import { useState } from "react";
import toast from "react-hot-toast";
import { ItemProductValidationErrors, ProductSpecification } from "../types/product";
import { useNavigate } from "react-router";
import { getCompanyName, formatNumberInput } from "@/helpers/generalHelper";
import { ItemProductService } from "../services/productService";

const makeSpec = (label: string): ProductSpecification => ({
    componen_product_specification_label: label,
    componen_product_specification_value: '',
    componen_product_specification_description: '',
    specification_label_name: label,
    specification_value_name: ''
});

export const REGULAR_SPECS: ProductSpecification[] = [
    'GVW', 'Unit Model', 'Horse Power', 'Cargobox/Vessel', 'Wheelbase',
    'Engine Brand Model', 'Max Torque', 'Displacement', 'Emission Standard',
    'Engine Guard', 'Gearbox Transmission', 'Fuel Tank', 'Tyre'
].map(makeSpec);

export const EV_SPECS: ProductSpecification[] = [
    'Overall Length', 'Wheelbase', 'Curb Weight',
    'Gross Vehicle Weight (GVW)', 'Rated Power / Torque', 'Peak Power / Torque',
    'Battery Capacity', 'Battery Protection', 'Charging Ports',
    'Input Socket Power', 'Frame', 'Rear Axles',
    'Tires', 'Structure Thickness', 'Cargo Box Size'
].map(makeSpec);

export const EV_COMPONENT_TYPES = [4, 5];

export const getDefaultSpecs = (componentType: number): ProductSpecification[] =>
    EV_COMPONENT_TYPES.includes(componentType) ? EV_SPECS.map(s => ({ ...s })) : REGULAR_SPECS.map(s => ({ ...s }));

// Form data type for creating
interface CreateProductFormData {
    code_unique: string;
    segment: string;
    msi_model: string;
    msi_product: string;
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
    company_name: string;
    componen_product_specifications: ProductSpecification[];
}

export const useCreateProduct = () => {
    const navigate = useNavigate();
    
    const [isCreating, setIsCreating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ItemProductValidationErrors>({});
    const [productImage, setProductImage] = useState<File[]>([]);
    
    const [formData, setFormData] = useState<CreateProductFormData>({
        code_unique: '',
        segment: '',
        msi_model: '',
        msi_product: '',
        wheel_no: '',
        engine: '',
        product_type: 'unit',
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
        company_name: getCompanyName(),
        componen_product_specifications: REGULAR_SPECS.map(s => ({ ...s })),
    });
    

    // Handle input changes
    const handleInputChange = (field: keyof CreateProductFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (validationErrors[field as keyof ItemProductValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleNumberInputChange = (field: keyof CreateProductFormData, value: string) => {
        const formattedValue = formatNumberInput(value);
        handleInputChange(field, formattedValue);
    };

    // Handle product image change
    const handleImageChange = (files: File | File[] | null) => {
        if (files === null) {
            setProductImage([]);
            return;
        }
        
        const fileArray = Array.isArray(files) ? files : [files];
        
        const uniqueFiles = fileArray.filter((file, index, self) => {
            const isDuplicate = self.slice(0, index).some(existingFile => 
                existingFile === file || // Same reference
                (existingFile.name === file.name && 
                 existingFile.size === file.size && 
                 existingFile.lastModified === file.lastModified &&
                 existingFile.type === file.type)
            );
            
            return !isDuplicate;
        });
        
        setProductImage(uniqueFiles);
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
        window.scrollTo(0, 0);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsCreating(true);

        try {
            const formDataToSend = new FormData();
            
            let specificationsData = formData.componen_product_specifications;
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
                specificationsData = formData.componen_product_specifications.map(spec => ({
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
            formDataToSend.append('company_name', formData.company_name);
            formDataToSend.append('componen_product_specifications', JSON.stringify(specificationsData));

            // Append image files if uploaded
            if (productImage && productImage.length > 0) {
                productImage.forEach((file, index) => {
                    formDataToSend.append(`images[${index}]`, file);
                });
                
                formDataToSend.append('images_count', productImage.length.toString());
            }

            const response = await ItemProductService.createItemProduct(formDataToSend);
            if (response.status) {
                toast.success('Produk berhasil dibuat');
                navigate('/quotations/products');
            } else {
                toast.success(response.message || 'Produk tidak berhasil dibuat');
            }
        } catch (error: any) {
            if (error.errors && typeof error.errors === 'object') {
                setValidationErrors(error.errors);
            }
            console.error('Error creating product:', error);
            toast.error('Gagal membuat produk');
        } finally {
            setIsCreating(false);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        navigate('/quotations/products');
    };

    const companyOptions = [
        { value: 1, label: 'OFF ROAD REGULAR' },
        { value: 2, label: 'ON ROAD REGULAR' },
        { value: 3, label: 'OFF ROAD IRREGULAR' },
        { value: 4, label: 'OFF ROAD EV' },
        { value: 5, label: 'ON ROAD EV' },
    ];

    const productOptions = [
        { value: 'unit', label: 'Unit' },
        { value: 'non_unit', label: 'Non Unit' }
    ];

    return {
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
    };
};