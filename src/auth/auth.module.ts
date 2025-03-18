import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  imports: [
    UserModule, 
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' } // 15 minutos para o token de acesso
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
