import { useState, useEffect, useCallback } from 'react';
import { BillPayment, BillPaymentRequest } from '../types/billPayment';
import { BillPaymentService } from '../services/billPaymentService';
import toast from 'react-hot-toast';

export const useBillPayment = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Advanced filters
    const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>('');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [filterSubsidiary, setFilterSubsidiary] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total_records: 0,
        total_pages: 0
    });

    const fetchBillPayments = useCallback(async (overrides?: Partial<BillPaymentRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const subVal = overrides?.subsidiary !== undefined ? overrides.subsidiary : filterSubsidiary;
            const appVal = overrides?.approvalstatus !== undefined ? overrides.approvalstatus : filterApprovalStatus;
            const startVal = overrides?.trandate_start !== undefined ? overrides.trandate_start : filterStartDate;
            const endVal = overrides?.trandate_end !== undefined ? overrides.trandate_end : filterEndDate;

            const requestBody: BillPaymentRequest = {
                page: overrides?.page ?? pagination.page,
                limit: overrides?.limit ?? pagination.page_size,
                sort_by: overrides?.sort_by ?? 'last_modified_netsuite',
                sort_order: overrides?.sort_order ?? sortOrder,
                ...(overrides?.search !== undefined
                    ? (overrides.search ? { search: overrides.search } : {})
                    : (searchValue ? { search: searchValue } : {})),
                ...(subVal ? { subsidiary: isNaN(Number(subVal)) ? subVal : Number(subVal) } : {}),
                ...(appVal ? { approvalstatus: isNaN(Number(appVal)) ? appVal : Number(appVal) } : {}),
                ...(startVal ? { trandate_from: startVal } : {}),
                ...(endVal ? { trandate_to: endVal } : {}),
            };

            const response = await BillPaymentService.getBillPayments(requestBody);

            setBillPayments(response.data.items || []);
            setPagination({
                page: response.data.pagination.page || 1,
                page_size: response.data.pagination.limit || 10,
                total_records: response.data.pagination.total || 0,
                total_pages: response.data.pagination.totalPages || 0
            });
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch bill payments data');
            console.error('Error fetching bill payments data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, filterApprovalStatus, filterStartDate, filterEndDate, filterSubsidiary, pagination.page, pagination.page_size]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchBillPayments({ page });
    }, [fetchBillPayments]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, page_size: limit, page }));
        fetchBillPayments({ limit, page });
    }, [fetchBillPayments]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchBillPayments({ search: searchQuery, page: 1 });
    }, [fetchBillPayments]);

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
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const override: Partial<BillPaymentRequest> = { page: 1 };
        if (filterType === 'sort_order') override.sort_order = value as 'asc' | 'desc';
        else if (filterType === 'approvalstatus') override.approvalstatus = value;
        else if (filterType === 'trandate_start') override.trandate_start = value;
        else if (filterType === 'trandate_end') override.trandate_end = value;
        else if (filterType === 'subsidiary') override.subsidiary = value;

        fetchBillPayments(override);
    }, [fetchBillPayments]);

    // Initial load
    useEffect(() => {
        fetchBillPayments();
    }, []);

    const handleSync = useCallback(async () => {
        setIsSyncing(true);
        const toastId = toast.loading('Syncing data...');
        try {
            const result = await BillPaymentService.syncBillPayments();
            if (result.success || result.sync_status === 'success') {
                toast.success(result.message || 'Data successfully synced', { id: toastId });
                fetchBillPayments();
            } else {
                toast.error(result.message || 'Failed to sync data', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error syncing data', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [fetchBillPayments]);

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
        setSortOrder('desc');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchBillPayments({
            page: 1,
            sort_order: 'desc',
            search: '',
            approvalstatus: '',
            trandate_start: '',
            trandate_end: '',
            subsidiary: '',
        });
    }, [fetchBillPayments]);

    const activeFilterCount = [
        filterApprovalStatus,
        filterStartDate,
        filterEndDate,
        filterSubsidiary,
    ].filter(Boolean).length;

    return {
        billPayments,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        filterApprovalStatus,
        filterStartDate,
        filterEndDate,
        filterSubsidiary,
        activeFilterCount,
        setSearchValue,
        fetchBillPayments,
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
    };
};
