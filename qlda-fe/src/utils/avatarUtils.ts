import { API_BASE } from './constants';

export const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http')) return avatar;
  return avatar.startsWith('/') ? `${API_BASE}${avatar}` : `${API_BASE}/${avatar}`;
};

