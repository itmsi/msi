import { useState, useEffect, useCallback } from "react";
import { ContractorServices } from '../services/contractorServices';
import { Contractor, ContractorListRequest, Pagination } from '../types/contractor';

export const useContractors = () => {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('desc');
    const [sortModify, setSortModify] = useState<'updated_at' | 'created_at' | ''>('updated_at');
    const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('');
    const [segmentationFilter, setSegmentationFilter] = useState('');
    const [mineTypeFilter, setMineTypeFilter] = useState<'batu bara' | 'nikel' | 'lainnya' | ''>('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchContractors = useCallback(async (params?: Partial<ContractorListRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const requestParams: ContractorListRequest = {
                page: params?.page || pagination?.page || 1,
                limit: params?.limit || pagination?.limit || 10,
                sort_order: params?.sort_order || sortOrder || 'desc',
                search: params?.search ?? searchValue,
                mine_type: params?.mine_type ?? mineTypeFilter,
                status: params?.status ?? statusFilter,
                segmentation_id: params?.segmentation_id ?? segmentationFilter,
                ...params
            };
            
            const response = await ContractorServices.getContractors(requestParams);
            
            setContractors(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch contractors');
            console.error('Error fetching contractors:', err);
        } finally {
            setLoading(false);
        }
    }, [sortOrder, mineTypeFilter, statusFilter, segmentationFilter, searchValue]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchContractors({ page });
    }, [fetchContractors]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, limit, page }));
        fetchContractors({ limit, page });
    }, [fetchContractors]);

    const handleSearch = useCallback((searchQuery: string) => {
        setSearchValue(searchQuery);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContractors({ search: searchQuery, page: 1 });
    }, [fetchContractors]);

    const handleMineTypeFilter = useCallback((mineType: 'batu bara' | 'nikel' | 'lainnya' | '') => {
        setMineTypeFilter(mineType);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContractors({ 
            mine_type: mineType,
            page: 1 
        });
    }, [fetchContractors]);

    const handleStatusFilter = useCallback((status: 'active' | 'inactive' | '') => {
        setStatusFilter(status);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContractors({ 
            status: status,
            page: 1 
        });
    }, [fetchContractors]);

    const handleFilters = useCallback((newFilters: { search?: string; mine_type?: 'batu bara' | 'nikel' | 'lainnya' | ''; status?: 'active' | 'inactive' | ''; sort_order?: 'asc' | 'desc' | ''; segmentation_id?: string }) => {
        if (newFilters.search !== undefined) {
            setSearchValue(newFilters.search);
        }
        if (newFilters.mine_type !== undefined) {
            setMineTypeFilter(newFilters.mine_type);
        }
        if (newFilters.status !== undefined) {
            setStatusFilter(newFilters.status);
        }
        if (newFilters.sort_order !== undefined) {
            setSortOrder(newFilters.sort_order);
        }
        if (newFilters.segmentation_id !== undefined) {
            setSegmentationFilter(newFilters.segmentation_id);
        }
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContractors({ ...newFilters, page: 1 });
    }, [fetchContractors]);

    // Generic filter change handler
    const handleFilterChange = useCallback((field: string, value: string) => {
        // Update individual state based on field
        switch (field) {
            case 'search':
                setSearchValue(value);
                break;
            case 'mine_type':
                setMineTypeFilter(value as 'batu bara' | 'nikel' | 'lainnya' | '');
                break;
            case 'status':
                setStatusFilter(value as 'active' | 'inactive' | '');
                break;
            case 'sort_order':
                setSortOrder(value as 'asc' | 'desc' | '');
                break;
            case 'segmentation_id':
                setSegmentationFilter(value);
                break;
        }
        
        // Reset pagination and fetch with new filters
        setPagination(prevPag => ({ ...prevPag, page: 1 }));
        
        // Use setTimeout to ensure state updates are applied
        setTimeout(() => {
            fetchContractors({ 
                page: 1,
                search: field === 'search' ? value : searchValue,
                mine_type: field === 'mine_type' ? value as 'batu bara' | 'nikel' | 'lainnya' | '' : mineTypeFilter,
                status: field === 'status' ? value as 'active' | 'inactive' | '' : statusFilter,
                sort_order: field === 'sort_order' ? value as 'asc' | 'desc' | '' : sortOrder,
                segmentation_id: field === 'segmentation_id' ? value : segmentationFilter
            });
        }, 0);
    }, [fetchContractors, searchValue, mineTypeFilter, statusFilter, sortOrder, segmentationFilter]);

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

    // Initial load only
    useEffect(() => {
        fetchContractors();
    }, []); // Empty dependency array for initial load only

    return {
        // State
        contractors,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        sortOrder,
        setSortOrder,
        sortModify,
        setSortModify,
        statusFilter,
        setStatusFilter,
        segmentationFilter,
        setSegmentationFilter,
        mineTypeFilter,
        setMineTypeFilter,
        
        // Actions
        fetchContractors,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch,
        handleMineTypeFilter,
        handleStatusFilter,
        handleFilters,
        handleFilterChange,
        
        // Search functions
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        
        refetch: () => fetchContractors()
    };
};
