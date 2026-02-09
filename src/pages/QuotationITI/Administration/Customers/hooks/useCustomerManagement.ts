import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useCustomers } from './useCustomers';

export const useCustomerManagement = () => {
    const navigate = useNavigate();
    
    // Local state untuk form inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Debounced search value
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Get customers hook
    const { customers, pagination, loading, error, fetchCustomers, deleteCustomer, handleSearchChange: updateSearch, handleSortChange: updateSort } = useCustomers();

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; customerId?: string; }>({ show: false });
    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);
    // Update search when debounced search changes
    useEffect(() => {
        updateSearch(debouncedSearch);
    }, [debouncedSearch, updateSearch]);
    
    useEffect(() => {
        updateSort(sortOrder);
    }, [sortOrder, updateSort]);

    useEffect(() => {
        fetchCustomers(1, 10, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        fetchCustomers(page, itemsPerPage, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemsPerPage]);

    const handleRowsPerPageChange = useCallback((newPerPage: number) => {
        setCurrentPage(1);
        setItemsPerPage(newPerPage);
        fetchCustomers(1, newPerPage, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    const handleManualSearch = useCallback(() => {
        setCurrentPage(1);
        setDebouncedSearch(searchTerm);
    }, [searchTerm]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setDebouncedSearch('');
        setCurrentPage(1);
    }, []);

    // Handler untuk sort change
    const handleFilterChange = useCallback((key: string, value: string) => {
        if (key === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            setCurrentPage(1);
        }
    }, []);

    const handleEdit = useCallback((customer: any) => {
        navigate(`/quotations/administration/customers/edit/${customer.customer_id}`);
    }, [navigate]);

    const handleDelete = useCallback((customer: any) => {
        // Support both customer object and customer ID
        const customerId = typeof customer === 'string' ? customer : customer.customer_id;
        setConfirmDelete({ show: true, customerId });
    }, []);

    const confirmDeleteCustomer = useCallback(async () => {
        if (!confirmDelete.customerId) return;
        
        try {
            await deleteCustomer(confirmDelete.customerId);
            setConfirmDelete({ show: false });
            // Refresh data setelah delete
            fetchCustomers(currentPage, itemsPerPage, false); // Don't append data for refresh after delete
        } catch (error) {
            console.error('Failed to delete customer:', error);
        }
    }, [confirmDelete.customerId, deleteCustomer, fetchCustomers, currentPage, itemsPerPage, sortOrder, debouncedSearch]);

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
        customers,
        pagination,
        loading,
        error,
        sortOptions,
        
        confirmDelete,
        setConfirmDelete,
        deleteCustomer,
        
        // Handlers
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleDelete,
        confirmDeleteCustomer,
        cancelDelete,
    };
};