import { useState, useEffect, useCallback } from 'react';
// import { WorkOrderItem, IupRequest, IupSummary, Pagination } from '../types/iupmanagement';
import { useLocation, useSearchParams } from 'react-router-dom';
import { WorkOrderService } from '../services/workOrderService';
import { Pagination, WorkOrderItem, WorkOrderRequest } from '../types/workorder';

type FilterState = {
    search: string;
    sort_by: 'updated_at' | 'created_at' | '';
    sort_order: 'asc' | 'desc' | '';
    status: 'active' | 'inactive' | '';
};
export const useWorkOrder = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation(); 

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_by: (searchParams.get('sort_by') as FilterState['sort_by']) || 'created_at',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        status: (searchParams.get('status') as FilterState['status']) || '',
    };

    const [searchValue, setSearchValue] = useState(urlFilters.search);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);

    const [pagination, setPagination] = useState<Pagination>({
        page: urlPage,
        limit: urlLimit,
        total: 0,
        totalPages: 0
    });

    const updateUrlParams = useCallback((currentFilters: FilterState, page: number, limit: number) => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', String(page));
        if (limit !== 10) params.set('limit', String(limit));
        
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'desc') { // Jangan masukkan nilai kosong atau default sort
                params.set(key, value);
            }
        });
        
        setSearchParams(params);
    }, [setSearchParams]);

    const fetchWorkOrders = useCallback(async (params?: Partial<WorkOrderRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const requestParams: WorkOrderRequest = {
                page: urlPage,
                limit: urlLimit,
                ...urlFilters,
                ...params
            };
            
            const response = await WorkOrderService.getWorkOrders(requestParams);
            
            setWorkOrders(response.data.items);
            setPagination(response.data.pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch work orders');
            console.error('Error fetching work orders:', err);
        } finally {
            setLoading(false);
        }
    }, [urlFilters, urlLimit, urlPage]);

    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        const updatedFilters = { ...urlFilters, ...newFilters };
        updateUrlParams(updatedFilters, 1, urlLimit); // Reset ke page 1 tiap filter berubah
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handlePageChange = useCallback((page: number) => {
        updateUrlParams(urlFilters, page, urlLimit);
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        updateUrlParams(urlFilters, page, limit);
    }, [urlFilters, updateUrlParams]);

    const executeSearch = useCallback(() => {
        handleFilterChange({ search: searchValue });
    }, [handleFilterChange, searchValue]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') executeSearch();
    }, [executeSearch]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        handleFilterChange({ search: '' });
    }, [handleFilterChange]);

    useEffect(() => {
        fetchWorkOrders();
        setSearchValue(urlFilters.search);
        const interval = setInterval(fetchWorkOrders, 20000);
        return () => clearInterval(interval);
    }, [location.search]);

    return {
        // State
        workOrders,
        loading,
        error,
        pagination,

        filters: urlFilters,
        searchValue,
        setSearchValue,
        
        // Actions
        fetchWorkOrders,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,

        // Search functions
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        // resetFilters,
        refetch: fetchWorkOrders
    };
};