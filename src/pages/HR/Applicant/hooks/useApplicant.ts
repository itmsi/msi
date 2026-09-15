import { useCallback, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiError } from '@/helpers/apiHelper';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantService } from '../services/applicantService';
import { ApplicantFormListItem, Pagination } from '../types/applicant';
import { applicantManage } from '../language/applicantManage';

type CompletedFilter = '' | 'true' | 'false';

type FilterState = {
    search: string;
    sort_order: 'asc' | 'desc';
    is_completed: CompletedFilter;
};

const EMPTY_FILTERS: FilterState = {
    search: '',
    sort_order: 'desc',
    is_completed: '',
};

const parseCompletedFilter = (value: string | null): CompletedFilter => (
    value === 'true' || value === 'false' ? value : ''
);

export const useApplicant = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const { langField } = useLanguage(applicantManage);
    const [searchValue, setSearchValue] = useState('');

    const listQueryKey = (() => {
        const params = new URLSearchParams(location.search);
        params.delete('lang');
        return params.toString();
    })();

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc',
        is_completed: parseCompletedFilter(searchParams.get('is_completed')),
    };

    const [applicants, setApplicants] = useState<ApplicantFormListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: urlPage,
        limit: urlLimit,
        total: 0,
        totalPages: 0,
    });

    const updateUrlParams = useCallback((currentFilters: FilterState, page: number, limit: number) => {
        const params = new URLSearchParams();
        const langParam = searchParams.get('lang');
        if (langParam) params.set('lang', langParam);
        if (page > 1) params.set('page', String(page));
        if (limit !== 10) params.set('limit', String(limit));

        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'desc') {
                params.set(key, value);
            }
        });

        setSearchParams(params);
    }, [searchParams, setSearchParams]);

    const fetchApplicants = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await ApplicantService.getApplicantForms({
                page: urlPage,
                limit: urlLimit,
                search: urlFilters.search,
                sort_order: urlFilters.sort_order,
                ...(urlFilters.is_completed ? { is_completed: urlFilters.is_completed === 'true' } : {}),
            });

            if (!result.success) {
                setApplicants([]);
                setError(result.message || langField('fetchFailed'));
                return;
            }

            setApplicants(result.items);
            setPagination(result.pagination);
        } catch (err) {
            const apiError = err as ApiError;
            setApplicants([]);
            setError(apiError?.message || langField('fetchFailed'));
            console.error('Error fetching applicant data:', err);
        } finally {
            setLoading(false);
        }
    }, [urlFilters.search, urlFilters.sort_order, urlFilters.is_completed, urlPage, urlLimit, langField]);

    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        updateUrlParams({ ...urlFilters, ...newFilters }, 1, urlLimit);
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handlePageChange = useCallback((page: number) => {
        updateUrlParams(urlFilters, page, urlLimit);
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        updateUrlParams(urlFilters, page, limit);
    }, [urlFilters, updateUrlParams]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleFilterChange({ search: searchValue });
    }, [handleFilterChange, searchValue]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        handleFilterChange({ search: '' });
    }, [handleFilterChange]);

    const handleClearFilters = useCallback(() => {
        setSearchValue('');
        updateUrlParams(EMPTY_FILTERS, 1, urlLimit);
    }, [updateUrlParams, urlLimit]);

    const handleCopyLink = useCallback(async (applicant: ApplicantFormListItem) => {
        if (!applicant.applicant_form_url) {
            toast.error(langField('linkNotAvailable'));
            return;
        }

        try {
            await navigator.clipboard.writeText(applicant.applicant_form_url);
            toast.success(langField('linkCopied'));
        } catch {
            toast.error(langField('linkCopyFailed'));
        }
    }, [langField]);

    useEffect(() => {
        fetchApplicants();
        setSearchValue(urlFilters.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listQueryKey]);

    const activeFilterCount = [urlFilters.is_completed].filter(Boolean).length;

    return {
        applicants,
        filters: urlFilters,
        loading,
        error,
        pagination,
        searchValue,
        activeFilterCount,
        setSearchValue,
        fetchApplicants,
        handleFilterChange,
        handlePageChange,
        handleRowsPerPageChange,
        handleKeyPress,
        handleClearSearch,
        handleClearFilters,
        handleCopyLink,
    };
};
