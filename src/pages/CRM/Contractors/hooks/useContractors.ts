import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { ContractorServices } from '../services/contractorServices';
import { Contractor, ContractorListRequest, Pagination } from '../types/contractor';

type FilterState = {
    search: string;
    mine_type: 'batu bara' | 'nikel' | 'lainnya' | '';
    status: 'active' | 'inactive' | '';
    sort_order: 'asc' | 'desc' | '';
    segmentation_id: string;
};

export const useContractors = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation(); 

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        mine_type: (searchParams.get('mine_type') as FilterState['mine_type']) || '',
        status: (searchParams.get('status') as FilterState['status']) || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        segmentation_id: searchParams.get('segmentation_id') || '',
    };

    // Input search dipisah agar tidak memicu fetch saat user masih mengetik
    const [searchValue, setSearchValue] = useState(urlFilters.search);

    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const fetchContractors = useCallback(async (overrideParams?: Partial<ContractorListRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const requestParams: ContractorListRequest = {
                page: urlPage,
                limit: urlLimit,
                ...urlFilters,
                ...overrideParams // Nilai baru akan menimpa nilai state lama disini
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

    // Search functions
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
        fetchContractors();
        
        // Memastikan input text search ter-reset jika user memencet tombol Back
        setSearchValue(urlFilters.search);
        
    }, [location.search]);

    return {
        contractors,
        loading,
        error,
        pagination,

        filters: urlFilters,
        searchValue,
        setSearchValue,
        
        // Actions
        fetchContractors,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        // Search functions
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        
        refetch: fetchContractors
    };
};