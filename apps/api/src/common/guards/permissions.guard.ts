import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has SUPER_ADMIN system role — bypass all checks
    const superAdminRole = await this.prisma.userRole.findFirst({
      where: {
        userId: user.id,
        expiresAt: null,
        role: {
          name: 'SUPER_ADMIN',
          isSystem: true,
          deletedAt: null,
        },
      },
    });

    if (superAdminRole) {
      return true;
    }

    // Load user roles with permissions
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const userPermissions = userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => ({
        module: rp.permission.module,
        action: rp.permission.action,
      })),
    );

    const hasAll = requiredPermissions.every((required) =>
      userPermissions.some(
        (p) => p.module === required.module && p.action === required.action,
      ),
    );

    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
