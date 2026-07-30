import React, { useState } from 'react';
import { LuExternalLink, LuVideo, LuImage } from 'react-icons/lu';
import { extractDriveFileId, driveEmbedUrl, driveThumbnailUrl } from './Surveyutils';
// import { extractDriveFileId, driveEmbedUrl, driveThumbnailUrl } from './surveyUtils';

interface DrivePlayerProps {
    url?: string | null;
    height: number;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    /** tailwind text + bg color classes, e.g. "text-rose-600 bg-rose-50" */
    accentClass: string;
}

export const DrivePlayer: React.FC<DrivePlayerProps> = ({ url, height, icon: Icon, label, accentClass }) => {
    const [loaded, setLoaded] = useState(false);
    const id = extractDriveFileId(url);

    // fallback for URLs that aren't a recognizable Drive file (missing/broken link)
    if (!id) {
        return (
            <a
                href={url || undefined}
                target="_blank"
                rel="noreferrer"
                className={`mb-2.5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-primary-bold hover:opacity-80 ${accentClass} ${
                    !url ? 'pointer-events-none opacity-60' : ''
                }`}
            >
                <Icon size={15} /> {label}
                {url && <LuExternalLink size={12} className="ml-auto" />}
            </a>
        );
    }

    return (
        <div className="mb-2.5">
            {!loaded ? (
                <button
                    type="button"
                    onClick={() => setLoaded(true)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-primary-bold hover:opacity-80 ${accentClass}`}
                >
                    <Icon size={16} /> {label}
                </button>
            ) : (
                <div className="overflow-hidden rounded-lg border border-slate-300 bg-black">
                    <iframe
                        src={driveEmbedUrl(id)}
                        width="100%"
                        height={height}
                        allow="autoplay"
                        style={{ border: 0, display: 'block' }}
                        title={label}
                    />
                </div>
            )}
            <a
                href={url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:underline"
            >
                Open in Drive <LuExternalLink size={10} />
            </a>
        </div>
    );
};

interface DriveImageProps {
    url?: string | null;
    alt: string;
}

export const DriveImage: React.FC<DriveImageProps> = ({ url, alt }) => {
    const [failed, setFailed] = useState(false);
    const id = extractDriveFileId(url);

    if (!id || failed) {
        return (
            <a
                href={url || undefined}
                target="_blank"
                rel="noreferrer"
                className="mb-2.5 flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm font-primary-bold text-violet-600 hover:opacity-80"
            >
                <LuImage size={15} /> Open image in Drive
                <LuExternalLink size={12} className="ml-auto" />
            </a>
        );
    }

    return (<>
        <a
            href={url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="flex justify-center overflow-hidden rounded-lg border border-slate-300"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={driveThumbnailUrl(id)}
                alt={alt}
                loading="lazy"
                onError={() => setFailed(true)}
                className="block max-h-80 w-full object-cover"
            />
            
        </a>
        <a
            href={url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="mb-2.5 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:underline"
        >
            Open in Drive <LuExternalLink size={10} />
        </a>
    </>);
};

export const SkeletonCard: React.FC = () => (
    <div className="animate-pulse rounded-xl border border-slate-300 bg-slate-50 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2.5">
            <div className="h-[34px] w-[34px] rounded-full bg-slate-200" />
            <div className="flex-1">
                <div className="mb-1.5 h-3 w-24 rounded bg-slate-200" />
                <div className="h-2.5 w-32 rounded bg-slate-200" />
            </div>
        </div>
        <div className="mb-1.5 h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
    </div>
);