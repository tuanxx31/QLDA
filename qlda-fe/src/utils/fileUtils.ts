import { API_BASE } from './constants';

/**
 * Lấy base URL cho file uploads (không có /api)
 * Ví dụ: http://localhost:8080/api -> http://localhost:8080
 */
const getFileBaseUrl = (): string => {
  // Nếu API_BASE kết thúc bằng /api, loại bỏ nó
  if (API_BASE.endsWith('/api')) {
    return API_BASE.slice(0, -4);
  }
  // Nếu không có /api, giữ nguyên (fallback)
  return API_BASE.replace('/api', '');
};

/**
 * Xử lý file URL đúng cách
 * - Nếu URL đã đầy đủ (http/https) thì trả về nguyên vẹn
 * - Nếu là relative path (/uploads/...) thì ghép với base URL không có /api
 * - Nếu là relative path không có / thì thêm / và ghép với base URL
 */
export const getFileUrl = (fileUrl?: string | null): string => {
  if (!fileUrl) return '';
  
  // Nếu đã là URL đầy đủ, trả về nguyên vẹn
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  
  // Lấy base URL cho files (không có /api)
  const fileBaseUrl = getFileBaseUrl();
  
  // Nếu bắt đầu bằng / thì ghép trực tiếp
  if (fileUrl.startsWith('/')) {
    return `${fileBaseUrl}${fileUrl}`;
  }
  
  // Nếu không có / thì thêm / trước khi ghép
  return `${fileBaseUrl}/${fileUrl}`;
};

