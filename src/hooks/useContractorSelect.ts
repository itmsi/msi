import { useState, useCallback, useRef } from 'react';
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
    const [currentFilters, setCurrentFilters] = useState<{iupId: string, type: string}>({
        iupId: '',
        type: ''
    });
    
    const loadingRef = useRef(false);

    const loadContractorOptions = useRef(async (
        inputValue: string = '', 
        loadedOptions: ContractorSelectOption[] = [],
        page: number = 1,
        iup_id: string = '',
        type: string = '',
        reset: boolean = false
    ) => {
        try {
            if (loadingRef.current && !reset) return loadedOptions;

            loadingRef.current = true;
            setPagination(prev => ({ ...prev, loading: true }));
            const getUser = isUser();
            
            const response = await ContractorServices.getContractors({
                search: inputValue,
                page: page,
                limit: 20,
                sort_order: 'desc',
                employee_id: getUser || undefined,
                iup_id: iup_id,
                type: type
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
                
                loadingRef.current = false;
                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading term conditions:', error);
            setPagination(prev => ({ ...prev, loading: false }));
            loadingRef.current = false;
        }

        return loadedOptions;
    });

    const handleInputChange = useCallback(async (inputValue: string, iupId: string = '', type: string = '') => {
        setInputValue(inputValue);
        setContractorOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        setCurrentFilters({ iupId, type });
        
        return await loadContractorOptions.current(inputValue, [], 1, iupId, type, true);
    }, []);
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadContractorOptions.current(inputValue, contractorOptions, pagination.page + 1, currentFilters.iupId, currentFilters.type, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, currentFilters.iupId, currentFilters.type]);


    const initializeOptions = useCallback(async () => {
        if (contractorOptions.length === 0) {
            await loadContractorOptions.current('', [], 1, '', '', true);
        }
    }, [contractorOptions.length]);

    return {
        contractorOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadContractorOptions: loadContractorOptions.current
    };
};