import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../auth/models/UserPayload';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async validateToken(token: string): Promise<boolean> {
    try {
      // Verifica se o JWT é válido
      const payload = this.jwtService.verify<UserPayload>(token);
      
      if (!payload || !payload.id) {
        this.logger.warn('Payload inválido ou sem ID');
        return false;
      }

      this.logger.debug(`Validando token para usuário ${payload.id}`);

      // Verifica se o token existe no banco de dados e não está expirado
      const dbToken = await this.prisma.token.findFirst({
        where: {
          token,
          userId: payload.id,
          expiresAt: {
            gte: new Date()
          }
        }
      });

      if (!dbToken) {
        this.logger.warn(`Token não encontrado no banco para o usuário ${payload.id}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Erro ao validar token: ${error.message}`);
      return false;
    }
  }

  async findTokenByValue(token: string) {
    return this.prisma.token.findFirst({
      where: {
        token
      },
      include: {
        user: true
      }
    });
  }

  async getUserTokens(userId: number) {
    return this.prisma.token.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async deleteToken(id: string) {
    return this.prisma.token.delete({
      where: {
        id
      }
    });
  }

  async deleteExpiredTokens() {
    const result = await this.prisma.token.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    return result.count;
  }

  async deleteUserTokens(userId: number) {
    const result = await this.prisma.token.deleteMany({
      where: {
        userId
      }
    });
    
    return result.count;
  }
}
