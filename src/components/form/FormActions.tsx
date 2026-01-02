import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button/Button';
import { FaSave } from 'react-icons/fa';
import { PermissionGate } from '../common/PermissionComponents';

interface FormActionsProps {
    onSubmit: () => void;
    isSubmitting?: boolean;
    cancelRoute?: string;
    submitText?: string;
    submittingText?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
    onSubmit,
    isSubmitting = false,
    cancelRoute = '/home',
    submitText = 'Create',
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
                Cancel
            </Button>
            
            <PermissionGate permission={["create", "update"]}>
                <Button
                    onClick={onSubmit}
                    className="px-6 flex items-center gap-2 rounded-full"
                    disabled={isSubmitting}
                >
                    <FaSave className={`mr-2 h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                    {isSubmitting ? submittingText : submitText}
                </Button>
            </PermissionGate>
        </div>
    );
};

export default FormActions;