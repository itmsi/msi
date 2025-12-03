import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useBank } from './useBank';
import toast from 'react-hot-toast';

export const useBankManagement = () => {
    const navigate = useNavigate();
    
    // Local state untuk form inputs  
    const [searchTerm, setSearchTerm] = useState('');

    // Get bank accounts hook - menggunakan search internal dari useBank
    const { bankAccounts, pagination, loading, error, fetchBankAccounts, deleteBankAccount, handleSearchChange: bankSearchChange } = useBank();

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; bankAccountId?: string; }>({ show: false });
    
    // Load initial data
    useEffect(() => {
        fetchBankAccounts(1, 10, false);
    }, []);
    const handlePageChange = useCallback((page: number) => {
        fetchBankAccounts(page, pagination?.limit || 10, false);
    }, [pagination?.limit]);

    const handleRowsPerPageChange = useCallback((newPerPage: number) => {
        fetchBankAccounts(1, newPerPage, false);
    }, []);

    // Handler untuk search - menggunakan search dari useBank
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        bankSearchChange(value);
    }, [bankSearchChange]);

    const handleManualSearch = useCallback(() => {
        bankSearchChange(searchTerm);
    }, [searchTerm, bankSearchChange]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        bankSearchChange('');
    }, [bankSearchChange]);

    const handleFilterChange = useCallback((_key: string, _value: string) => {
    }, []);

    const handleEdit = useCallback((bankAccount: any) => {
        navigate(`/quotations/administration/bank-accounts/edit/${bankAccount.bank_account_id}`);
    }, [navigate]);

    const handleDelete = useCallback((bankAccount: any) => {
        // Support both bank account object and bank account ID
        const bankAccountId = typeof bankAccount === 'string' ? bankAccount : bankAccount.bank_account_id;
        setConfirmDelete({ show: true, bankAccountId });
    }, []);

    const confirmDeleteBankAccount = useCallback(async () => {
        if (!confirmDelete.bankAccountId) return;
        
        try {
            await deleteBankAccount(confirmDelete.bankAccountId);
            setConfirmDelete({ show: false });
            toast.success('Bank account deleted successfully!');
            // Refresh data setelah delete
            fetchBankAccounts(pagination?.page || 1, pagination?.limit || 10, false);
        } catch (error) {
            console.error('Failed to delete bank account:', error);
        }
    }, [confirmDelete.bankAccountId, deleteBankAccount, fetchBankAccounts, pagination?.page, pagination?.limit]);

    const cancelDelete = useCallback(() => {
        setConfirmDelete({ show: false });
    }, []);

    return {
        // State
        searchTerm,
        bankAccounts,
        pagination,
        loading,
        error,
        
        confirmDelete,
        setConfirmDelete,
        deleteBankAccount,
        
        // Handlers
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleDelete,
        confirmDeleteBankAccount,
        cancelDelete,
    };
};