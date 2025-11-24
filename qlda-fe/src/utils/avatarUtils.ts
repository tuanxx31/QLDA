import { API_BASE } from './constants';

/**
 * Format avatar URL để hiển thị đúng
 * - Nếu avatar là URL đầy đủ (http/https) thì trả về nguyên vẹn
 * - Nếu avatar là relative path (bắt đầu bằng /) thì thêm API_BASE
 * - Nếu avatar không có hoặc rỗng thì trả về undefined
 */
export const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http')) return avatar;
  return avatar.startsWith('/') ? `${API_BASE}${avatar}` : `${API_BASE}/${avatar}`;
};

