import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { UserPayload } from './models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenService } from './services/refresh-token.service';

@Injectable()
export class AuthService {
    constructor (
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly refreshTokenService: RefreshTokenService,
    ) {}
     
    async login(user: User): Promise<UserToken> {
        if (!user.id) {
            throw new Error('Usuário sem ID válido');
        }

        // Cria o payload e o token de acesso (curta duração)
        const payload: UserPayload = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' }); // Token de 15 minutos
        
        // Salva o token de acesso no banco
        await this.saveToken(user.id, accessToken, 15);

        // Cria um refresh token (longa duração)
        const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

        return {
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }

    private async saveToken(userId: number, token: string, minutesDuration: number): Promise<void> {
        // Define a data de expiração
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + minutesDuration);
        
        // Salva o token no banco
        await this.prisma.token.create({
            data: {
                userId,
                token,
                expiresAt,
            }
        });
    }

    async refreshToken(refreshToken: string): Promise<UserToken> {
        // Validar o refresh token
        const refreshTokenData = await this.refreshTokenService.validateRefreshToken(refreshToken);
        if (!refreshTokenData) {
            throw new UnauthorizedException('Refresh token inválido ou expirado');
        }

        // Revogar o refresh token utilizado
        await this.refreshTokenService.revokeRefreshToken(refreshToken);

        // Criar novo access token
        const user = refreshTokenData.user;
        const payload: UserPayload = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role
        };
        
        // Cria um novo token de acesso
        const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        
        // Salva o token de acesso no banco
        await this.saveToken(user.id, newAccessToken, 15);

        // Cria um novo refresh token
        const newRefreshToken = await this.refreshTokenService.createRefreshToken(user.id);

        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken
        };
    }

    async removeExpiredTokens(): Promise<number> {
        const result = await this.prisma.token.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });
        
        return result.count;
    }

    async removeUserTokens(userId: number): Promise<number> {
        const result = await this.prisma.token.deleteMany({
            where: {
                userId
            }
        });
        
        return result.count;
    }

    async validateUser(username: string, password: string) {
        const user = await this.userService.findbyUsername(username);
        
        if (!user) {
            throw new UnauthorizedException('Usuário ou senha incorretos');
        }
        
        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            throw new UnauthorizedException('Usuário ou senha incorretos');
        }
        
        return {
            ...user, 
            password: undefined,
        };
    }
}
