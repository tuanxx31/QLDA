import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Lấy thông tin user hiện tại từ request (đã qua JwtAuthGuard)
 * @example
 *   @CurrentUser() user
 *   @CurrentUser('id') userId
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // do JwtStrategy gắn vào request
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data ? user?.[data] : user;
  },
);
