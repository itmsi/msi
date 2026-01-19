import { useState, useEffect, useCallback } from 'react';
import { IupItem, IupRequest, IupSummary, Pagination } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';

export const useIupManagement = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('desc');
    const [sortModify, setSortModify] = useState<'updated_at' | 'created_at' | ''>('updated_at');
    const [statusFilter, setStatusFilter] = useState('');
    const [segmentationFilter, setSegmentationFilter] = useState('');
    
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
                page: params?.page || pagination.page,
                limit: params?.limit || pagination.limit,
                sort_by: params?.sort_by || sortModify || "updated_at",
                sort_order: params?.sort_order || sortOrder || 'desc',
                search: params?.search !== undefined ? params.search : searchValue,
                status: params?.status !== undefined ? params.status : statusFilter,
                segmentation_id: params?.segmentation_id !== undefined ? params.segmentation_id : segmentationFilter,
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
    }, [searchValue, sortOrder, sortModify, statusFilter, pagination.page, pagination.limit]);

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

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'status') {
            setStatusFilter(value);
        } else if (filterType === 'segmentation') {
            setSegmentationFilter(value);
        } else if (filterType === 'sort_by') {
            setSortModify(value as 'updated_at' | 'created_at' | '');
        } else if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc' | '');
        }
        
        setPagination(prev => ({ ...prev, page: 1 }));
        
        const params: any = { page: 1 };
        if (filterType === 'status') {
            params.status = value;
        } else if (filterType === 'segmentation') {
            params.segmentation_id = value;
        } else if (filterType === 'sort_by') {
            params.sort_by = value;
        } else if (filterType === 'sort_order') {
            params.sort_order = value;
        }
        
        fetchIup(params);
    }, [fetchIup]);

    const handleFilters = useCallback((filters: { search?: string; mine_type?: string; status?: string }) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchIup({ ...filters, page: 1 });
    }, [fetchIup]);

    // Initial load
    useEffect(() => {
        fetchIup();
    }, []);
    
    // Refetch when filters change  
    // useEffect(() => {
    //     if (searchValue || sortOrder || sortModify || statusFilter) {
    //         fetchIup({
    //             page: 1,
    //             search: searchValue,
    //             sort_order: sortOrder,
    //             sort_by: sortModify,
    //             status: statusFilter
    //         });
    //     }
    // }, [searchValue, sortOrder, sortModify, statusFilter, fetchIup]);

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
        sortOrder,
        sortModify,
        setSearchValue,
        statusFilter,
        setStatusFilter,
        segmentationFilter,
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