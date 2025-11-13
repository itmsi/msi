import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useQuotation } from './useQuotation';

export const useQuotationManagement = () => {
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Get quotations from main hook
    const { quotations, pagination, loading, error, filters, fetchQuotations, handleSearchChange: quotationSearch } = useQuotation();

    // Load initial data
    useEffect(() => {
        fetchQuotations(1, 10);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pagination handlers
    const handlePageChange = useCallback((page: number) => {
        fetchQuotations(page, pagination.limit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.limit]);

    const handleRowsPerPageChange = useCallback((newPerPage: number) => {
        fetchQuotations(1, newPerPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Search handlers
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        quotationSearch(value);
    }, [quotationSearch]);

    const handleManualSearch = useCallback(() => {
        quotationSearch(searchTerm);
    }, [searchTerm, quotationSearch]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        quotationSearch('');
    }, [quotationSearch]);

    // Filter handlers
    const handleFilterChange = useCallback((filterKey: string, value: string) => {
        if (filterKey === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            // TODO: Implement sorting in API call when backend supports it
        }
    }, []);

    // Navigation handlers
    const handleEdit = useCallback((quotation: any) => {
        navigate(`/quotations/edit/${quotation.manage_quotation_id}`);
    }, [navigate]);

    const handleView = useCallback((quotation: any) => {
        navigate(`/quotations/detail/${quotation.manage_quotation_id}`);
    }, [navigate]);

    return {
        searchTerm,
        sortOrder,
        quotations,
        pagination,
        loading,
        error,
        filters,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleView,
    };
};