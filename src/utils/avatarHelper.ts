export interface AvatarOptions {
  nama?: string;
  size?: number;
  fontSize?: number;
  className?: string;
}

/** Generate initials dari nama lengkap. Contoh: "John Doe Smith" -> "JS" */
export const generateInitials = (nama: string): string => {
  if (!nama || nama.trim() === '') return '??';
  
  const words = nama.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  } else {
    const firstInitial = words[0].charAt(0);
    const lastInitial = words[words.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
};

/** Generate warna konsisten berdasarkan nama */
export const generateAvatarColor = (nama: string): string => {
  if (!nama) return '#6B7280';
  
  const colors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6',
    '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#8475DB', '#84CC16'
  ];
  
  let hash = 0;
  for (let i = 0; i < nama.length; i++) {
    hash = nama.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};

export const generateLightAvatarColor = (nama: string): string => {
  if (!nama) return '#F3F4F6';
  
  const lightColors = [
    '#FEE2E2', '#FED7AA', '#FEF3C7', '#D1FAE5', '#CFFAFE', '#DBEAFE',
    '#EDE9FE', '#FCE7F3', '#D1FAE5', '#FEF3C7', '#E0E7FF', '#ECFCCB'
  ];
  
  let hash = 0;
  for (let i = 0; i < nama.length; i++) {
    hash = nama.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % lightColors.length;
  return lightColors[colorIndex];
};

/** Generate SVG avatar dengan initials */
export const generateAvatarSVG = (nama: string, options: AvatarOptions = {}): string => {
  const { size = 96, fontSize = 32 } = options;
  const initials = generateInitials(nama);
  const bgColor = generateLightAvatarColor(nama);
  const textColor = generateAvatarColor(nama);
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}" rx="50%" />
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        fill="${textColor}" 
        font-size="${fontSize}px" 
        font-weight="600" 
        font-family="system-ui, -apple-system, sans-serif"
      >
        ${initials}
      </text>
    </svg>
  `)}`;
};

/** Validate apakah URL image dapat diakses */
export const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url || url.trim() === '') {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    setTimeout(() => resolve(false), 5000);
  });
};

/** Get avatar source - return image URL atau fallback SVG */
export const getAvatarSource = async (imageUrl: string | null | undefined, nama: string, options?: AvatarOptions): Promise<string> => {
  if (imageUrl) {
    const isValid = await validateImageUrl(imageUrl);
    if (isValid) {
      return imageUrl;
    }
  }
  
  return generateAvatarSVG(nama, options);
};

/** Get avatar source secara synchronous */
export const getAvatarSourceSync = (imageUrl: string | null | undefined, nama: string, options?: AvatarOptions): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return generateAvatarSVG(nama, options);
  }
  
  return imageUrl;
};