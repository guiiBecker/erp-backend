import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from '../models/UserPayload';
import { UserFromJwt } from '../models/UserFromJwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '../enums/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está definida');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: UserPayload): Promise<UserFromJwt> {
    if (!payload.id) {
      throw new UnauthorizedException('Token inválido');
    }

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

    // Buscar o usuário para obter a role atualizada
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id
      }
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Convertendo a role do prisma para a role da aplicação
    const appRole = user.role.toString() as Role;

    return {
      id: payload.id,
      username: payload.username,
      name: payload.name,
      role: appRole
    };
  }
}