import { useState, useCallback } from 'react';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { ProjectSegmentationItem } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

export interface POProjectSegmentationSelectOption {
    value: string;
    label: string;
    data?: ProjectSegmentationItem;
}

export interface POProjectSegmentationPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const usePOProjectSegmentationSelect = (limit: number = 30) => {
    const [POProjectSegmentationOptions, setPOProjectSegmentationOptions] = useState<POProjectSegmentationSelectOption[]>([]);
    const [pagination, setPagination] = useState<POProjectSegmentationPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadPOProjectSegmentationOptions = useCallback(async (
        inputValue: string = '',
        loadedOptions: POProjectSegmentationSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        // Prevent multiple simultaneous calls
        if (isLoading) return loadedOptions;

        try {
            setIsLoading(true);
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await PurchaseOrderService.getPOProjectSegmentation({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc',
            });

            if (response.success) {
                const newOptions: POProjectSegmentationSelectOption[] = response.data.items.map((poItems: ProjectSegmentationItem) => ({
                    value: poItems.id.toString(),
                    label: poItems.full_name || poItems.name,
                    data: poItems
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setPOProjectSegmentationOptions(updatedOptions);

                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;

                setPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                if (reset) setInitialized(true);

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading Project Segmentation options:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        } finally {
            setIsLoading(false);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        return loadedOptions;
    }, [limit, isLoading]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setPOProjectSegmentationOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });

        return await loadPOProjectSegmentationOptions(inputValue, [], 1, true);
    }, [loadPOProjectSegmentationOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadPOProjectSegmentationOptions(inputValue, POProjectSegmentationOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, POProjectSegmentationOptions, loadPOProjectSegmentationOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (!initialized && !isLoading && POProjectSegmentationOptions.length === 0) {
            await loadPOProjectSegmentationOptions('', [], 1, true);
        }
    }, [initialized, isLoading, POProjectSegmentationOptions.length, loadPOProjectSegmentationOptions]);

    return {
        POProjectSegmentationOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadPOProjectSegmentationOptions,
        initialized,
        isLoading,
    };
};
