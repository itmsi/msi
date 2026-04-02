import { useState, useCallback } from 'react';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { LocationItem } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

export interface POLocationSelectOption {
    value: string;
    label: string;
    data?: LocationItem;
}

export interface POLocationPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const usePOLocationSelect = (limit: number = 30, is_parent?: boolean) => {
    const [POLocationOptions, setPOLocationOptions] = useState<POLocationSelectOption[]>([]);
    const [pagination, setPagination] = useState<POLocationPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadPOLocationOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: POLocationSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await PurchaseOrderService.getPOLocation({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc',
                ...(is_parent !== undefined ? { is_parent } : {})
            });

            if (response.success) {
                const newOptions: POLocationSelectOption[] = response.data.items.map((poItems: LocationItem) => ({
                    value: poItems.id.toString(),
                    label: poItems.name,
                    data: poItems
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setPOLocationOptions(updatedOptions);
                
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
    }, [limit, is_parent]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setPOLocationOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadPOLocationOptions(inputValue, [], 1, true);
    }, [loadPOLocationOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadPOLocationOptions(inputValue, POLocationOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, POLocationOptions, loadPOLocationOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (POLocationOptions.length === 0) {
            await loadPOLocationOptions('', [], 1, true);
        }
    }, [POLocationOptions.length, loadPOLocationOptions]);

    // Get PO item by ID
    const getPOItemById = useCallback(async (poItemId: string, is_parent: boolean = true): Promise<POLocationSelectOption | null> => {
        try {
            const response = await PurchaseOrderService.getPOLocation({ search: poItemId, is_parent: is_parent });
            if (response.success && response.data.items.length > 0) {
                const poItem = response.data.items[0];
                return {
                    value: poItem.id.toString(),
                    label: poItem.name,
                    data: poItem
                };
            }
        } catch (error) {
            console.error('Error getting Purchase Order item by ID:', error);
        }
        return null;
    }, []);

    return {
        POLocationOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadPOLocationOptions,
        getPOItemById
    };
};