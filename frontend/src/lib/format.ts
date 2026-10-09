const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

/**
 * Converts a relative Django media URL (e.g. /media/shop/products/img.jpg)
 * into an absolute URL pointing at the backend server.
 * Absolute URLs (http/https) are returned unchanged.
 */
export const getMediaUrl = (path?: string | null): string => {
  if (!path) return '/api/placeholder/400/320';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const formatPKR = (value: string | number): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return 'Rs 0';

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(numericValue).replace('PKR', 'Rs');
};

export const formatTime12h = (timeStr?: string): string => {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutesStr || '00'} ${ampm}`;
};

