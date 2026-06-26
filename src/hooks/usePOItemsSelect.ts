import { useState, useCallback, useEffect } from 'react';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { DataItems, ItemTypeItem } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

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

export const usePOItemsSelect = (limit: number = 10) => {
    const [POItemsOptions, setPOItemsOptions] = useState<POItemsSelectOption[]>([]);
    const [pagination, setPagination] = useState<POItemsPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');
    const [itemTypeFilter, setItemTypeFilter] = useState<string[]>([]);
    const [itemTypeOptions, setItemTypeOptions] = useState<{ value: string; label: string }[]>([]);

    // Load item types for dropdown
    const loadItemTypes = useCallback(async () => {
        try {
            const response = await PurchaseOrderService.getItemTypes();
            if (response.success) {
                const options = response.data.items.map((item: ItemTypeItem) => ({
                    value: item.code,
                    label: item.name
                }));
                setItemTypeOptions(options);
            }
        } catch (error) {
            console.error('Error loading item types:', error);
        }
    }, []);

    useEffect(() => {
        loadItemTypes();
    }, [loadItemTypes]);

    const loadPOItemsOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: POItemsSelectOption[] = [],
        page: number = 1,
        reset: boolean = false,
        itemTypeIds?: string[]
    ) => {
        try {
            setPagination(prev => ({ ...prev, loading: true }));

            const params: any = {
                search: inputValue,
                page: page,
                limit: limit,
                sort_order: 'desc'
            };

            const activeFilter = itemTypeIds ?? itemTypeFilter;
            if (activeFilter.length > 0) {
                params.item_type_id = activeFilter;
            }

            const response = await PurchaseOrderService.getPOItems(params);

            if (response.success) {
                const newOptions: POItemsSelectOption[] = response.data.items.map((poItems: DataItems) => ({
                    value: poItems.internalId,
                    label: poItems.displayName !== '' ? poItems.displayName : poItems.itemId,
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
    }, [limit, itemTypeFilter]);

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

    // Handle item type select change - single value
    const handleItemTypeChange = useCallback(async (selected: { value: string; label: string } | null) => {
        const newFilter = selected ? [selected.value] : [];
        setItemTypeFilter(newFilter);
        setPOItemsOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        setInputValue('');
        return await loadPOItemsOptions('', [], 1, true, newFilter);
    }, [loadPOItemsOptions]);

    // Set item type filter and reload items
    const setItemTypeIds = useCallback(async (itemTypeIds: string[]) => {
        setItemTypeFilter(itemTypeIds);
        setPOItemsOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        setInputValue('');
        return await loadPOItemsOptions('', [], 1, true, itemTypeIds);
    }, [loadPOItemsOptions]);

    // Get PO item by ID
    const getPOItemById = useCallback(async (poItemId: string): Promise<POItemsSelectOption | null> => {
        try {
            const response = await PurchaseOrderService.getPOItems({ search: poItemId });
            if (response.success && response.data.items.length > 0) {
                const poItem = response.data.items[0];
                return {
                    value: poItem.internalId,
                    label: poItem.displayName !== '' ? poItem.displayName : poItem.itemId,
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
        getPOItemById,
        itemTypeFilter,
        setItemTypeIds,
        itemTypeOptions,
        handleItemTypeChange,
        loadItemTypes
    };
};