import React, { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload/FileUpload';

interface AvatarUploadProps {
    currentAvatar?: string | null;
    onAvatarChange: (file: File | null) => void;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
    currentAvatar,
    onAvatarChange,
    size = 'md',
    disabled = false,
    className = ''
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const handleFileChange = (file: File | null) => {
        setUploadFile(file);
        
        if (file) {
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            onAvatarChange(file);
        } else {
            setPreviewUrl(null);
            onAvatarChange(null);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* File Upload Component with integrated preview */}
            <FileUpload
                id="avatar_upload"
                name="avatar"
                label={previewUrl ? "Change Avatar" : "Upload Avatar"}
                accept="image/*"
                icon="image"
                acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                maxSize={2}
                currentFile={uploadFile}
                onFileChange={handleFileChange}
                disabled={disabled}
                description="JPG, PNG, GIF or WebP files only, max 2MB"
                showPreview={true}
                previewSize={size}
                className={previewUrl ? 'opacity-75' : ''}
            />

            {/* Upload Tips */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>Recommended: Square image (1:1 ratio)</p>
                <p>Minimum size: 200x200 pixels</p>
                <p>For best quality, use PNG or high-quality JPG</p>
            </div>
        </div>
    );
};

export default AvatarUpload;