import { useState, useEffect, useCallback } from 'react';
import { InvoiceSalesOrder, InvoiceSalesOrderRequest } from '../types/invoiceSalesOrder';
import { InvoiceSalesOrderService } from '../services/invoiceSalesOrderService';

export const useInvoiceSalesOrder = () => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [sortModify, setSortModify] = useState<string>('trandate');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invoiceSalesOrders, setInvoiceSalesOrders] = useState<InvoiceSalesOrder[]>([]);
    
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 20,
        total_records: 0,
        total_pages: 0
    });

    const fetchInvoiceSalesOrders = useCallback(async (params?: Partial<InvoiceSalesOrderRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const activeSearch = params?.filters?.tranid !== undefined ? params.filters.tranid : searchValue;
            
            const response = await InvoiceSalesOrderService.getInvoiceSalesOrders({
                page: params?.page || pagination.page,
                page_size: params?.page_size || pagination.page_size,
                sort_by: params?.sort_by || sortModify,
                sort_order: params?.sort_order || sortOrder,
                filters: activeSearch ? { tranid: activeSearch } : {},
                ...params
            });

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
    }, [searchValue, sortOrder, sortModify, pagination.page, pagination.page_size]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchInvoiceSalesOrders({ page });
    }, [fetchInvoiceSalesOrders]);

    const handleRowsPerPageChange = useCallback((page_size: number, page: number) => {
        setPagination(prev => ({ ...prev, page_size, page }));
        fetchInvoiceSalesOrders({ page_size, page });
    }, [fetchInvoiceSalesOrders]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchInvoiceSalesOrders({ filters: { tranid: searchQuery }, page: 1 });
    }, [fetchInvoiceSalesOrders]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        if (filterType === 'sort_by') {
            setSortModify(value);
        } else if (filterType === 'sort_order') {
            setSortOrder(value as 'ASC' | 'DESC');
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const params: any = { page: 1 };
        if (filterType === 'sort_by') params.sort_by = value;
        else if (filterType === 'sort_order') params.sort_order = value;

        fetchInvoiceSalesOrders(params);
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

    return {
        invoiceSalesOrders,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        sortModify,
        setSearchValue,
        fetchInvoiceSalesOrders,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleSearch,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
    };
};
