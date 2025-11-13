import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAccessories } from './useAccessories';

export const useAccessoriesManagement = () => {
    const navigate = useNavigate();
    
    // Local state untuk form inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { accessories, pagination, loading, error, fetchAccessories, deleteAccessories } = useAccessories();

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; accessoryId?: string; }>({ show: false });
    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Load data saat component mount atau filter berubah
    useEffect(() => {
        fetchAccessories({
            page: currentPage,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: debouncedSearch
        });
    }, [debouncedSearch, sortOrder, currentPage, itemsPerPage, fetchAccessories]);

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
        fetchAccessories({
            page: 1,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: searchTerm
        });
    }, [searchTerm, sortOrder, itemsPerPage, fetchAccessories]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchAccessories({
            page: 1,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: ''
        });
    }, [sortOrder, itemsPerPage, fetchAccessories]);

    // Handler untuk sort change
    const handleFilterChange = useCallback((key: string, value: string) => {
        if (key === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            setCurrentPage(1);
        }
    }, []);

    const handleEdit = useCallback((accessory: any) => {
        navigate(`/accessories/edit/${accessory.accessory_id}`);
    }, [navigate]);

    const handleDelete = useCallback((accessory: any) => {
        // Support both accessory object and accessory ID
        const accessoryId = typeof accessory === 'string' ? accessory : accessory.accessory_id;
        setConfirmDelete({ show: true, accessoryId: accessoryId });
    }, []);

    const confirmDeleteAccessories = useCallback(async () => {
        if (!confirmDelete.accessoryId) return;

        try {
            await deleteAccessories(confirmDelete.accessoryId);
            setConfirmDelete({ show: false });
            // Refresh data setelah delete
            fetchAccessories({
                page: currentPage,
                limit: itemsPerPage,
                sort_order: sortOrder,
                search: debouncedSearch
            });
        } catch (error) {
            console.error('Failed to delete accessory:', error);
        }
    }, [confirmDelete.accessoryId, deleteAccessories, fetchAccessories, currentPage, itemsPerPage, sortOrder, debouncedSearch]);

    const cancelDelete = useCallback(() => {
        setConfirmDelete({ show: false });
    }, []);

    // Options untuk sort order
    const sortOptions = [
        { value: 'desc', label: 'Newest First' },
        { value: 'asc', label: 'Oldest First' }
    ];

    return {
        // State
        searchTerm,
        sortOrder,
        currentPage,
        itemsPerPage,
        accessories,
        pagination,
        loading,
        error,
        sortOptions,
        
        confirmDelete,
        setConfirmDelete,
        deleteAccessories,
        
        // Handlers
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleDelete,
        confirmDeleteAccessories,
        cancelDelete,
    };
};