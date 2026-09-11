import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { InventoryAdjustmentService } from '../services/inventoryAdjustmentService';
import { Pagination, InventoryAdjustmentItem, InventoryAdjustmentRequest, SyncInfo } from '../types/inventoryAdjustment';

export const useInventoryAdjustment = (profileSSO?: number) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC' | ''>('DESC');
    const [sortModify, setSortModify] = useState<'last_modified' | 'created_at' | 'updated_at' | ''>('last_modified');
    const [approvalStatusFilter, setApprovalStatusFilter] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inventoryAdjustment, setInventoryAdjustment] = useState<InventoryAdjustmentItem[]>([]);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const paginationRef = useRef(pagination);
    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    const fetchInventoryAdjustment = useCallback(async (params?: Partial<InventoryAdjustmentRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await InventoryAdjustmentService.getInventoryAdjustments({
                page: params?.page || pagination.page,
                limit: params?.limit || pagination.limit,
                sort_by: params?.sort_by || sortModify || 'last_modified',
                sort_order: params?.sort_order || sortOrder || 'DESC',
                search: params?.search !== undefined ? params.search : searchValue,
                approval_status: params?.approval_status !== undefined ? params.approval_status : (approvalStatusFilter || undefined),
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
                ...params
            });

            setInventoryAdjustment(response.data?.items || []);
            setPagination(response.data?.pagination || pagination);
            setSyncInfo(response.sync_info || null);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch inventory adjustment data');
            console.error('Error fetching inventory adjustment data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, sortModify, approvalStatusFilter, profileSSO, pagination.page, pagination.limit]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchInventoryAdjustment({ page });
    }, [fetchInventoryAdjustment]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, limit, page }));
        fetchInventoryAdjustment({ limit, page });
    }, [fetchInventoryAdjustment]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchInventoryAdjustment({ search: searchQuery, page: 1 });
    }, [fetchInventoryAdjustment]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'sort_by') {
            setSortModify(value as 'last_modified' | 'created_at' | 'updated_at' | '');
            setPagination(prev => ({ ...prev, page: 1 }));
            fetchInventoryAdjustment({ page: 1, sort_by: value });
            return;
        }
        if (filterType === 'sort_order') {
            setSortOrder(value as 'ASC' | 'DESC' | '');
            setPagination(prev => ({ ...prev, page: 1 }));
            fetchInventoryAdjustment({ page: 1, sort_order: value });
            return;
        }
        if (filterType === 'approval_status') {
            setApprovalStatusFilter(value);
            setPagination(prev => ({ ...prev, page: 1 }));
            fetchInventoryAdjustment({ page: 1, approval_status: value || undefined });
            return;
        }
    }, [fetchInventoryAdjustment]);

    // Initial load
    useEffect(() => {
        fetchInventoryAdjustment();
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
        setApprovalStatusFilter('');
        setSortOrder('DESC');
        setSortModify('last_modified');

        setPagination(prev => ({ ...prev, page: 1 }));
        fetchInventoryAdjustment({
            page: 1,
            sort_order: 'DESC',
            sort_by: 'last_modified',
            approval_status: undefined,
        });
    }, [fetchInventoryAdjustment]);

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data inventory adjustment...');
        try {
            await InventoryAdjustmentService.syncInventoryAdjustments();
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchInventoryAdjustment({ page: 1 });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchInventoryAdjustment]);

    const handleSyncById = useCallback(async (row: InventoryAdjustmentItem) => {
        if (isSyncing) return;
        if (!row?.netsuite_id && !row?.id) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi Inventory Adjustment: ${row.tranid || row.id}...`);
        try {
            await InventoryAdjustmentService.syncInventoryAdjustmentById(String(row.netsuite_id || row.id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchInventoryAdjustment({ page: paginationRef.current.page, limit: paginationRef.current.limit });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchInventoryAdjustment]);

    const activeFilterCount = [approvalStatusFilter].filter(Boolean).length;

    return {
        inventoryAdjustment,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        approvalStatusFilter,
        activeFilterCount,
        setSearchValue,
        fetchInventoryAdjustment,
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
