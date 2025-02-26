import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[UserModule],
  providers: [AuthService],
  controllers: [AuthController, LocalStrategy]
})
export class AuthModule {}
