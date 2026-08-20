const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  .replace(/\/api\/?$/, '');

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${apiOrigin}${url}`;
  if (url.startsWith('http://localhost:5000/')) {
    return `${apiOrigin}${url.slice('http://localhost:5000'.length)}`;
  }
  return url;
};