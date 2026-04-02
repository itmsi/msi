import { useState, useCallback, useMemo, useRef } from 'react';
import { TermConditionService } from '../TermCondition/services/termconditionService';
import { TermCondition } from '../TermCondition/types/termcondition';
import { AuthService } from '@/services/authService';

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
    // Get company_name from localStorage auth_user
    const companyName = useMemo(() => {
        const user = AuthService.getCurrentUser();
        return user.company_name || undefined;
    }, []);

    const [termConditionOptions, setTermConditionOptions] = useState<TermConditionSelectOption[]>([]);
    const [pagination, setPagination] = useState<TermConditionPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');
    
    // Add ref to prevent multiple initializations
    const isInitialized = useRef(false);
    const isLoadingRef = useRef(false);

    // Load term conditions for async select
    const loadTermConditions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: TermConditionSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (isLoadingRef.current && !reset) return loadedOptions;
            isLoadingRef.current = true;
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await TermConditionService.getTermConditions({
                search: inputValue,
                page: page,
                limit: 10,
                sort_order: 'desc',
                company_name: companyName
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
        } finally {
            isLoadingRef.current = false;
        }

        return loadedOptions;
    }, [companyName]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setTermConditionOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadTermConditions(inputValue, [], 1, true);
    }, [loadTermConditions]);

    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !isLoadingRef.current) {
            loadTermConditions(inputValue, termConditionOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.page, inputValue, termConditionOptions, loadTermConditions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (isInitialized.current || isLoadingRef.current) return;
        
        isInitialized.current = true;
        await loadTermConditions('', [], 1, true);
    }, [loadTermConditions]);

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