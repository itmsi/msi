import { useState } from 'react';
import { TermConditionService } from '../services/termconditionService';
import { TermCondition, TermConditionValidationErrors } from '../types/termcondition';

export interface UseTermConditionEditReturn {
    isUpdating: boolean;
    validationErrors: TermConditionValidationErrors;
    clearFieldError: (field: keyof TermConditionValidationErrors) => void;
    updateTermCondition: (termConditionId: string, termConditionData: Partial<Omit<TermCondition, 'term_condition_id'>>) => Promise<TermCondition>;
}

export function useTermConditionEdit(): UseTermConditionEditReturn {
    const [isUpdating, setIsUpdating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<TermConditionValidationErrors>({});

    const clearFieldError = (field: keyof TermConditionValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    };

    const updateTermCondition = async (termConditionId: string, termConditionData: Partial<Omit<TermCondition, 'term_condition_id'>>) => {
        setIsUpdating(true);
        setValidationErrors({});

        try {
            const response = await TermConditionService.updateTermCondition(termConditionId, termConditionData);
            return response;
        } catch (error: any) {
            // Handle validation errors from API
            if (error.errors && typeof error.errors === 'object') {
                setValidationErrors(error.errors);
            }
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        isUpdating,
        validationErrors,
        clearFieldError,
        updateTermCondition
    };
}