export const formatDate = (date: string | Date | null | undefined, includeTime = true): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  const day = dateObj.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  let dateStr = `${day} ${month} ${year}`;
  if (includeTime) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  }
  return dateStr;
};

export const getBadgeVariant = (status: string): string => {
  switch (status) {
    case 'Complete': return 'success';
    case 'submit': return 'success';
    case 'Interviewed': return 'primary';
    case 'save': return 'secondary';
    default: return 'info';
  }
};

export const placeholderProfileImage =
  'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="#e5e7eb" rx="24"/><circle cx="24" cy="18" r="8" fill="#9ca3af"/><path d="M10 40c0-8 6-14 14-14s14 6 14 14" fill="#9ca3af"/></svg>'
  );

export const onImageProfileError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = placeholderProfileImage;
};
