import { useState, useEffect, useCallback, useRef } from 'react';
import { CandidateItem, CandidateRequest, Pagination, CandidateOfferingCount } from '../types/Candidate';
import { CandidateService } from '../services/Candidateservice';
import { useLocation, useSearchParams } from 'react-router-dom';

export type FilterState = {
    search: string;
    candidate_status: string;
    sort_order: 'asc' | 'desc' | '';
    group_id: string;
    company_id: string;
    department_id: string;
    title_id: string;
    assign_role: string;
};

export const useCandidateManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    // const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 12, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') ?? '',
        candidate_status: searchParams.get('candidate_status') ?? '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        group_id: searchParams.get('group_id') ?? '',
        company_id: searchParams.get('company_id') ?? '',
        department_id: searchParams.get('department_id') ?? '',
        title_id: searchParams.get('title_id') ?? '',
        assign_role: searchParams.get('assign_role') ?? '',
    };

    const [searchValue, setSearchValue] = useState(urlFilters.search);

    const [candidates, setCandidates] = useState<CandidateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offeringCount, setOfferingCount] = useState<CandidateOfferingCount | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        limit: urlLimit,
        total: 0,
        totalPages: 0,
    });

    // Tracks the most recent fetch — lets an in-flight request for a filter/group
    // that's no longer current be ignored when it resolves, instead of clobbering
    // the newer request's results (e.g. switching groups while loadMore is still in flight).
    const requestIdRef = useRef(0);

    const updateUrlParams = useCallback((currentFilters: FilterState) => {
        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'desc') {
                params.set(key, value);
            }
        });

        setSearchParams(params);
    }, [setSearchParams]);

    const fetchCandidates = useCallback(async (page: number, replace: boolean, activeFilters: FilterState) => {
        const requestId = ++requestIdRef.current;

        replace ? setLoading(true) : setLoadingMore(true);
        setError(null);
        try {
            const response = await CandidateService.getCandidates({
                page,
                limit: pagination.limit,
                ...urlFilters,
                ...activeFilters,
            } as Partial<CandidateRequest>);

            if (requestId !== requestIdRef.current) return; // superseded by a newer request

            setCandidates((prev) => (replace ? response.data || [] : [...prev, ...(response.data || [])]));
            setPagination(response.pagination);
            setOfferingCount(response.candidate_status_offering_count ?? null);
        } catch (err: any) {
            if (requestId !== requestIdRef.current) return;
            setError(err?.message || 'Failed to fetch candidate data');
            console.error('Error fetching candidate data:', err);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, []);
    useEffect(() => {
        setSearchValue(urlFilters.search);
        fetchCandidates(1, true, urlFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const hasMore = pagination.page > 0 && pagination.page < pagination.totalPages;

    const loadMore = useCallback(() => {
        if (loading || loadingMore || !hasMore) return;
        fetchCandidates(pagination.page + 1, false, urlFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, loadingMore, hasMore, pagination.page, fetchCandidates, urlFilters]);

    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        updateUrlParams({ ...urlFilters, ...newFilters });
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

    const handleClearFilters = useCallback(() => {
        handleFilterChange({
            search: '',
            candidate_status: '',
            group_id: '',
            company_id: '',
            department_id: '',
            title_id: '',
            assign_role: '',
        });
    }, [handleFilterChange]);

    return {
        candidates,
        filters: urlFilters,
        loading,
        loadingMore,
        hasMore,
        error,
        pagination,
        offeringCount,
        searchValue,
        setSearchValue,
        fetchCandidates,
        loadMore,
        handleFilterChange,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        handleClearFilters,
    };
};