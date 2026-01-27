import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FileUpload from "@/components/ui/FileUpload/FileUpload";
import { MdEdit, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-hot-toast";

import { useProductEdit } from "./hooks/useProductEdit";
import { ItemProductValidationErrors, ProductSpecification } from "./types/product";
import { handleKeyPress, formatNumberInput } from "@/helpers/generalHelper";
import CustomSelect from "@/components/form/select/CustomSelect";
import { PermissionGate } from "@/components/common/PermissionComponents";

// Form data type for editing
interface EditProductFormData {
    code_unique: string;
    segment: string;
    msi_model: string;
    wheel_no: string;
    engine: string;
    product_type: string;
    horse_power: string;
    market_price: string;
    selling_price_star_1: string;
    selling_price_star_2: string;
    selling_price_star_3: string;
    selling_price_star_4: string;
    selling_price_star_5: string;
    componen_product_description: string;
    componen_type: number;
    volume: string;
    componen_product_unit_model: string;
    msi_product: string;
    componen_product_specifications: ProductSpecification[];
}

export default function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const { 
        isLoading,
        isUpdating,
        productData,
        validationErrors, 
        loadProduct,
        clearFieldError,
        updateProduct 
    } = useProductEdit();
    
    const [formData, setFormData] = useState<EditProductFormData>({
        code_unique: '',
        segment: '',
        msi_model: '',
        wheel_no: '',
        engine: '',
        product_type: '',
        horse_power: '',
        market_price: '',
        selling_price_star_1: '',
        selling_price_star_2: '',
        selling_price_star_3: '',
        selling_price_star_4: '',
        selling_price_star_5: '',
        componen_product_description: '',
        componen_type: 1,
        volume: '',
        componen_product_unit_model: '',
        msi_product: '',
        componen_product_specifications: [
            {
                componen_product_specification_label: 'GVW',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'GVW',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Unit Model',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Unit Model',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Horse Power',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Horse Power',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Cargobox/Vessel',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Cargobox/Vessel',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Wheelbase',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Wheelbase',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Engine Brand Model',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Engine Brand Model',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Max Torque',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Max Torque',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Displacement',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Displacement',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Emission Standard',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Emission Standard',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Engine Guard',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Engine Guard',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Gearbox Transmission',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Gearbox Transmission',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Fuel Tank',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Fuel Tank',
                specification_value_name: ''
            },
            {
                componen_product_specification_label: 'Tyre',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'Tyre',
                specification_value_name: ''
            }
        ],
    });
    
    const [specifications, setSpecifications] = useState<any[]>([]);
    const [productImage, setProductImage] = useState<File[]>([]);
    const [existingImageUrl, setExistingImageUrl] = useState<any[] | null>(null);
    const [originalImages, setOriginalImages] = useState<any[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            loadProductData(id);
        }
    }, [id]); 

    const loadProductData = async (productId: string) => {
        try {
            const product = await loadProduct(productId);
            
            if (product) {
                // Define default specifications template
                const defaultSpecifications = [
                    {
                        componen_product_specification_label: 'GVW',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'GVW',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Unit Model',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Unit Model',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Horse Power',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Horse Power',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Cargobox/Vessel',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Cargobox/Vessel',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Wheelbase',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Wheelbase',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Engine Brand Model',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Engine Brand Model',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Max Torque',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Max Torque',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Displacement',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Displacement',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Emission Standard',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Emission Standard',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Engine Guard',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Engine Guard',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Gearbox Transmission',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Gearbox Transmission',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Fuel Tank',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Fuel Tank',
                        specification_value_name: ''
                    },
                    {
                        componen_product_specification_label: 'Tyre',
                        componen_product_specification_value: '',
                        componen_product_specification_description: '',
                        specification_label_name: 'Tyre',
                        specification_value_name: ''
                    }
                ];

                // Merge API data with default template
                const specificationsData = defaultSpecifications.map(defaultSpec => {
                    // Find matching specification from API response
                    const apiSpec = product.componen_product_specifications?.find(spec => 
                        spec.specification_label_name === defaultSpec.specification_label_name ||
                        spec.componen_product_specification_label === defaultSpec.componen_product_specification_label
                    );

                    // If found in API, use API data, otherwise use default template
                    return apiSpec ? {
                        ...defaultSpec,
                        ...apiSpec
                    } : defaultSpec;
                });

                // Map product data to form data
                setFormData({
                    code_unique: product.code_unique || '',
                    segment: product.segment || '',
                    msi_model: product.msi_model || '',
                    wheel_no: product.wheel_no || '',
                    engine: product.engine || '',
                    horse_power: product.horse_power || '',
                    product_type: product.product_type || '',
                    market_price: product.market_price ? formatNumberInput(product.market_price.toString()) : '',
                    selling_price_star_1: product.selling_price_star_1 ? formatNumberInput(product.selling_price_star_1.toString()) : '',
                    selling_price_star_2: product.selling_price_star_2 ? formatNumberInput(product.selling_price_star_2.toString()) : '',
                    selling_price_star_3: product.selling_price_star_3 ? formatNumberInput(product.selling_price_star_3.toString()) : '',
                    selling_price_star_4: product.selling_price_star_4 ? formatNumberInput(product.selling_price_star_4.toString()) : '',
                    selling_price_star_5: product.selling_price_star_5 ? formatNumberInput(product.selling_price_star_5.toString()) : '',
                    componen_product_description: product.componen_product_description || '',
                    componen_type: product.componen_type || 1,
                    volume: product.volume || '',
                    componen_product_unit_model: product.componen_product_unit_model || '',
                    msi_product: product.msi_product || '',
                    componen_product_specifications: specificationsData,
                });
                
                // Set specifications state with the merged data
                setSpecifications(specificationsData);
                
                // Load existing image URL if available
                if (product.images && product.images.length > 0) {
                    const imageUrls = product.images.map((img: any) => img.image_url);
                    setExistingImageUrl(imageUrls);
                    setOriginalImages(product.images); // Store original images with image_id
                }
            } else {
                toast.error('Gagal memuat data produk');
                navigate('/quotations/products');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            toast.error('Gagal memuat data produk');
            navigate('/quotations/products');
        }
    };

    // Handle input changes
    const handleInputChange = (field: keyof EditProductFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (validationErrors[field as keyof ItemProductValidationErrors]) {
            clearFieldError(field as keyof ItemProductValidationErrors);
        }
    };

    const handleNumberInputChange = (field: keyof EditProductFormData, value: string) => {
        const formattedValue = formatNumberInput(value);
        handleInputChange(field, formattedValue);
    };

    // Handle product image change
    const handleImageChange = (files: File | File[] | null) => {
        if (files === null) {
            setProductImage([]);
            return;
        }
        
        // Handle both single file and multiple files
        const fileArray = Array.isArray(files) ? files : [files];
        setProductImage(fileArray);
        
        // Remove existing image URL when new files are uploaded
        if (fileArray.length > 0) {
            setExistingImageUrl(null);
        }
    };

    // Handle removing existing image by index
    const handleRemoveExistingImage = (index?: number) => {
        if (typeof index === 'number' && Array.isArray(existingImageUrl)) {
            // Track the deleted image ID
            if (originalImages[index] && originalImages[index].image_id) {
                setDeletedImageIds(prev => [...prev, originalImages[index].image_id]);
            }
            
            const newExistingImages = existingImageUrl.filter((_, i) => i !== index);
            setExistingImageUrl(newExistingImages.length > 0 ? newExistingImages : null);
        } else {
            // Track all deleted image IDs when removing all
            if (originalImages.length > 0) {
                const allImageIds = originalImages.map(img => img.image_id).filter(Boolean);
                setDeletedImageIds(prev => [...prev, ...allImageIds]);
            }
            setExistingImageUrl(null);
        }
    };

    // Validate form data
    const validateForm = (): boolean => {
        const errors: Partial<ItemProductValidationErrors> = {};

        if (!formData.code_unique.trim()) {
            errors.code_unique = 'Kode produk wajib diisi';
        }

        if (!formData.market_price.trim()) {
            errors.market_price = 'Harga pasar wajib diisi';
        }

        if (Object.keys(errors).length > 0) {
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        
        if (!validateForm() || !id) {
            return;
        }

        try {
            // Create FormData for multipart/form-data
            const formDataToSend = new FormData();
            
            // Prepare data based on product_type
            let specificationsData = specifications.length > 0 ? specifications : formData.componen_product_specifications;;
            let segmentValue = formData.segment;
            let msiModelValue = formData.msi_model;
            let msiProductValue = formData.msi_product;
            let componentTypeValue = formData.componen_type;
            let wheelNoValue = formData.wheel_no;
            let engineValue = formData.engine;
            let horsePowerValue = formData.horse_power;
            let volumeValue = formData.volume;
            let unitModelValue = formData.componen_product_unit_model;

            if (formData.product_type !== 'unit') {
                // For non_unit type, clear unit-specific fields
                segmentValue = '';
                msiModelValue = '';
                msiProductValue = '';
                componentTypeValue = 1;
                wheelNoValue = '';
                engineValue = '';
                horsePowerValue = '';
                volumeValue = '';
                unitModelValue = '';
                
                const currentSpecs = specifications.length > 0 ? specifications : formData.componen_product_specifications;
                specificationsData = currentSpecs.map(spec => ({
                    ...spec,
                    componen_product_specification_value: '',
                    specification_value_name: ''
                }));
            }
            
            // Append all form fields
            formDataToSend.append('code_unique', formData.code_unique);
            formDataToSend.append('product_type', formData.product_type);
            formDataToSend.append('componen_product_description', formData.componen_product_description);
            formDataToSend.append('segment', segmentValue);
            formDataToSend.append('msi_model', msiModelValue);
            formDataToSend.append('msi_product', msiProductValue);
            formDataToSend.append('componen_type', componentTypeValue.toString());
            formDataToSend.append('wheel_no', wheelNoValue);
            formDataToSend.append('engine', engineValue);
            formDataToSend.append('horse_power', horsePowerValue);
            formDataToSend.append('volume', volumeValue);
            formDataToSend.append('market_price', formData.market_price.replace(/\./g, ''));
            formDataToSend.append('componen_product_unit_model', unitModelValue);
            formDataToSend.append('selling_price_star_1', formData.selling_price_star_1.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_2', formData.selling_price_star_2.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_3', formData.selling_price_star_3.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_4', formData.selling_price_star_4.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_5', formData.selling_price_star_5.replace(/\./g, ''));
            formDataToSend.append('componen_product_specifications', JSON.stringify(specificationsData));
            
            // Add deleted images information if any
            if (deletedImageIds.length > 0) {
                const deletedImagesData = deletedImageIds.map(imageId => {
                    const originalImage = originalImages.find(img => img.image_id === imageId);
                    return {
                        image_id: imageId,
                        image_url: originalImage?.image_url || '',
                        image_id_to_delete: imageId
                    };
                });
                formDataToSend.append('images', JSON.stringify(deletedImagesData));
            }

            // Append image files if new files are uploaded
            if (productImage && productImage.length > 0) {
                if (productImage.length === 1) {
                    formDataToSend.append('images[0]', productImage[0]);
                } else {
                    productImage.forEach((file, index) => {
                        formDataToSend.append(`images[${index}]`, file);
                    });
                    formDataToSend.append('image_count', productImage.length.toString());
                }
            }
            
            const success = await updateProduct(id, formDataToSend);
            
            if (success) {
                toast.success('Produk berhasil diperbarui');
                navigate('/quotations/products');
            }
        } catch (error) {
            // Error handling sudah dihandle di hook
            toast.error('Gagal memperbarui produk');
        }
    };

    // Handle back navigation
    const handleBack = () => {
        navigate('/quotations/products');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data produk...</p>
                </div>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-gray-600">Data produk tidak ditemukan</p>
                    <Button 
                        variant="outline" 
                        onClick={handleBack}
                        className="mt-4"
                    >
                        Kembali
                    </Button>
                </div>
            </div>
        );
    }

    const companyOptions = [
        { value: 1, label: 'OFF ROAD REGULAR' },
        { value: 2, label: 'ON ROAD REGULAR' },
        { value: 3, label: 'OFF ROAD IRREGULAR' },
    ];

    const productOptions = [
        { value: 'unit', label: 'Unit' },
        { value: 'non_unit', label: 'Non Unit' }
    ];

    return (
        <>
            <PageMeta 
                title="Edit Produk | MSI" 
                description="Edit data produk dalam sistem MSI"
                image=""
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    
                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBack}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Produk</h1>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => e.preventDefault()} className=" space-y-6">

                        {/* Basic Information Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">
                                Informasi Dasar
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="code_unique">
                                        Kode Produk <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="code_unique"
                                        name="code_unique"
                                        type="text"
                                        value={formData.code_unique}
                                        onChange={(e) => handleInputChange('code_unique', e.target.value)}
                                        error={!!validationErrors.code_unique}
                                        placeholder="Masukkan kode produk"
                                    />
                                    {validationErrors.code_unique && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {validationErrors.code_unique}
                                        </p>
                                    )}
                                </div>
                            
                                <div>
                                    <Label htmlFor="product_type">Product Type</Label>
                                    <CustomSelect
                                        options={productOptions}
                                        value={productOptions.find(option => option.value === formData.product_type) || null}
                                        onChange={(option) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                product_type: option?.value || 'unit'
                                            }));
                                        }}
                                        placeholder="Select Company"
                                        isClearable={false}
                                        isSearchable={true}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="componen_product_description">Deskripsi</Label>
                                    <textarea
                                        id="componen_product_description"
                                        name="componen_product_description"
                                        rows={4}
                                        value={formData.componen_product_description}
                                        onChange={(e) => handleInputChange('componen_product_description', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                        placeholder="Masukkan deskripsi produk..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">
                                Informasi Harga
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="market_price">
                                        Harga Pasar <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="market_price"
                                        name="market_price"
                                        type="text"
                                        value={formData.market_price}
                                        onChange={(e) => handleNumberInputChange('market_price', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        error={!!validationErrors.market_price}
                                        placeholder="0"
                                    />
                                    {validationErrors.market_price && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {validationErrors.market_price}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="selling_price_star_1">
                                        Harga Star 1
                                    </Label>
                                    <Input
                                        id="selling_price_star_1"
                                        name="selling_price_star_1"
                                        type="text"
                                        value={formData.selling_price_star_1}
                                        onChange={(e) => handleNumberInputChange('selling_price_star_1', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="selling_price_star_2">Harga Star 2</Label>
                                    <Input
                                        id="selling_price_star_2"
                                        name="selling_price_star_2"
                                        type="text"
                                        value={formData.selling_price_star_2}
                                        onChange={(e) => handleNumberInputChange('selling_price_star_2', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="selling_price_star_3">Harga Star 3</Label>
                                    <Input
                                        id="selling_price_star_3"
                                        name="selling_price_star_3"
                                        type="text"
                                        value={formData.selling_price_star_3}
                                        onChange={(e) => handleNumberInputChange('selling_price_star_3', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="selling_price_star_4">Harga Star 4</Label>
                                    <Input
                                        id="selling_price_star_4"
                                        name="selling_price_star_4"
                                        type="text"
                                        value={formData.selling_price_star_4}
                                        onChange={(e) => handleNumberInputChange('selling_price_star_4', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="selling_price_star_5">Harga Star 5</Label>
                                    <Input
                                        id="selling_price_star_5"
                                        name="selling_price_star_5"
                                        type="text"
                                        value={formData.selling_price_star_5}
                                        onChange={(e) => handleNumberInputChange('selling_price_star_5', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        
                    {formData.product_type === 'unit' && <>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">
                                Spesifikasi Unit 
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="segment">
                                        Segment
                                    </Label>
                                    <Input
                                        id="segment"
                                        name="segment"
                                        type="text"
                                        value={formData.segment}
                                        onChange={(e) => handleInputChange('segment', e.target.value)}
                                        placeholder="Masukkan segment"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="msi_model">
                                        Model
                                    </Label>
                                    <Input
                                        id="msi_model"
                                        name="msi_model"
                                        type="text"
                                        value={formData.msi_model}
                                        onChange={(e) => handleInputChange('msi_model', e.target.value)}
                                        error={!!validationErrors.msi_model}
                                        placeholder="Masukkan MSI model"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="msi_product">
                                        Product
                                    </Label>
                                    <Input
                                        id="msi_product"
                                        name="msi_product"
                                        type="text"
                                        value={formData.msi_product}
                                        onChange={(e) => handleInputChange('msi_product', e.target.value)}
                                        error={!!validationErrors.msi_product}
                                        placeholder="Masukkan MSI model"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="componen_type">Product Type</Label>
                                    <CustomSelect
                                        options={companyOptions}
                                        value={companyOptions.find(option => option.value === formData.componen_type) || null}
                                        onChange={(option) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                componen_type: Number(option?.value) || 1
                                            }));
                                        }}
                                        placeholder="Select Company"
                                        isClearable={false}
                                        isSearchable={true}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="wheel_no">Wheel No</Label>
                                    <Input
                                        id="wheel_no"
                                        name="wheel_no"
                                        type="text"
                                        value={formData.wheel_no}
                                        onChange={(e) => handleInputChange('wheel_no', e.target.value)}
                                        placeholder="Masukkan wheel number"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="engine">Engine</Label>
                                    <Input
                                        id="engine"
                                        name="engine"
                                        type="text"
                                        value={formData.engine}
                                        onChange={(e) => handleInputChange('engine', e.target.value)}
                                        placeholder="Masukkan engine"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="horse_power">Horse Power</Label>
                                    <Input
                                        id="horse_power"
                                        name="horse_power"
                                        type="text"
                                        value={formData.horse_power}
                                        onChange={(e) => handleInputChange('horse_power', e.target.value)}
                                        placeholder="Masukkan horse power"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="volume">Volume</Label>
                                    <Input
                                        id="volume"
                                        name="volume"
                                        type="text"
                                        value={formData.volume}
                                        onChange={(e) => handleInputChange('volume', e.target.value)}
                                        placeholder="Masukkan volume"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="componen_product_unit_model">Unit Model</Label>
                                    <Input
                                        id="componen_product_unit_model"
                                        name="componen_product_unit_model"
                                        type="text"
                                        value={formData.componen_product_unit_model}
                                        onChange={(e) => handleInputChange('componen_product_unit_model', e.target.value)}
                                        placeholder="Masukkan unit model"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">
                                Spesifikasi Produk 
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {specifications.map((spec, index) => (
                                    <div key={`${spec.specification_label_name}-${index}`}>
                                        <Label htmlFor={`spec_${index}`}>
                                            {spec.specification_label_name || spec.componen_product_specification_label}
                                        </Label>
                                        <Input
                                            id={`spec_${index}`}
                                            type="text"
                                            value={spec.specification_value_name || spec.componen_product_specification_value || ''}
                                            onChange={(e) => {
                                                const newSpecs = [...specifications];
                                                newSpecs[index] = {
                                                    ...newSpecs[index],
                                                    specification_value_name: e.target.value,
                                                    componen_product_specification_value: e.target.value
                                                };
                                                setSpecifications(newSpecs);
                                            }}
                                            placeholder="Masukkan nilai spesifikasi"
                                        />
                                        {spec.componen_product_specification_description && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                {spec.componen_product_specification_description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>}

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <FileUpload
                                id="product_image"
                                name="product_image"
                                label="Foto Produk"
                                accept="image/jpeg,image/jpg,image/png"
                                icon="image"
                                acceptedFormats={['jpg', 'jpeg', 'png']}
                                maxSize={5}
                                multiple={true}
                                currentFiles={productImage}
                                existingImageUrl={existingImageUrl}
                                onFileChange={handleImageChange}
                                onRemoveExistingImage={handleRemoveExistingImage}
                                validationError={validationErrors.image}
                                disabled={isUpdating}
                                description="Format: JPG, JPEG, PNG - Maksimal 5MB"
                                showPreview={true}
                                previewSize="lg"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={isUpdating}
                                className="px-6 rounded-full"
                            >
                                Batal
                            </Button>
                            
                            <PermissionGate permission={["create", "update"]}>
                                <Button
                                    disabled={isUpdating}
                                    type="submit"
                                    onClick={() => {
                                        const tipu = { preventDefault: () => {} } as React.FormEvent;
                                        handleSubmit(tipu);
                                    }}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    {isUpdating ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Menyimpan...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <MdSave className="mr-2" />
                                            Simpan
                                        </div>
                                    )}
                                </Button>
                            </PermissionGate>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}