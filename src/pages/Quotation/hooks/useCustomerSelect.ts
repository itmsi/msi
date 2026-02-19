import { useState, useCallback, useRef } from 'react';
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
    
    // Add ref to prevent multiple initializations
    const isInitialized = useRef(false);
    const isLoadingRef = useRef(false);

    const loadCustomerOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: CustomerSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (isLoadingRef.current && !reset) return loadedOptions;
            
            isLoadingRef.current = true;
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await CustomerService.getCustomers({
                search: inputValue,
                page: page,
                limit: 25,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions = response.data.data.map((customer: Customer) => ({
                    value: customer.customer_id,
                    label: customer.customer_name + ' - ' + customer.contact_person
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
            console.error('Error loading customers:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        } finally {
            isLoadingRef.current = false;
        }

        return loadedOptions;
    }, []);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setCustomerOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadCustomerOptions(inputValue, [], 1, true);
    }, [loadCustomerOptions]);
    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !isLoadingRef.current) {
            loadCustomerOptions(inputValue, customerOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.page, inputValue, customerOptions, loadCustomerOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        // Prevent multiple initializations
        if (isInitialized.current || isLoadingRef.current) return;
        
        isInitialized.current = true;
        await loadCustomerOptions('', [], 1, true);
    }, [loadCustomerOptions]);

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