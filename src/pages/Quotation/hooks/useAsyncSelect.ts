import { useState, useCallback } from 'react';
import { AuthService } from '@/services/authService';
import { ItemProductService } from '../Product/services/productService';
import { AccessoriesService } from '../Accessories/services/accessoriesService';
import { ItemProduct } from '../Product/types/product';
import { Accessories } from '../Accessories/types/accessories';

export interface SelectOption {
    value: string;
    label: string;
    code: string;
    price?: string;
    market_price?: string;
    msi_model?: string;
    segment?: string;
    wheel_no?: string;
    accessory_part_name?: string;
    accessory_part_number?: string;
    accessory_brand?: string;
    accessory_specification?: string;
    description?: string;
    data?: any;
}

export interface PaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useAsyncSelect = () => {
    // Product states
    const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
    const [productPagination, setProductPagination] = useState<PaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [productInputValue, setProductInputValue] = useState('');

    // Accessory states
    const [accessoryOptions, setAccessoryOptions] = useState<SelectOption[]>([]);
    const [accessoryPagination, setAccessoryPagination] = useState<PaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [accessoryInputValue, setAccessoryInputValue] = useState('');

    // Load products for async select
    const loadProducts = useCallback(async (
        inputValue: string = '', 
        loadedOptions: SelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (productPagination.loading && !reset) return loadedOptions;

            setProductPagination(prev => ({ ...prev, loading: true }));

            // Get company_name from logged in user
            const user = AuthService.getCurrentUser();
            const companyName = user.company_name;

            const response = await ItemProductService.getItemProduct({
                search: inputValue,
                page: page,
                limit: 10,
                sort_order: 'desc',
                company_name: companyName
            });

            if (response.status) {
                const newOptions = response.data.items.map((product: ItemProduct) => ({
                    value: product.componen_product_id,
                    label: `${product.componen_product_name || 'Unknown'}`,
                    code: product.code_unique || '',
                    price: product.selling_price_star_1 || '0',
                    market_price: product.market_price || product.selling_price_star_1 || '0',
                    msi_model: product.msi_model || '',
                    segment: product.segment || '',
                    wheel_no: product.wheel_no || '',
                    product_type: product.product_type || '',
                    description: `${product.engine || 'Unknown'} (${product.horse_power || 'Unknown'})`,
                    data: product
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setProductOptions(updatedOptions);

                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;
                setProductPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProductPagination(prev => ({ ...prev, loading: false }));
        }

        return loadedOptions;
    }, [productPagination.loading]);

    // Load accessories for async select
    const loadAccessories = useCallback(async (
        inputValue: string = '',
        loadedOptions: SelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (accessoryPagination.loading && !reset) return loadedOptions;

            setAccessoryPagination(prev => ({ ...prev, loading: true }));

            const response = await AccessoriesService.getAccessories({
                search: inputValue,
                page: page,
                limit: 10,
                sort_order: 'desc'
            });

            if (response.status) {
                const newOptions = response.data.items.map((accessory: Accessories) => ({
                    value: accessory.accessory_id,
                    label: `${accessory.accessory_part_name}`,
                    code: accessory.accessory_part_number,
                    price: '0', // Accessories might not have price in API
                    accessory_part_name: accessory.accessory_part_name || '',
                    accessory_part_number: accessory.accessory_part_number || '',
                    accessory_brand: accessory.accessory_brand || '',
                    accessory_specification: accessory.accessory_specification || '',
                    description: accessory.accessory_description || accessory.accessory_specification,
                    data: accessory
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setAccessoryOptions(updatedOptions);

                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;
                setAccessoryPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading accessories:', error);
            setAccessoryPagination(prev => ({ ...prev, loading: false }));
        }

        return loadedOptions;
    }, [accessoryPagination.loading]);

    // Handle product input change
    const handleProductInputChange = useCallback(async (inputValue: string) => {
        setProductInputValue(inputValue);
        setProductOptions([]); // Clear existing options for new search
        setProductPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadProducts(inputValue, [], 1, true);
    }, [loadProducts]);

    // Handle accessory input change  
    const handleAccessoryInputChange = useCallback(async (inputValue: string) => {
        setAccessoryInputValue(inputValue);
        setAccessoryOptions([]); // Clear existing options for new search
        setAccessoryPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadAccessories(inputValue, [], 1, true);
    }, [loadAccessories]);

    // Handle scroll to bottom for products
    const handleProductMenuScrollToBottom = useCallback(() => {
        if (productPagination.hasMore && !productPagination.loading) {
            loadProducts(productInputValue, productOptions, productPagination.page + 1, false);
        }
    }, [productPagination, productOptions, productInputValue, loadProducts]);

    // Handle scroll to bottom for accessories
    const handleAccessoryMenuScrollToBottom = useCallback(() => {
        if (accessoryPagination.hasMore && !accessoryPagination.loading) {
            loadAccessories(accessoryInputValue, accessoryOptions, accessoryPagination.page + 1, false);
        }
    }, [accessoryPagination, accessoryOptions, accessoryInputValue, loadAccessories]);

    // Initialize product options
    const initializeProductOptions = useCallback(async () => {
        if (productOptions.length === 0) {
            await loadProducts('', [], 1, true);
        }
    }, [productOptions.length, loadProducts]);

    // Initialize accessory options
    const initializeAccessoryOptions = useCallback(async () => {
        if (accessoryOptions.length === 0) {
            await loadAccessories('', [], 1, true);
        }
    }, [accessoryOptions.length, loadAccessories]);

    return {
        // Product related
        productOptions,
        productPagination,
        productInputValue,
        handleProductInputChange,
        handleProductMenuScrollToBottom,
        initializeProductOptions,
        
        // Accessory related
        accessoryOptions,
        accessoryPagination,
        accessoryInputValue,
        handleAccessoryInputChange,
        handleAccessoryMenuScrollToBottom,
        initializeAccessoryOptions,

        // Utility functions
        loadProducts,
        loadAccessories
    };
};