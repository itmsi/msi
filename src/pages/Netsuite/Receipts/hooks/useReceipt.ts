import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { PurchaseOrderService } from '../../PurchaseOrder/services/purchaseOrderService';
import { Pagination, PurchaseOrderItem, ReceiptItem, ReceiveRequest, SyncInfo } from '../../PurchaseOrder/types/purchaseorder';

export const useReceipt = (profileSSO?: number) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('desc');
    const [sortModify, setSortModify] = useState< 'created_at' | 'updated_at' | 'last_modified' | 'po_id' | ''>('created_at');
    const [statusFilter, setStatusFilter] = useState('');
    // const [subsidiaryFilter, setSubsidiaryFilter] = useState('');
    // const [locationFilter, setLocationFilter] = useState('');
    // const [approvalStatusFilter, setApprovalStatusFilter] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [receipt, setReceipt] = useState<ReceiptItem[]>([]);
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

    const fetchReceipt = useCallback(async (params?: Partial<ReceiveRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await PurchaseOrderService.getReceiptById({
                page: params?.page || pagination.page,
                limit: params?.limit || pagination.limit,
                sort_by: params?.sort_by || sortModify || 'po_id',
                sort_order: params?.sort_order || sortOrder || 'desc',
                search: params?.search !== undefined ? params.search : searchValue,
                // status: params?.status !== undefined ? params.status : statusFilter,
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
                ...params
            });

            setReceipt(response.data?.items || []);
            setPagination(response.data?.pagination || pagination);
            setSyncInfo(response.sync_info || null);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch receipt data');
            console.error('Error fetching receipt data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, sortModify, statusFilter, pagination.page, pagination.limit]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchReceipt({ page });
    }, [fetchReceipt]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, limit, page }));
        fetchReceipt({ limit, page });
    }, [fetchReceipt]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchReceipt({ search: searchQuery, page: 1 });
    }, [fetchReceipt]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'status') {
            setStatusFilter(value);
        } else if (filterType === 'sort_by') {
            setSortModify(value as 'created_at' | 'updated_at' | 'last_modified' | 'po_id' | '');
        } else if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc' | '');
        } else if (filterType === 'subsidiary') {
            // setSubsidiaryFilter(value);
        } else if (filterType === 'location') {
            // setLocationFilter(value);
        } else if (filterType === 'approvalstatus') {
            // setApprovalStatusFilter(value);
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const params: any = { page: 1 };
        if (filterType === 'status') params.status = value;
        else if (filterType === 'sort_by') params.sort_by = value;
        else if (filterType === 'sort_order') params.sort_order = value;
        else if (filterType === 'subsidiary') params.subsidiary = value;
        else if (filterType === 'location') params.location = value;
        else if (filterType === 'approvalstatus') params.approvalstatus = Number(value);

        fetchReceipt(params);
    }, [fetchReceipt]);

    // Initial load
    useEffect(() => {
        fetchReceipt();
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
            const result = await PurchaseOrderService.syncReceiptItems();
            if (result) {
                toast.success('Sinkronisasi berhasil', { id: toastId });
                fetchReceipt({ page: 1 });
            } else {
                toast.error('Sinkronisasi gagal', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchReceipt]);

    // const handleSyncById = useCallback(async (row: PurchaseOrderItem) => {
    //     if (isSyncing) return;
    //     if (!row?.po_id) return;
    //     setIsSyncing(true);
    //     const toastId = toast.loading(`Sinkronisasi PO: ${row.po_number || row.po_id}...`);
    //     try {
    //         await PurchaseOrderService.syncPOById(String(row.po_id));
    //         toast.success('Sinkronisasi berhasil', { id: toastId });
    //         fetchReceipt({ page: paginationRef.current.page, limit: paginationRef.current.limit });
    //     } catch (err: any) {
    //         toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
    //     } finally {
    //         setIsSyncing(false);
    //     }
    // }, [isSyncing, fetchReceipt]);

    // const handleDownloadInvoice = useCallback(async (row: PurchaseOrderItem) => {
    //     if (!row?.po_id) return;
    //     const toastId = toast.loading(`Mengunduh invoice PO: ${row.po_number || row.po_id}...`);
    //     try {
    //         const response = await PurchaseOrderService.downloadInvoice({
    //             // recId: Number(row.po_id),
    //             recId: 4152,
    //         });

    //         if (response?.fileContent && response?.fileName) {
    //             const byteChars = atob(response.fileContent);
    //             const byteArr = new Uint8Array(byteChars.length);
    //             for (let i = 0; i < byteChars.length; i++) {
    //                 byteArr[i] = byteChars.charCodeAt(i);
    //             }
    //             const blob = new Blob([byteArr], { type: response.mimeType || 'application/pdf' });
    //             const url = URL.createObjectURL(blob);
    //             const link = document.createElement('a');
    //             link.href = url;
    //             link.download = response.fileName;
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);
    //             URL.revokeObjectURL(url);

    //             toast.success('Invoice berhasil diunduh', { id: toastId });
    //         } else {
    //             toast.error('Gagal mengunduh invoice', { id: toastId });
    //         }
    //     } catch (err: any) {
    //         toast.error(err?.message || 'Gagal mengunduh invoice', { id: toastId });
    //     }
    // }, []);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
        // setSubsidiaryFilter('');
        // setLocationFilter('');
        // setApprovalStatusFilter('');
        setSortOrder('desc');
        setSortModify('created_at');
        
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchReceipt({ 
            page: 1, 
            sort_order: 'desc',
            sort_by: 'created_at'
        });
    }, [fetchReceipt]);

    return {
        receipt,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        sortModify,
        statusFilter,
        setSearchValue,
        fetchReceipt,
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
        // handleSyncById,
        // handleDownloadInvoice,
    };
};