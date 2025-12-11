import { AxiosError } from 'axios';

export function isForbiddenError(error: unknown): boolean {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 403;
  }
  return false;
}

export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
}

export function isNotFoundError(error: unknown): boolean {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 404;
  }
  return false;
}

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

export function isMainResource(url: string): boolean {
  const mainResourcePatterns = [
    /\/api\/projects\/[^/]+$/,
    /\/api\/groups\/[^/]+$/,
  ];
  return mainResourcePatterns.some(pattern => pattern.test(url));
}

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

