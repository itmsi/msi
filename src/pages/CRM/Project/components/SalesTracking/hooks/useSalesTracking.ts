// Custom hook untuk data management - Do One Thing: Manage Sales Tracking Data
import { useState, useCallback } from 'react';
import { ProjectSalesTrackService } from '../../../services/projectSalesTrackService';
import { SalesTrackingItem } from '../../../types/salesTracking';
import toast from 'react-hot-toast';

export const useSalesTracking = (projectId?: string) => {
    const [salesData, setSalesData] = useState<SalesTrackingItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadSalesTracking = useCallback(async () => {
        if (!projectId) return;
        
        setIsLoading(true);
        try {
            const response = await ProjectSalesTrackService.getSalesTracking(projectId);
            
            if (response.status && response.data) {
                setSalesData(response.data);
            }
        } catch (error: any) {
            console.error('Error loading sales tracking:', error);
            toast.error(error.message || 'Gagal memuat data sales tracking');
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    const createSalesTracking = useCallback(async (formData: FormData) => {
        const response = await ProjectSalesTrackService.createSalesTracking(formData);
        await loadSalesTracking(); // Refresh data
        return response;
    }, [loadSalesTracking]);

    const updateSalesTracking = useCallback(async (projectDetailId: string, formData: FormData) => {
        const response = await ProjectSalesTrackService.updateSalesTracking(projectDetailId, formData);
        await loadSalesTracking(); // Refresh data
        return response;
    }, [loadSalesTracking]);

    const deleteSalesTracking = useCallback(async (projectDetailId: string) => {
        await ProjectSalesTrackService.deleteSalesTracking(projectDetailId);
        await loadSalesTracking(); // Refresh data
    }, [loadSalesTracking]);

    return {
        salesData,
        isLoading,
        loadSalesTracking,
        createSalesTracking,
        updateSalesTracking,
        deleteSalesTracking
    };
};