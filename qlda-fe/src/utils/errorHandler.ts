import { AxiosError } from 'axios';

/**
 * Kiểm tra xem lỗi có phải là 403 Forbidden không
 */
export function isForbiddenError(error: unknown): boolean {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 403;
  }
  return false;
}

/**
 * Kiểm tra xem lỗi có phải là 401 Unauthorized không
 */
export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
}

/**
 * Kiểm tra xem lỗi có phải là 404 Not Found không
 */
export function isNotFoundError(error: unknown): boolean {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 404;
  }
  return false;
}

/**
 * Lấy message lỗi từ response
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return (
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Đã xảy ra lỗi'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã xảy ra lỗi';
}

/**
 * Kiểm tra xem URL có phải là resource chính (project/group) không
 */
export function isMainResource(url: string): boolean {
  const mainResourcePatterns = [
    /\/api\/projects\/[^/]+$/,
    /\/api\/groups\/[^/]+$/,
  ];
  return mainResourcePatterns.some(pattern => pattern.test(url));
}

/**
 * Kiểm tra xem URL có phải là resource phụ không
 */
export function isSubResource(url: string): boolean {
  const subResourcePatterns = [
    /\/api\/projects\/[^/]+\/columns/,
    /\/api\/projects\/[^/]+\/tasks/,
    /\/api\/tasks\/[^/]+\/comments/,
    /\/api\/projects\/[^/]+\/labels/,
    /\/api\/projects\/[^/]+\/members/,
  ];
  return subResourcePatterns.some(pattern => pattern.test(url));
}

