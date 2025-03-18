import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthRequest } from './models/AuthRequest';
import { IsPublic } from './decorators/is-public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authservice: AuthService) {}

    @IsPublic()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    login(@Request() req: AuthRequest){
        return this.authservice.login(req.user);
    }

    @IsPublic()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authservice.refreshToken(refreshTokenDto.refresh_token);
    }

    @Delete('tokens/expired')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async removeExpiredTokens() {
        const count = await this.authservice.removeExpiredTokens();
        return { message: `${count} tokens expirados foram removidos` };
    }

    @Delete('tokens')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async removeUserTokens(@Request() req: AuthRequest) {
        if (!req.user.id) {
            return { message: 'Nenhum token removido' };
        }
        const count = await this.authservice.removeUserTokens(req.user.id);
        return { message: `${count} tokens do usuário foram removidos` };
    }

    @UseGuards(JwtAuthGuard)
    @Get('test-auth')
    async testAuth(@Request() req: AuthRequest) {
        return {
            message: 'Autenticação bem-sucedida!',
            userId: req.user.id,
            username: req.user.username,
            role: req.user.role
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req: AuthRequest) {
        return {
            id: req.user.id,
            username: req.user.username,
            name: req.user.name,
            role: req.user.role
        };
    }
}
