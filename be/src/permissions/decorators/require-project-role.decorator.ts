import { SetMetadata } from '@nestjs/common';
import { ProjectRole } from '../permissions.service';

export const REQUIRE_PROJECT_ROLE_KEY = 'require_project_role';

export const RequireProjectRole = (...roles: ProjectRole[]) =>
  SetMetadata(REQUIRE_PROJECT_ROLE_KEY, roles);

