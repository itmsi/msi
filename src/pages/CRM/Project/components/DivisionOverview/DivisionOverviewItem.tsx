import React from 'react';
import DivisionOverviewForm from './DivisionOverviewForm';
import { DivisionOverviewFormData } from '../../types/divisionOverview';

interface DivisionOverviewItemProps {
    formData: DivisionOverviewFormData;
    onFormDataChange: (formData: DivisionOverviewFormData) => void;
    onSubmit: (formData: DivisionOverviewFormData) => Promise<void>;
    isSubmitting: boolean;
    isNewItem?: boolean;
    type: string;
}

const DivisionOverviewItemComponent: React.FC<DivisionOverviewItemProps> = ({
    formData,
    onFormDataChange,
    onSubmit,
    isSubmitting,
    isNewItem = false,
    type
}) => {
    const submitButtonText = isNewItem ? `Create ${type}` : `Update ${type}`;
    
    return (
        <DivisionOverviewForm
            formData={formData}
            onFormDataChange={onFormDataChange}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
        />
    );
};

export default DivisionOverviewItemComponent;