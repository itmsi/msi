import { useState, useCallback } from 'react';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { ComponentsItem } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

export interface POClassSelectOption {
    value: string;
    label: string;
    data?: ComponentsItem;
}

export interface POClassPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const usePOClassSelect = (limit: number = 30, subsidiary_id?: number, profileSSOId?: number) => {
    const [POClassOptions, setPOClassOptions] = useState<POClassSelectOption[]>([]);
    const [pagination, setPagination] = useState<POClassPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadPOClassOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: POClassSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        // Prevent multiple simultaneous calls
        if (isLoading) return loadedOptions;
        
        try {
            setIsLoading(true);
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await PurchaseOrderService.getPOClass({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc',
                ...(subsidiary_id !== undefined ? { subsidiary_id } : {}),
                ...(profileSSOId !== undefined ? { class_profile: profileSSOId } : {})

            });

            if (response.success) {
                const newOptions: POClassSelectOption[] = response.data.items.map((poItems: ComponentsItem) => ({
                    value: poItems.id.toString(),
                    label: poItems.name,
                    data: poItems
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setPOClassOptions(updatedOptions);
                
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
    }, [limit, subsidiary_id, profileSSOId, isLoading]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setPOClassOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadPOClassOptions(inputValue, [], 1, true);
    }, [loadPOClassOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadPOClassOptions(inputValue, POClassOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, POClassOptions, loadPOClassOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (!initialized && !isLoading && POClassOptions.length === 0) {
            await loadPOClassOptions('', [], 1, true);
        }
    }, [initialized, isLoading, POClassOptions.length, loadPOClassOptions]);

    // Get PO item by ID
    const getPOItemById = useCallback(async (poItemId: string,): Promise<POClassSelectOption | null> => {
        try {
            const response = await PurchaseOrderService.getPOClass({ search: poItemId, ...(profileSSOId !== undefined ? { class_profile: profileSSOId } : {}) });
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
    }, [profileSSOId]);

    // Reset class options ketika subsidiary_id berubah
    const resetClassOptions = useCallback(async () => {
        if (isLoading) return; // Prevent reset during loading
        
        setPOClassOptions([]);
        setInputValue('');
        setInitialized(false);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        if (subsidiary_id) {
            await loadPOClassOptions('', [], 1, true);
        }
    }, [subsidiary_id, loadPOClassOptions, isLoading]);

    return {
        POClassOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadPOClassOptions,
        getPOItemById,
        resetClassOptions,
        initialized, // Export initialized state
        isLoading, // Export loading state
    };
};