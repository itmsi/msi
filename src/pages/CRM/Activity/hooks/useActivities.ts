import { useState, useEffect, useCallback } from "react";
import { ActivityServices } from '../services/activityServices';
import { Activity, ActivityListRequest, ActivityPagination, ActivityFilters } from '../types/activity';

export const useActivities = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [filters, setFilters] = useState<ActivityFilters>({
        search: '',
        transaction_type: '',
        transaction_source: '',
        sort_by: 'updated_at',
        sort_order: 'desc'
    });
    const [pagination, setPagination] = useState<ActivityPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Fetch activities from API
    const fetchActivities = useCallback(async (params?: Partial<ActivityListRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const requestParams: ActivityListRequest = {
                page: pagination.page,
                limit: pagination.limit,
                sort_order: filters.sort_order || 'desc',
                sort_by: filters.sort_by || 'updated_at',
                search: searchValue,
                transaction_type: filters.transaction_type || '',
                ...params
            };
            
            const response = await ActivityServices.getActivities(requestParams);
            
            setActivities(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            // Handle error messages from API
            if (err?.response?.data?.message) {
                const messages = Array.isArray(err.response.data.message) 
                    ? err.response.data.message.join(', ')
                    : err.response.data.message;
                setError(messages);
            } else {
                setError(err?.message || 'Failed to fetch activities');
            }
            console.error('Error fetching activities:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchValue, filters.sort_by, filters.sort_order, filters.transaction_type]);

    // Handle page changes
    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchActivities({ page });
    }, [fetchActivities]);

    // Handle rows per page changes
    const handleRowsPerPageChange = useCallback((limit: number) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
        fetchActivities({ limit, page: 1 });
    }, [fetchActivities]);

    // Handle search
    const handleSearch = useCallback((searchTerm: string) => {
        setSearchValue(searchTerm);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchActivities({ search: searchTerm, page: 1 });
    }, [fetchActivities]);

    // Handle search on key press (Enter)
    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(searchValue);
        }
    }, [searchValue, handleSearch]);

    // Clear search
    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchActivities({ search: '', page: 1 });
    }, [fetchActivities]);

    // Handle filter changes
    const handleFilters = useCallback((newFilters: Partial<ActivityFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        
        fetchActivities({
            transaction_type: updatedFilters.transaction_type,
            sort_by: updatedFilters.sort_by,
            sort_order: updatedFilters.sort_order !== '' ? updatedFilters.sort_order : undefined,
            page: 1
        });
    }, [filters, fetchActivities]);

    // Refetch data
    const refetch = useCallback(() => {
        fetchActivities();
    }, [fetchActivities]);

    // Initial load
    useEffect(() => {
        fetchActivities();
    }, []);

    return {
        // State
        activities,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        filters,
        setFilters,
        
        // Actions
        handlePageChange,
        handleRowsPerPageChange,
        handleFilters,
        refetch,
        
        // Search functions
        handleSearch,
        handleKeyPress,
        handleClearSearch
    };
};