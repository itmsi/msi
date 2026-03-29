import { useState, useCallback } from 'react';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { VendorItem } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

export interface POVendorSelectOption {
    value: string;
    label: string;
    data?: VendorItem;
}

export interface POVendorPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const usePOVendorSelect = (limit: number = 30) => {
    const [POVendorOptions, setPOVendorOptions] = useState<POVendorSelectOption[]>([]);
    const [pagination, setPagination] = useState<POVendorPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadPOVendorOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: POVendorSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await PurchaseOrderService.getPOVendor({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions: POVendorSelectOption[] = response.data.items.map((poItems: VendorItem) => ({
                    value: poItems.internalId.toString(),
                    label: poItems.companyName,
                    data: poItems
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setPOVendorOptions(updatedOptions);
                
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
        setPOVendorOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadPOVendorOptions(inputValue, [], 1, true);
    }, [loadPOVendorOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadPOVendorOptions(inputValue, POVendorOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, POVendorOptions, loadPOVendorOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (POVendorOptions.length === 0) {
            await loadPOVendorOptions('', [], 1, true);
        }
    }, [POVendorOptions.length, loadPOVendorOptions]);

    // Get PO item by ID
    const getPOItemById = useCallback(async (poItemId: string): Promise<POVendorSelectOption | null> => {
        try {
            const response = await PurchaseOrderService.getPOVendor({ search: poItemId });
            if (response.success && response.data.items.length > 0) {
                const poItem = response.data.items[0];
                return {
                    value: poItem.internalId.toString(),
                    label: poItem.companyName,
                    data: poItem
                };
            }
        } catch (error) {
            console.error('Error getting Purchase Order item by ID:', error);
        }
        return null;
    }, []);

    return {
        POVendorOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadPOVendorOptions,
        getPOItemById
    };
};