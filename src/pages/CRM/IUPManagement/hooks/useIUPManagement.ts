import { useState, useEffect, useCallback } from 'react';
import { IupItem, IupRequest, IupSummary, Pagination } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';

export const useIupManagement = () => {
    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [iup, setIup] = useState<IupItem[]>([]);
    const [summary, setSummary] = useState<IupSummary>({
        total_iup: 0,
        total_iup_aktif: 0,
        total_contractor: 0,
        total_iup_have_contractor: 0,
        total_iup_no_contractor: 0,
    });
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchIup = useCallback(async (params?: Partial<IupRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await IupService.getIUPManagement({
                page: pagination.page,
                limit: pagination.limit,
                sort_order: 'desc',
                search: '',
                status: statusFilter,
                ...params
            });
            
            setIup(response.data);
            setSummary(response.Summary);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch IUP data');
            console.error('Error fetching IUP data:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchIup({ page });
    }, [fetchIup]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, limit, page }));
        fetchIup({ limit, page });
    }, [fetchIup]);
    

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchIup({ search: searchQuery, page: 1 });
    }, [fetchIup]);

    const handleFilterChange = useCallback((status: string) => {
        setStatusFilter(status);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchIup({ status: status, page: 1 });
    }, [fetchIup]);

    const handleFilters = useCallback((filters: { search?: string; mine_type?: string; status?: string }) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchIup({ ...filters, page: 1 });
    }, [fetchIup]);

    useEffect(() => {
        fetchIup();
    }, []);

    // Search functions
    const executeSearch = useCallback(() => {
        handleSearch(searchValue);
    }, [handleSearch, searchValue]);
    
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    }, [executeSearch]);
    
    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        handleSearch('');
    }, [handleSearch]);

    return {
        // State
        iup,
        loading,
        error,
        pagination,
        summary,
        searchValue,
        setSearchValue,
        statusFilter,
        setStatusFilter,
        fetchIup,

        // Actions
        handlePageChange,
        handleRowsPerPageChange,
        handleFilters,
        
        // Filter actions
        handleFilterChange,
        handleSearch,
        
        // Search functions
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        // resetFilters,
    };
};