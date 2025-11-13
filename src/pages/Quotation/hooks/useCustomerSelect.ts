import { useState, useCallback } from 'react';
import { Employee } from '@/types/administration';
import { employeesService } from '@/services/administrationService';
import { CustomerService } from '@/pages/Administration/Customers/services/customerService';
import { Customer } from '@/pages/Administration/Customers/types/customer';

export interface CustomerSelectOption {
    value: string;
    label: string;
}

export interface CustomerPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useCustomerSelect = () => {
    const [customerOptions, setCustomerOptions] = useState<CustomerSelectOption[]>([]);
    const [pagination, setPagination] = useState<CustomerPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadCustomerOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: CustomerSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (pagination.loading && !reset) return loadedOptions;

            setPagination(prev => ({ ...prev, loading: true }));

            const response = await CustomerService.getCustomers({
                search: inputValue,
                page: page,
                limit: 5,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions = response.data.data.map((customer: Customer) => ({
                    value: customer.customer_id,
                    label: customer.customer_name
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setCustomerOptions(updatedOptions);
                
                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;
                
                setPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading term conditions:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        return loadedOptions;
    }, [pagination.loading]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setCustomerOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadCustomerOptions(inputValue, [], 1, true);
    }, [loadCustomerOptions]);
    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadCustomerOptions(inputValue, customerOptions, pagination.page + 1, false);
        }
    }, [pagination, customerOptions, inputValue, loadCustomerOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (customerOptions.length === 0) {
            await loadCustomerOptions('', [], 1, true);
        }
    }, [customerOptions.length, loadCustomerOptions]);

    return {
        customerOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadCustomerOptions
    };
};