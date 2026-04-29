import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Pagination, PurchaseOrderItem, PurchaseOrderRequest, SyncInfo } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';

export const usePurchaseOrder = (profileSSO?: number) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('desc');
    const [sortModify, setSortModify] = useState< 'created_at' | 'updated_at' | 'last_modified' | 'po_id' | ''>('created_at');
    const [statusFilter, setStatusFilter] = useState('');
    const [subsidiaryFilter, setSubsidiaryFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [approvalStatusFilter, setApprovalStatusFilter] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
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

    const fetchPurchaseOrders = useCallback(async (params?: Partial<PurchaseOrderRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await PurchaseOrderService.getPurchaseOrders({
                page: params?.page || pagination.page,
                limit: params?.limit || pagination.limit,
                sort_by: params?.sort_by || sortModify || 'po_id',
                sort_order: params?.sort_order || sortOrder || 'desc',
                search: params?.search !== undefined ? params.search : searchValue,
                status: params?.status !== undefined ? params.status : statusFilter,
                subsidiary: params?.subsidiary !== undefined ? params.subsidiary : subsidiaryFilter,
                location: params?.location !== undefined ? params.location : locationFilter,
                ...(params?.approvalstatus !== undefined ? { approvalstatus: Number(approvalStatusFilter) }  : {}),
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
                ...params
            });

            setPurchaseOrders(response.data?.items || []);
            setPagination(response.data?.pagination || pagination);
            setSyncInfo(response.sync_info || null);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch purchase order data');
            console.error('Error fetching purchase order data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, sortModify, statusFilter, subsidiaryFilter, locationFilter, approvalStatusFilter, pagination.page, pagination.limit]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchPurchaseOrders({ page });
    }, [fetchPurchaseOrders]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, limit, page }));
        fetchPurchaseOrders({ limit, page });
    }, [fetchPurchaseOrders]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchPurchaseOrders({ search: searchQuery, page: 1 });
    }, [fetchPurchaseOrders]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'status') {
            setStatusFilter(value);
        } else if (filterType === 'sort_by') {
            setSortModify(value as 'created_at' | 'updated_at' | 'last_modified' | 'po_id' | '');
        } else if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc' | '');
        } else if (filterType === 'subsidiary') {
            setSubsidiaryFilter(value);
        } else if (filterType === 'location') {
            setLocationFilter(value);
        } else if (filterType === 'approvalstatus') {
            setApprovalStatusFilter(value);
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const params: any = { page: 1 };
        if (filterType === 'status') params.status = value;
        else if (filterType === 'sort_by') params.sort_by = value;
        else if (filterType === 'sort_order') params.sort_order = value;
        else if (filterType === 'subsidiary') params.subsidiary = value;
        else if (filterType === 'location') params.location = value;
        else if (filterType === 'approvalstatus') params.approvalstatus = Number(value);

        fetchPurchaseOrders(params);
    }, [fetchPurchaseOrders]);

    // Initial load
    useEffect(() => {
        fetchPurchaseOrders();
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

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = useCallback(async (_row?: PurchaseOrderItem) => {
        if (isSyncing) return;
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data purchase order...');
        try {
            const result = await PurchaseOrderService.syncPOItems();
            if (result) {
                toast.success('Sinkronisasi berhasil', { id: toastId });
                fetchPurchaseOrders({ page: 1 });
            } else {
                toast.error('Sinkronisasi gagal', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchPurchaseOrders]);

    const handleSyncById = useCallback(async (row: PurchaseOrderItem) => {
        if (isSyncing) return;
        if (!row?.po_id) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi PO: ${row.po_number || row.po_id}...`);
        try {
            await PurchaseOrderService.syncPOById(String(row.po_id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchPurchaseOrders({ page: paginationRef.current.page, limit: paginationRef.current.limit });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchPurchaseOrders]);

    const handleDownloadInvoice = useCallback(async (row: PurchaseOrderItem) => {
        if (!row?.po_id) return;
        const toastId = toast.loading(`Mengunduh invoice PO: ${row.po_number || row.po_id}...`);
        try {
            const response = await PurchaseOrderService.downloadInvoice({
                recId: Number(row.po_id),
                // recId: 4152,
            });

            if (response?.fileContent && response?.fileName) {
                const byteChars = atob(response.fileContent);
                const byteArr = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteArr[i] = byteChars.charCodeAt(i);
                }
                const blob = new Blob([byteArr], { type: response.mimeType || 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = response.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast.success('Invoice berhasil diunduh', { id: toastId });
            } else {
                toast.error('Gagal mengunduh invoice', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Gagal mengunduh invoice', { id: toastId });
        }
    }, []);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
        setSubsidiaryFilter('');
        setLocationFilter('');
        setApprovalStatusFilter('');
        setSortOrder('desc');
        setSortModify('created_at');
        
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchPurchaseOrders({ 
            page: 1, 
            status: '', 
            subsidiary: '', 
            location: '',
            sort_order: 'desc',
            sort_by: 'created_at'
        });
    }, [fetchPurchaseOrders]);

    return {
        purchaseOrders,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        sortModify,
        statusFilter,
        subsidiaryFilter,
        locationFilter,
        approvalStatusFilter,
        setSearchValue,
        fetchPurchaseOrders,
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
        handleDownloadInvoice,
    };
};
