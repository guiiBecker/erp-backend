import { Controller, Delete, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthRequest } from './models/AuthRequest';
import { IsPublic } from './decorators/is-public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guards';

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
}
