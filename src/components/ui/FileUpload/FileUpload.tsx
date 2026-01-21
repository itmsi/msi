import React, { useState, useEffect } from 'react';
import { MdImage, MdUpload, MdCloudUpload, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import Label from '@/components/form/Label';

interface FileUploadProps {
    id: string;
    name: string;
    label: string;
    accept: string;
    icon?: 'image' | 'upload' | 'cloud';
    acceptedFormats: string[];
    maxSize?: number;
    multiple?: boolean;
    length?: number;
    currentFile?: File | null;
    currentFiles?: File[];
    existingImageUrl?: any[] | string |null;
    onFileChange: (files: File | File[] | null) => void;
    onRemoveExistingImage?: () => void;
    validationError?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    className?: string;
    showPreview?: boolean;
    previewSize?: 'sm' | 'md' | 'lg';
    viewMode?: boolean;
}

interface DragState {
    isDragging: boolean;
}

interface PreviewState {
    url: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
    id,
    name,
    label,
    accept,
    icon = 'upload',
    acceptedFormats,
    maxSize = 10, // 10MB default
    multiple = false,
    length = 1,
    currentFile,
    currentFiles,
    existingImageUrl,
    onFileChange,
    onRemoveExistingImage,
    validationError,
    required = false,
    disabled = false,
    description,
    className = '',
    showPreview = true,
    previewSize = 'md',
    viewMode = false
}) => {
    
    const [dragState, setDragState] = useState<DragState>({ isDragging: false });
    const [previewState, setPreviewState] = useState<PreviewState>({ 
        url: null
    });
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [preservedExistingImages, setPreservedExistingImages] = useState<any[] | string | null>(null);

    // Preserve existing images when component first loads
    useEffect(() => {
        if (existingImageUrl && !preservedExistingImages) {
            setPreservedExistingImages(existingImageUrl);
            console.log('Preserving existing images:', existingImageUrl);
        }
    }, [existingImageUrl, preservedExistingImages]);

    // Helper function to get current files based on mode
    const getCurrentFiles = (): File[] => {
        if (multiple) {
            return currentFiles || [];
        } else {
            return currentFile ? [currentFile] : [];
        }
    };

    useEffect(() => {
        // Cleanup previous URLs
        if (previewState.url && previewState.url.startsWith('blob:')) {
            URL.revokeObjectURL(previewState.url);
        }
        previewUrls.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });

        const files = getCurrentFiles();
        
        if (multiple) {
            // Handle multiple files
            const urls = files.filter(isImageFile).map(file => URL.createObjectURL(file));
            setPreviewUrls(urls);
            setPreviewState({ url: null });
            
            return () => {
                urls.forEach(url => URL.revokeObjectURL(url));
            };
        } else {
            // Handle single file (existing logic)
            const file = files[0];
            if (file && isImageFile(file)) {
                const url = URL.createObjectURL(file);
                setPreviewState({ url });
                setPreviewUrls([]);
                
                return () => {
                    URL.revokeObjectURL(url);
                };
            } else {
                setPreviewState({ url: null });
                setPreviewUrls([]);
            }
        }
    }, [currentFile, currentFiles, multiple]);

    const isImageFile = (file: File): boolean => {
        if (!file || typeof file !== 'object' || !file.name || typeof file.type !== 'string') {
            return false;
        }
        
        if (file.type.startsWith('image/')) {
            return true;
        }
        
        const fileName = file.name.toLowerCase();
        const imageExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
        
        return imageExtensions.some(ext => fileName.endsWith(ext));
    };

    const getPreviewSizeClasses = () => {
        switch (previewSize) {
            case 'sm': return 'w-16 h-16';
            case 'lg': return 'w-full';
            default: return 'w-24 h-24';
        }
    };

    const handleRemoveFile = (indexToRemove?: number) => {
        // Cleanup URLs
        if (previewState.url && previewState.url.startsWith('blob:')) {
            URL.revokeObjectURL(previewState.url);
        }
        previewUrls.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        
        if (multiple && typeof indexToRemove === 'number') {
            // Remove specific file from multiple files
            const files = getCurrentFiles();
            const newFiles = files.filter((_, index) => index !== indexToRemove);
            onFileChange(newFiles.length > 0 ? newFiles : null);
        } else {
            // Remove all files
            setPreviewState({ url: null });
            setPreviewUrls([]);
            onFileChange(null);
            if (existingImageUrl && onRemoveExistingImage) {
                onRemoveExistingImage();
            }
        }
    };    
    const getIcon = () => {
        const iconProps = { className: "mx-auto h-12 w-12 text-gray-400" };
        switch (icon) {
            case 'image':
                return <MdImage {...iconProps} />;
            case 'cloud':
                return <MdCloudUpload {...iconProps} />;
            default:
                return <MdUpload {...iconProps} />;
        }
    };

    const validasiFile = (file: File): boolean => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`File size must be less than ${maxSize}MB`);
            return false;
        }

        const fileExtension = file.name.toLowerCase().split('.').pop();
        const mimeTypeValid = acceptedFormats.some(format => 
            file.type.includes(format) || file.name.toLowerCase().endsWith(format)
        );
        const extensionValid = acceptedFormats.some(format => 
            format.includes(fileExtension || '')
        );

        if (!mimeTypeValid && !extensionValid) {
            const formatsText = acceptedFormats.join(', ');
            toast.error(`Please select a valid file. Accepted formats: ${formatsText}`);
            return false;
        }

        return true;
    };

    // Handle file selection
    const handleFileChange = (newFiles: File[]) => {
        const validFiles: File[] = [];
        
        for (const file of newFiles) {
            if (validasiFile(file)) {
                validFiles.push(file);
            }
        }
        
        if (validFiles.length === 0) {
            return;
        }
        
        if (multiple) {
            const currentFiles = getCurrentFiles();
            // Use preserved existing images for calculation
            const currentExistingImages = existingImageUrl || preservedExistingImages;
            console.log('Current files before merge:', currentFiles.length);
            console.log('Existing images:', Array.isArray(currentExistingImages) ? currentExistingImages.length : (currentExistingImages ? 1 : 0));
            console.log('New valid files:', validFiles.length);
            
            const allFiles = [...currentFiles, ...validFiles];
            const totalExisting = Array.isArray(currentExistingImages) ? currentExistingImages.length : (currentExistingImages ? 1 : 0);
            const totalImages = allFiles.length + totalExisting;
            
            console.log('Total files after merge:', allFiles.length);
            console.log('Total images (including existing):', totalImages);
            
            onFileChange(allFiles);
            toast.success(`${validFiles.length} file(s) added successfully! Total: ${totalImages} images`);
        } else {
            onFileChange(validFiles[0]);
            toast.success('File uploaded successfully!');
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            handleFileChange(fileArray);
            
            // Reset input untuk mencegah masalah caching
            e.target.value = '';
        }
    };

    // Drag & Drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setDragState({ isDragging: true });
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState({ isDragging: false });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState({ isDragging: false });

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            handleFileChange(fileArray);
        }
    };

    // Generate accepted formats text
    const getAcceptedFormatsText = () => {
        return acceptedFormats.map(format => format.toUpperCase()).join(', ');
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor={id} className='font-secondary'>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {!viewMode && (<>
                <div
                    className={`
                        relative flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-200
                        ${disabled 
                            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                            : dragState.isDragging
                                ? 'border-blue-400 bg-blue-50 shadow-sm'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }
                    `}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="space-y-2 text-center">
                        {/* Icon */}
                        <div className={`transition-colors ${dragState.isDragging ? 'text-blue-500' : ''}`}>
                            {getIcon()}
                        </div>

                        {/* Upload Text */}
                        <div className="flex text-sm text-gray-600 flex-wrap flex-col justify-center items-center">
                            <label
                                htmlFor={id}
                                className={`
                                    relative font-medium rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500
                                    ${disabled 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'cursor-pointer text-blue-600 hover:text-blue-500'
                                    }
                                `}
                            >
                                <span>
                                    {(getCurrentFiles().length > 0 || existingImageUrl) 
                                        ? (multiple ? 'Add more files' : 'Change file') 
                                        : `Upload ${getAcceptedFormatsText()} ${multiple ? 'files' : 'file'}`
                                    }
                                </span>
                                <input
                                    id={id}
                                    name={name}
                                    type="file"
                                    accept={accept}
                                    multiple={multiple}
                                    disabled={disabled}
                                    className="sr-only"
                                    onChange={handleInputChange}
                                />
                            </label>
                            <p className={`pl-1 ${disabled ? 'text-gray-400' : ''}`}>
                                or drag and drop
                            </p>
                        </div>

                        {/* File Info */}
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500">
                                {description || `${getAcceptedFormatsText()} files only, max ${maxSize}MB`}
                            </p>
                            
                            {/* Current File Display */}
                            {getCurrentFiles().length > 0 && (
                                <div className="space-y-2">
                                    {multiple ? (
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                            <span className="mr-1">✓</span>
                                            <span className="font-medium">{getCurrentFiles().length} file(s) selected</span>
                                        </div>
                                    ) : (
                                        getCurrentFiles().map((file, index) => (
                                            <div key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                                <span className="mr-1">✓</span>
                                                <span className="font-medium">{file.name}</span>
                                                <span className="ml-2 text-xs text-green-600">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Drag State Feedback */}
                            {dragState.isDragging && !disabled && (
                                <p className="text-sm text-blue-600 font-medium animate-pulse">
                                    Drop file here to upload
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </>)}
            {/* Validation Error */}
            {validationError && (
                <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">Error</span>
                    {validationError}
                </p>
            )}

            {/* File Preview Section */}
            {showPreview && (getCurrentFiles().some(isImageFile) || existingImageUrl) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                            Preview {multiple && getCurrentFiles().length > 1 && `(${getCurrentFiles().filter(isImageFile).length} images)`}
                        </h4>
                        {!viewMode && (
                            <button
                                onClick={() => handleRemoveFile()}
                                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                                disabled={disabled}
                            >
                                <MdClose className="w-4 h-4" />
                                Remove All
                            </button>
                        )}
                    </div>


                    {/* Render preview based on mode */}
                    {(() => {
                        const files = getCurrentFiles();
                        const imageFiles = files.filter(isImageFile);
                        // Use preserved existing images if current existingImageUrl is null/empty
                        const currentExistingImages = existingImageUrl || preservedExistingImages;
                        const existingImagesCount = Array.isArray(currentExistingImages) ? currentExistingImages.length : (currentExistingImages ? 1 : 0);
                        const totalImages = imageFiles.length + existingImagesCount;
                        const getImageLength = totalImages > 3 ? 3 : (totalImages > 0 ? totalImages : 1);
                        
                        console.log('=== Preview Debug ===');
                        console.log('imageFiles length:', imageFiles.length);
                        console.log('existingImageUrl:', existingImageUrl);
                        console.log('preservedExistingImages:', preservedExistingImages);
                        console.log('currentExistingImages:', currentExistingImages);
                        console.log('existingImagesCount:', existingImagesCount);
                        console.log('totalImages:', totalImages);
                        console.log('getImageLength:', getImageLength);
                        console.log('previewUrls:', previewUrls);
                        
                        if (multiple) {
                            return (
                                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${getImageLength}, 1fr)` }}>
                                    {/* Show existing images first */}
                                    {currentExistingImages && (
                                        Array.isArray(currentExistingImages) ? (
                                            currentExistingImages.map((imageUrl, index) => {
                                                console.log(`Rendering existing image ${index}:`, imageUrl);
                                                return (
                                                    <div key={`existing-${index}`} className="space-y-2">
                                                        <div className={`${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm`}>
                                                            <img
                                                                src={imageUrl}
                                                                alt={`Existing ${index + 1}`}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        <p className="text-xs font-medium text-gray-900">
                                                            Existing Image {currentExistingImages.length > 1 ? `${index + 1}` : ''}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="space-y-2">
                                                <div className={`${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm`}>
                                                    <img
                                                        src={currentExistingImages}
                                                        alt="Existing"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <p className="text-xs font-medium text-gray-900">
                                                    Existing Image
                                                </p>
                                            </div>
                                        )
                                    )}
                                    
                                    {/* Then show new files */}
                                    {imageFiles.map((file, index) => {
                                        const url = previewUrls[index];
                                        console.log(`Rendering new file ${index}:`, file.name, 'URL:', url);
                                        
                                        if (!url) {
                                            console.log(`No URL for file ${index}, skipping render`);
                                            return null;
                                        }
                                        
                                        return (
                                            <div key={`new-${index}`} className="space-y-2">
                                                {/* Image Preview */}
                                                <div className={`${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group`}>
                                                    <img
                                                        src={url}
                                                        alt={`New ${index + 1}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                    {!viewMode && (
                                                        <button
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MdClose className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {/* File Info */}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium text-gray-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        } else {
                            // Single file preview (existing logic)
                            const hasNewFile = imageFiles.length > 0;
                            const imageUrl = hasNewFile ? previewState.url : (Array.isArray(existingImageUrl) ? existingImageUrl[0] : existingImageUrl);
                            const isLoading = hasNewFile && !previewState.url;

                            if (isLoading) {
                                return (
                                    <div className="text-center py-4 text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p>Generating preview...</p>
                                    </div>
                                );
                            }

                            if (imageUrl) {
                                const file = imageFiles[0];
                                // const isSvg = hasNewFile 
                                //     ? file.name.toLowerCase().endsWith('.svg')
                                //     : existingImageUrl!.toLowerCase().includes('.svg');

                                return (
                                    <div className="space-y-2">
                                        {/* Image Preview */}
                                        <div className={`${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group`}>
                                            <img
                                                src={imageUrl}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {hasNewFile ? file.name : 'Existing Image'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {hasNewFile ? (file.type || 'Unknown type') : ''}
                                                    </p>
                                                </div>
                                                
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    {hasNewFile && (
                                                        <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        }

                        return null;
                    })()}
                </div>
            )}
        </div>
    );
};

export default FileUpload;