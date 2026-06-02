import { useState, useCallback } from 'react';
import { SalesOrderService } from '@/pages/Netsuite/SalesOrders/services/salesOrderService';
import { BankItem } from '@/pages/Netsuite/SalesOrders/types/salesOrder';

export interface SOBankSelectOption {
    value: string;
    label: string;
    data?: BankItem;
}

export interface SOBankPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useSOBankSelect = (limit: number = 30) => {
    const [SOBankOptions, setSOBankOptions] = useState<SOBankSelectOption[]>([]);
    const [pagination, setPagination] = useState<SOBankPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadSOBankOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: SOBankSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await SalesOrderService.getSOBanks({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions: SOBankSelectOption[] = response.data.items.map((soBankItems: BankItem) => ({
                    value: soBankItems.id.toString(),
                    label: soBankItems.name,
                    data: soBankItems
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setSOBankOptions(updatedOptions);
                
                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;
                
                setPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading SO Bank items:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        setPagination(prev => ({ ...prev, loading: false }));
        return loadedOptions;
    }, [limit]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setSOBankOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadSOBankOptions(inputValue, [], 1, true);
    }, [loadSOBankOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadSOBankOptions(inputValue, SOBankOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, SOBankOptions, loadSOBankOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (SOBankOptions.length === 0) {
            await loadSOBankOptions('', [], 1, true);
        }
    }, [SOBankOptions.length, loadSOBankOptions]);

    // Get SO Bank by ID
    const getSOBankById = useCallback(async (soBankId: string): Promise<SOBankSelectOption | null> => {
        try {
            const response = await SalesOrderService.getSOBanks({ search: soBankId });
            if (response.success && response.data.items.length > 0) {
                const soBankItem = response.data.items[0];
                return {
                    value: soBankItem.id.toString(),
                    label: soBankItem.name,
                    data: soBankItem
                };
            }
        } catch (error) {
            console.error('Error getting SO Bank item by ID:', error);
        }
        return null;
    }, []);

    return {
        SOBankOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadSOBankOptions,
        getSOBankById
    };
};