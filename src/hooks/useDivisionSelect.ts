import { useState, useCallback, useRef } from 'react';
import { DivisionService } from '@/pages/CRM/Divisions/services/divisionService';
import { Division } from '@/pages/CRM/Divisions/types/division';

export interface DivisionSelectOption {
    value: string;
    label: string;
}

export interface DivisionPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useDivisionSelect = () => {
    const [divisionOptions, setDivisionOptions] = useState<DivisionSelectOption[]>([]);
    const [pagination, setPagination] = useState<DivisionPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');
    
    const isInitialized = useRef(false);
    const isLoadingRef = useRef(false);

    const loadDivisionOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: DivisionSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (isLoadingRef.current && !reset) return loadedOptions;
            
            isLoadingRef.current = true;
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await DivisionService.getDivisions({
                search: inputValue,
                page: page,
                limit: 10,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions = response.data.map((division: Division) => ({
                    value: division.devision_project_id,
                    label: division.devision_project_name
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setDivisionOptions(updatedOptions);
                
                const hasMoreData = response.pagination.page < response.pagination.totalPages;
                
                setPagination({
                    page: response.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading divisions:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        } finally {
            isLoadingRef.current = false;
        }

        return loadedOptions;
    }, []); // Remove pagination.loading dependency

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setDivisionOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadDivisionOptions(inputValue, [], 1, true);
    }, [loadDivisionOptions]);

    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !isLoadingRef.current) {
            loadDivisionOptions(inputValue, divisionOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.page, inputValue, divisionOptions, loadDivisionOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (isInitialized.current || isLoadingRef.current) return;
        
        isInitialized.current = true;
        await loadDivisionOptions('', [], 1, true);
    }, [loadDivisionOptions]);

    return {
        divisionOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadDivisionOptions
    };
};