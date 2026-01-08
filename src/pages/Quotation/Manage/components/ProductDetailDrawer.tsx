import React from 'react';
import Offcanvas from '../../../../components/ui/offcanvas';
import ProductDetailOffcanvas from './ProductDetailOffcanvas';
import ProductDetailErrorBoundary from './ProductDetailErrorBoundary';
import { ItemProduct } from '../../Product/types/product';

interface ProductDetailDrawerProps {
    productId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (updatedProduct: ItemProduct) => void;
    onChange?: (updatedProduct: ItemProduct) => void;
    initialData?: ItemProduct | null;
    readOnly?: boolean;
}

const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
    productId,
    isOpen,
    onClose,
    onSave,
    onChange,
    initialData,
    readOnly = false
}) => {    
    console.log({
        initialData
    });
    
    return (
        <Offcanvas
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Produk"
            description="Informasi lengkap produk komponen"
            width="xxl"
            position="right"
        >
            <ProductDetailErrorBoundary>
                <ProductDetailOffcanvas
                    productId={productId}
                    isOpen={isOpen}
                    onClose={onClose}
                    onSave={onSave}
                    onChange={onChange}
                    initialData={initialData}
                    readOnly={readOnly}
                />
            </ProductDetailErrorBoundary>
        </Offcanvas>
    );
};

export default ProductDetailDrawer;