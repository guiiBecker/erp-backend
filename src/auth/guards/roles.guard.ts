import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verifica se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Obtém as roles necessárias para acessar a rota
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não houver roles definidas, qualquer usuário autenticado pode acessar
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Verifica se o usuário existe e tem uma role
    if (!user || !user.role) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso');
    }

    // Verificações especiais para ROOT e ADMIN
    if (user.role === Role.ROOT) {
      // ROOT tem acesso a tudo
      return true;
    }

    if (user.role === Role.ADMIN && !requiredRoles.includes(Role.ROOT)) {
      // ADMIN tem acesso a tudo exceto recursos exclusivos de ROOT
      return true;
    }

    // Para outros casos, verifica se a role do usuário está na lista de roles permitidas
    return requiredRoles.includes(user.role);
  }
} 