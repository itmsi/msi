import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Pagination, PurchaseOrderItem, PurchaseOrderRequest, SyncInfo } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';
import { useLocation, useSearchParams } from 'react-router-dom';

type FilterState = {
    search: string;
    sort_order: 'asc' | 'desc' | '';
    po_status: string;
    subsidiary: string;
    location: string;
    approvalstatus: string | null;
    created_by?: string;
};

export const usePurchaseOrder = (profileSSO?: number) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation(); 
    const [searchValue, setSearchValue] = useState('');
    // const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('desc');
    // const [sortModify, setSortModify] = useState< 'created_at' | 'updated_at' | 'last_modified' | 'po_id' | ''>('created_at');
    // const [statusFilter, setStatusFilter] = useState('');
    // const [subsidiaryFilter, setSubsidiaryFilter] = useState('');
    // const [locationFilter, setLocationFilter] = useState('');
    // const [approvalStatusFilter, setApprovalStatusFilter] = useState('');
    // const [employeeFilter, setEmployeeFilter] = useState('');

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        po_status: searchParams.get('po_status') || '',
        subsidiary: searchParams.get('subsidiary') || '',
        location: searchParams.get('location') || '',
        approvalstatus: searchParams.get('approvalstatus') || null,
        created_by: searchParams.get('created_by') || '',
    };

    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: urlPage,
        limit: urlLimit,
        total: 0,
        totalPages: 0
    });

    // const paginationRef = useRef(pagination);
    // useEffect(() => {
    //     paginationRef.current = pagination;
    // }, [pagination]);

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

    const fetchPurchaseOrders = useCallback(async (params?: Partial<PurchaseOrderRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await PurchaseOrderService.getPurchaseOrders({
                page: urlPage,
                limit: urlLimit,
                sort_by: 'created_at',
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
                ...urlFilters,
                ...params,
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
    
    // Clear search — reset URL params agar useEffect trigger refetch otomatis
    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        updateUrlParams({
            search: '',
            sort_order: 'desc',
            po_status: '',
            subsidiary: '',
            location: '',
            approvalstatus: null,
            created_by: '',
        }, 1, urlLimit);
    }, [updateUrlParams, urlLimit]);

    useEffect(() => {
        fetchPurchaseOrders();
        
        // Memastikan input text search ter-reset jika user memencet tombol Back
        setSearchValue(urlFilters.search);
        
    }, [location.search]);

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
            // fetchPurchaseOrders({ page: urlPage, limit: urlLimit, ...urlFilters });
            fetchPurchaseOrders({ page: urlPage, limit: urlLimit });
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

    return {
        purchaseOrders,
        syncInfo,
        loading,
        error,
        pagination,
        
        filters: urlFilters,
        searchValue,
        setSearchValue,

        fetchPurchaseOrders,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        isSyncing,
        handleSync,
        handleSyncById,
        handleDownloadInvoice,
    };
};
