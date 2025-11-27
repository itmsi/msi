import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useRoeCalculator } from './useRoeCalculator';

export const useRoeCalculatorManagement = () => {
    const navigate = useNavigate();
    
    // Local state untuk form inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortCommodity, setSortCommodity] = useState<'batu bara' | 'nikel' | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { roeCalculator, pagination, loading, error, fetchRoeCalculator, deleteRorCalculator } = useRoeCalculator();

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; roeCalculatorId?: string; }>({ show: false });
    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Load data saat component mount atau filter berubah
    useEffect(() => {
        fetchRoeCalculator({
            page: currentPage,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: debouncedSearch,
            commodity: sortCommodity || undefined,
        });
    }, [debouncedSearch, sortOrder, currentPage, itemsPerPage, sortCommodity, fetchRoeCalculator]);

    // Handler untuk pagination
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleRowsPerPageChange = useCallback((newPerPage: number) => {
        setCurrentPage(1);
        setItemsPerPage(newPerPage);
    }, []);

    // Handler untuk search
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset ke halaman pertama saat search
    }, []);

    const handleManualSearch = useCallback(() => {
        setCurrentPage(1);
        fetchRoeCalculator({
            page: 1,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: searchTerm
        });
    }, [searchTerm, sortOrder, itemsPerPage, fetchRoeCalculator]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchRoeCalculator({
            page: 1,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: '',
            commodity: sortCommodity || undefined,
        });
    }, [sortOrder, itemsPerPage, fetchRoeCalculator]);

    // Handler untuk sort change
    const handleFilterChange = useCallback((key: string, value: string) => {
        if (key === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            setCurrentPage(1);
        }
        if (key === 'commodity') {
            setSortCommodity(value as 'batu bara' | 'nikel' | '');
            setCurrentPage(1);
        }
    }, []);

    const handleEdit = useCallback((roeCalculator: any) => {
        navigate(`/roe-roa-calculator/manage/${roeCalculator.id}`);
    }, [navigate]);

    const handleDelete = useCallback((roeCalculator: any) => {
        // Support both roeCalculator object and roeCalculator ID
        const roeCalculatorId = typeof roeCalculator === 'string' ? roeCalculator : roeCalculator.id;
        setConfirmDelete({ show: true, roeCalculatorId: roeCalculatorId });
    }, []);

    const confirmdeleteRorCalculator = useCallback(async () => {
        if (!confirmDelete.roeCalculatorId) return;
        try {
            await deleteRorCalculator(confirmDelete.roeCalculatorId);
            setConfirmDelete({ show: false });
            // Refresh data setelah delete
            fetchRoeCalculator({
                page: currentPage,
                limit: itemsPerPage,
                sort_order: sortOrder,
                search: debouncedSearch,
                commodity: sortCommodity || undefined,
            });
        } catch (error) {
            console.error('Failed to delete roe calculator:', error);
        }
    }, [confirmDelete.roeCalculatorId, deleteRorCalculator, fetchRoeCalculator, currentPage, itemsPerPage, sortOrder, debouncedSearch]);

    const cancelDelete = useCallback(() => {
        setConfirmDelete({ show: false });
    }, []);

    return {
        // State
        searchTerm,
        sortOrder,
        sortCommodity,
        currentPage,
        itemsPerPage,
        roeCalculator,
        pagination,
        loading,
        error,
        
        confirmDelete,
        setConfirmDelete,
        deleteRorCalculator,
        
        // Handlers
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleDelete,
        confirmdeleteRorCalculator,
        cancelDelete,
    };
};