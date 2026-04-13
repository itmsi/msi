import { useState, useEffect, useCallback } from 'react';
import { Pagination, PurchaseOrderItem, PurchaseOrderRequest } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';

export const usePurchaseOrder = (profileSSO?: number) => {
    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('desc');
    const [sortModify, setSortModify] = useState<'updated_at' | 'last_modified' | 'po_id' | ''>('po_id');
    const [statusFilter, setStatusFilter] = useState('');
    const [subsidiaryFilter, setSubsidiaryFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

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
                ...(profileSSO !== undefined ? { classes: profileSSO } : {}),
                ...params
            });

            setPurchaseOrders(response.data?.items || []);
            setPagination(response.data?.pagination || pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch purchase order data');
            console.error('Error fetching purchase order data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, sortModify, statusFilter, subsidiaryFilter, locationFilter, pagination.page, pagination.limit]);

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
            setSortModify(value as 'po_id' | 'updated_at' | 'last_modified' | '');
        } else if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc' | '');
        } else if (filterType === 'subsidiary') {
            setSubsidiaryFilter(value);
        } else if (filterType === 'location') {
            setLocationFilter(value);
        }

        setPagination(prev => ({ ...prev, page: 1 }));

        const params: any = { page: 1 };
        if (filterType === 'status') params.status = value;
        else if (filterType === 'sort_by') params.sort_by = value;
        else if (filterType === 'sort_order') params.sort_order = value;
        else if (filterType === 'subsidiary') params.subsidiary = value;
        else if (filterType === 'location') params.location = value;

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

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
        setSubsidiaryFilter('');
        setLocationFilter('');
        setSortOrder('desc');
        setSortModify('last_modified');
        
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchPurchaseOrders({ 
            page: 1, 
            status: '', 
            subsidiary: '', 
            location: '',
            sort_order: 'desc',
            sort_by: 'last_modified'
        });
    }, [fetchPurchaseOrders]);

    return {
        purchaseOrders,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        sortModify,
        statusFilter,
        subsidiaryFilter,
        locationFilter,
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
    };
};
