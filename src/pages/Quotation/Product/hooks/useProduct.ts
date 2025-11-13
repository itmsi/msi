import { useState, useCallback } from 'react';
import { ItemProduct, ItemProductRequest, Pagination } from '../types/product';
import { ItemProductService } from '../services/productService';

export const useProduct = () => {
    const [products, setProduct] = useState<ItemProduct[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
        has_next_page: false,
        has_prev_page: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async (params: Partial<ItemProductRequest> = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await ItemProductService.getItemProduct(params);
            if (response.status) {
                setProduct(response.data.items);
                const apiPagination = response.data.pagination;
                setPagination({
                    current_page: apiPagination.page,
                    per_page: apiPagination.limit,
                    total: apiPagination.total,
                    total_pages: apiPagination.totalPages,
                    has_next_page: apiPagination.page < apiPagination.totalPages,
                    has_prev_page: apiPagination.page > 1
                });
            } else {
                setError(response.message || 'Failed to fetch products');
            }
        } catch (err) {
            setError('Something went wrong while fetching products');
            console.error('Fetch products error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProduct = useCallback(async (productId: string, productData: Partial<Omit<ItemProduct, 'item_product_id'>>) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedProduct = await ItemProductService.updateItemProduct(productId, productData);
            // Update local state
            setProduct(prev => prev.map(product => 
                product.item_product_id === productId ? updatedProduct : product
            ));
            return updatedProduct;
        } catch (err) {
            setError('Failed to update product');
            console.error('Update product error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (productId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            await ItemProductService.deleteItemProduct(productId);
            // Remove from local state
            setProduct(prev => prev.filter(product => product.item_product_id !== productId));
            return true;
        } catch (err) {
            setError('Failed to delete product');
            console.error('Delete product error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        products,
        pagination,
        loading,
        error,
        fetchProduct,
        updateProduct,
        deleteProduct,
    };
};