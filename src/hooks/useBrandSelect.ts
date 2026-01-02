import { useState, useCallback } from 'react';
import { BrandService } from '@/pages/CRM/Brand/services/brandService';
import { BrandItem } from '@/pages/CRM/Brand/types/brand';

export interface BrandSelectOption {
    value: string;
    label: string;
}

export interface BrandPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useBrandSelect = () => {
    const [brandOptions, setBrandOptions] = useState<BrandSelectOption[]>([]);
    const [pagination, setPagination] = useState<BrandPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadBrandOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: BrandSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (pagination.loading && !reset) return loadedOptions;

            setPagination(prev => ({ ...prev, loading: true }));

            const response = await BrandService.getBrands({
                search: inputValue,
                page: page,
                limit: 20,
                sort_order: 'desc'
            });
            if (response.success) {
                
                const newOptions = response.data.map((brand: BrandItem) => ({
                    value: brand.brand_id,
                    label: brand.brand_name_en
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setBrandOptions(updatedOptions);
                
                const hasMoreData = response.pagination.page < response.pagination.totalPages;
                
                setPagination({
                    page: response.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading term conditions:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        return loadedOptions;
    }, [pagination.loading]);

    // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setBrandOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadBrandOptions(inputValue, [], 1, true);
    }, [loadBrandOptions]);
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadBrandOptions(inputValue, brandOptions, pagination.page + 1, false);
        }
    }, [pagination, brandOptions, inputValue, loadBrandOptions]);


    const initializeOptions = useCallback(async () => {
        if (brandOptions.length === 0) {
            await loadBrandOptions('', [], 1, true);
        }
    }, [brandOptions.length, loadBrandOptions]);

    return {
        brandOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadBrandOptions
    };
};