import { Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Post, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { TokenRequest } from './models/token-request';
import { IsPublic } from '../auth/decorators/is-public.decorator';

@Controller('auth/tokens')
export class TokenController {
    constructor(private readonly tokenService: TokenService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUserTokens(@Request() req: TokenRequest) {
        return this.tokenService.getUserTokens(req.user.id);
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    async deleteUserTokens(@Request() req: TokenRequest) {
        return this.tokenService.deleteUserTokens(req.user.id);
    }

    @Delete('expired')
    @UseGuards(JwtAuthGuard)
    async deleteExpiredTokens() {
        const count = await this.tokenService.deleteExpiredTokens();
        return { message: `${count} tokens expirados foram removidos` };
    }

    @IsPublic()
    @Get('verify')
    @HttpCode(HttpStatus.OK)
    async verifyToken(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { 
                valid: false,
                message: 'Token não fornecido ou formato inválido. Use o formato: Bearer token'
            };
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' do token
        const isValid = await this.tokenService.validateToken(token);
        
        return { 
            valid: isValid,
            message: isValid ? 'Token válido' : 'Token inválido ou expirado'
        };
    }

    @IsPublic()
    @Get('user-info')
    @HttpCode(HttpStatus.OK)
    async getUserInfo(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token não fornecido ou formato inválido. Use o formato: Bearer token');
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' do token
        const isValid = await this.tokenService.validateToken(token);
        
        if (!isValid) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
        
        const tokenInfo = await this.tokenService.findTokenByValue(token);
        if (!tokenInfo || !tokenInfo.user) {
            throw new UnauthorizedException('Usuário não encontrado para este token');
        }
        
        // Retorna informações do usuário, excluindo a senha
        const { password, ...userInfo } = tokenInfo.user;
        return userInfo;
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteToken(@Request() req: TokenRequest, @Body('id') id: string) {
        // Verifique primeiro se o token pertence ao usuário
        const token = await this.tokenService.findTokenByValue(id);
        
        if (!token || token.userId !== req.user.id) {
            return { 
                success: false,
                message: 'Token não encontrado ou não pertence ao usuário'
            };
        }
        
        await this.tokenService.deleteToken(token.id);
        return { 
            success: true,
            message: 'Token removido com sucesso'
        };
    }
}
