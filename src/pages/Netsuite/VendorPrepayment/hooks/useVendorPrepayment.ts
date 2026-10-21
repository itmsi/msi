import { useState, useEffect, useCallback } from 'react';
import { VendorPrepayment, VendorPrepaymentRequest } from '../types/vendorPrepayment';
import { VendorPrepaymentService } from '../services/vendorPrepaymentService';
import toast from 'react-hot-toast';
import { SyncInfo } from '../../Quotation/types/quotation';

// Default Next Approver = employee_id_netsuite user yang login (auth_user di localStorage)
export const getLoginEmployeeNetsuiteId = (): string => {
    try {
        const authUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
        const id = authUser?.employee_id_netsuite;
        return id !== undefined && id !== null ? String(id) : '';
    } catch {
        return '';
    }
};

// Override internal (nama filter UI), dipetakan ke body request backend di fetchVendorPrepayments
interface FetchOverrides {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    subsidiary?: string;
    approvalstatus?: string;
    next_approver?: string;
    trandate_start?: string;
    trandate_end?: string;
}

export const useVendorPrepayment = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Advanced filters
    // Default: Pending Approval (1)
    const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>('1');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [filterSubsidiary, setFilterSubsidiary] = useState<string>('');
    const [filterNextApprover, setFilterNextApprover] = useState<string>(getLoginEmployeeNetsuiteId);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
    const [vendorPrepayments, setVendorPrepayments] = useState<VendorPrepayment[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total_records: 0,
        total_pages: 0
    });

    const fetchVendorPrepayments = useCallback(async (overrides?: FetchOverrides) => {
        try {
            setLoading(true);
            setError(null);

            const subVal = overrides?.subsidiary !== undefined ? overrides.subsidiary : filterSubsidiary;
            const appVal = overrides?.approvalstatus !== undefined ? overrides.approvalstatus : filterApprovalStatus;
            const nextApproverVal = overrides?.next_approver !== undefined ? overrides.next_approver : filterNextApprover;
            const startVal = overrides?.trandate_start !== undefined ? overrides.trandate_start : filterStartDate;
            const endVal = overrides?.trandate_end !== undefined ? overrides.trandate_end : filterEndDate;

            // Current approver ID dari local storage (auth_user.current_approver_netsuite_id)
            let currentApproverId: any = undefined;
            try {
                const authUserStr = localStorage.getItem('auth_user');
                if (authUserStr) {
                    const authUser = JSON.parse(authUserStr);
                    currentApproverId = authUser?.current_approver_netsuite_id;
                }
            } catch (e) {
                console.warn('Failed to parse auth_user from localStorage', e);
            }

            const requestBody: VendorPrepaymentRequest = {
                page: overrides?.page ?? pagination.page,
                page_size: overrides?.limit ?? pagination.page_size,
                sort_by: overrides?.sort_by ?? 'last_modified_netsuite',
                sort_order: ((overrides?.sort_order ?? sortOrder) as string).toUpperCase() as 'ASC' | 'DESC',
                ...(overrides?.search !== undefined
                    ? (overrides.search ? { search: overrides.search } : {})
                    : (searchValue ? { search: searchValue } : {})),
                ...(subVal ? { subsidiary_id: String(subVal) } : {}),
                ...(appVal ? { approval_status: String(appVal) } : {}),
                ...(startVal ? { tran_date_from: startVal } : {}),
                ...(endVal ? { tran_date_to: endVal } : {}),
                ...(nextApproverVal ? { next_approver_blank: nextApproverVal } : {}),
                // Include current approver ID if available
                ...(currentApproverId !== undefined && currentApproverId !== null ? { current_approver_id: currentApproverId } : {}),
            };

            const response = await VendorPrepaymentService.getVendorPrepayments(requestBody);

            setVendorPrepayments(response.data.items || []);
            setPagination({
                page: response.data.pagination.page || 1,
                page_size: response.data.pagination.limit || 10,
                total_records: response.data.pagination.total || 0,
                total_pages: response.data.pagination.totalPages || 0
            });
            setSyncInfo(response.sync_info || null);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch vendor prepayments data');
            console.error('Error fetching vendor prepayments data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, filterApprovalStatus, filterStartDate, filterEndDate, filterSubsidiary, filterNextApprover, pagination.page, pagination.page_size]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchVendorPrepayments({ page });
    }, [fetchVendorPrepayments]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, page_size: limit, page }));
        fetchVendorPrepayments({ limit, page });
    }, [fetchVendorPrepayments]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchVendorPrepayments({ search: searchQuery, page: 1 });
    }, [fetchVendorPrepayments]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
        } else if (filterType === 'approvalstatus') {
            setFilterApprovalStatus(value);
        } else if (filterType === 'trandate_start') {
            setFilterStartDate(value);
        } else if (filterType === 'trandate_end') {
            setFilterEndDate(value);
        } else if (filterType === 'subsidiary') {
            setFilterSubsidiary(value);
        } else if (filterType === 'next_approver') {
            setFilterNextApprover(value);
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const override: FetchOverrides = { page: 1 };
        if (filterType === 'sort_order') override.sort_order = value as 'asc' | 'desc';
        else if (filterType === 'approvalstatus') override.approvalstatus = value;
        else if (filterType === 'trandate_start') override.trandate_start = value;
        else if (filterType === 'trandate_end') override.trandate_end = value;
        else if (filterType === 'subsidiary') override.subsidiary = value;
        else if (filterType === 'next_approver') override.next_approver = value;

        fetchVendorPrepayments(override);
    }, [fetchVendorPrepayments]);

    // Initial load
    useEffect(() => {
        fetchVendorPrepayments();
    }, []);

    const handleSync = useCallback(async () => {
        setIsSyncing(true);
        const toastId = toast.loading('Syncing data...');
        try {
            const result = await VendorPrepaymentService.syncVendorPrepayments();
            if (result.success || result.sync_status === 'success') {
                toast.success(result.message || 'Data successfully synced', { id: toastId });
                fetchVendorPrepayments();
            } else {
                toast.error(result.message || 'Failed to sync data', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error syncing data', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [fetchVendorPrepayments]);

    const handleSyncById = useCallback(async (row: VendorPrepayment) => {
        if (isSyncing || !row?.netsuite_id) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi Vendor Prepayment: ${row.transactionnumber || row.netsuite_id}...`);
        try {
            await VendorPrepaymentService.syncVendorPrepaymentById(String(row.netsuite_id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchVendorPrepayments();
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchVendorPrepayments]);

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
        setFilterApprovalStatus('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterSubsidiary('');
        setFilterNextApprover('');
        setSortOrder('desc');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchVendorPrepayments({
            page: 1,
            sort_order: 'desc',
            search: '',
            approvalstatus: '',
            trandate_start: '',
            trandate_end: '',
            subsidiary: '',
            next_approver: '',
        });
    }, [fetchVendorPrepayments]);

    const activeFilterCount = [
        filterApprovalStatus,
        filterStartDate,
        filterEndDate,
        filterSubsidiary,
        filterNextApprover,
    ].filter(Boolean).length;

    return {
        vendorPrepayments,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        filterApprovalStatus,
        filterStartDate,
        filterEndDate,
        filterSubsidiary,
        filterNextApprover,
        activeFilterCount,
        setSearchValue,
        fetchVendorPrepayments,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleSearch,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        handleClearAllFilters,
        isSyncing,
        handleSync,
        handleSyncById,
    };
};
