import { useState, useCallback } from 'react';
import { TermConditionService } from '../TermCondition/services/termconditionService';
import { TermCondition } from '../TermCondition/types/termcondition';

export interface TermConditionSelectOption {
    value: string;
    label: string;
    term_content_directory: string;
    data: TermCondition;
}

export interface TermConditionPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useTermConditionSelect = () => {
    const [termConditionOptions, setTermConditionOptions] = useState<TermConditionSelectOption[]>([]);
    const [pagination, setPagination] = useState<TermConditionPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    // Load term conditions for async select
    const loadTermConditions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: TermConditionSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (pagination.loading && !reset) return loadedOptions;

            setPagination(prev => ({ ...prev, loading: true }));

            const response = await TermConditionService.getTermConditions({
                search: inputValue,
                page: page,
                limit: 10,
                sort_order: 'desc'
            });

            if (response.status) {
                const newOptions = response.data.items.map((termCondition: TermCondition) => ({
                    value: termCondition.term_content_id,
                    label: termCondition.term_content_title,
                    term_content_directory: termCondition.term_content_directory,
                    data: termCondition
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setTermConditionOptions(updatedOptions);

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
        setTermConditionOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadTermConditions(inputValue, [], 1, true);
    }, [loadTermConditions]);

    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadTermConditions(inputValue, termConditionOptions, pagination.page + 1, false);
        }
    }, [pagination, termConditionOptions, inputValue, loadTermConditions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (termConditionOptions.length === 0) {
            await loadTermConditions('', [], 1, true);
        }
    }, [termConditionOptions.length, loadTermConditions]);

    return {
        termConditionOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadTermConditions
    };
};