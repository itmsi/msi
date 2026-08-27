import { useState, useEffect, useCallback } from 'react';
import { TransferOrderListItem, TransferOrderRequest, SyncInfo } from '../types/transferOrder';
import toast from 'react-hot-toast';
import { TransferOrderService } from '../services/transferOrderService';
import { NetSuiteSyncService } from '../../Sync/services/netSuiteSyncService';

export const useTransferOrder = (profileSSO?: number) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Advanced filters
    const [filterLocation, setFilterLocation] = useState<string>('');
    const [filterTransferLocation, setFilterTransferLocation] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transferOrders, setTransferOrders] = useState<TransferOrderListItem[]>([]);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);

    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total_records: 0,
        total_pages: 0,
    });

    const fetchTransferOrders = useCallback(async (overrides?: Partial<TransferOrderRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const requestBody: TransferOrderRequest = {
                page: overrides?.page ?? pagination.page,
                limit: overrides?.limit ?? pagination.page_size,
                sort_by: 'created_at',
                sort_order: overrides?.sort_order ?? sortOrder,
                ...(overrides?.search !== undefined
                    ? (overrides.search ? { search: overrides.search } : {})
                    : (searchValue ? { search: searchValue } : {})),
                ...(overrides?.location !== undefined
                    ? (overrides.location ? { location: overrides.location } : {})
                    : (filterLocation ? { location: filterLocation } : {})),
                ...(overrides?.transferlocation !== undefined
                    ? (overrides.transferlocation ? { transferlocation: overrides.transferlocation } : {})
                    : (filterTransferLocation ? { transferlocation: filterTransferLocation } : {})),
                ...(overrides?.status_name !== undefined
                    ? (overrides.status_name ? { status_name: overrides.status_name } : {})
                    : (filterStatus ? { status_name: filterStatus } : {})),
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
            };

            const response = await TransferOrderService.getTransferOrders(requestBody);

            setTransferOrders(response.data.items || []);
            setPagination({
                page: response.data.pagination.page || 1,
                page_size: response.data.pagination.limit || 10,
                total_records: response.data.pagination.total || 0,
                total_pages: response.data.pagination.totalPages || 0,
            });
            if (response.sync_info) {
                setSyncInfo(response.sync_info);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch transfer orders data');
            console.error('Error fetching transfer orders data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, filterLocation, filterTransferLocation, filterStatus, pagination.page, pagination.page_size, profileSSO]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchTransferOrders({ page });
    }, [fetchTransferOrders]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, page_size: limit, page }));
        fetchTransferOrders({ limit, page });
    }, [fetchTransferOrders]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchTransferOrders({ search: searchQuery, page: 1 });
    }, [fetchTransferOrders]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
        } else if (filterType === 'location') {
            setFilterLocation(value);
        } else if (filterType === 'transferlocation') {
            setFilterTransferLocation(value);
        } else if (filterType === 'status_name') {
            setFilterStatus(value);
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const override: Partial<TransferOrderRequest> = { page: 1 };
        if (filterType === 'sort_order') override.sort_order = value as 'asc' | 'desc';
        else if (filterType === 'location') override.location = value;
        else if (filterType === 'transferlocation') override.transferlocation = value;
        else if (filterType === 'status_name') override.status_name = value;

        fetchTransferOrders(override);
    }, [fetchTransferOrders]);

    // Initial load
    useEffect(() => {
        fetchTransferOrders();
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

    const handleClearAllFilters = useCallback(() => {
        setSearchValue('');
        setFilterLocation('');
        setFilterTransferLocation('');
        setFilterStatus('');
        setSortOrder('desc');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchTransferOrders({
            page: 1,
            sort_order: 'desc',
            search: '',
            location: '',
            transferlocation: '',
            status_name: '',
        });
    }, [fetchTransferOrders]);

    const activeFilterCount = [
        filterLocation,
        filterTransferLocation,
        filterStatus,
    ].filter(Boolean).length;

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data transfer order...');
        try {
            await NetSuiteSyncService.sync('transfer_orders');
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchTransferOrders({ page: 1 });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
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
            fetchTransferOrders({ page: pagination.page, limit: pagination.page_size });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchTransferOrders, pagination.page, pagination.page_size]);

    return {
        transferOrders,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        filterLocation,
        filterTransferLocation,
        filterStatus,
        activeFilterCount,
        setSearchValue,
        fetchTransferOrders,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleSearch,
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
