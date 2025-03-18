import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { UserPayload } from './models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor (
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}
     
    async login(user: User): Promise<UserToken> {
        if (!user.id) {
            throw new Error('Usuário sem ID válido');
        }

        const payload: UserPayload = {
            id: user.id,
            name: user.name,
            username: user.username,
        };
        const jwtToken = this.jwtService.sign(payload);
        
        // Limpa tokens expirados
        await this.removeExpiredTokens();
        
        // Salvando o token no banco de dados
        await this.saveToken(user.id, jwtToken);

        return {
            access_token: jwtToken
        };
    }

    private async saveToken(userId: number, token: string): Promise<void> {
        // Define a data de expiração (30 dias, conforme definido no módulo JWT)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Salva o token no banco
        await this.prisma.token.create({
            data: {
                userId,
                token,
                expiresAt,
            }
        });
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
