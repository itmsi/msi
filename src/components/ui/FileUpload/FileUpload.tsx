import React, { useState, useEffect } from 'react';
import { MdImage, MdUpload, MdCloudUpload, MdClose, MdDownload, MdZoomIn } from 'react-icons/md';
import toast from 'react-hot-toast';
import Label from '@/components/form/Label';
import { FaFileExcel, FaFilePowerpoint, FaFileWord, FaRegFile, FaRegFilePdf } from 'react-icons/fa6';
import Button from '../button/Button';

interface FileUploadProps {
    id: string;
    name: string;
    label: string;
    accept: string;
    icon?: 'image' | 'upload' | 'cloud';
    acceptedFormats: string[];
    maxSize?: number;
    multiple?: boolean;
    currentFile?: File | null;
    currentFiles?: File[];
    existingImageUrl?: any[] | string |null;
    onFileChange: (files: File | File[] | null) => void;
    onRemoveExistingImage?: (index?: number) => void;
    validationError?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    className?: string;
    showPreview?: boolean;
    previewSize?: 'sm' | 'md' | 'lg';
    viewMode?: boolean;
    colLength?: number;
    existingFiles?: Array<{file_id: string; file_url: string; file_name?: string}>;
    hasDownloadButton?: boolean;
}

interface DragState {
    isDragging: boolean;
}

interface PreviewState {
    url: string | null;
}

interface ModalState {
    isOpen: boolean;
    imageUrl: string;
    imageName: string;
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
    viewMode = false,
    colLength = 1,
    existingFiles,
    hasDownloadButton = false,
}) => {
    
    const [dragState, setDragState] = useState<DragState>({ isDragging: false });
    const [previewState, setPreviewState] = useState<PreviewState>({ 
        url: null
    });
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [preservedExistingImages, setPreservedExistingImages] = useState<any[] | string | null>(null);
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        imageUrl: '',
        imageName: ''
    });

    // Preserve existing images when component first loads
    useEffect(() => {
        if (existingImageUrl && !preservedExistingImages) {
            setPreservedExistingImages(existingImageUrl);
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
            const imageFiles = files.filter(isImageFile);
            const urls = imageFiles.map((file, index) => {
                const url = URL.createObjectURL(file);
                return {
                    url,
                    fileName: file.name,
                    fileSize: file.size,
                    lastModified: file.lastModified,
                    index
                };
            });
            
            setPreviewUrls(urls.map(item => item.url));
            setPreviewState({ url: null });
            
            return () => {
                urls.forEach(item => URL.revokeObjectURL(item.url));
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

    // Check if file is a document (PDF, DOC, etc.)
    const isDocumentFile = (fileName: string): boolean => {
        const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
        const lowerFileName = fileName.toLowerCase();
        return documentExtensions.some(ext => lowerFileName.endsWith(ext));
    };

    // Get document icon based on file type
    const getDocumentIcon = (fileName: string) => {
        const lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith('.pdf')) {
            return <FaRegFilePdf />;
        } else if (lowerFileName.endsWith('.doc') || lowerFileName.endsWith('.docx')) {
            return <FaFileWord />;
        } else if (lowerFileName.endsWith('.xls') || lowerFileName.endsWith('.xlsx')) {
            return <FaFileExcel />;
        } else if (lowerFileName.endsWith('.ppt') || lowerFileName.endsWith('.pptx')) {
            return <FaFilePowerpoint />;
        } else {
            return <FaRegFile />;
        }
    };

    // Handle download of existing file
    const handleDownload = (fileUrl: string, fileName?: string) => {
        try {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download file');
        }
    };

    // Handle image click untuk popup preview
    const handleImageClick = (imageUrl: string, imageName: string) => {
        setModalState({
            isOpen: true,
            imageUrl,
            imageName
        });
    };

    // Handle modal close
    const handleModalClose = () => {
        setModalState({
            isOpen: false,
            imageUrl: '',
            imageName: ''
        });
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

    const handleRemoveExistingImage = (indexToRemove: number) => {
        if (onRemoveExistingImage) {
            onRemoveExistingImage(indexToRemove);
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
            const currentExistingImages = existingImageUrl || preservedExistingImages;
            
            const cekFiles = validFiles.filter(newFile => {
                return !currentFiles.some(existingFile => 
                    existingFile.name === newFile.name && 
                    existingFile.size === newFile.size && 
                    existingFile.lastModified === newFile.lastModified
                );
            });
            
            if (cekFiles.length === 0) {
                toast.error('All selected files are already added');
                return;
            }
            
            const allFiles = [...currentFiles, ...cekFiles];
            const totalExisting = Array.isArray(currentExistingImages) ? currentExistingImages.length : (currentExistingImages ? 1 : 0);
            const totalFiles = allFiles.length + totalExisting;
            
            onFileChange(allFiles);
            toast.success(`${cekFiles.length} file(s) added successfully! Total: ${totalFiles} files`);
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
                {label} {required && <span className="text-white">*</span>}
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
            {showPreview && (getCurrentFiles().length > 0 || existingImageUrl) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                            Preview {multiple && getCurrentFiles().length > 1 && `(${getCurrentFiles().length} files)`}
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
                        const documentFiles = files.filter(file => !isImageFile(file));
                        // Use preserved existing images if current existingImageUrl is null/empty
                        const currentExistingImages = existingImageUrl || preservedExistingImages;
                        // const existingImagesCount = Array.isArray(currentExistingImages) ? currentExistingImages.length : (currentExistingImages ? 1 : 0);
                        // const totalImages = imageFiles.length + existingImagesCount;
                        // const getImageLength = totalImages > 3 ? 3 : (totalImages > 0 ? totalImages : 1);
                        
                        if (multiple) {
                            return (
                                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${colLength}, 1fr)` }}>
                                    {/* Show existing images/documents first */}
                                    {currentExistingImages && (
                                        Array.isArray(currentExistingImages) ? (
                                            currentExistingImages.map((imageUrl, index) => {
                                                // Get file name from URL or use default
                                                const fileName = existingFiles?.[index]?.file_name || 
                                                               imageUrl.split('/').pop() || 
                                                               `attachment-${index + 1}`;
                                                const isImage = !isDocumentFile(fileName);
                                                
                                                return (
                                                    <div key={`existing-${index}`} className={`space-y-2 ${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group p-5 content-center aspect-square hover:brightness-90` }>
                                                        {/* Action buttons */}
                                                        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">

                                                            {/* Download button */}
                                                            {hasDownloadButton && (
                                                                <Button
                                                                    onClick={() => handleDownload(imageUrl, fileName)}
                                                                    className='rounded-full p-1'
                                                                    size='sm'
                                                                >
                                                                    <MdDownload className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            
                                                            {/* Remove button */}
                                                            {!viewMode && (
                                                                <Button
                                                                    onClick={() => handleRemoveExistingImage(index)}
                                                                    className="bg-red-500 text-white rounded-full p-1"
                                                                    size='sm'
                                                                >
                                                                    <MdClose className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        
                                                        {isImage && (
                                                            <div
                                                                className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                                                                onClick={() => handleImageClick(imageUrl, fileName)}
                                                            >
                                                                <MdZoomIn 
                                                                    className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-gray-700 rounded-lg" 
                                                                    size={40}
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="relative">
                                                            {isImage ? (
                                                                <div className="relative group">
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={`Existing ${index + 1}`}
                                                                        className="w-full h-full object-contain transition-all"
                                                                        title="Click untuk preview"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                                                                    <div className="text-4xl mb-2">
                                                                        {getDocumentIcon(fileName)}
                                                                    </div>
                                                                    <p className="text-xs font-medium text-gray-900 truncate max-w-full" title={fileName}>
                                                                        {fileName}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className={`space-y-2 ${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group p-5 content-center hover:brightness-90 aspect-square`}>
                                                <div className="relative">
                                                    {(() => {
                                                        const fileName = existingFiles?.[0]?.file_name || 
                                                                        currentExistingImages.split('/').pop() || 
                                                                        'attachment';
                                                        const isImage = !isDocumentFile(fileName);
                                                        
                                                        return isImage ? (<>
                                                            <div
                                                                className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                                                                onClick={() => handleImageClick(currentExistingImages, fileName)}
                                                            >
                                                                <MdZoomIn 
                                                                    className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-gray-700 rounded-lg" 
                                                                    size={40}
                                                                />
                                                            </div>
                                                            <div className="relative group">
                                                                <img
                                                                    src={currentExistingImages}
                                                                    alt="Existing"
                                                                    className="w-full h-full object-contain transition-all"
                                                                    title="Click untuk preview"
                                                                />
                                                            </div>
                                                        </>) : (
                                                            <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                                                                <div className="text-4xl mb-2">
                                                                    {getDocumentIcon(fileName)}
                                                                </div>
                                                                <p className="text-xs font-medium text-gray-900 truncate max-w-full" title={fileName}>
                                                                    {fileName}
                                                                </p>
                                                            </div>
                                                        );
                                                    })()}
                                                    
                                                    {/* Action buttons */}
                                                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {/* Download button */}
                                                        <button
                                                            onClick={() => {
                                                                const fileName = existingFiles?.[0]?.file_name || 
                                                                               currentExistingImages.split('/').pop() || 
                                                                               'attachment';
                                                                handleDownload(currentExistingImages, fileName);
                                                            }}
                                                            className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                                                            title="Download"
                                                        >
                                                            <MdDownload className="w-3 h-3" />
                                                        </button>
                                                        
                                                        {/* Remove button */}
                                                        {!viewMode && (
                                                            <button
                                                                onClick={() => handleRemoveExistingImage(0)}
                                                                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                                title="Remove"
                                                            >
                                                                <MdClose className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                    
                                    {/* Then show new image files */}
                                    {imageFiles.map((file, index) => {
                                        const url = previewUrls[index];
                                        
                                        if (!url) {
                                            return null;
                                        }
                                        
                                        return (
                                            <div key={`new-image-${file.name}-${file.size}-${file.lastModified}-${index}`} className={`space-y-2 ${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group p-5 content-center aspect-square hover:brightness-90`}>
                                                
                                                {/* Zoom icon overlay */}
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                                                    onClick={() => handleImageClick(url, file.name)}
                                                >
                                                    <MdZoomIn 
                                                        className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-gray-700 rounded-lg" 
                                                        size={40}
                                                    />
                                                </div>

                                                {/* Image Preview */}
                                                <div className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`${file.name} - Preview ${index + 1}`}
                                                        className="w-full h-full object-contain transition-all"
                                                        title="Click untuk preview"
                                                    />
                                                    {!viewMode && (
                                                        <button
                                                            onClick={() => handleRemoveFile(imageFiles.length > 1 ? index : undefined)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MdClose className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {/* File Info */}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Then show new document files */}
                                    {documentFiles.map((file, index) => {
                                        return (
                                            <div key={`new-doc-${file.name}-${file.size}-${file.lastModified}-${index}`} className={`space-y-2 ${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group p-5 content-center aspect-square`}>
                                                {/* Document Preview */}
                                                <div className="relative">
                                                    <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                                                        <div className="text-4xl mb-2">
                                                            {getDocumentIcon(file.name)}
                                                        </div>
                                                        <p className="text-xs font-medium text-gray-900 truncate max-w-full" title={file.name}>
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    {!viewMode && (
                                                        <button
                                                            onClick={() => handleRemoveFile(files.indexOf(file))}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MdClose className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        } else {
                            // Single file preview (existing logic)
                            const hasNewFile = files.length > 0;
                            const file = files[0];
                            const imageUrl = hasNewFile && isImageFile(file) ? previewState.url : (Array.isArray(existingImageUrl) ? existingImageUrl[0] : existingImageUrl);
                            const isLoading = hasNewFile && isImageFile(file) && !previewState.url;

                            if (isLoading) {
                                return (
                                    <div className="text-center py-4 text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p>Generating preview...</p>
                                    </div>
                                );
                            }

                            if (hasNewFile) {
                                return (
                                    <div className="space-y-2">
                                        {/* File Preview */}
                                        <div className={`${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group`}>
                                            {isImageFile(file) ? (<>
                                                {/* Zoom icon overlay */}
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                                                    onClick={() => handleImageClick(imageUrl || '', file.name)}
                                                >
                                                    <MdZoomIn 
                                                        className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-gray-700 rounded-lg" 
                                                        size={40}
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <img
                                                        src={imageUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain transition-all"
                                                        title="Click untuk preview"
                                                    />
                                                </div>
                                            </>) : (
                                                <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center p-5">
                                                    <div className="text-4xl mb-2">
                                                        {getDocumentIcon(file.name)}
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-900 truncate max-w-full" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {file.type || 'Unknown type'}
                                                    </p>
                                                </div>
                                                
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (imageUrl) {
                                return (
                                    <div className="space-y-2">
                                        {/* Image Preview */}
                                        <div className={`${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group`}>
                                            <div className="relative group">
                                                <img
                                                    src={imageUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain transition-all"
                                                    title="Click untuk preview"
                                                />
                                                {/* Zoom icon overlay */}
                                                <div 
                                                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                                                    onClick={() => handleImageClick(imageUrl, 'Existing Image')}
                                                >
                                                    <MdZoomIn 
                                                        className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-gray-700 rounded-lg" 
                                                        size={40}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        Existing Image
                                                    </p>
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

            {/* Modal Popup untuk Preview Image */}
            {modalState.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleModalClose}>
                    <div className="relative max-w-4xl max-h-full p-4" onClick={e => e.stopPropagation()}>
                        {/* Tombol Close */}
                        <button
                            onClick={handleModalClose}
                            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all z-10"
                            title="Tutup preview"
                        >
                            <MdClose className="w-6 h-6" />
                        </button>
                        
                        {/* Image */}
                        <img
                            src={modalState.imageUrl}
                            alt={modalState.imageName}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                        
                        {/* Image Name */}
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                            <p className="text-white bg-black/50 rounded-b-lg px-3 py-2 text-sm font-medium">
                                {modalState.imageName}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;