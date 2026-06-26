import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Quotation, QuotationRequest, SyncInfo } from '../types/quotation';
import { QuotationService } from '../services/quotationService';

export const useQuotation = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Advanced filters
    const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>('');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [filterSubsidiary, setFilterSubsidiary] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);

    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total_records: 0,
        total_pages: 0
    });

    const fetchQuotations = useCallback(async (overrides?: Partial<QuotationRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const subVal = overrides?.subsidiary !== undefined ? overrides.subsidiary : filterSubsidiary;
            const appVal = overrides?.approvalstatus !== undefined ? overrides.approvalstatus : filterApprovalStatus;
            const startVal = overrides?.tran_date_from !== undefined ? overrides.tran_date_from : filterStartDate;
            const endVal = overrides?.tran_date_to !== undefined ? overrides.tran_date_to : filterEndDate;

            const requestBody: QuotationRequest = {
                page: overrides?.page ?? pagination.page,
                limit: overrides?.limit ?? pagination.page_size,
                sort_by: overrides?.sort_by ?? 'last_modified_netsuite',
                sort_order: overrides?.sort_order ?? sortOrder,
                ...(overrides?.search !== undefined
                    ? (overrides.search ? { search: overrides.search } : {})
                    : (searchValue ? { search: searchValue } : {})),
                ...(subVal ? { subsidiary: isNaN(Number(subVal)) ? subVal : Number(subVal) } : {}),
                ...(appVal ? { approvalstatus: isNaN(Number(appVal)) ? appVal : Number(appVal) } : {}),
                ...(startVal ? { tran_date_from: startVal } : {}),
                ...(endVal ? { tran_date_to: endVal } : {}),
            };

            const response = await QuotationService.getQuotations(requestBody);

            setQuotations(response.data.items || []);
            setPagination({
                page: response.data.pagination.page || 1,
                page_size: response.data.pagination.limit || 10,
                total_records: response.data.pagination.total || 0,
                total_pages: response.data.pagination.totalPages || 0
            });
            if (response.sync_info) {
                setSyncInfo(response.sync_info);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch quotations data');
            console.error('Error fetching quotations data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, filterApprovalStatus, filterStartDate, filterEndDate, filterSubsidiary, pagination.page, pagination.page_size]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchQuotations({ page });
    }, [fetchQuotations]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, page_size: limit, page }));
        fetchQuotations({ limit, page });
    }, [fetchQuotations]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchQuotations({ search: searchQuery, page: 1 });
    }, [fetchQuotations]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
        } else if (filterType === 'approvalstatus') {
            setFilterApprovalStatus(value);
        } else if (filterType === 'tran_date_from') {
            setFilterStartDate(value);
        } else if (filterType === 'tran_date_to') {
            setFilterEndDate(value);
        } else if (filterType === 'subsidiary') {
            setFilterSubsidiary(value);
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const override: Partial<QuotationRequest> = { page: 1 };
        if (filterType === 'sort_order') override.sort_order = value as 'asc' | 'desc';
        else if (filterType === 'approvalstatus') override.approvalstatus = value;
        else if (filterType === 'tran_date_from') override.tran_date_from = value;
        else if (filterType === 'tran_date_to') override.tran_date_to = value;
        else if (filterType === 'subsidiary') override.subsidiary = value;

        fetchQuotations(override);
    }, [fetchQuotations]);

    // Initial load
    useEffect(() => {
        fetchQuotations();
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
        setFilterApprovalStatus('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterSubsidiary('');
        setSortOrder('desc');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchQuotations({
            page: 1,
            sort_order: 'desc',
            search: '',
            approvalstatus: '',
            tran_date_from: '',
            tran_date_to: '',
            subsidiary: '',
        });
    }, [fetchQuotations]);

    const handleSync = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data quotation...');
        try {
            const result = await QuotationService.syncQuotations();
            if (result) {
                toast.success('Sinkronisasi berhasil', { id: toastId });
                fetchQuotations({ page: 1 });
            } else {
                toast.error('Sinkronisasi gagal', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchQuotations]);

    const handleSyncById = useCallback(async (row: Quotation) => {
        if (isSyncing) return;
        const quoId = row?.netsuite_id;
        if (!quoId) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi Quotation: ${row.tranid || quoId}...`);
        try {
            await QuotationService.syncQuotationById(String(quoId));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            fetchQuotations({ page: pagination.page, limit: pagination.page_size });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, fetchQuotations, pagination.page, pagination.page_size]);

    const activeFilterCount = [
        filterApprovalStatus,
        filterStartDate,
        filterEndDate,
        filterSubsidiary,
    ].filter(Boolean).length;

    return {
        quotations,
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
        isSyncing,
        syncInfo,
        setSearchValue,
        fetchQuotations,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleSearch,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        handleClearAllFilters,
        handleSync,
        handleSyncById,
    };
};
