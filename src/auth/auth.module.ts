import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports:[UserModule, JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions:{expiresIn: '30d'}
  })],
  providers: [AuthService],
  controllers: [AuthController, LocalStrategy]
})
export class AuthModule {}
