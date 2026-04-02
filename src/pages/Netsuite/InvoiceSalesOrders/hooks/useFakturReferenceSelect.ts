import { useState, useCallback } from 'react';
import { FakturService } from '../services/fakturService';
import { ReferenceItem } from '../types/faktur';

export interface ReferenceSelectOption {
    value: string;
    label: string;
    data?: ReferenceItem;
}

export interface ReferencePaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useFakturReferenceSelect = (type: string, options?: { limit?: number, labelFormat?: (opt: ReferenceItem) => string }) => {
    const limit = options?.limit || 30;
    const [referenceOptions, setReferenceOptions] = useState<ReferenceSelectOption[]>([]);
    const [pagination, setPagination] = useState<ReferencePaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadReferenceOptions = useCallback(async (
        searchValue: string = '', 
        loadedOptions: ReferenceSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await FakturService.getReferences({
                type,
                search: searchValue,
                page: page,
                limit: limit
            });

            if (response.success) {
                const items = response.data.items;
                const newOptions: ReferenceSelectOption[] = items.map((item: ReferenceItem) => ({
                    value: item.code,
                    label: options?.labelFormat ? options.labelFormat(item) : item.description,
                    data: item
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setReferenceOptions(updatedOptions);
                
                const paginationInfo = response.data.pagination;
                const hasMoreData = paginationInfo.page < paginationInfo.totalPages;
                
                setPagination({
                    page: paginationInfo.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error(`Error loading reference options for ${type}:`, error);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        setPagination(prev => ({ ...prev, loading: false }));
        return loadedOptions;
    }, [type, limit, options]);

    const loadOptionsByValues = useCallback(async (values: string[]) => {
        if (!values || values.length === 0) return;
        
        // Filter out values already in referenceOptions
        const missingValues = values.filter(v => v && !referenceOptions.some(opt => opt.value === v));
        if (missingValues.length === 0) return;

        try {
            // Fetch missing values concurrently
            const fetchPromises = missingValues.map(async (val) => {
                const response = await FakturService.getReferences({
                    type,
                    search: val,
                    limit: 1 // We only need the exact match
                });
                return response.success ? response.data.items : [];
            });

            const results = await Promise.all(fetchPromises);
            const foundItems = results.flat();
            
            if (foundItems.length > 0) {
                const newOptions: ReferenceSelectOption[] = foundItems.map((item: ReferenceItem) => ({
                    value: item.code,
                    label: options?.labelFormat ? options.labelFormat(item) : item.description,
                    data: item
                }));

                setReferenceOptions(prev => {
                    // Avoid duplicates
                    const existingValues = new Set(prev.map(p => p.value));
                    const filteredNew = newOptions.filter(n => !existingValues.has(n.value));
                    return [...prev, ...filteredNew];
                });
            }
        } catch (error) {
            console.error(`Error recovering labels for ${type}:`, error);
        }
    }, [type, options, referenceOptions]);

    const handleInputChange = useCallback(async (val: string) => {
        setInputValue(val);
        // We only reset if the value actually changed or if it's the first load
        setReferenceOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadReferenceOptions(val, [], 1, true);
    }, [loadReferenceOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadReferenceOptions(inputValue, referenceOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, referenceOptions, loadReferenceOptions]);

    const initializeOptions = useCallback(async () => {
        if (referenceOptions.length === 0) {
            await loadReferenceOptions('', [], 1, true);
        }
    }, [referenceOptions.length, loadReferenceOptions]);

    return {
        referenceOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadReferenceOptions,
        loadOptionsByValues
    };
};
