import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { IupItem, IupRequest, Pagination } from "../types/iupterritory";
import { IupService } from "../services/iupTeritoryService";
import toast from 'react-hot-toast';

type FilterState = {
    search: string;
    sort_order: 'asc' | 'desc' | '';
    iup_id?: string;
};

export const useIupTerritory = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation(); 

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 100, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        iup_id: searchParams.get('iup_id') || '',
    };

    // Input search dipisah agar tidak memicu fetch saat user masih mengetik
    const [searchValue, setSearchValue] = useState(urlFilters.search);

    const [iupTerritories, setIupTerritories] = useState<IupItem[]>([]);
    const [selectedIup, setSelectedIup] = useState<IupItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        if (limit !== 100) params.set('limit', String(limit));
        
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'desc') {
                params.set(key, value);
            }
        });
        
        setSearchParams(params);
    }, [setSearchParams]);

    const fetchIupTerritories = useCallback(async (overrideParams?: Partial<IupRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const requestParams: IupRequest = {
                page: urlPage,
                limit: urlLimit,
                ...urlFilters,
                ...overrideParams // Nilai baru akan menimpa nilai state lama disini
            };
            
            const response = await IupService.getIUPTerritory(requestParams);
            
            setIupTerritories(response.data.items);
            setPagination(response.data.pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch IUP territories');
            console.error('Error fetching IUP territories:', err);
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

    const handleDeleteConfirmation = (iup: IupItem) => {
        setSelectedIup(iup);
        setShowDeleteModal(true);
    };

    const handleDelete = async (iup: IupItem) => {
        if (!selectedIup) return;
        
        try { 
            await IupService.deleteIUPTerritory(iup.iup_selection_id);
            fetchIupTerritories();
            setShowDeleteModal(false);
        } catch {
            toast.error('Gagal menghapus data.');
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedIup(null);
    }

    useEffect(() => {
        fetchIupTerritories();
        
        // Memastikan input text search ter-reset jika user memencet tombol Back
        setSearchValue(urlFilters.search);
        
    }, [location.search]);

    return {
        iupTerritories,
        loading,
        error,
        pagination,

        filters: urlFilters,
        searchValue,
        setSearchValue,
        
        // Actions
        fetchIupTerritories,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        // Search functions
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        
        refetch: fetchIupTerritories,

        // modal delete
        handleDeleteConfirmation,
        handleDelete,
        showDeleteModal,
        selectedIup,
        cancelDelete
        
    };
};