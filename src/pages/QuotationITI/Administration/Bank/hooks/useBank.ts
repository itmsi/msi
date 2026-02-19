import { useState, useCallback, useRef } from 'react';
import { BankAccount, BankAccountPagination, BankAccountRequest } from '../types/bank';
import { BankService } from '../services/bankService';

export const useBank = () => {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [pagination, setPagination] = useState<BankAccountPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        search: ''
    });

    // Debounce timer ref
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const fetchBankAccounts = useCallback(async (page?: number, limit?: number, appendData: boolean = false) => {
        setLoading(true);
        setError(null);
        
        try {
            const requestParams: Partial<BankAccountRequest> = {
                page: page !== undefined ? page : pagination.page,
                limit: limit !== undefined ? limit : pagination.limit,
                search: filters.search
            };
            
            const response = await BankService.getBankAccounts(requestParams);
            
            if (response.success) {
                // For infinite scroll (appendData = true), combine existing data with new data
                // For regular fetch (appendData = false), replace data
                if (appendData && page && page > 1) {
                    setBankAccounts(prev => [...prev, ...response.data.data]);
                } else {
                    setBankAccounts(response.data.data);
                }
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Failed to fetch bank accounts');
            }
        } catch (err) {
            setError('Something went wrong while fetching bank accounts');
            console.error('Fetch bank accounts error:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters.search]);

    const updateBankAccount = useCallback(async (bankAccountId: string, bankAccountData: Partial<Omit<BankAccount, 'bank_account_id'>>) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedBankAccount = await BankService.updateBankAccount(bankAccountId, bankAccountData);
            // Update local state
            setBankAccounts(prev => prev.map(bankAccount =>
                bankAccount.bank_account_id === bankAccountId ? updatedBankAccount : bankAccount
            ));
            return updatedBankAccount;
        } catch (err) {
            setError('Failed to update bank account');
            console.error('Update bank account error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteBankAccount = useCallback(async (bankAccountId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            await BankService.deleteBankAccount(bankAccountId);
            // Remove from local state
            setBankAccounts(prev => prev.filter(bankAccount => bankAccount.bank_account_id !== bankAccountId));
            return true;
        } catch (err) {
            setError('Failed to delete bank account');
            console.error('Delete bank account error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced filter change handler
    const handleFilterChangeDebounced = useCallback((filterKey: string, value: string) => {
        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
            setFilters(prev => ({ ...prev, [filterKey]: value }));
            
            // Reset pagination to first page when filtering
            setPagination(prev => ({ ...prev, page: 1 }));
            
            // Call fetchBankAccounts with updated params directly - use new value immediately
            const requestParams: Partial<BankAccountRequest> = {
                page: 1,
                limit: pagination.limit,
                search: value // Use the new value directly, not the stale state
            };
            
            setLoading(true);
            setError(null);
            
            BankService.getBankAccounts(requestParams)
                .then(response => {
                    if (response.success) {
                        setBankAccounts(response.data.data);
                        setPagination(response.data.pagination);
                    } else {
                        setError(response.message || 'Failed to fetch bank accounts');
                    }
                })
                .catch(err => {
                    setError('Something went wrong while fetching bank accounts');
                    console.error('Fetch bank accounts error:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 500);
    }, [pagination.limit, filters.search]);

    // Handle search change
    const handleSearchChange = useCallback((search: string) => {
        handleFilterChangeDebounced('search', search);
    }, [handleFilterChangeDebounced]);

    return {
        bankAccounts,
        pagination,
        loading,
        error,
        fetchBankAccounts,
        updateBankAccount,
        deleteBankAccount,
        handleSearchChange,
    };
};