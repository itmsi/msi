import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useCustomers } from './useCustomers';

export const useCustomerManagement = () => {
    const navigate = useNavigate();
    
    // Get customers hook
    const { 
        customers, 
        pagination, 
        loading, 
        error, 
        
        filters,
        searchValue,
        setSearchValue,

        fetchCustomers,
        deleteCustomer,

        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        refetch
    } = useCustomers();

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; customerId?: string; }>({ show: false });


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
            fetchCustomers(); // Don't append data for refresh after delete
        } catch (error) {
            console.error('Failed to delete customer:', error);
        }
    }, [confirmDelete.customerId, deleteCustomer, fetchCustomers]);

    const cancelDelete = useCallback(() => {
        setConfirmDelete({ show: false });
    }, []);


    return {
        // State
        customers,
        loading,
        error,
        pagination,
        
        filters,
        searchValue,
        setSearchValue,

        confirmDelete,
        // setConfirmDelete,
        deleteCustomer,
        
        fetchCustomers,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        refetch,

        // Handlers
        handleEdit,
        handleDelete,
        confirmDeleteCustomer,
        cancelDelete,
    };
};