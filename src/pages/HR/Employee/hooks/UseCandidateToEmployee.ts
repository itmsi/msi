import { useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError } from '@/helpers/apiHelper';
import { CandidateService } from '../services/Candidateservice';

export const useCandidateToEmployee = (onSuccess?: () => void) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const openConfirm = () => setIsConfirmOpen(true);

    const closeConfirm = () => {
        if (isGenerating) return;
        setIsConfirmOpen(false);
    };

    const generateEmployee = async (candidateId: string) => {
        if (isGenerating || !candidateId) return;

        setIsGenerating(true);
        try {
            const response = await CandidateService.generateEmployeeFromCandidate(candidateId);

            if (!response?.success) {
                toast.error(response?.message || 'Failed to generate employee from this candidate');
                return;
            }

            toast.success(response.message || 'Candidate has been registered as an employee');
            setIsConfirmOpen(false);
            onSuccess?.();
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError?.message || 'Failed to generate employee from this candidate');
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isConfirmOpen,
        isGenerating,
        openConfirm,
        closeConfirm,
        generateEmployee,
    };
};
