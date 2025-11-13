import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { TermConditionService } from "../services/termconditionService";
import { TermConditionFormData, TermConditionValidationErrors } from "../types/termcondition";

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return 'An unknown error occurred';
};

export const useCreateTermConditions = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<TermConditionValidationErrors>({});

    const createTermCondition = useCallback(async (termConditionData: TermConditionFormData): Promise<{ success: boolean; message?: string; errors?: any }> => {
        setIsCreating(true);
        setValidationErrors({});

        try {
            const response = await TermConditionService.createTermCondition(termConditionData);
            
            if (response.success) {
                toast.success('Term condition created successfully!');
                return { success: true };
            } else {
                // Server returned error response
                if (response.errors) {
                    setValidationErrors(response.errors);
                }
                toast.error(response.message || 'Failed to create customer');
                return { 
                    success: false, 
                    message: response.message, 
                    errors: response.errors 
                };
            }
        } catch (err: any) {
            const errorMessage = getErrorMessage(err);
            
            // Handle different error scenarios
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
                toast.error('Please check the form for errors');
            } else if (err.response?.status === 400 && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error(`Failed to create customer: ${errorMessage}`);
            }
            
            return { 
                success: false, 
                message: errorMessage, 
                errors: err.response?.data?.errors 
            };
        } finally {
            setIsCreating(false);
        }
    }, []);

    // Clear specific validation error
    const clearFieldError = useCallback((fieldName: keyof TermConditionValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Clear all validation errors
    const clearAllErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    return {
        isCreating,
        validationErrors,
        createTermCondition,
        clearFieldError,
        clearAllErrors,
        setValidationErrors
    };
};