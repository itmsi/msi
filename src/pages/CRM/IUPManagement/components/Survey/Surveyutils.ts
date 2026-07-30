import moment from 'moment';
import { LuMapPin, LuMic, LuVideo, LuMessageSquare, LuImage } from 'react-icons/lu';
import { IupSurveyItem } from '../../types/iupmanagement';

export type SurveyEntryType = 'video' | 'voice' | 'image' | 'location' | 'chat' | 'empty';

interface TypeConfigEntry {
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    /** badge text color */
    color: string;
    /** badge background color */
    bg: string;
    /** timeline marker dot color */
    dot: string;
}

export const TYPE_CONFIG: Record<SurveyEntryType, TypeConfigEntry> = {
    video: { label: 'Video', icon: LuVideo, color: 'text-rose-700', bg: 'bg-rose-100', dot: 'bg-rose-500' },
    voice: { label: 'Voice note', icon: LuMic, color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
    image: { label: 'Image', icon: LuImage, color: 'text-violet-700', bg: 'bg-violet-100', dot: 'bg-violet-500' },
    location: { label: 'Location', icon: LuMapPin, color: 'text-slate-700', bg: 'bg-slate-200', dot: 'bg-slate-500' },
    chat: { label: 'Text', icon: LuMessageSquare, color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
    empty: { label: 'Empty', icon: LuMessageSquare, color: 'text-slate-400', bg: 'bg-slate-50', dot: 'bg-slate-300' },
};

export const classifyEntry = (e: IupSurveyItem): SurveyEntryType => {
    if (e.file_name && /\.(mp4|mov|avi|mkv|webm)$/i.test(e.file_name)) return 'video';
    // if (e.file_name && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(e.file_name)) return 'image';
    if (e.source_type === 'image') return 'image';
    if (e.source_type === 'voice') return 'voice';
    if (e.source_type === 'location') return 'location';
    if (e.description) return 'chat';
    return 'empty';
};

// Google Drive files are shared as "Anyone with the link · Viewer",
// so they can be embedded directly from the file id in the URL.
export const extractDriveFileId = (url?: string | null): string | null => {
    if (!url) return null;
    const m = url.match(/\/d\/([-\w]+)/) ?? url.match(/[?&]id=([-\w]+)/);
    return m ? m[1] : null;
};
export const driveEmbedUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`;
export const driveThumbnailUrl = (id: string, size = 'w1000') =>
    `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;


export const formatDateHeading = (iso: string) => moment(iso).format('dddd, MMMM Do YYYY');

export const formatTime = (iso: string) => moment(iso).format('HH:mm');

/** Stable per-day grouping key, e.g. "2026-07-28" */
export const dateGroupKey = (iso: string) => moment(iso).format('YYYY-MM-DD');

// export const parseLatLng = (desc: string) => {
//     const m = desc.match(/latitude:\s*(-?[\d.]+),\s*longitude:\s*(-?[\d.]+)/i);
//     return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null;
// };
export const parseLatLng = (desc: string) => {
    if (!desc) return null;

    // 1. Format: "latitude: -3.05, longitude: 122.27"
    const labeled = desc.match(/latitude:\s*(-?[\d.]+),\s*longitude:\s*(-?[\d.]+)/i);
    if (labeled) {
        return {
            lat: parseFloat(labeled[1]),
            lng: parseFloat(labeled[2]),
        };
    }

    // 2. Format: "[-3.0532052,122.276181]"
    const arrayFormat = desc.match(/\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/);
    if (arrayFormat) {
        return {
            lat: parseFloat(arrayFormat[1]),
            lng: parseFloat(arrayFormat[2]),
        };
    }

    return null;
};