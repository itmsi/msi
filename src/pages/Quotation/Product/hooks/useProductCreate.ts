import { useState } from "react";
import toast from "react-hot-toast";
import { ItemProductValidationErrors, ProductSpecification } from "../types/product";
import { useNavigate } from "react-router";
import { formatNumberInput } from "@/helpers/generalHelper";
import { ItemProductService } from "../services/productService";

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
    componen_product_specifications: ProductSpecification[];
}

export const useCreateProduct = () => {
    const navigate = useNavigate();
    
    const [isCreating, setIsCreating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ItemProductValidationErrors>({});
    const [productImage, setProductImage] = useState<File | null>(null);
    
    const [formData, setFormData] = useState<CreateProductFormData>({
        code_unique: '',
        segment: '',
        msi_model: '',
        msi_product: '',
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
        componen_product_specifications: [
            {
                componen_product_specification_label: 'GWM',
                componen_product_specification_value: '',
                componen_product_specification_description: '',
                specification_label_name: 'GWM',
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
    const handleImageChange = (file: File | null) => {
        setProductImage(file);
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

        if (!formData.msi_product.trim()) {
            errors.msi_product = 'Product wajib diisi';
        }

        if (!formData.market_price.trim()) {
            errors.market_price = 'Harga pasar wajib diisi';
        }

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
            // Create FormData for multipart/form-data
            const formDataToSend = new FormData();
            
            // Append all form fields
            formDataToSend.append('code_unique', formData.code_unique);
            formDataToSend.append('segment', formData.segment);
            formDataToSend.append('msi_model', formData.msi_model);
            formDataToSend.append('msi_product', formData.msi_product);
            formDataToSend.append('wheel_no', formData.wheel_no);
            formDataToSend.append('engine', formData.engine);
            formDataToSend.append('product_type', formData.product_type);
            formDataToSend.append('horse_power', formData.horse_power);
            formDataToSend.append('market_price', formData.market_price.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_1', formData.selling_price_star_1.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_2', formData.selling_price_star_2.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_3', formData.selling_price_star_3.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_4', formData.selling_price_star_4.replace(/\./g, ''));
            formDataToSend.append('selling_price_star_5', formData.selling_price_star_5.replace(/\./g, ''));
            formDataToSend.append('componen_product_description', formData.componen_product_description);
            formDataToSend.append('componen_type', formData.componen_type.toString());
            formDataToSend.append('volume', formData.volume);
            formDataToSend.append('componen_product_unit_model', formData.componen_product_unit_model);
            formDataToSend.append('componen_product_specifications', JSON.stringify(formData.componen_product_specifications));

            if (productImage) {
                formDataToSend.append('image', productImage);
            }

            const response = await ItemProductService.createItemProduct(formDataToSend);
            if (response.status) {
                toast.success('Produk berhasil dibuat');
                navigate('/quotations/products');
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
        setFormData
    };
};