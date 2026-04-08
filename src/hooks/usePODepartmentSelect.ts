import { useState, useCallback } from 'react';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { ComponentsItem } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

export interface PODepartmentSelectOption {
    value: string;
    label: string;
    data?: ComponentsItem;
}

export interface PODepartmentPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const usePODepartmentSelect = (limit: number = 30, subsidiary_id?: number) => {
    const [PODepartmentOptions, setPODepartmentOptions] = useState<PODepartmentSelectOption[]>([]);
    const [pagination, setPagination] = useState<PODepartmentPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadPODepartmentOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: PODepartmentSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await PurchaseOrderService.getPODepartment({
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc',
                ...(subsidiary_id !== undefined ? { subsidiary_id } : {})
            });

            if (response.success) {
                const newOptions: PODepartmentSelectOption[] = response.data.items.map((poItems: ComponentsItem) => ({
                    value: poItems.id.toString(),
                    label: poItems.name,
                    data: poItems
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setPODepartmentOptions(updatedOptions);
                
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
    }, [limit, subsidiary_id]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setPODepartmentOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadPODepartmentOptions(inputValue, [], 1, true);
    }, [loadPODepartmentOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadPODepartmentOptions(inputValue, PODepartmentOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, PODepartmentOptions, loadPODepartmentOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (PODepartmentOptions.length === 0) {
            await loadPODepartmentOptions('', [], 1, true);
        }
    }, [PODepartmentOptions.length, loadPODepartmentOptions]);

    // Get PO item by ID
    const getPOItemById = useCallback(async (poItemId: string,): Promise<PODepartmentSelectOption | null> => {
        try {
            const response = await PurchaseOrderService.getPODepartment({ search: poItemId });
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

    // Reset department options ketika subsidiary_id berubah
    const resetDepartmentOptions = useCallback(async () => {
        setPODepartmentOptions([]);
        setInputValue('');
        setPagination({ page: 1, hasMore: true, loading: false });
        if (subsidiary_id) {
            await loadPODepartmentOptions('', [], 1, true);
        }
    }, [subsidiary_id, loadPODepartmentOptions]);

    return {
        PODepartmentOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadPODepartmentOptions,
        getPOItemById,
        resetDepartmentOptions,
    };
};