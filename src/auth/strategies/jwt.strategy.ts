import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from '../models/UserPayload';
import { UserFromJwt } from '../models/UserFromJwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: UserPayload): Promise<UserFromJwt> {
    // Verificar se o token está no banco e ainda é válido
    const token = await this.prisma.token.findFirst({
      where: {
        userId: payload.id,
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (!token) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return {
      id: payload.id,
      username: payload.username,
      name: payload.name,
    };
  }
}