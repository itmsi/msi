import { useState, useEffect, useCallback } from 'react';
import { InvoiceSalesOrder, InvoiceSalesOrderRequest } from '../types/invoiceSalesOrder';
import { InvoiceSalesOrderService } from '../services/invoiceSalesOrderService';

export const useInvoiceSalesOrder = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Advanced filters
    const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>('');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [filterSubsidiary, setFilterSubsidiary] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invoiceSalesOrders, setInvoiceSalesOrders] = useState<InvoiceSalesOrder[]>([]);

    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 20,
        total_records: 0,
        total_pages: 0
    });

    const fetchInvoiceSalesOrders = useCallback(async (overrides?: Partial<InvoiceSalesOrderRequest>) => {
        try {
            setLoading(true);
            setError(null);

            // Build flat request body, overrides win over current state
            const requestBody: InvoiceSalesOrderRequest = {
                page: overrides?.page ?? pagination.page,
                limit: overrides?.limit ?? pagination.page_size,
                sort_by: 'created_at',
                sort_order: overrides?.sort_order ?? sortOrder,
                ...(overrides?.search !== undefined
                    ? (overrides.search ? { search: overrides.search } : {})
                    : (searchValue ? { search: searchValue } : {})),
                ...(overrides?.subsidiary !== undefined
                    ? (overrides.subsidiary ? { subsidiary: overrides.subsidiary } : {})
                    : (filterSubsidiary ? { subsidiary: filterSubsidiary } : {})),
                ...(overrides?.approvalstatus !== undefined
                    ? (overrides.approvalstatus ? { approvalstatus: overrides.approvalstatus } : {})
                    : (filterApprovalStatus ? { approvalstatus: filterApprovalStatus } : {})),
                ...(overrides?.trandate_start !== undefined
                    ? (overrides.trandate_start ? { trandate_start: overrides.trandate_start } : {})
                    : (filterStartDate ? { trandate_start: filterStartDate } : {})),
                ...(overrides?.trandate_end !== undefined
                    ? (overrides.trandate_end ? { trandate_end: overrides.trandate_end } : {})
                    : (filterEndDate ? { trandate_end: filterEndDate } : {})),
            };

            const response = await InvoiceSalesOrderService.getInvoiceSalesOrders(requestBody);

            setInvoiceSalesOrders(response.data.items || []);
            setPagination({
                page: response.data.pagination.page || 1,
                page_size: response.data.pagination.limit || 20,
                total_records: response.data.pagination.total || 0,
                total_pages: response.data.pagination.totalPages || 0
            });
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch invoice sales orders data');
            console.error('Error fetching invoice sales orders data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, filterApprovalStatus, filterStartDate, filterEndDate, filterSubsidiary, pagination.page, pagination.page_size]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchInvoiceSalesOrders({ page });
    }, [fetchInvoiceSalesOrders]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, page_size: limit, page }));
        fetchInvoiceSalesOrders({ limit, page });
    }, [fetchInvoiceSalesOrders]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchInvoiceSalesOrders({ search: searchQuery, page: 1 });
    }, [fetchInvoiceSalesOrders]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        // Update local state first
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

        // Build override just for this single changed field
        const override: Partial<InvoiceSalesOrderRequest> = { page: 1 };
        if (filterType === 'sort_order') override.sort_order = value as 'asc' | 'desc';
        else if (filterType === 'approvalstatus') override.approvalstatus = value;
        else if (filterType === 'trandate_start') override.trandate_start = value;
        else if (filterType === 'trandate_end') override.trandate_end = value;
        else if (filterType === 'subsidiary') override.subsidiary = value;

        fetchInvoiceSalesOrders(override);
    }, [fetchInvoiceSalesOrders]);

    // Initial load
    useEffect(() => {
        fetchInvoiceSalesOrders();
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
        fetchInvoiceSalesOrders({
            page: 1,
            sort_order: 'desc',
            search: '',
            approvalstatus: '',
            trandate_start: '',
            trandate_end: '',
            subsidiary: '',
        });
    }, [fetchInvoiceSalesOrders]);

    const activeFilterCount = [
        filterApprovalStatus,
        filterStartDate,
        filterEndDate,
        filterSubsidiary,
    ].filter(Boolean).length;

    return {
        invoiceSalesOrders,
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
        fetchInvoiceSalesOrders,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleSearch,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        handleClearAllFilters,
    };
};
