import { useState } from 'react';
import { QuotationService } from '../services/quotationService';
import { QuotationFormData, QuotationValidationErrors } from '../types/quotation';

export function useCreateQuotation() {
    const [isCreating, setIsCreating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<QuotationValidationErrors>({});

    const clearFieldError = (field: keyof QuotationValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    };

    const createQuotation = async (quotationData: QuotationFormData) => {
        setIsCreating(true);
        setValidationErrors({});

        try {
            const response = await QuotationService.createQuotation(quotationData);
            
            if (!response.success) {
                // Handle validation errors from API
                if (response.errors && typeof response.errors === 'object') {
                    setValidationErrors(response.errors);
                }
                throw new Error(response.message);
            }
            
            return response;
        } catch (error: any) {
            // Handle validation errors from API
            if (error.errors && typeof error.errors === 'object') {
                setValidationErrors(error.errors);
            }
            throw error;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        isCreating,
        validationErrors,
        clearFieldError,
        createQuotation
    };
}