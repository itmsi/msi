import { Segementation } from './../pages/CRM/Segmentasi/types/segementasi';
import { useState, useCallback } from 'react';
import { SegementationService } from '@/pages/CRM/Segmentasi/services/segementasiService';

export interface SegementationSelectOption {
    value: string;
    label: string;
}

export interface SegementationPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useSegementationSelect = () => {
    const [segementationOptions, setSegementationOptions] = useState<SegementationSelectOption[]>([]);
    const [pagination, setPagination] = useState<SegementationPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadBrandOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: SegementationSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (pagination.loading && !reset) return loadedOptions;

            setPagination(prev => ({ ...prev, loading: true }));

            const response = await SegementationService.getSegementations({
                search: inputValue,
                page: page,
                limit: 20,
                sort_order: 'desc'
            });
            if (response.success) {
                
                const newOptions = response.data.map((segementation: Segementation) => ({
                    value: segementation.segmentation_id,
                    label: segementation.segmentation_name_en
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setSegementationOptions(updatedOptions);
                
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
        setSegementationOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadBrandOptions(inputValue, [], 1, true);
    }, [loadBrandOptions]);
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadBrandOptions(inputValue, segementationOptions, pagination.page + 1, false);
        }
    }, [pagination, segementationOptions, inputValue, loadBrandOptions]);


    const initializeOptions = useCallback(async () => {
        if (segementationOptions.length === 0) {
            await loadBrandOptions('', [], 1, true);
        }
    }, [segementationOptions.length, loadBrandOptions]);

    return {
        segementationOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadBrandOptions
    };
};