import { useState, useEffect, useCallback } from 'react';
import { ProjectItem, ProjectRequest, Pagination } from '../types/project';
import { ProjectService } from '../services/projectService';
import { useLocation, useSearchParams } from 'react-router-dom';

interface UseProjectManagementProps {
    iup_customer_id: string;
}

type FilterState = {
    search: string;
    status: 'Not Started' | 'Find' | 'Pull' | 'Survey' | 'BAST';
    sort_order: 'asc' | 'desc' | '';
};

export const useProjectManagement = ({ iup_customer_id }: UseProjectManagementProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation(); 

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);
    
    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        status: (searchParams.get('status') as FilterState['status']) || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
    };

    const [searchValue, setSearchValue] = useState(urlFilters.search);
    
    const [projects, setProjects] = useState<ProjectItem[]>([]);
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

    const fetchProjects = useCallback(async (params?: Partial<ProjectRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await ProjectService.getProjects({
                page: pagination.page,
                limit: pagination.limit,
                iup_customer_id: iup_customer_id ? iup_customer_id : '',
                ...urlFilters,
                ...params
            });

            setProjects(response.data || []);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch project data');
            console.error('Error fetching project data:', err);
        } finally {
            setLoading(false);
        }
    }, [urlFilters, pagination.page, pagination.limit]);

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
        fetchProjects({
            page: urlPage,
            limit: urlLimit,
            ...urlFilters
        });
        setSearchValue(urlFilters.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    return {
        projects,
        filters: urlFilters,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        fetchProjects,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
    };
};
