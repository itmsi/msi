import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { ItemProduct } from '../../Product/types/product';
import { QuotationAccessory } from '../types/quotation';
import Input from '../../../../components/form/input/InputField';
import Button from '../../../../components/ui/button/Button';
import CustomAsyncSelect from '../../../../components/form/select/CustomAsyncSelect';
import CustomDataTable from "../../../../components/ui/table/CustomDataTable";
import { TableColumn } from "react-data-table-component";
import { useAsyncSelect, SelectOption } from '../../hooks/useAsyncSelect';
import { createActionsColumn } from '@/components/ui/table';

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
    const [error, setError] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    const [activeTab, setActiveTab] = useState<'specifications' | 'accessories'>('specifications');
    const [accessories, setAccessories] = useState<QuotationAccessory[]>([]);
    const [selectedAccessory, setSelectedAccessory] = useState<SelectOption | null>(null);
    const [accessorySelectError, setAccessorySelectError] = useState<string>('');

    const {
        accessoryOptions,
        accessoryInputValue,
        accessoryPagination,
        handleAccessoryInputChange,
        handleAccessoryMenuScrollToBottom
    } = useAsyncSelect();

    // Default specifications template - use useMemo to prevent re-creation
    const defaultSpecifications = React.useMemo(() => [
        { label: "Model", value: "" },
        { label: "Drive Type", value: "" },
        { label: "GVW", value: "" },
        { label: "Wheelbase", value: "" },
        { label: "Engine Brand / Model", value: "" },
        { label: "Power", value: "" },
        { label: "Max Torque", value: "" },
        { label: "Displacement", value: "" },
        { label: "Emission Standard", value: "" },
        { label: "Engine Guard", value: "" },
        { label: "Gearbox / Transmission", value: "" },
        { label: "Fuel Tank", value: "" },
        { label: "Tires", value: "" },
        { label: "Cargobox / Vessel", value: "" }
    ], []);



    useEffect(() => {
        if (!isOpen) {
            setError(null);
        } else if (!initialData || initialData.componen_product_id !== productId) {
            setError('Product data not available');
        } else {
            setError(null);
            
            // Initialize accessories from initialData
            const accessoriesSource = initialData.manage_quotation_item_accessories || initialData.accessories || [];
            const initializedAccessories = accessoriesSource.map((acc: any, index: number) => ({
                accessory_id: acc.id || acc.accessory_id || `acc_${index}`,
                accessory_part_name: acc.componen_product_name || acc.accessory_part_name || '',
                accessory_part_number: acc.code_unique || acc.accessory_part_number || '',
                accessory_brand: acc.brand || acc.accessory_brand || '',
                accessory_specification: acc.specification || acc.accessory_specification || '',
                quantity: acc.quantity || 1,
                description: acc.description || ''
            }));
            
            setAccessories(initializedAccessories);
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
        const updatedSpecs = [...(updatedData.componen_product_specifications || [])];
        
        while (updatedSpecs.length < defaultSpecifications.length) {
            const specIndex = updatedSpecs.length;
            updatedSpecs.push({
                componen_product_specification_label: defaultSpecifications[specIndex].label,
                componen_product_specification_value: defaultSpecifications[specIndex].value,
                componen_product_specification_description: null,
                specification_label_name: defaultSpecifications[specIndex].label,
                specification_value_name: defaultSpecifications[specIndex].value
            });
        }
        
        if (updatedSpecs[index]) {
            updatedSpecs[index] = {
                ...updatedSpecs[index],
                componen_product_specification_value: value,
                specification_value_name: value
            };
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

    const addAccessoryItem = useCallback(() => {
        if (!selectedAccessory) {
            const errorMessage = 'Please select an accessory';
            setAccessorySelectError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        const isDuplicate = accessories.some(item => 
            item.accessory_id === selectedAccessory.value
        );

        if (isDuplicate) {
            const errorMessage = 'This accessory is already added';
            setAccessorySelectError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        const newAccessory: QuotationAccessory = {
            accessory_id: selectedAccessory.value,
            accessory_part_name: selectedAccessory.accessory_part_name || selectedAccessory.label || '',
            accessory_part_number: selectedAccessory.accessory_part_number || '',
            accessory_brand: selectedAccessory.accessory_brand || '',
            accessory_specification: selectedAccessory.accessory_specification || '',
            quantity: 1,
            description: selectedAccessory.description || ''
        };

        const updatedAccessories = [...accessories, newAccessory];
        setAccessories(updatedAccessories);
        
        if (initialData && onChange) {
            onChange({
                ...initialData,
                manage_quotation_item_accessories: updatedAccessories,
                accessories: updatedAccessories
            });
        }
        
        setSelectedAccessory(null);
        setAccessorySelectError('');
        toast.success('Accessory added successfully');
    }, [selectedAccessory, accessories, initialData, onChange]);

    const removeAccessoryItem = useCallback((index: number) => {
        const updatedAccessories = accessories.filter((_, i) => i !== index);
        setAccessories(updatedAccessories);
        
        if (initialData && onChange) {
            onChange({
                ...initialData,
                manage_quotation_item_accessories: updatedAccessories,
                accessories: updatedAccessories
            });
        }
        
        toast.success('Accessory removed successfully');
    }, [accessories, initialData, onChange]);

    const accessoryColumns: TableColumn<QuotationAccessory>[] = React.useMemo(() => [
        {
            name: 'Accessory Name',
            selector: (row: QuotationAccessory) => row.accessory_part_name,
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">
                        {row.accessory_part_name}
                    </div>
                    <div className="block text-sm text-gray-500">{row.accessory_part_number}</div>
                    <div className="block text-sm text-gray-500">{row.accessory_brand ? ` - ${row.accessory_brand}` : ''}</div>
                </div>
            ),
            wrap: true,
        },
        // {
        //     name: 'Part Number',
        //     selector: (row: QuotationAccessory) => row.accessory_part_number || '-',
        // },
        // {
        //     name: 'Brand',
        //     selector: (row: QuotationAccessory) => row.accessory_brand || '-',
        // },
        // {
        //     name: 'Specification',
        //     selector: (row: QuotationAccessory) => row.accessory_specification || '-',
        // },
        {
            name: 'Quantity',
            selector: (row: QuotationAccessory) => row.quantity,
            width: '100px',
            center: true,
        },
        createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: (row: QuotationAccessory) => {
                    const index = accessories.findIndex(acc => acc.accessory_id === row.accessory_id);
                    if (index !== -1) {
                        removeAccessoryItem(index);
                    }
                },
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ]),
    ], [accessories, removeAccessoryItem]);

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
                            Tutup
                        </button>
                    </div>
                </div>
            );
        }

        if (!initialData || !initialData) {
            return (
                <div className="p-6 text-center text-gray-500">
                    <p>Data produk tidak ditemukan</p>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-6">

                {/* Product Image */}
                <div className="border-b border-gray-200 pb-6">
                    <div className='md:grid md:grid-cols-5 md:gap-4'>
                        <div className="flex md:col-span-2 justify-center">
                            {initialData.image ? (
                                <div className="relative cursor-pointer" onClick={() => setShowImageModal(true)}>
                                    <img
                                        src={initialData.image}
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
                                                <p className="text-sm">Klik untuk memperbesar</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-50 h-50 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">Tidak ada gambar</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='md:col-span-3 space-y-1'>
                                <p className="text-gray-700 text-sm">
                                    {initialData.code_unique || 'n/a'}
                                </p>
                                <p className="font-bold text-gray-900">
                                    {initialData.msi_model || 'n/a'}
                                </p>
                                <p className="text-gray-700 text-sm">
                                    {initialData.engine || 'n/a'} - {initialData.segment || 'n/a'}
                                </p>
                                
                                <p className="text-gray-700 text-sm">
                                    {initialData.segment || '-'}
                                </p>
                                {/* <p className="text-gray-700 text-sm">
                                    {initialData.product_type || 'n/a'}
                                </p> */}
                        </div>
                    </div>
                    
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('specifications')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'specifications'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Spesifikasi
                        </button>
                        <button
                            onClick={() => setActiveTab('accessories')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'accessories'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Accessories
                            {accessories.length > 0 && (
                                <span className="ml-1 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                                    {accessories.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'specifications' && (
                    <div className='product-spesification-information'>
                    {/* Product Basic Info */}
                    <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">Informasi Dasar</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className='md:col-span-3'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Produk
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.componen_product_name || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.componen_product_name || ''}
                                    onChange={(e) => handleFieldUpdate('componen_product_name', e.target.value)}
                                    placeholder="Masukkan nama produk"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kode Unique
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.code_unique || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.code_unique || ''}
                                    onChange={(e) => handleFieldUpdate('code_unique', e.target.value)}
                                    placeholder="Masukkan kode unique"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Segment
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.segment || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.segment || ''}
                                    onChange={(e) => handleFieldUpdate('segment', e.target.value)}
                                    placeholder="Masukkan segment"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    MSI Model
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.msi_model || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.msi_model || ''}
                                    onChange={(e) => handleFieldUpdate('msi_model', e.target.value)}
                                    placeholder="Masukkan MSI model"
                                    className="w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Wheel No
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.wheel_no || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.wheel_no || ''}
                                    onChange={(e) => handleFieldUpdate('wheel_no', e.target.value)}
                                    placeholder="Masukkan wheel no"
                                    className="w-full"
                                />
                            </div>
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Volume
                            </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.volume || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.volume || ''}
                                    onChange={(e) => handleFieldUpdate('volume', e.target.value)}
                                    placeholder="Masukkan volume"
                                    className="w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Horse Power
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                                    {initialData.horse_power || '-'}
                                </p>
                                <Input
                                    type="hidden"
                                    value={initialData.horse_power || ''}
                                    onChange={(e) => handleFieldUpdate('horse_power', e.target.value)}
                                    placeholder="Masukkan horse power"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Specifications */}
                    <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-lg font-semibold text-gray-900 my-4">Spesifikasi</h4>
                        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
                            {editableSpecifications.map((spec, index) => {
                                return (
                                <div key={index} className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 mb-2">
                                            {spec.componen_product_specification_label}
                                        </p>
                                        <Input
                                            type="text"
                                            value={spec.componen_product_specification_value || ''}
                                            onChange={(e) => handleSpecificationUpdate(index, e.target.value)}
                                            placeholder={`Masukkan ${spec.componen_product_specification_label.toLowerCase()}`}
                                            className="w-full text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                            )}
                        </div>
                    </div>

                    {/* Product Pricing Info */}
                    <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-lg font-semibold text-gray-900 my-4">Informasi Harga</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Harga Pasar
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
                                    placeholder="Masukkan harga pasar"
                                    className="w-full"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga Star 1
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
                                        placeholder="Harga star 1"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga Star 2
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
                                        placeholder="Harga star 2"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga Star 3
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
                                        placeholder="Harga star 3"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga Star 4
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
                                        placeholder="Harga star 4"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga Star 5
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
                                        placeholder="Harga star 5"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                )}

                {/* Accessories Tab */}
                {activeTab === 'accessories' && (
                    <div className='product-accessories-information'>
                        {/* Accessories Section */}
                        
                        <h4 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">Accessories</h4>
                        
                        {/* Add Accessory */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1">
                                <CustomAsyncSelect
                                    name="accessory_select"
                                    placeholder="Select accessory to add..."
                                    value={selectedAccessory}
                                    error={accessorySelectError}
                                    defaultOptions={accessoryOptions}
                                    loadOptions={handleAccessoryInputChange}
                                    onMenuScrollToBottom={handleAccessoryMenuScrollToBottom}
                                    isLoading={accessoryPagination.loading}
                                    noOptionsMessage={() => "No accessories found"}
                                    loadingMessage={() => "Loading accessories..."}
                                    isSearchable={true}
                                    inputValue={accessoryInputValue}
                                    onInputChange={(inputValue) => {
                                        handleAccessoryInputChange(inputValue);
                                    }}
                                    onChange={(option: any) => {
                                        if (option) {
                                            const completeOption = accessoryOptions.find(a => a.value === option.value);
                                            setSelectedAccessory(completeOption || option);
                                        } else {
                                            setSelectedAccessory(null);
                                        }
                                        if (option && accessorySelectError) {
                                            setAccessorySelectError('');
                                        }
                                    }}
                                />
                                {accessorySelectError && (
                                    <span className="text-sm text-red-500 mt-1 block">{accessorySelectError}</span>
                                )}
                            </div>
                            <Button 
                                type="button" 
                                onClick={addAccessoryItem} 
                                className="flex items-center gap-2"
                                disabled={!selectedAccessory}
                            >
                                <MdAdd size={16} />
                                Add Accessory
                            </Button>
                        </div>

                        {/* Accessories Table */}
                        {accessories.length > 0 && (
                            <div className="mt-6">
                                <CustomDataTable
                                    columns={accessoryColumns}
                                    data={accessories}
                                    pagination={false}
                                    fixedHeader={false}
                                    responsive
                                    striped={false}
                                    highlightOnHover
                                    noDataComponent={
                                        <div className="text-center py-8 text-gray-500">
                                            No accessories added yet
                                        </div>
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {renderProductInfo()}
            
            {/* Image Modal */}
            {showImageModal && initialData?.image && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black-900 backdrop-blur-sm"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] p-4 overflow-hidden">
                        <img
                            src={initialData.image}
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
