import { useState } from 'react';
import { ItemProductService } from '../services/productService';
import { ItemProductValidationErrors, ItemProduct } from '../types/product';

export interface UseProductEditReturn {
    // Loading states
    isLoading: boolean;
    isUpdating: boolean;
    
    // Data states
    productData: ItemProduct | null;
    validationErrors: ItemProductValidationErrors;
    
    // Actions
    loadProduct: (productId: string) => Promise<ItemProduct | null>;
    clearFieldError: (field: keyof ItemProductValidationErrors) => void;
    updateProduct: (productId: string, productData: Partial<Omit<ItemProduct, 'componen_product_id'>> | FormData) => Promise<boolean>;
}

export function useProductEdit(): UseProductEditReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [productData, setProductData] = useState<ItemProduct | null>(null);
    const [validationErrors, setValidationErrors] = useState<ItemProductValidationErrors>({});

    const clearFieldError = (field: keyof ItemProductValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    };

    const loadProduct = async (productId: string): Promise<ItemProduct | null> => {
        setIsLoading(true);
        try {
            const response = await ItemProductService.getItemProductById(productId);
            
            if (response.data?.status && response.data?.data) {
                const product = response.data.data;
                setProductData(product);
                return product;
            } else {
                setProductData(null);
                return null;
            }
        } catch (error) {
            console.error('Error loading product:', error);
            setProductData(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const updateProduct = async (productId: string, productData: Partial<Omit<ItemProduct, 'componen_product_id'>> | FormData): Promise<boolean> => {
        setIsUpdating(true);
        setValidationErrors({});

        try {
            await ItemProductService.updateItemProduct(productId, productData);
            return true;
        } catch (error: any) {
            // Handle validation errors from API
            if (error.errors && typeof error.errors === 'object') {
                setValidationErrors(error.errors);
            }
            console.error('Error updating product:', error);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        isLoading,
        isUpdating,
        productData,
        validationErrors,
        loadProduct,
        clearFieldError,
        updateProduct
    };
}