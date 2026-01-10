import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';
import { REQUIRE_GROUP_ROLE_KEY } from '../decorators/require-group-role.decorator';
import { GroupRole } from '../permissions.service';

@Injectable()
export class GroupRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<GroupRole[]>(
      REQUIRE_GROUP_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Không tìm thấy thông tin người dùng.');
    }

    const groupId = request.params.groupId || request.params.id || request.body?.groupId;
    
    if (!groupId) {
      throw new NotFoundException('Không tìm thấy groupId trong request.');
    }

    const hasPermission = await this.permissionsService.checkGroupPermission(
      groupId,
      userId,
      requiredRoles,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện thao tác này. Yêu cầu role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

