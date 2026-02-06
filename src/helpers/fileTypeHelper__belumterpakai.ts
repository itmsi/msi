import { FiFile, FiFileText, FiImage, FiMusic, FiVideo, FiCode } from "react-icons/fi";
import { IconType } from "react-icons";

export interface FileTypeInfo {
    name: string;
    icon: IconType;
    category: 'document' | 'image' | 'audio' | 'video' | 'archive' | 'code' | 'other';
}

/**
 * Get file type information based on filename extension
 * @param filename - The filename to analyze
 * @returns FileTypeInfo object with name, icon, and category
 */
export const getFileTypeInfo = (filename: string | null | undefined): FileTypeInfo => {
    if (!filename) return { name: 'No file attached', icon: FiFile, category: 'other' };
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        // Document files
        case 'pdf':
            return { name: 'PDF File', icon: FiFileText, category: 'document' };
        case 'doc':
        case 'docx':
            return { name: 'Word Document', icon: FiFileText, category: 'document' };
        case 'xls':
        case 'xlsx':
            return { name: 'Excel Spreadsheet', icon: FiFileText, category: 'document' };
        case 'ppt':
        case 'pptx':
            return { name: 'PowerPoint Presentation', icon: FiFileText, category: 'document' };
        case 'txt':
            return { name: 'Text File', icon: FiFileText, category: 'document' };
        case 'csv':
            return { name: 'CSV File', icon: FiFileText, category: 'document' };
        case 'rtf':
            return { name: 'Rich Text Format', icon: FiFileText, category: 'document' };
            
        // Code files
        case 'json':
            return { name: 'JSON File', icon: FiCode, category: 'code' };
        case 'xml':
            return { name: 'XML File', icon: FiCode, category: 'code' };
        case 'html':
        case 'htm':
            return { name: 'HTML File', icon: FiCode, category: 'code' };
        case 'css':
            return { name: 'CSS File', icon: FiCode, category: 'code' };
        case 'js':
            return { name: 'JavaScript File', icon: FiCode, category: 'code' };
        case 'ts':
            return { name: 'TypeScript File', icon: FiCode, category: 'code' };
        case 'jsx':
            return { name: 'React JSX File', icon: FiCode, category: 'code' };
        case 'tsx':
            return { name: 'React TSX File', icon: FiCode, category: 'code' };
        case 'py':
            return { name: 'Python File', icon: FiCode, category: 'code' };
        case 'java':
            return { name: 'Java File', icon: FiCode, category: 'code' };
        case 'php':
            return { name: 'PHP File', icon: FiCode, category: 'code' };
            
        // Image files
        case 'jpg':
        case 'jpeg':
            return { name: 'JPEG Image', icon: FiImage, category: 'image' };
        case 'png':
            return { name: 'PNG Image', icon: FiImage, category: 'image' };
        case 'gif':
            return { name: 'GIF Image', icon: FiImage, category: 'image' };
        case 'bmp':
            return { name: 'BMP Image', icon: FiImage, category: 'image' };
        case 'webp':
            return { name: 'WebP Image', icon: FiImage, category: 'image' };
        case 'svg':
            return { name: 'SVG Image', icon: FiImage, category: 'image' };
        case 'ico':
            return { name: 'Icon File', icon: FiImage, category: 'image' };
        case 'tiff':
        case 'tif':
            return { name: 'TIFF Image', icon: FiImage, category: 'image' };
            
        // Audio files
        case 'mp3':
            return { name: 'MP3 Audio', icon: FiMusic, category: 'audio' };
        case 'wav':
            return { name: 'WAV Audio', icon: FiMusic, category: 'audio' };
        case 'flac':
            return { name: 'FLAC Audio', icon: FiMusic, category: 'audio' };
        case 'aac':
            return { name: 'AAC Audio', icon: FiMusic, category: 'audio' };
        case 'ogg':
            return { name: 'OGG Audio', icon: FiMusic, category: 'audio' };
            
        // Video files
        case 'mp4':
            return { name: 'MP4 Video', icon: FiVideo, category: 'video' };
        case 'avi':
            return { name: 'AVI Video', icon: FiVideo, category: 'video' };
        case 'mov':
            return { name: 'QuickTime Video', icon: FiVideo, category: 'video' };
        case 'wmv':
            return { name: 'WMV Video', icon: FiVideo, category: 'video' };
        case 'flv':
            return { name: 'Flash Video', icon: FiVideo, category: 'video' };
        case 'webm':
            return { name: 'WebM Video', icon: FiVideo, category: 'video' };
            
        // Archive files
        case 'zip':
            return { name: 'ZIP Archive', icon: FiFile, category: 'archive' };
        case 'rar':
            return { name: 'RAR Archive', icon: FiFile, category: 'archive' };
        case '7z':
            return { name: '7-Zip Archive', icon: FiFile, category: 'archive' };
        case 'tar':
            return { name: 'TAR Archive', icon: FiFile, category: 'archive' };
        case 'gz':
            return { name: 'GZip Archive', icon: FiFile, category: 'archive' };
            
        default:
            return { 
                name: `${extension?.toUpperCase() || 'Unknown'} File`, 
                icon: FiFile, 
                category: 'other' 
            };
    }
};

/**
 * Get file size in human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
};

export const isPreviewableFile = (filename: string): boolean => {
    const previewableExtensions = [
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
        // Documents that browsers can display
        'pdf', 'txt',
        // Code files
        'html', 'htm', 'css', 'js', 'json', 'xml'
    ];
    const extension = filename.split('.').pop()?.toLowerCase();
    return previewableExtensions.includes(extension || '');
};
export const getFileActions = (filename: string) => {
    const fileInfo = getFileTypeInfo(filename);
    
    if (fileInfo.category === 'image') {
        return { view: 'Preview', download: 'Download' };
    } else if (fileInfo.category === 'document' || fileInfo.category === 'code') {
        return { view: 'View', download: 'Download' };
    } else if (fileInfo.category === 'video' || fileInfo.category === 'audio') {
        return { view: 'Play', download: 'Download' };
    } else {
        return { view: 'Open', download: 'Download' };
    }
};
export const isUser = (): string => {
    const profileString = localStorage.getItem("auth_user");
    const profile = profileString ? JSON.parse(profileString) : null;
    const roleCode = profile?.employee_id
    return roleCode;
};
export const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
};