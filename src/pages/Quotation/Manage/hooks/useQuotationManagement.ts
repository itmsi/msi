import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useQuotation } from './useQuotation';

export const useQuotationManagement = () => {
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
    const [sortStatus, setSortStatus] = useState<'submit' | 'draft' | 'rejected' | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; quotationId?: string; }>({ show: false });

    const { quotations, pagination, loading, error, filters, fetchQuotations, handleSearchChange: quotationSearch, deleteQuotation, downloadQuotation, updateFilters } = useQuotation();

    useEffect(() => {
        fetchQuotations(1, 10);
    }, []);

    // Trigger fetch when filters change
    useEffect(() => {
        if (filters.sort_order || filters.status) {
            fetchQuotations(currentPage, itemsPerPage);
        }
    }, [filters.sort_order, filters.status]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        fetchQuotations(page, pagination.limit);
    }, [pagination.limit]);

    const handleRowsPerPageChange = useCallback((newPerPage: number) => {
        setCurrentPage(1);
        setItemsPerPage(newPerPage);
        fetchQuotations(1, newPerPage);
    }, [fetchQuotations]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        quotationSearch(value);
    }, [quotationSearch]);

    const handleManualSearch = useCallback(() => {
        setCurrentPage(1);
        quotationSearch(searchTerm);
    }, [searchTerm, quotationSearch]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setCurrentPage(1);
        quotationSearch('');
    }, [quotationSearch]);

    const handleFilterChange = useCallback((filterKey: string, value: string) => {
        if (filterKey === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            updateFilters('sort_order', value);
        } else if (filterKey === 'status') {
            setSortStatus(value as 'submit' | 'draft' | 'rejected' | '');
            updateFilters('status', value);
        }
        setCurrentPage(1);
        // fetchQuotations akan otomatis terpanggil karena filters berubah
    }, [updateFilters]);

    const handleStatusChange = useCallback((filterKey: string, value: string) => {
        handleFilterChange(filterKey, value);
    }, [handleFilterChange]);

    // Navigation handlers
    const handleEdit = useCallback((quotation: any) => {
        navigate(`/quotations/manage/edit/${quotation.manage_quotation_id}`);
    }, [navigate]);

    const handleView = useCallback((quotation: any) => {
        navigate(`/quotations/detail/${quotation.manage_quotation_id}`);
    }, [navigate]);

    const handleDelete = useCallback((quotation: any) => {
        const quotationId = typeof quotation === 'string' ? quotation : quotation.manage_quotation_id;
        setConfirmDelete({ show: true, quotationId: quotationId });
    }, []);

    const handleDownload = useCallback((quotation: any) => {
        downloadQuotation(quotation.manage_quotation_id);
    }, []);

    const confirmDeleteQuotations = useCallback(async () => {
        if (!confirmDelete.quotationId) return;

        try {
            await deleteQuotation(confirmDelete.quotationId);
            setConfirmDelete({ show: false });
            // Refresh data setelah delete
            fetchQuotations(currentPage, itemsPerPage);
        } catch (error) {
            console.error('Failed to delete quotation:', error);
        }
    }, [confirmDelete.quotationId, deleteQuotation, fetchQuotations, currentPage, itemsPerPage]);

    const cancelDelete = useCallback(() => {
        setConfirmDelete({ show: false });
    }, []);

    return {
        searchTerm,
        sortOrder,
        sortStatus,
        quotations,
        pagination,
        loading,
        error,
        filters,
        confirmDelete,
        confirmDeleteQuotations,
        cancelDelete,
        handleDelete,
        handleDownload,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleStatusChange,
        handleEdit,
        handleView,
    };
};