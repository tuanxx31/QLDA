import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator để extract projectId từ route params
 * Có thể lấy từ 'projectId' hoặc từ task/column để tìm projectId
 */
export const ProjectParam = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;

    // Nếu có projectId trực tiếp trong params
    if (params.projectId) {
      return data ? params.projectId : params.projectId;
    }

    // Nếu không có, trả về undefined (sẽ được xử lý trong guard)
    return undefined;
  },
);

