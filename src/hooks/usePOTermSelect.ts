import { useState, useCallback } from 'react';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { TermsItem } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

export interface POTermSelectOption {
    value: string;
    label: string;
    data?: TermsItem;
}

export interface POTermPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const usePOTermSelect = (limit: number = 30) => {
    const [POTermOptions, setPOTermOptions] = useState<POTermSelectOption[]>([]);
    const [pagination, setPagination] = useState<POTermPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadPOTermOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: POTermSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await PurchaseOrderService.getPOTerms({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions: POTermSelectOption[] = response.data.items.map((poItems: TermsItem) => ({
                    value: poItems.id.toString(),
                    label: poItems.name,
                    data: poItems
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setPOTermOptions(updatedOptions);
                
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
        setPOTermOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadPOTermOptions(inputValue, [], 1, true);
    }, [loadPOTermOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadPOTermOptions(inputValue, POTermOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, POTermOptions, loadPOTermOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (POTermOptions.length === 0) {
            await loadPOTermOptions('', [], 1, true);
        }
    }, [POTermOptions.length, loadPOTermOptions]);

    // Get PO item by ID
    const getPOItemById = useCallback(async (poItemId: string): Promise<POTermSelectOption | null> => {
        try {
            const response = await PurchaseOrderService.getPOTerms({ search: poItemId });
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
        POTermOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadPOTermOptions,
        getPOItemById
    };
};