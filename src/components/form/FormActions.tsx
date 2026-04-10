import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button/Button';
import { FaSave } from 'react-icons/fa';
import { PermissionGate } from '../common/PermissionComponents';

interface FormActionsProps {
    onSubmit: () => void;
    isSubmitting?: boolean;
    cancelText?: string;
    cancelRoute?: string;
    submitText?: string;
    submittingText?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
    onSubmit,
    isSubmitting = false,
    cancelRoute = '/home',
    submitText = 'Create',
    cancelText = 'Cancel',
    submittingText = 'Creating...'
}) => {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate(cancelRoute);
    };

    return (
        <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm mb-8">
            <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-6 rounded-full"
                disabled={isSubmitting}
            >
                {cancelText}
            </Button>
            
            <PermissionGate permission={["create", "update"]}>
                <Button
                    onClick={onSubmit}
                    className="px-6 flex items-center gap-2 rounded-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing {submitText}...
                        </>
                    ) : (
                            <>
                                <FaSave className={`mr-2 h-4 w-4`} /> {submitText}
                            </>
                    )}
                </Button>
            </PermissionGate>
        </div>
    );
};

export default FormActions;