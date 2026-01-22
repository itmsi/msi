import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FileUpload from "@/components/ui/FileUpload/FileUpload";
import { MdAdd, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { handleKeyPress } from "@/helpers/generalHelper";
import CustomSelect from "@/components/form/select/CustomSelect";
import { useCreateProduct } from "./hooks/useProductCreate";

export default function CreateProduct() {
    const {
        isCreating,
        formData,
        validationErrors,
        handleInputChange,
        handleNumberInputChange,
        handleImageChange,
        productImage,
        handleSubmit,
        handleBack,
        companyOptions,
        productOptions,
        setFormData
    } = useCreateProduct();

    return (
        <>
            <PageMeta 
                title="Tambah Produk | MSI" 
                description="Tambah data produk baru dalam sistem MSI"
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
                            <MdAdd size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Tambah Produk</h1>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className=" space-y-6">

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
                                        value={productOptions.find(option => option.value === (formData.product_type || 'unit')) || productOptions.find(option => option.value === 'unit') || null}
                                        onChange={(option) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                product_type: option?.value || 'unit'
                                            }));
                                        }}
                                        placeholder="Select Product Type"
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

                        {/* Description Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">
                                Spesifikasi {formData.product_type === 'unit' ? 'Unit' : 'Product'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.product_type === 'unit' ? (
                                    <>
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
                                                MSI Model 
                                            </Label>
                                            <Input
                                                id="msi_model"
                                                name="msi_model"
                                                type="text"
                                                value={formData.msi_model}
                                                onChange={(e) => handleInputChange('msi_model', e.target.value)}
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
                                                placeholder="Masukkan MSI model"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="componen_type">Component Type</Label>
                                            <CustomSelect
                                                options={companyOptions}
                                                value={companyOptions.find(option => option.value === formData.componen_type) || null}
                                                onChange={(option) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        componen_type: Number(option?.value) || 1
                                                    }));
                                                }}
                                                placeholder="Select Product Type"
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
                                    </>
                                ) : 
                                    <>
                                        {formData.componen_product_specifications.map((spec, index) => (
                                            <div key={`${spec.specification_label_name}-${index}`}>
                                                <Label htmlFor={`spec_${index}`}>
                                                    {spec.specification_label_name || spec.componen_product_specification_label}
                                                </Label>
                                                <Input
                                                    id={`spec_${index}`}
                                                    type="text"
                                                    value={spec.specification_value_name || spec.componen_product_specification_value || ''}
                                                    onChange={(e) => {
                                                        const newSpecs = [...formData.componen_product_specifications];
                                                        newSpecs[index] = {
                                                            ...newSpecs[index],
                                                            specification_value_name: e.target.value,
                                                            componen_product_specification_value: e.target.value
                                                        };
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            componen_product_specifications: newSpecs
                                                        }));
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
                                    </>
                                }
                            </div>
                            
                        </div>


                        {/* Image Upload Section */}
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
                                onFileChange={handleImageChange}
                                validationError={validationErrors.image}
                                disabled={isCreating}
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
                                disabled={isCreating}
                                className="px-6 rounded-full"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="px-6 flex items-center gap-2 rounded-full"
                            >
                                {isCreating ? (
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
            </div>
        </>
    );
}
