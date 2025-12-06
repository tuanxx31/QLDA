import { SetMetadata } from '@nestjs/common';
import { GroupRole } from '../permissions.service';

export const REQUIRE_GROUP_ROLE_KEY = 'require_group_role';

export const RequireGroupRole = (...roles: GroupRole[]) =>
  SetMetadata(REQUIRE_GROUP_ROLE_KEY, roles);

