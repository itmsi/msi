import React from 'react';
import SalesTrackingForm from './SalesTrackingForm';
import { SalesTrackingFormData } from '../../types/salesTracking';

interface SalesTrackingItemProps {
    formData: SalesTrackingFormData;
    onFormDataChange: (formData: SalesTrackingFormData) => void;
    onSubmit: (formData: SalesTrackingFormData) => Promise<void>;
    isSubmitting: boolean;
    isNewItem?: boolean;
    type: string;
}

const SalesTrackingItemComponent: React.FC<SalesTrackingItemProps> = ({
    formData,
    onFormDataChange,
    onSubmit,
    isSubmitting,
    isNewItem = false,
    type
}) => {
    const submitButtonText = isNewItem ? `Create ${type}` : `Update ${type}`;
    
    return (
        <SalesTrackingForm
            formData={formData}
            onFormDataChange={onFormDataChange}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
        />
    );
};

export default SalesTrackingItemComponent;