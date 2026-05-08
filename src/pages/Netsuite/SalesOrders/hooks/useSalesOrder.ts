import { useState, useEffect, useCallback } from 'react';
import { SalesOrder, SalesOrderRequest, SalesOrderSyncInfo } from '../types/salesOrder';
import toast from 'react-hot-toast';
import { SalesOrderService } from '../services/salesOrderService';

export const useSalesOrder = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Advanced filters
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    const [syncInfo, setSyncInfo] = useState<SalesOrderSyncInfo | null>(null);

    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 20,
        total_records: 0,
        total_pages: 0,
    });

    const fetchSalesOrders = useCallback(async (overrides?: Partial<SalesOrderRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const requestBody: SalesOrderRequest = {
                page: overrides?.page ?? pagination.page,
                limit: overrides?.limit ?? pagination.page_size,
                sort_by: 'updated_at',
                sort_order: overrides?.sort_order ?? sortOrder,
                ...(overrides?.search !== undefined
                    ? (overrides.search ? { search: overrides.search } : {})
                    : (searchValue ? { search: searchValue } : {})),
                ...(overrides?.status !== undefined
                    ? (overrides.status ? { status: overrides.status } : {})
                    : (filterStatus ? { status: filterStatus } : {})),
                ...(overrides?.tran_date_start !== undefined
                    ? (overrides.tran_date_start ? { tran_date_start: overrides.tran_date_start } : {})
                    : (filterStartDate ? { tran_date_start: filterStartDate } : {})),
                ...(overrides?.tran_date_end !== undefined
                    ? (overrides.tran_date_end ? { tran_date_end: overrides.tran_date_end } : {})
                    : (filterEndDate ? { tran_date_end: filterEndDate } : {})),
            };

            const response = await SalesOrderService.getSalesOrders(requestBody);

            setSalesOrders(response.data.items || []);
            setPagination({
                page: response.data.pagination.page || 1,
                page_size: response.data.pagination.limit || 20,
                total_records: response.data.pagination.total || 0,
                total_pages: response.data.pagination.totalPages || 0,
            });
            if (response.sync_info) {
                setSyncInfo(response.sync_info);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch sales orders data');
            console.error('Error fetching sales orders data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, filterStatus, filterStartDate, filterEndDate, pagination.page, pagination.page_size]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchSalesOrders({ page });
    }, [fetchSalesOrders]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, page_size: limit, page }));
        fetchSalesOrders({ limit, page });
    }, [fetchSalesOrders]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchSalesOrders({ search: searchQuery, page: 1 });
    }, [fetchSalesOrders]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
        } else if (filterType === 'status') {
            setFilterStatus(value);
        } else if (filterType === 'tran_date_start') {
            setFilterStartDate(value);
        } else if (filterType === 'tran_date_end') {
            setFilterEndDate(value);
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const override: Partial<SalesOrderRequest> = { page: 1 };
        if (filterType === 'sort_order') override.sort_order = value as 'asc' | 'desc';
        else if (filterType === 'status') override.status = value;
        else if (filterType === 'tran_date_start') override.tran_date_start = value;
        else if (filterType === 'tran_date_end') override.tran_date_end = value;

        fetchSalesOrders(override);
    }, [fetchSalesOrders]);

    // Initial load
    useEffect(() => {
        fetchSalesOrders();
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
        setFilterStatus('');
        setFilterStartDate('');
        setFilterEndDate('');
        setSortOrder('desc');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchSalesOrders({
            page: 1,
            sort_order: 'desc',
            search: '',
            status: '',
            tran_date_start: '',
            tran_date_end: '',
        });
    }, [fetchSalesOrders]);

    const activeFilterCount = [
        filterStatus,
        filterStartDate,
        filterEndDate,
    ].filter(Boolean).length;

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data sales order...');
        try {
            const result = await SalesOrderService.syncSalesOrders();
            if (result.success) {
                toast.success('Sinkronisasi berhasil', { id: toastId });
                fetchSalesOrders({ page: 1 });
            } else {
                toast.error('Sinkronisasi gagal', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchSalesOrders]);

    const handleSyncById = useCallback(async (row: SalesOrder) => {
        if (isSyncing) return;
        if (!row?.id) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi SO: ${row.tranid || row.id}...`);
        try {
            await SalesOrderService.syncSalesOrderById(String(row.id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchSalesOrders({ page: pagination.page, limit: pagination.page_size });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchSalesOrders, pagination.page, pagination.page_size]);

    return {
        salesOrders,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        filterStatus,
        filterStartDate,
        filterEndDate,
        activeFilterCount,
        setSearchValue,
        fetchSalesOrders,
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
