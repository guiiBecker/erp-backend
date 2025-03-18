import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}
  
  async createRefreshToken(userId: number): Promise<string> {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias de validade
    
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt
      }
    });
    
    return refreshToken;
  }
  
  async validateRefreshToken(token: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        isRevoked: false
      },
      include: {
        user: true
      }
    });
  }
  
  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true }
    });
  }
  
  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    });
  }
  
  async deleteExpiredRefreshTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });
    
    return result.count;
  }
} 