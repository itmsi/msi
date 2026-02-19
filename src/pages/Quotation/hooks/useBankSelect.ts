import { useState, useCallback, useRef } from 'react';
import { BankService } from '@/pages/Administration/Bank/services/bankService';
import { BankAccount } from '@/pages/Administration/Bank/types/bank';

export interface BankSelectOption {
    value: string;
    label: string;
    data: BankAccount;
}

export interface BankPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useBankSelect = () => {
    const [bankOptions, setBankOptions] = useState<BankSelectOption[]>([]);
    const [pagination, setPagination] = useState<BankPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');
    
    const isInitialized = useRef(false);
    const isLoadingRef = useRef(false);

    const loadBankAccounts = useCallback(async (
        inputValue: string = '', 
        loadedOptions: BankSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (isLoadingRef.current && !reset) return loadedOptions;
            
            isLoadingRef.current = true;
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await BankService.getBankAccounts({
                search: inputValue,
                page: page,
                limit: 25,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions = response.data.data.map((bankAccount: BankAccount) => ({
                    value: bankAccount.bank_account_id,
                    label: bankAccount.bank_account_name + ' - ' + bankAccount.bank_account_type,
                    data: bankAccount
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setBankOptions(updatedOptions);
                
                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;
                
                setPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading bank accounts:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        } finally {
            isLoadingRef.current = false;
        }

        return loadedOptions;
    }, []);

        // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setBankOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadBankAccounts(inputValue, [], 1, true);
    }, [loadBankAccounts]);

    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !isLoadingRef.current) {
            loadBankAccounts(inputValue, bankOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.page, inputValue, bankOptions, loadBankAccounts]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (isInitialized.current || isLoadingRef.current) return;
        
        isInitialized.current = true;
        await loadBankAccounts('', [], 1, true);
    }, [loadBankAccounts]);

    return {
        bankOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadBankAccounts
    };
};