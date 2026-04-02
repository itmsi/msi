import { useState, useCallback } from 'react';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { DataItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

export interface POItemsSelectOption {
    value: string;
    label: string;
    data?: DataItems;
}

export interface POItemsPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const usePOItemsSelect = (limit: number = 30) => {
    const [POItemsOptions, setPOItemsOptions] = useState<POItemsSelectOption[]>([]);
    const [pagination, setPagination] = useState<POItemsPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadPOItemsOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: POItemsSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await PurchaseOrderService.getPOItems({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions: POItemsSelectOption[] = response.data.items.map((poItems: DataItems) => ({
                    value: poItems.internalId,
                    label: poItems.itemId,
                    data: poItems
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setPOItemsOptions(updatedOptions);
                
                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;
                
                setPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading Purchase Order items:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        setPagination(prev => ({ ...prev, loading: false }));
        return loadedOptions;
    }, [limit]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setPOItemsOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadPOItemsOptions(inputValue, [], 1, true);
    }, [loadPOItemsOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadPOItemsOptions(inputValue, POItemsOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, POItemsOptions, loadPOItemsOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (POItemsOptions.length === 0) {
            await loadPOItemsOptions('', [], 1, true);
        }
    }, [POItemsOptions.length, loadPOItemsOptions]);

    // Get PO item by ID
    const getPOItemById = useCallback(async (poItemId: string): Promise<POItemsSelectOption | null> => {
        try {
            const response = await PurchaseOrderService.getPOItems({ search: poItemId });
            if (response.success && response.data.items.length > 0) {
                const poItem = response.data.items[0];
                return {
                    value: poItem.internalId,
                    label: poItem.itemId,
                    data: poItem
                };
            }
        } catch (error) {
            console.error('Error getting Purchase Order item by ID:', error);
        }
        return null;
    }, []);

    return {
        POItemsOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadPOItemsOptions,
        getPOItemById
    };
};