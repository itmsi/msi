import React, { useState, useEffect, useCallback } from 'react';
import { ItemProduct } from '../../Product/types/product';
import Input from '../../../../components/form/input/InputField';
import { getDefaultSpecs } from '../../Product/hooks/useProductCreate';
import { useLanguage } from '@/components/lang/useLanguage';
import { quotationLabels } from '../language/quotationLabels';
import { quotationLabelPDF } from '@/pages/Quotation/Manage/language/quotationLabelPDF';
import WysiwygEditor from '@/components/form/editor/WysiwygEditor';

interface ProductDetailOffcanvasProps {
    productId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (updatedProduct: ItemProduct) => void;
    onChange?: (updatedProduct: ItemProduct) => void;
    initialData?: ItemProduct | null;
    readOnly?: boolean;
}

const ProductDetailOffcanvas: React.FC<ProductDetailOffcanvasProps> = ({
    productId,
    isOpen,
    onClose,
    onChange,
    initialData,
    readOnly = false
}) => {
    const { langField } = useLanguage(quotationLabels);
    const { langField: langFieldPDF } = useLanguage(quotationLabelPDF);

    // Helper function to translate specification labels
    const translateSpecLabel = (label: string): string => {
        const specMap: { [key: string]: string } = {
            'remark': langFieldPDF('spec_remark')
        };
        
        return specMap[label] || label;
    };
    const [error, setError] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const [activeTab] = useState<'specifications' | 'accessories'>('specifications');


    // Default specifications template - dinamis berdasarkan componen_type produk
    const defaultSpecifications = React.useMemo(() => {
        const componentType = (initialData as any)?.componen_type || 1;
        return getDefaultSpecs(componentType).map(spec => ({
            label: spec.specification_label_name,
            value: spec.specification_value_name || ''
        }));
    }, [(initialData as any)?.componen_type]);



    useEffect(() => {
        if (!isOpen) {
            setError(null);
        } else if (!initialData || initialData.componen_product_id !== productId) {
            setError('Product data not available');
        } else {
            setError(null);
        }
    }, [productId, isOpen, initialData]);

    const handleFieldUpdate = useCallback((field: keyof ItemProduct, value: string) => {
        if (!initialData || !onChange) return;
        
        const updatedData = {
            ...initialData,
            [field]: value
        };
        
        onChange(updatedData);
    }, [initialData, onChange]);

    const handleSpecificationUpdate = useCallback((index: number, value: string) => {
        if (!initialData || !onChange) return;
        
        const updatedData = { ...initialData };
        const existingSpecs = updatedData.componen_product_specifications || [];
        const updatedSpecs = [];
        
        for (let i = 0; i < defaultSpecifications.length; i++) {
            const defaultSpec = defaultSpecifications[i];
            
            const existingSpec = existingSpecs.find(spec => 
                spec.componen_product_specification_label === defaultSpec.label ||
                spec.specification_label_name === defaultSpec.label
            );
            
            const newValue = i === index ? value : 
                (existingSpec?.componen_product_specification_value || 
                 existingSpec?.specification_value_name || 
                 defaultSpec.value || '');
            
            updatedSpecs.push({
                componen_product_specification_label: defaultSpec.label,
                componen_product_specification_value: newValue,
                componen_product_specification_description: existingSpec?.componen_product_specification_description || null,
                specification_label_name: defaultSpec.label,
                specification_value_name: newValue
            });
        }
        
        updatedData.componen_product_specifications = updatedSpecs;
        onChange(updatedData);
    }, [initialData, defaultSpecifications, onChange]);

    const editableSpecifications = React.useMemo(() => {
        if (!initialData) return [];


        const existingSpecs = initialData.componen_product_specifications || [];
        const editableSpecs = [];
        // Map by matching label names, not by index
        for (let i = 0; i < defaultSpecifications.length; i++) {
            const defaultSpec = defaultSpecifications[i];
            
            // Find matching specification by label name
            const existingSpec = existingSpecs.find(spec => 
                spec.componen_product_specification_label === defaultSpec.label ||
                spec.specification_label_name === defaultSpec.label
            );
            
            editableSpecs.push({
                componen_product_specification_label: defaultSpec.label,
                componen_product_specification_value: existingSpec?.componen_product_specification_value || existingSpec?.specification_value_name || defaultSpec.value || '',
                componen_product_specification_description: existingSpec?.componen_product_specification_description || null,
                specification_label_name: defaultSpec.label,
                specification_value_name: existingSpec?.componen_product_specification_value || existingSpec?.specification_value_name || defaultSpec.value || ''
            });
        }
        
        return editableSpecs;
    }, [initialData?.componen_product_specifications, defaultSpecifications]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowImageModal(false);
            }
        };

        if (showImageModal) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [showImageModal]);
    const renderProductInfo = () => {
        if (error) {
            return (
                <div className="p-6 text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-600 font-medium">{error}</p>
                    <div className="mt-4 flex gap-2 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            {langField('close')}
                        </button>
                    </div>
                </div>
            );
        }

        if (!initialData || !initialData) {
            return (
                <div className="p-6 text-center text-gray-500">
                    <p>{langField('productDataNotFound')}</p>
                </div>
            );
        }
        
        return (
            <div className="p-6 space-y-6">

                {/* Product Image */}
                <div className="border-b border-gray-200 pb-6">
                    <div className='md:grid md:grid-cols-5 md:gap-4'>
                        <div className="flex md:col-span-5 justify-center">
                            {(() => {
                                // Flatten nested array structure
                                const flatImages = initialData.images ? initialData.images.flat() : [];
                                return flatImages?.length ? (
                                    flatImages.map((img: any, idx: number) => (
                                        <div key={idx} className="relative cursor-pointer" onClick={() => {
                                            setSelectedImageIndex(idx);
                                            setShowImageModal(true);
                                        }}>
                                            <img
                                                src={img.image_url || img}
                                                alt={initialData.componen_product_name || 'Product Image'}
                                                className="max-w-full max-h-50 object-contain rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    target.parentElement?.querySelector('.image-placeholder')?.classList.remove('hidden');
                                                }}
                                            />
                                            {!readOnly && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-lg">
                                                    <div className="text-white text-center">
                                                        <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                        </svg>
                                                        <p className="text-sm">{langField('clickToEnlarge')}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Hidden placeholder for error handling */}
                                            <div className="image-placeholder hidden flex items-center justify-center w-50 h-50 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                                                <div className="text-center">
                                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-gray-500 text-sm">{langField('imageNotValid')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center w-50 h-50 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                                        <div className="text-center">
                                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-gray-500 text-sm">{langField('noImage')}</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                    
                </div>

                {/* Tab Content */}
                {activeTab === 'specifications' && (
                    <div className='product-spesification-information'>
                    {/* Product Basic Info */}
                    <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">{langField('basicInformation')}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className='md:col-span-2'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {langField('productName')}
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.componen_product_name || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.componen_product_name || ''}
                                    onChange={(e) => handleFieldUpdate('componen_product_name', e.target.value)}
                                    placeholder={langField('enterProductName')}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {langField('uniqueCode')}
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.code_unique || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.code_unique || ''}
                                    onChange={(e) => handleFieldUpdate('code_unique', e.target.value)}
                                    placeholder={langField('enterUniqueCode')}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {langField('product_type')}
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.product_type || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.segment || ''}
                                    onChange={(e) => handleFieldUpdate('product_type', e.target.value)}
                                    placeholder={langField('enterProductType')}
                                    className="w-full"
                                />
                            </div>
                            {editableSpecifications.map((spec, index) => {
                                return (
                                    <div key={index} className="flex justify-between items-start col-span-2">
                                        <div className="flex-1">
                                            <WysiwygEditor
                                                label={translateSpecLabel(spec.componen_product_specification_label ?? '')}
                                                value={spec.componen_product_specification_value || ''}
                                                onChange={(content) => handleSpecificationUpdate(index, content)}
                                                placeholder="Enter remarks content..."
                                                minHeight="300px"
                                            />
                                        </div>
                                    </div>
                                )}
                            )}
                        </div>
                    </div>

                    {/* Product Pricing Info */}
                    <div className="border-b border-gray-200 pb-6 hidden">
                        <h4 className="text-lg font-semibold text-gray-900 my-4">{langField('priceInformation')}</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {langField('marketPrice')}
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.market_price ? 
                                        new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR'
                                        }).format(Number(initialData.market_price)) : '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.market_price || ''}
                                    onChange={(e) => handleFieldUpdate('market_price', e.target.value)}
                                    placeholder={langField('enterMarketPrice')}
                                    className="w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {langField('priceStar1')}
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                        {initialData.selling_price_star_1 ? 
                                            new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR'
                                            }).format(Number(initialData.selling_price_star_1)) : '-'}
                                    </p>
                                    <Input
                                        type="hidden"
                                        value={initialData.selling_price_star_1 || ''}
                                        onChange={(e) => handleFieldUpdate('selling_price_star_1', e.target.value)}
                                        placeholder={langField('pricePlaceholderStar1')}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {langField('priceStar2')}
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                        {initialData.selling_price_star_2 ? 
                                            new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR'
                                            }).format(Number(initialData.selling_price_star_2)) : '-'}
                                    </p>
                                    <Input
                                        type="hidden"
                                        value={initialData.selling_price_star_2 || ''}
                                        onChange={(e) => handleFieldUpdate('selling_price_star_2', e.target.value)}
                                        placeholder={langField('pricePlaceholderStar2')}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {langField('priceStar3')}
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                        {initialData.selling_price_star_3 ? 
                                            new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR'
                                            }).format(Number(initialData.selling_price_star_3)) : '-'}
                                    </p>
                                    <Input
                                        type="hidden"
                                        value={initialData.selling_price_star_3 || ''}
                                        onChange={(e) => handleFieldUpdate('selling_price_star_3', e.target.value)}
                                        placeholder={langField('pricePlaceholderStar3')}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {langField('priceStar4')}
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                        {initialData.selling_price_star_4 ? 
                                            new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR'
                                            }).format(Number(initialData.selling_price_star_4)) : '-'}
                                    </p>
                                    <Input
                                        type="hidden"
                                        value={initialData.selling_price_star_4 || ''}
                                        onChange={(e) => handleFieldUpdate('selling_price_star_4', e.target.value)}
                                        placeholder={langField('pricePlaceholderStar4')}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {langField('priceStar5')}
                                    </label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                        {initialData.selling_price_star_5 ? 
                                            new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR'
                                            }).format(Number(initialData.selling_price_star_5)) : '-'}
                                    </p>
                                    <Input
                                        type="hidden"
                                        value={initialData.selling_price_star_5 || ''}
                                        onChange={(e) => handleFieldUpdate('selling_price_star_5', e.target.value)}
                                        placeholder={langField('pricePlaceholderStar5')}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {renderProductInfo()}
            
            {/* Image Modal */}
            {showImageModal && initialData?.images && (() => {
                const flatImages = initialData.images.flat();
                return flatImages.length > 0 && flatImages[selectedImageIndex]?.image_url;
            })() && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black-900 backdrop-blur-sm"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] p-4 overflow-hidden">
                        <img
                            src={initialData.images.flat()[selectedImageIndex]?.image_url}
                            alt={initialData.componen_product_name || 'Product Image'}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                            <p className="text-white text-sm bg-black bg-opacity-50 rounded px-3 py-1 inline-block">
                                {initialData.componen_product_name}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetailOffcanvas;