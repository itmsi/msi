import { useState, useEffect } from 'react';
import { generateAvatarSVG, AvatarOptions } from '@/utils/avatarHelper';

interface AvatarComponentProps extends AvatarOptions {
  src?: string | null;
  nama: string;
  alt?: string;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * Avatar Component dengan automatic fallback
 * Secara otomatis menangani broken image dan fallback ke initials
 */
const Avatar: React.FC<AvatarComponentProps> = ({
  src,
  nama,
  alt,
  size = 96,
  fontSize,
  className = '',
  onError,
  onLoad,
}) => {
  // Generate fallback avatar
  const fallbackSrc = generateAvatarSVG(nama, { size, fontSize });
  
  // Initialize with proper src or fallback to avoid empty string
  const initialSrc = src && src.trim() !== '' ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(src && src.trim() !== ''));

  // Initialize avatar source
  useEffect(() => {
    if (!src || src.trim() === '') {
      setImgSrc(fallbackSrc);
      setIsLoading(false);
    } else {
      setImgSrc(src);
      setIsLoading(true);
    }
  }, [src, fallbackSrc]);

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Handle image load error
  const handleError = () => {
    setIsLoading(false);
    setImgSrc(fallbackSrc);
    onError?.();
  };

  const containerSize = `${size}px`;
  const containerClass = `
    relative inline-block overflow-hidden rounded-full bg-gray-100
    ${className}
  `.trim();

  return (
    <div 
      className={containerClass}
      style={{ width: containerSize, height: containerSize }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
        </div>
      )}
      
      <img
        src={imgSrc}
        alt={alt || `Avatar ${nama}`}
        className="w-full h-full object-cover"
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
};

export default Avatar;