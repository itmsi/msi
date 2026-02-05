import { useState, useEffect, useCallback, useRef } from "react";
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
        sort_order: 'desc',
        start_date: '',
        end_date: ''
    });
    const [pagination, setPagination] = useState<ActivityPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Refs to hold current values
    const filtersRef = useRef(filters);
    const searchValueRef = useRef(searchValue);
    const paginationRef = useRef(pagination);
    
    // Update refs when state changes
    useEffect(() => { filtersRef.current = filters; }, [filters]);
    useEffect(() => { searchValueRef.current = searchValue; }, [searchValue]);
    useEffect(() => { paginationRef.current = pagination; }, [pagination]);

    // Fetch activities from API
    const fetchActivities = useCallback(async (params?: Partial<ActivityListRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const currentFilters = filtersRef.current;
            const currentSearchValue = searchValueRef.current;
            const currentPagination = paginationRef.current;
            
            const requestParams: ActivityListRequest = {
                page: params?.page || currentPagination.page,
                limit: params?.limit || currentPagination.limit,
                sort_order: params?.sort_order || currentFilters.sort_order || 'desc',
                sort_by: params?.sort_by || currentFilters.sort_by || 'updated_at',
                search: params?.search !== undefined ? params.search : currentSearchValue,
                transaction_type: params?.transaction_type !== undefined ? params.transaction_type : (currentFilters.transaction_type || ''),
                start_date: params?.start_date !== undefined ? params.start_date : (currentFilters.start_date || ''),
                end_date: params?.end_date !== undefined ? params.end_date : (currentFilters.end_date || '')
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
    }, []);

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
        setFilters(prevFilters => {
            const updatedFilters = { ...prevFilters, ...newFilters };
            
            // Call fetchActivities with updated filters
            fetchActivities({
                transaction_type: updatedFilters.transaction_type,
                sort_by: updatedFilters.sort_by,
                sort_order: updatedFilters.sort_order !== '' ? updatedFilters.sort_order : undefined,
                start_date: updatedFilters.start_date || '',
                end_date: updatedFilters.end_date || '',
                page: 1
            });
            
            return updatedFilters;
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [fetchActivities]);

    // Refetch data
    const refetch = useCallback(() => {
        fetchActivities();
    }, [fetchActivities]);

    // Reset all filters
    const resetFilters = useCallback(() => {
        const defaultFilters: ActivityFilters = {
            search: '',
            transaction_type: '',
            transaction_source: '',
            sort_by: 'updated_at',
            sort_order: 'desc',
            start_date: '',
            end_date: ''
        };
        
        setFilters(defaultFilters);
        setSearchValue('');
        setPagination(prev => ({ ...prev, page: 1 }));
        
        fetchActivities({
            search: '',
            transaction_type: '',
            sort_by: 'updated_at',
            sort_order: 'desc',
            start_date: '',
            end_date: '',
            page: 1
        });
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
        resetFilters,
        
        // Search functions
        handleSearch,
        handleKeyPress,
        handleClearSearch
    };
};