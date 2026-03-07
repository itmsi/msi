import { useState, useCallback } from 'react';
import { ProjectDivisionOverviewService } from '../../../services/projectDivisionOverviewService';
import { DivisionOverviewItem } from '../../../types/divisionOverview';
import toast from 'react-hot-toast';

export const useDivisionOverview = (projectId?: string) => {
    const [divisionData, setDivisionData] = useState<DivisionOverviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadDivisionOverview = useCallback(async () => {
        if (!projectId) return;
        
        setIsLoading(true);
        try {
            const response = await ProjectDivisionOverviewService.getDivisionOverview(projectId);
            
            if (response.status && response.data) {
                setDivisionData(response.data);
            }
        } catch (error: any) {
            console.error('Error loading division overview:', error);
            toast.error(error.message || 'Gagal memuat data division overview');
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    const createDivisionOverview = useCallback(async (formData: FormData) => {
        const response = await ProjectDivisionOverviewService.createDivisionOverview(formData);
        await loadDivisionOverview();
        return response;
    }, [loadDivisionOverview]);

    const updateDivisionOverview = useCallback(async (projectDetailDivisionId: string, formData: FormData) => {
        const response = await ProjectDivisionOverviewService.updateDivisionOverview(projectDetailDivisionId, formData);
        await loadDivisionOverview();
        return response;
    }, [loadDivisionOverview]);

    const deleteDivisionOverview = useCallback(async (projectDetailId: string) => {
        await ProjectDivisionOverviewService.deleteDivisionOverview(projectDetailId);
        await loadDivisionOverview();
    }, [loadDivisionOverview]);

    return {
        divisionData,
        isLoading,
        loadDivisionOverview,
        createDivisionOverview,
        updateDivisionOverview,
        deleteDivisionOverview
    };
};