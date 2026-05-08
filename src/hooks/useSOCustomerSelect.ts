import { useState, useCallback } from 'react';
import { SalesOrderService } from '@/pages/Netsuite/SalesOrders/services/salesOrderService';
import { CustomerItem } from '@/pages/Netsuite/SalesOrders/types/salesOrder';

export interface SOCustomerSelectOption {
    value: string;
    label: string;
    data?: CustomerItem;
}

export interface SOCustomerPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useSOCustomerSelect = (limit: number = 30) => {
    const [SOCustomerOptions, setSOCustomerOptions] = useState<SOCustomerSelectOption[]>([]);
    const [pagination, setPagination] = useState<SOCustomerPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadSOCustomerOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: SOCustomerSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await SalesOrderService.getCustomers({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions: SOCustomerSelectOption[] = response.data.items.map((customer: CustomerItem) => ({
                    value: (customer.netsuite_id || customer.id).toString(),
                    label: customer.entity_id || customer.name,
                    data: customer
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setSOCustomerOptions(updatedOptions);
                
                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;
                
                setPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading Customers:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        setPagination(prev => ({ ...prev, loading: false }));
        return loadedOptions;
    }, [limit]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setSOCustomerOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadSOCustomerOptions(inputValue, [], 1, true);
    }, [loadSOCustomerOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadSOCustomerOptions(inputValue, SOCustomerOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, SOCustomerOptions, loadSOCustomerOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (SOCustomerOptions.length === 0) {
            await loadSOCustomerOptions('', [], 1, true);
        }
    }, [SOCustomerOptions.length, loadSOCustomerOptions]);

    // Get Customer by ID
    const getCustomerById = useCallback(async (customerId: string): Promise<SOCustomerSelectOption | null> => {
        if (!customerId) return null;
        try {
            const response = await SalesOrderService.getCustomers({ search: customerId });
            if (response.success && response.data.items.length > 0) {
                const customer = response.data.items.find(c => (c.netsuite_id || c.id).toString() === customerId.toString()) || response.data.items[0];
                return {
                    value: (customer.netsuite_id || customer.id).toString(),
                    label: customer.entity_id || customer.name,
                    data: customer
                };
            }
        } catch (error) {
            console.error('Error getting Customer by ID:', error);
        }
        return null;
    }, []);

    return {
        SOCustomerOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadSOCustomerOptions,
        getCustomerById
    };
};
