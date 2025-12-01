import { useState, useCallback } from 'react';
import { IslandService } from '@/pages/Administration/Island/services/islandService';
import { Island } from '@/pages/Administration/Island/types/island';

export interface IslandSelectOption {
    value: string;
    label: string;
}

export interface IslandPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useIslandSelect = () => {
    const [islandOptions, setIslandOptions] = useState<IslandSelectOption[]>([]);
    const [pagination, setPagination] = useState<IslandPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadIslandOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: IslandSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (pagination.loading && !reset) return loadedOptions;

            setPagination(prev => ({ ...prev, loading: true }));

            const response = await IslandService.getIslands({
                search: inputValue,
                page: page,
                limit: 10,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions = response.data.data.map((island: Island) => ({
                    value: island.island_id,
                    label: island.island_name
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setIslandOptions(updatedOptions);
                
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
        setIslandOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadIslandOptions(inputValue, [], 1, true);
    }, [loadIslandOptions]);
    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadIslandOptions(inputValue, islandOptions, pagination.page + 1, false);
        }
    }, [pagination, islandOptions, inputValue, loadIslandOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (islandOptions.length === 0) {
            await loadIslandOptions('', [], 1, true);
        }
    }, [islandOptions.length, loadIslandOptions]);

    return {
        islandOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadIslandOptions
    };
};