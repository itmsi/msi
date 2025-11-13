import { useState, useCallback } from 'react';
import { Accessories, AccessoriesRequest, Pagination } from '../types/accessories';
import { AccessoriesService } from '../services/accessoriesService';

export const useAccessories = () => {
    const [accessories, setAccessories] = useState<Accessories[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
        has_next_page: false,
        has_prev_page: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAccessories = useCallback(async (params: Partial<AccessoriesRequest> = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await AccessoriesService.getAccessories(params);
            if (response.status) {
                setAccessories(response.data.items);
                const apiPagination = response.data.pagination;
                setPagination({
                    current_page: apiPagination.page,
                    per_page: apiPagination.limit,
                    total: apiPagination.total,
                    total_pages: apiPagination.totalPages,
                    has_next_page: apiPagination.page < apiPagination.totalPages,
                    has_prev_page: apiPagination.page > 1
                });
            } else {
                setError(response.message || 'Failed to fetch Accessories');
            }
        } catch (err) {
            setError('Something went wrong while fetching Accessories');
            console.error('Fetch Accessories error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAccessories = useCallback(async (accessoriesId: string, accessoriesData: Partial<Omit<Accessories, 'accessory_id'>>) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedAccessories = await AccessoriesService.updateAccessories(accessoriesId, accessoriesData);
            // Update local state
            setAccessories(prev => prev.map(product => 
                product.accessory_id === accessoriesId ? updatedAccessories : product
            ));
            return updatedAccessories;
        } catch (err) {
            setError('Failed to update Accessories');
            console.error('Update Accessories error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAccessories = useCallback(async (accessory_id: string) => {
        setLoading(true);
        setError(null);
        
        try {
            await AccessoriesService.deleteAccessories(accessory_id);
            // Remove from local state
            setAccessories(prev => prev.filter(accessory => accessory.accessory_id !== accessory_id));
            return true;
        } catch (err) {
            setError('Failed to delete accessories');
            console.error('Delete accessories error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        accessories,
        pagination,
        loading,
        error,
        fetchAccessories,
        updateAccessories,
        deleteAccessories,
    };
};