import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-hot-toast";

import { useProductEdit } from "./hooks/useProductEdit";
import { ItemProductValidationErrors } from "./types/product";
import { handleKeyPress, formatNumberInput } from "@/helpers/generalHelper";

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
}

export default function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    // Hook for product operations
    const { 
        isLoading,
        isUpdating,
        productData,
        validationErrors, 
        loadProduct,
        clearFieldError,
        updateProduct 
    } = useProductEdit();
    
    // State for form data
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
        componen_product_unit_model: ''
    });

    // Load product data when component mounts
    useEffect(() => {
        if (id) {
            loadProductData(id);
        }
    }, [id, loadProduct]);

    const loadProductData = async (productId: string) => {
        try {
            const product = await loadProduct(productId);
            
            if (product) {
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
                    componen_product_unit_model: product.componen_product_unit_model || ''
                });
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

        // Clear validation error when user starts typing
        if (validationErrors[field as keyof ItemProductValidationErrors]) {
            clearFieldError(field as keyof ItemProductValidationErrors);
        }
    };

    // Handle number input changes with formatting
    const handleNumberInputChange = (field: keyof EditProductFormData, value: string) => {
        const formattedValue = formatNumberInput(value);
        handleInputChange(field, formattedValue);
    };

    // Validate form data
    const validateForm = (): boolean => {
        const errors: Partial<ItemProductValidationErrors> = {};

        if (!formData.code_unique.trim()) {
            errors.code_unique = 'Kode produk wajib diisi';
        }

        if (!formData.segment.trim()) {
            errors.segment = 'Segment wajib diisi';
        }

        if (!formData.msi_model.trim()) {
            errors.msi_model = 'MSI Model wajib diisi';
        }

        if (!formData.market_price.trim()) {
            errors.market_price = 'Harga pasar wajib diisi';
        }

        if (!formData.selling_price_star_1.trim()) {
            errors.selling_price_star_1 = 'Harga Star 1 wajib diisi';
        }

        if (Object.keys(errors).length > 0) {
            // Handle validation errors if needed
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm() || !id) {
            return;
        }

        try {
            // Prepare data for API (remove formatting from number fields)
            const submitData = {
                ...formData,
                market_price: formData.market_price.replace(/\./g, ''),
                selling_price_star_1: formData.selling_price_star_1.replace(/\./g, ''),
                selling_price_star_2: formData.selling_price_star_2.replace(/\./g, ''),
                selling_price_star_3: formData.selling_price_star_3.replace(/\./g, ''),
                selling_price_star_4: formData.selling_price_star_4.replace(/\./g, ''),
                selling_price_star_5: formData.selling_price_star_5.replace(/\./g, ''),
            };

            const success = await updateProduct(id, submitData);
            
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

    return (
        <>
            <PageMeta 
                title="Edit Produk - MSI" 
                description="Edit data produk dalam sistem MSI"
                image=""
            />
            
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                            className="hover:bg-gray-100"
                        >
                            <MdKeyboardArrowLeft className="text-xl" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Edit Produk
                            </h1>
                            <p className="text-sm text-gray-600">
                                Ubah informasi produk: {formData.code_unique}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                                    onKeyPress={handleKeyPress}
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
                                <Label htmlFor="segment">
                                    Segment <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="segment"
                                    name="segment"
                                    type="text"
                                    value={formData.segment}
                                    onChange={(e) => handleInputChange('segment', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    error={!!validationErrors.segment}
                                    placeholder="Masukkan segment"
                                />
                                {validationErrors.segment && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {validationErrors.segment}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="msi_model">
                                    MSI Model <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="msi_model"
                                    name="msi_model"
                                    type="text"
                                    value={formData.msi_model}
                                    onChange={(e) => handleInputChange('msi_model', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    error={!!validationErrors.msi_model}
                                    placeholder="Masukkan MSI model"
                                />
                                {validationErrors.msi_model && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {validationErrors.msi_model}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="wheel_no">Wheel No</Label>
                                <Input
                                    id="wheel_no"
                                    name="wheel_no"
                                    type="text"
                                    value={formData.wheel_no}
                                    onChange={(e) => handleInputChange('wheel_no', e.target.value)}
                                    onKeyPress={handleKeyPress}
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
                                    onKeyPress={handleKeyPress}
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
                                    onKeyPress={handleKeyPress}
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
                                    onKeyPress={handleKeyPress}
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
                                    onKeyPress={handleKeyPress}
                                    placeholder="Masukkan unit model"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                                    Harga Star 1 <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="selling_price_star_1"
                                    name="selling_price_star_1"
                                    type="text"
                                    value={formData.selling_price_star_1}
                                    onChange={(e) => handleNumberInputChange('selling_price_star_1', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    error={!!validationErrors.selling_price_star_1}
                                    placeholder="0"
                                />
                                {validationErrors.selling_price_star_1 && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {validationErrors.selling_price_star_1}
                                    </p>
                                )}
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

                    {/* Description Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Deskripsi Produk
                        </h2>
                        
                        <div>
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

                    {/* Specifications Section */}
                    {productData?.componen_product_specifications && productData.componen_product_specifications.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Spesifikasi Produk
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {productData.componen_product_specifications.map((spec) => (
                                    <div 
                                        key={spec.componen_product_specification_id} 
                                        className="p-4 bg-gray-50 rounded-lg border"
                                    >
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Label:</span>
                                                <p className="text-gray-900 font-medium">
                                                    {spec.specification_label_name}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Value:</span>
                                                <p className="text-gray-900">
                                                    {spec.specification_value_name}
                                                </p>
                                            </div>
                                            {spec.componen_product_specification_description && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Deskripsi:</span>
                                                    <p className="text-gray-600 text-sm">
                                                        {spec.componen_product_specification_description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {productData.componen_product_specifications.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Tidak ada spesifikasi produk yang tersedia</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={isUpdating}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="min-w-[120px]"
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
                    </div>
                </form>
            </div>
        </>
    );
}