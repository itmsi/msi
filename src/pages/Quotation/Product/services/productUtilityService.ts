import { ItemProduct } from '../types/product';

export class ProductUtilityService {

    static validateProduct(productData: Partial<ItemProduct>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Required fields validation
        if (!productData.item_product_code || productData.item_product_code.trim().length === 0) {
            errors.push('Product code is required');
        }

        if (!productData.item_product_model || productData.item_product_model.trim().length === 0) {
            errors.push('Product model is required');
        }

        if (!productData.item_product_segment || productData.item_product_segment.trim().length === 0) {
            errors.push('Product segment is required');
        }

        // Optional but validate if provided
        if (productData.item_product_msi_model && productData.item_product_msi_model.length > 500) {
            errors.push('Model cannot exceed 500 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static getProductStatus(product: ItemProduct): 'complete' | 'incomplete' | 'missing_info' {
        const hasCode = product.item_product_code && product.item_product_code.trim().length > 0;
        const hasModel = product.item_product_model && product.item_product_model.trim().length > 0;
        const hasEngine = product.item_product_engine && product.item_product_engine.trim().length > 0;
        const hasSegment = product.item_product_segment && product.item_product_segment.trim().length > 0;

        if (!hasCode || !hasModel || !hasEngine || !hasSegment) {
            return 'missing_info';
        }

        if (hasCode && hasModel && hasEngine && hasSegment) {
            return 'complete';
        }

        return 'incomplete';
    }

    static searchProductsLocally(products: ItemProduct[], searchTerm: string): ItemProduct[] {
        if (!searchTerm.trim()) return products;

        const term = searchTerm.toLowerCase();

        return products.filter(product =>
            (product.item_product_code || '').toLowerCase().includes(term) ||
            (product.item_product_model || '').toLowerCase().includes(term) ||
            (product.item_product_engine || '').toLowerCase().includes(term) ||
            (product.item_product_segment || '').toLowerCase().includes(term)
        );
    }

    static sortProducts(products: ItemProduct[], field: keyof ItemProduct, order: 'asc' | 'desc' = 'asc'): ItemProduct[] {
        return [...products].sort((a, b) => {
            const aValue = (a[field] || '').toString().toLowerCase();
            const bValue = (b[field] || '').toString().toLowerCase();

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

}