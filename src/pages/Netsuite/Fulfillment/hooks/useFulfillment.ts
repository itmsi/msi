import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FulfillmentService } from '../services/fulfillmentService';
import { Pagination, FulfillmentItem, FulfillmentRequest, SyncInfo } from '../types/fulfillment';
import { NetSuiteSyncService } from '../../Sync/services/netSuiteSyncService';

export const useFulfillment = (profileSSO?: number) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('desc');
    const [sortModify, setSortModify] = useState<'last_modified' | 'created_at' | 'updated_at' | ''>('last_modified');
    const [statusFilter, setStatusFilter] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fulfillment, setFulfillment] = useState<FulfillmentItem[]>([]);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const paginationRef = useRef(pagination);
    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    const fetchFulfillment = useCallback(async (params?: Partial<FulfillmentRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await FulfillmentService.getFulfillments({
                page: params?.page || pagination.page,
                limit: params?.limit || pagination.limit,
                sort_by: params?.sort_by || sortModify || 'last_modified',
                sort_order: params?.sort_order || sortOrder || 'desc',
                search: params?.search !== undefined ? params.search : searchValue,
                status: params?.status !== undefined ? params.status : (statusFilter || undefined),
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
                ...params
            });

            setFulfillment(response.data?.items || []);
            setPagination(response.data?.pagination || pagination);
            setSyncInfo(response.sync_info || null);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch fulfillment data');
            console.error('Error fetching fulfillment data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, sortModify, statusFilter, pagination.page, pagination.limit]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchFulfillment({ page });
    }, [fetchFulfillment]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, limit, page }));
        fetchFulfillment({ limit, page });
    }, [fetchFulfillment]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchFulfillment({ search: searchQuery, page: 1 });
    }, [fetchFulfillment]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'status') {
            setStatusFilter(value);
        } else if (filterType === 'sort_by') {
            setSortModify(value as 'last_modified' | 'created_at' | 'updated_at' | '');
        } else if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc' | '');
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const params: any = { page: 1 };
        if (filterType === 'status') params.status = value || undefined;
        else if (filterType === 'sort_by') params.sort_by = value;
        else if (filterType === 'sort_order') params.sort_order = value;

        fetchFulfillment(params);
    }, [fetchFulfillment]);

    // Initial load
    useEffect(() => {
        fetchFulfillment();
    }, []);

    const executeSearch = useCallback(() => {
        handleSearch(searchValue);
    }, [handleSearch, searchValue]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    }, [executeSearch]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        handleSearch('');
    }, [handleSearch]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
        setSortOrder('desc');
        setSortModify('last_modified');

        setPagination(prev => ({ ...prev, page: 1 }));
        fetchFulfillment({
            page: 1,
            sort_order: 'desc',
            sort_by: 'last_modified',
            status: undefined
        });
    }, [fetchFulfillment]);

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data fulfillment...');
        try {
            await NetSuiteSyncService.sync('fulfillments');
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchFulfillment({ page: 1 });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
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
            fetchFulfillment({ page: pagination.page, limit: pagination.limit });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchFulfillment, pagination.page, pagination.limit]);

    const activeFilterCount = [statusFilter].filter(Boolean).length;

    return {
        fulfillment,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        sortModify,
        statusFilter,
        activeFilterCount,
        setSearchValue,
        fetchFulfillment,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleSearch,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        handleClearFilters,
        isSyncing,
        handleSync,
        handleSyncById,
    };
};
