import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';
import { REQUIRE_PROJECT_ROLE_KEY } from '../decorators/require-project-role.decorator';
import { ProjectRole } from '../permissions.service';

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(
      REQUIRE_PROJECT_ROLE_KEY,
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

    // Lấy projectId từ params (có thể là 'projectId' hoặc 'id')
    const projectId = request.params.projectId || request.params.id;

    if (!projectId) {
      throw new NotFoundException('Không tìm thấy projectId trong request.');
    }

    // Kiểm tra quyền
    const hasPermission = await this.permissionsService.checkProjectPermission(
      projectId,
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

