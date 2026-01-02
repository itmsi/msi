import { useState, useCallback } from 'react';
import { IupService } from '@/pages/CRM/IUPManagement/services/iupManagementService';
import { IupItem } from '@/pages/CRM/IUPManagement/types/iupmanagement';

export interface IupSelectOption {
    value: string;
    label: string;
}

export interface IupPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useIupSelect = () => {
    const [iupOptions, setIupOptions] = useState<IupSelectOption[]>([]);
    const [pagination, setPagination] = useState<IupPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadIupOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: IupSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (pagination.loading && !reset) return loadedOptions;

            setPagination(prev => ({ ...prev, loading: true }));

            const response = await IupService.getIUPManagement({
                search: inputValue,
                page: page,
                limit: 20,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions = response.data.map((iup: IupItem) => ({
                    value: iup.iup_id,
                    label: iup.iup_name
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setIupOptions(updatedOptions);
                
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
        setIupOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadIupOptions(inputValue, [], 1, true);
    }, [loadIupOptions]);

    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadIupOptions(inputValue, iupOptions, pagination.page + 1, false);
        }
    }, [pagination, iupOptions, inputValue, loadIupOptions]);


    const initializeOptions = useCallback(async () => {
        if (iupOptions.length === 0) {
            await loadIupOptions('', [], 1, true);
        }
    }, [iupOptions.length, loadIupOptions]);

    return {
        iupOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadIupOptions
    };
};