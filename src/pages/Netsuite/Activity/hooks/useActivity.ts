import { useCallback, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { ApiError } from '@/helpers/apiHelper';
import { ActivityService } from '../services/activityService';
import { ActivityRow, Pagination } from '../types/activity';
import { toActivityRows, toRequestEndDate, toRequestStartDate } from '../utils/activityFormat';
import { getProfile } from '@/helpers/generalHelper';

type FilterState = {
    search: string;
    sort_order: 'asc' | 'desc';
    type_data: string;
    client: string;
    status: string;
    module_name: string;
    start_date: string;
    end_date: string;
};

const DEFAULT_SORT_ORDER: FilterState['sort_order'] = 'desc';

const today = (): string => moment().format('YYYY-MM-DD');

export const useActivity = () => {
    const profileSSO = getProfile() as any;
    const profileSSOITI = profileSSO.company_name;
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [searchValue, setSearchValue] = useState('');

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc',
        type_data: profileSSOITI === 'MSI' ? (searchParams.get('type_data') || 'APPS') : 'APPS',
        client: profileSSOITI === 'MSI' ? (searchParams.get('client') || '') : 'ITI',
        status: searchParams.get('status') || '',
        module_name: searchParams.get('module_name') || '',
        start_date: searchParams.get('start_date') || today(),
        end_date: searchParams.get('end_date') || today(),
    };

    const [activities, setActivities] = useState<ActivityRow[]>([]);
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
        if (page > 1) params.set('page', String(page));
        if (limit !== 10) params.set('limit', String(limit));
        if (currentFilters.search) params.set('search', currentFilters.search);
        if (currentFilters.sort_order !== DEFAULT_SORT_ORDER) params.set('sort_order', currentFilters.sort_order);
        if (currentFilters.type_data) params.set('type_data', currentFilters.type_data);
        if (currentFilters.client) params.set('client', currentFilters.client);
        if (currentFilters.status) params.set('status', currentFilters.status);
        if (currentFilters.module_name) params.set('module_name', currentFilters.module_name);
        if (currentFilters.start_date) params.set('start_date', currentFilters.start_date);
        if (currentFilters.end_date) params.set('end_date', currentFilters.end_date);

        setSearchParams(params);
    }, [setSearchParams]);

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await ActivityService.getActivities({
                page: urlPage,
                limit: urlLimit,
                search: urlFilters.search,
                sort_order: urlFilters.sort_order,
                type_data: urlFilters.type_data,
                client: urlFilters.client,
                status: urlFilters.status,
                module_name: urlFilters.module_name,
                start_date: toRequestStartDate(urlFilters.start_date),
                end_date: toRequestEndDate(urlFilters.end_date),
            });

            if (!result.success) {
                setActivities([]);
                setError(result.message || 'Failed to fetch activity logs');
                return;
            }

            setActivities(toActivityRows(result.items));
            setPagination(result.pagination);
        } catch (err) {
            const apiError = err as ApiError;
            setActivities([]);
            setError(apiError?.message || 'Failed to fetch activity logs');
            console.error('Error fetching activity logs:', err);
        } finally {
            setLoading(false);
        }
    }, [
        urlFilters.search,
        urlFilters.sort_order,
        urlFilters.type_data,
        urlFilters.client,
        urlFilters.status,
        urlFilters.module_name,
        urlFilters.start_date,
        urlFilters.end_date,
        urlPage,
        urlLimit,
    ]);

    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        updateUrlParams({ ...urlFilters, ...newFilters }, 1, urlLimit);
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handleDateRangeChange = useCallback((startDate: string, endDate: string) => {
        handleFilterChange({ start_date: startDate, end_date: endDate });
    }, [handleFilterChange]);

    const handlePageChange = useCallback((page: number) => {
        updateUrlParams(urlFilters, page, urlLimit);
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        updateUrlParams(urlFilters, page, limit);
    }, [urlFilters, updateUrlParams]);

    const handleSearch = useCallback(() => {
        handleFilterChange({ search: searchValue });
    }, [handleFilterChange, searchValue]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        handleFilterChange({ search: '' });
    }, [handleFilterChange]);

    const handleClearFilters = useCallback(() => {
        setSearchValue('');
        updateUrlParams({
            search: '',
            sort_order: DEFAULT_SORT_ORDER,
            type_data: '',
            client: '',
            status: '',
            module_name: '',
            start_date: today(),
            end_date: today(),
        }, 1, urlLimit);
    }, [updateUrlParams, urlLimit]);

    useEffect(() => {
        fetchActivities();
        setSearchValue(urlFilters.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const activeFilterCount = [
        urlFilters.type_data,
        urlFilters.client,
        urlFilters.status,
        urlFilters.module_name,
    ].filter(Boolean).length;

    return {
        activities,
        filters: urlFilters,
        loading,
        error,
        pagination,
        searchValue,
        activeFilterCount,
        setSearchValue,
        fetchActivities,
        handleFilterChange,
        handleDateRangeChange,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch,
        handleClearSearch,
        handleClearFilters,
    };
};
