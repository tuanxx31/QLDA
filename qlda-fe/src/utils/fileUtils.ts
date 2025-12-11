import { API_BASE } from './constants';

const getFileBaseUrl = (): string => {
  
  if (API_BASE.endsWith('/api')) {
    return API_BASE.slice(0, -4);
  }
  
  return API_BASE.replace('/api', '');
};

export const getFileUrl = (fileUrl?: string | null): string => {
  if (!fileUrl) return '';
  
  
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  
  
  const fileBaseUrl = getFileBaseUrl();
  
  
  if (fileUrl.startsWith('/')) {
    return `${fileBaseUrl}${fileUrl}`;
  }
  
  
  return `${fileBaseUrl}/${fileUrl}`;
};

