import { useState, useCallback } from 'react';
import { ContractorServices } from '@/pages/CRM/Contractors/services/contractorServices';
import { Contractor } from '@/pages/CRM/IUPManagement/types/iupmanagement';
import { isUser } from '@/helpers/fileTypeHelper__belumterpakai';

export interface ContractorSelectOption {
    value: string;
    label: string;
}

export interface ContractorPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useContractorSelect = () => {
    const [contractorOptions, setContractorOptions] = useState<ContractorSelectOption[]>([]);
    const [pagination, setPagination] = useState<ContractorPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadContractorOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: ContractorSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (pagination.loading && !reset) return loadedOptions;

            setPagination(prev => ({ ...prev, loading: true }));
            const getUser = isUser();
            
            const response = await ContractorServices.getContractors({
                search: inputValue,
                page: page,
                limit: 20,
                sort_order: 'desc',
                employee_id: getUser || undefined
            });
            if (response.success) {
                
                const newOptions = response.data.map((contractor: Contractor) => ({
                    value: contractor.iup_customer_id,
                    label: contractor.customer_iup_name
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setContractorOptions(updatedOptions);
                
                const hasMoreData = response.pagination.page < response.pagination.totalPages;
                
                setPagination({
                    page: response.pagination.page,
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
        setContractorOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadContractorOptions(inputValue, [], 1, true);
    }, [loadContractorOptions]);
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadContractorOptions(inputValue, contractorOptions, pagination.page + 1, false);
        }
    }, [pagination, contractorOptions, inputValue, loadContractorOptions]);


    const initializeOptions = useCallback(async () => {
        if (contractorOptions.length === 0) {
            await loadContractorOptions('', [], 1, true);
        }
    }, [contractorOptions.length, loadContractorOptions]);

    return {
        contractorOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadContractorOptions
    };
};