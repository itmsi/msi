import { useState, useEffect, useCallback } from "react";
import { ContractorServices } from '../services/contractorServices';
import { Contractor, ContractorListRequest, Pagination } from '../types/contractor';

export const useContractors = () => {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [filters, setFilters] = useState({
        mine_type: '' as 'batu bara' | 'nikel' | 'lainnya' | '',
        status: '' as 'active' | 'inactive' | ''
    });
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
                page: pagination.page,
                limit: pagination.limit,
                sort_order: 'desc',
                search: searchValue,
                mine_type: filters.mine_type,
                status: filters.status,
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
    }, [pagination.page, pagination.limit, searchValue, filters.mine_type, filters.status]);

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
        setFilters(prev => ({ ...prev, mine_type: mineType }));
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContractors({ 
            ...filters,
            mine_type: mineType,
            page: 1 
        });
    }, [fetchContractors, filters]);

    const handleStatusFilter = useCallback((status: 'active' | 'inactive' | '') => {
        setFilters(prev => ({ ...prev, status: status }));
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContractors({ 
            ...filters, 
            status: status,
            page: 1 
        });
    }, [fetchContractors, filters]);

    const handleFilters = useCallback((newFilters: { search?: string; mine_type?: 'batu bara' | 'nikel' | 'lainnya' | ''; status?: 'active' | 'inactive' | ''  }) => {
        if (newFilters.search !== undefined) {
            setSearchValue(newFilters.search);
        }
        if (newFilters.mine_type !== undefined || newFilters.status !== undefined) {
            setFilters(prev => ({ ...prev, ...newFilters }));
        }
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContractors({ ...newFilters, page: 1 });
    }, [fetchContractors]);

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

    useEffect(() => {
        fetchContractors();
    }, []);

    return {
        // State
        contractors,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        filters,
        setFilters,
        
        // Actions
        fetchContractors,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch,
        handleMineTypeFilter,
        handleStatusFilter,
        handleFilters,
        
        // Search functions
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        
        refetch: () => fetchContractors()
    };
};
