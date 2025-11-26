import { useState, useCallback } from 'react';
import { QuotationService } from '../services/quotationService';
import { ManageQuotationData, QuotationValidationErrors } from '../types/quotation';

export const useEditQuotation = () => {
    const [loading, setLoading] = useState(false);
    const [quotationData, setQuotationData] = useState<ManageQuotationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<QuotationValidationErrors>({});

    // Fetch quotation by ID
    const fetchQuotation = useCallback(async (quotationId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await QuotationService.getQuotationById(quotationId);
            
            if (response.data?.status) {
                setQuotationData(response.data.data);
                return response.data.data;
            } else {
                const errorMsg = response.data?.message || 'Failed to fetch quotation';
                setError(errorMsg);
                throw new Error(errorMsg);
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch quotation';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update quotation
    const updateQuotation = useCallback(async (quotationId: string, formData: any) => {
        setLoading(true);
        setError(null);
        setValidationErrors({});

        try {
            const response = await QuotationService.updateQuotation(quotationId, formData);
            
            if (response.success) {
                return response;
            } else {
                if (response.errors) {
                    setValidationErrors(response.errors);
                }
                throw new Error(response.message || 'Failed to update quotation');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update quotation');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete quotation
    const deleteQuotation = useCallback(async (quotationId: string) => {
        setLoading(true);
        setError(null);

        try {
            await QuotationService.deleteQuotation(quotationId);
            return true;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to delete quotation';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearFieldError = useCallback((field: keyof QuotationValidationErrors) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    return {
        loading,
        quotationData,
        error,
        validationErrors,
        fetchQuotation,
        updateQuotation,
        deleteQuotation,
        clearFieldError,
    };
};
