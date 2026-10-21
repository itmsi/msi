import { useState, useEffect, useMemo, useRef } from 'react';
import { generateAvatarSVG, AvatarOptions } from '@/utils/avatarHelper';

interface AvatarComponentProps extends AvatarOptions {
    src?: string | null;
    nama: string;
    alt?: string;
    onError?: () => void;
    onLoad?: () => void;
}

type AvatarStatus = 'loading' | 'ready' | 'failed';

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
    const fallbackSrc = useMemo(() => generateAvatarSVG(nama, { size, fontSize }), [nama, size, fontSize]);

    const resolvedSrc = src?.trim() ?? '';
    const imgRef = useRef<HTMLImageElement>(null);
    const [status, setStatus] = useState<AvatarStatus>(resolvedSrc ? 'loading' : 'ready');

    useEffect(() => {
        const node = imgRef.current;

        if (!resolvedSrc) {
            setStatus('ready');
            return;
        }

        if (node?.complete) {
            setStatus(node.naturalWidth === 0 ? 'failed' : 'ready');
            return;
        }

        setStatus('loading');
    }, [resolvedSrc]);

    const isLoading = status === 'loading';
    const imgSrc = !resolvedSrc || status === 'failed' ? fallbackSrc : resolvedSrc;

    // Handle image load success
    const handleLoad = () => {
        setStatus('ready');
        onLoad?.();
    };

    // Handle image load error, fallback yang ikut gagal tidak dicoba ulang
    const handleError = () => {
        setStatus(imgSrc === fallbackSrc ? 'ready' : 'failed');
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
                ref={imgRef}
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