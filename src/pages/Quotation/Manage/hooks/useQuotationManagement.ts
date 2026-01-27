import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useQuotation } from './useQuotation';

export const useQuotationManagement = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
    const [quotationFor, setQuotationFor] = useState<'customer' | 'leasing' | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; quotationId?: string; }>({ show: false });

    const { quotations, pagination, loading, error, filters, fetchQuotations, handleSearchChange: quotationSearch, deleteQuotation, downloadQuotation, updateFilters, applyFilters, clearAllFilters } = useQuotation();

    useEffect(() => {
        fetchQuotations(1, 10);
    }, []);

    // Trigger fetch when filters change (including new fields)
    useEffect(() => {
        if (filters.sort_order || filters.quotation_for || filters.island || filters.start_date || filters.end_date) {
            fetchQuotations(currentPage, itemsPerPage);
        }
    }, [filters.sort_order, filters.quotation_for, filters.island, filters.start_date, filters.end_date, currentPage, itemsPerPage, fetchQuotations]);

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
        applyFilters();
    }, [applyFilters]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setSortOrder('');
        setQuotationFor('');
        setCurrentPage(1);
        clearAllFilters();
    }, [clearAllFilters]);

    const handleFilterChange = useCallback((filterKey: string, value: string) => {
        if (filterKey === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            updateFilters('sort_order', value);
        } else if (filterKey === 'quotation_for') {
            setQuotationFor(value as 'customer' | 'leasing' | '');
            updateFilters('quotation_for', value);
        } else if (filterKey === 'island') {
            updateFilters('island', value);
        } else if (filterKey === 'start_date') {
            updateFilters('start_date', value);
        } else if (filterKey === 'end_date') {
            updateFilters('end_date', value);
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
        quotationFor,
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
        applyFilters,
    };
};