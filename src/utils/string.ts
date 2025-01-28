export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0590-\u05FF\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isRTL = (str: string): boolean => {
  const rtlChars = /[\u0591-\u07FF]/;
  return rtlChars.test(str);
};

export const countWords = (str: string): number => {
  return str.trim().split(/\s+/).length;
};

export const extractEmails = (str: string): string[] => {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  return str.match(emailRegex) || [];
};

export const extractUrls = (str: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return str.match(urlRegex) || [];
};

export const removeHtmlTags = (str: string): string => {
  return str.replace(/<[^>]*>/g, '');
};

export const escapeHtml = (str: string): string => {
  const htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, tag => htmlEntities[tag] || tag);
}; 