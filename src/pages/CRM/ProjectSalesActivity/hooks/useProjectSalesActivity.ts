import { useState, useEffect, useCallback, useRef } from "react";
import { ActivityServices } from '../services/projectSalesActivityServices';
import { ProjectSalesActivitySummaryItem, ProjectSalesActivityRequest, Pagination } from '../types/projectSalesActivity';
import { useLocation, useSearchParams } from "react-router-dom";

type FilterState = {
    search?: string;
    sort_order?: 'asc' | 'desc';
    project_id?: string;
    iup_id?: string;
    iup_customer_id?: string;
    project_status?: string;
    start_date?: string;
    end_date?: string;
};

export const useProjectSalesActivity = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation(); 

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        project_id: (searchParams.get('project_id') as FilterState['project_id']) || '',
        iup_id: (searchParams.get('iup_id') as FilterState['iup_id']) || '',
        iup_customer_id: (searchParams.get('iup_customer_id') as FilterState['iup_customer_id']) || '',
        start_date: (searchParams.get('start_date') as FilterState['start_date']) || '',
        end_date: (searchParams.get('end_date') as FilterState['end_date']) || '',
        project_status: (searchParams.get('project_status') as FilterState['project_status']) || '',
    };

    // Input search dipisah agar tidak memicu fetch saat user masih mengetik
    const [searchValue, setSearchValue] = useState(urlFilters.search);

    const [activities, setActivities] = useState<any[]>([]);
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
            if (value && value !== 'desc') {
                params.set(key, value);
            }
        });
        
        setSearchParams(params);
    }, [setSearchParams]);

    // Fetch activities from API
    const fetchProjectSalesActivity = useCallback(async (params?: Partial<ProjectSalesActivityRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const requestParams: ProjectSalesActivityRequest = {
                page: urlPage,
                limit: urlLimit,
                ...urlFilters,
                ...params
            };
            const response = await ActivityServices.getPSA(requestParams);
            
            setActivities(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch Project Sales Activity data');
            console.error('Error fetching Project Sales Activity data:', err);
        } finally {
            setLoading(false);
        }
    }, [urlFilters, urlLimit, urlPage]);

    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        const updatedFilters = { ...urlFilters, ...newFilters };
        console.log({
            updatedFilters,
            newFilters
        })
        updateUrlParams(updatedFilters, 1, urlLimit);
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
        fetchProjectSalesActivity();
        
        // Memastikan input text search ter-reset jika user memencet tombol Back
        setSearchValue(urlFilters.search);
        
    }, [location.search]);

    return {
        // State
        activities,
        loading,
        error,
        pagination,
        
        filters: urlFilters,
        searchValue,
        setSearchValue,
        
        // Actions
        fetchProjectSalesActivity,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,

        executeSearch,
        handleKeyPress,
        handleClearSearch,
    };
};