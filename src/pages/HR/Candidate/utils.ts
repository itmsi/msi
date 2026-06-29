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

export const placeholderProfileImage = '/assets/img/avatar.png';

export const onImageProfileError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = placeholderProfileImage;
};
