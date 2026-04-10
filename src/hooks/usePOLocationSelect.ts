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

export const usePOLocationSelect = (limit: number = 30, is_parent?: boolean, subsidiary_id?: number) => {
    const [POLocationOptions, setPOLocationOptions] = useState<POLocationSelectOption[]>([]);
    const [pagination, setPagination] = useState<POLocationPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadPOLocationOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: POLocationSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        // Prevent multiple simultaneous calls
        if (isLoading) return loadedOptions;
        
        try {
            setIsLoading(true);
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await PurchaseOrderService.getPOLocation({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc',
                ...(subsidiary_id !== undefined ? { subsidiary_id } : {}),
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
                
                if (reset) setInitialized(true);

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading Purchase Order items:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        } finally {
            setIsLoading(false);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        return loadedOptions;
    }, [limit, is_parent, subsidiary_id, isLoading]); // Tambahkan subsidiary_id sebagai dependency

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
        if (!initialized && !isLoading && POLocationOptions.length === 0) {
            await loadPOLocationOptions('', [], 1, true);
        }
    }, [initialized, isLoading, POLocationOptions.length, loadPOLocationOptions]);

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

    // Reset location options ketika subsidiary_id berubah
    const resetLocationOptions = useCallback(async () => {
        if (isLoading) return; // Prevent reset during loading
        
        setPOLocationOptions([]);
        setInputValue('');
        setInitialized(false);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        if (subsidiary_id) {
            await loadPOLocationOptions('', [], 1, true);
        }
    }, [subsidiary_id, loadPOLocationOptions, isLoading]);

    return {
        POLocationOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadPOLocationOptions,
        getPOItemById,
        resetLocationOptions,
        initialized, // Export initialized state
        isLoading, // Export loading state
    };
};