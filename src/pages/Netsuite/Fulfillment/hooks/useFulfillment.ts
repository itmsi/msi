import { useCallback, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiError } from '@/helpers/apiHelper';
import { FulfillmentService } from '../services/fulfillmentService';
import { Pagination, FulfillmentItem, FulfillmentRequest, SyncInfo } from '../types/fulfillment';
import { NetSuiteSyncService } from '../../Sync/services/netSuiteSyncService';

type FilterState = {
    search: string;
    sort_order: 'asc' | 'desc';
    status: string;
    source_type: string;
};

const EMPTY_FILTERS: FilterState = {
    search: '',
    sort_order: 'desc',
    status: '',
    source_type: '',
};

// Nilai kosong tidak ikut dikirim ke API
const buildActiveFilters = (filters: FilterState): Partial<FulfillmentRequest> => {
    const entries = Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined);
    return Object.fromEntries(entries) as Partial<FulfillmentRequest>;
};

export const useFulfillment = (profileSSO?: number) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [searchValue, setSearchValue] = useState('');

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        status: searchParams.get('status') || '',
        source_type: searchParams.get('source_type') || '',
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fulfillment, setFulfillment] = useState<FulfillmentItem[]>([]);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
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

    const fetchFulfillment = useCallback(async (overrides?: Partial<FulfillmentRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await FulfillmentService.getFulfillments({
                page: urlPage,
                limit: urlLimit,
                sort_by: 'last_modified',
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
                ...buildActiveFilters(urlFilters),
                ...overrides,
            });

            setFulfillment(response.data?.items || []);
            setPagination(response.data?.pagination || {
                page: urlPage,
                limit: urlLimit,
                total: 0,
                totalPages: 0
            });
            setSyncInfo(response.sync_info || null);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError?.message || 'Failed to fetch fulfillment data');
            console.error('Error fetching fulfillment data:', err);
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
        setSearchValue('');
        updateUrlParams(EMPTY_FILTERS, 1, urlLimit);
    }, [updateUrlParams, urlLimit]);

    useEffect(() => {
        fetchFulfillment();

        // Memastikan input text search ter-reset jika user memencet tombol Back
        setSearchValue(urlFilters.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const activeFilterCount = [urlFilters.status, urlFilters.source_type].filter(Boolean).length;

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data fulfillment...');
        try {
            await NetSuiteSyncService.sync('fulfillments');
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchFulfillment({ page: 1 });
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchFulfillment]);

    const handleSyncById = useCallback(async (row: FulfillmentItem) => {
        if (isSyncing) return;
        if (!row?.netsuite_id && !row?.id) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi Fulfillment: ${row.number || row.id}...`);
        try {
            await FulfillmentService.syncFulfillmentById(String(row.netsuite_id || row.id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchFulfillment({ page: urlPage, limit: urlLimit });
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchFulfillment, urlPage, urlLimit]);

    return {
        fulfillment,
        filters: urlFilters,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        activeFilterCount,
        setSearchValue,
        fetchFulfillment,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        handleClearFilters,
        isSyncing,
        handleSync,
        handleSyncById,
    };
};
