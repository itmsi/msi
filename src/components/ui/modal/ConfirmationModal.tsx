import { ReactNode } from 'react';
import { MdWarning, MdInfo, MdCheckCircle, MdError } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import { Modal } from '.';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    loading?: boolean;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const iconMap = {
    danger: MdError,
    warning: MdWarning,
    info: MdInfo,
    success: MdCheckCircle,
};

const colorMap = {
    danger: {
        icon: 'text-red-600',
        background: 'bg-red-50',
        border: 'border-red-200',
        confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        confirmButtonDisabled: 'bg-red-400 cursor-not-allowed',
        colorText: 'text-red-600 font-primary-bold',
    },
    warning: {
        icon: 'text-orange-600',
        background: 'bg-orange-50',
        border: 'border-orange-200',
        confirmButton: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
        confirmButtonDisabled: 'bg-orange-400 cursor-not-allowed',
        colorText: 'text-gray-900 font-primary-bold',
    },
    info: {
        icon: 'text-blue-600',
        background: 'bg-blue-50',
        border: 'border-blue-200',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        confirmButtonDisabled: 'bg-blue-400 cursor-not-allowed',
        colorText: 'text-gray-900 font-primary-bold',
    },
    success: {
        icon: 'text-green-600',
        background: 'bg-green-50',
        border: 'border-green-200',
        confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        confirmButtonDisabled: 'bg-green-400 cursor-not-allowed',
        colorText: 'text-gray-900 font-primary-bold',
    },
};

const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
};

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    loading = false,
    showIcon = true,
    size = 'md',
    className = '',
}: ConfirmationModalProps) {
    const Icon = iconMap[type];
    const colors = colorMap[type];
    const sizeClass = sizeMap[size];

    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            console.error('Confirmation action failed:', error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={loading ? () => {} : onClose} // Prevent closing when loading
            showCloseButton={!loading}
            className={`${sizeClass} ${className}`}
            title={title}
            classTitle={`${colors.background} ${colors.colorText}`}
        >
            <div className="p-6">
                {/* Content */}
                <div className="sm:flex items-center">
                    {/* Icon */}
                    {showIcon && (
                        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${colors.background} sm:mx-0 sm:h-10 sm:w-10`}>
                            <Icon className={`h-6 w-6 ${colors.icon}`} />
                        </div>
                    )}

                    {/* Text Content */}
                    <div className={`text-center sm:ml-4 sm:mt-0 sm:text-left ${showIcon ? '' : 'sm:ml-0'}`}>
                            {typeof message === 'string' ? (
                                <p className="text-sm text-gray-500">
                                    {message}
                                </p>
                            ) : (
                                message
                            )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 gap-3 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <Button
                        className={`rounded-[50px] ${
                            loading 
                                ? colors.confirmButtonDisabled 
                                : `${colors.confirmButton} focus:ring-2 focus:ring-offset-2`
                        }`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-[50px]"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}