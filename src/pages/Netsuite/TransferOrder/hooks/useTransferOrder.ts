import { useState, useEffect, useCallback } from 'react';
import { TransferOrderListItem, TransferOrderRequest, SyncInfo, Pagination } from '../types/transferOrder';
import toast from 'react-hot-toast';
import { TransferOrderService } from '../services/transferOrderService';
import { NetSuiteSyncService } from '../../Sync/services/netSuiteSyncService';
import { useLocation, useSearchParams } from 'react-router';
import { ApiError } from '@/helpers/apiHelper';

type FilterState = {
    search: string;
    sort_order: 'asc' | 'desc';
    from_location_id: string;
    to_location_id: string;
    status_name: string;
    start_date: string;
    end_date: string;
};

const EMPTY_FILTERS: FilterState = {
    search: '',
    sort_order: 'desc',
    from_location_id: '',
    to_location_id: '',
    status_name: '',
    start_date: '',
    end_date: '',
};

// Nilai kosong tidak ikut dikirim ke API
const buildActiveFilters = (filters: FilterState): Partial<TransferOrderRequest> => {
    const entries = Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined);
    return Object.fromEntries(entries) as Partial<TransferOrderRequest>;
};

export const useTransferOrder = (profileSSO?: number) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [searchValue, setSearchValue] = useState('');

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        from_location_id: searchParams.get('from_location_id') || '',
        to_location_id: searchParams.get('to_location_id') || '',
        status_name: searchParams.get('status_name') || '',
        start_date: searchParams.get('start_date') || '',
        end_date: searchParams.get('end_date') || '',
    };

    const [transferOrders, setTransferOrders] = useState<TransferOrderListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);

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

        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'desc') { // Jangan masukkan nilai kosong atau default sort
                params.set(key, value);
            }
        });

        setSearchParams(params);
    }, [setSearchParams]);

    const fetchTransferOrders = useCallback(async (overrides?: Partial<TransferOrderRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const requestBody: TransferOrderRequest = {
                page: urlPage,
                limit: urlLimit,
                sort_by: 'created_at',
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
                ...buildActiveFilters(urlFilters),
                ...overrides,
            };

            const response = await TransferOrderService.getTransferOrders(requestBody);

            setTransferOrders(response.data?.items || []);
            setPagination(response.data?.pagination || {
                page: urlPage,
                limit: urlLimit,
                total: 0,
                totalPages: 0,
            });
            setSyncInfo(response.sync_info || null);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError?.message || 'Failed to fetch transfer orders data');
            console.error('Error fetching transfer orders data:', err);
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

    const handleDateRangeChange = useCallback((startDate: string, endDate: string) => {
        handleFilterChange({ start_date: startDate, end_date: endDate });
    }, [handleFilterChange]);

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

    const handleClearAllFilters = useCallback(() => {
        setSearchValue('');
        updateUrlParams(EMPTY_FILTERS, 1, urlLimit);
    }, [updateUrlParams, urlLimit]);

    useEffect(() => {
        fetchTransferOrders();

        // Memastikan input text search ter-reset jika user memencet tombol Back
        setSearchValue(urlFilters.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const activeFilterCount = [
        urlFilters.from_location_id,
        urlFilters.to_location_id,
        urlFilters.status_name,
    ].filter(Boolean).length + (urlFilters.start_date && urlFilters.end_date ? 1 : 0);

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data transfer order...');
        try {
            await NetSuiteSyncService.sync('transfer_orders');
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchTransferOrders({ page: 1 });
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchTransferOrders]);

    const handleSyncById = useCallback(async (row: TransferOrderListItem) => {
        if (isSyncing) return;
        if (!row?.netsuite_id && !row?.id) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi TO: ${row.tranid || row.id}...`);
        try {
            await TransferOrderService.syncTransferOrderById(String(row.netsuite_id || row.id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchTransferOrders({ page: urlPage, limit: urlLimit });
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchTransferOrders, urlPage, urlLimit]);

    return {
        transferOrders,
        filters: urlFilters,
        loading,
        error,
        pagination,
        searchValue,
        activeFilterCount,
        setSearchValue,
        fetchTransferOrders,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleDateRangeChange,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        handleClearAllFilters,
        syncInfo,
        isSyncing,
        handleSync,
        handleSyncById,
    };
};
