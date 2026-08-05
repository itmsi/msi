import { useState, useEffect, useCallback, useRef } from 'react';
import { CandidateItem, CandidateRequest, Pagination, CandidateOfferingCount } from '../types/Candidate';
import { CandidateService } from '../services/Candidateservice';
import { useLocation, useSearchParams } from 'react-router-dom';

type FilterState = {
    search: string;
    candidate_status: string;
    sort_order: 'asc' | 'desc' | '';
};

export const useCandidateManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    // const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') ?? '',
        candidate_status: searchParams.get('candidate_status') ?? '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
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

    const isFetchingRef = useRef(false);

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
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        replace ? setLoading(true) : setLoadingMore(true);
        setError(null);
        try {
            const response = await CandidateService.getCandidates({
                page,
                limit: pagination.limit,
                ...urlFilters,
                ...activeFilters,
            } as Partial<CandidateRequest>);

            setCandidates((prev) => (replace ? response.data || [] : [...prev, ...(response.data || [])]));
            setPagination(response.pagination);
            setOfferingCount(response.candidate_status_offering_count ?? null);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch candidate data');
            console.error('Error fetching candidate data:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
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
    };
};