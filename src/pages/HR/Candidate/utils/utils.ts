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
