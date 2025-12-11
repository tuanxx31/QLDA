import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ProjectParam = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;

    
    if (params.projectId) {
      return data ? params.projectId : params.projectId;
    }

    
    return undefined;
  },
);

