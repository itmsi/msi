import { useState, useCallback } from 'react';
import { ConfirmationModalProps } from '@/components/ui/modal/ConfirmationModal';

// INI ADALAH FUNGSI UNTUK CONFIRMATION MODAL
export interface UseConfirmationOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    size?: 'sm' | 'md' | 'lg';
}

export interface UseConfirmationReturn {
    isOpen: boolean;
    loading: boolean;
    modalProps: ConfirmationModalProps;
    showConfirmation: (options?: UseConfirmationOptions) => Promise<boolean>;
    hideConfirmation: () => void;
}

export function useConfirmation(): UseConfirmationReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<UseConfirmationOptions>({
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger',
        size: 'md',
    });
    const [resolveRef, setResolveRef] = useState<{
        resolve: (value: boolean) => void;
    } | null>(null);

    const showConfirmation = useCallback(
        (options?: UseConfirmationOptions): Promise<boolean> => {
            return new Promise((resolve) => {
                setConfig((prev) => ({ ...prev, ...options }));
                setResolveRef({ resolve });
                setIsOpen(true);
            });
        },
        []
    );

    const hideConfirmation = useCallback(() => {
        setIsOpen(false);
        setLoading(false);
        if (resolveRef) {
            resolveRef.resolve(false);
            setResolveRef(null);
        }
    }, [resolveRef]);

    const handleConfirm = useCallback(async () => {
        if (resolveRef) {
            setLoading(true);
            try {
                resolveRef.resolve(true);
                setIsOpen(false);
            } finally {
                setLoading(false);
                setResolveRef(null);
            }
        }
    }, [resolveRef]);

    const modalProps: ConfirmationModalProps = {
        isOpen,
        onClose: hideConfirmation,
        onConfirm: handleConfirm,
        title: config.title || 'Confirm Action',
        message: config.message || 'Are you sure you want to proceed?',
        confirmText: config.confirmText,
        cancelText: config.cancelText,
        type: config.type,
        size: config.size,
        loading,
        showIcon: true,
    };

    return {
        isOpen,
        loading,
        modalProps,
        showConfirmation,
        hideConfirmation,
    };
}