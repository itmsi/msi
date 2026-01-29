import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { ItemProductValidationErrors, ProductSpecification } from "../types/product";
import { useNavigate } from "react-router";
import { formatNumberInput } from "@/helpers/generalHelper";
import { ItemProductService } from "../services/productService";
import { AuthService } from "@/services/authService";

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
    
    // Get company_name from logged in user
    const companyName = useMemo(() => {
        const user = AuthService.getCurrentUser();
        return (user as any)?.company_name || '';
    }, []);
    
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
        company_name: companyName,
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
        
        // Handle both single file and multiple files
        const fileArray = Array.isArray(files) ? files : [files];
        
        // Create a new array with unique files to avoid reference issues
        const uniqueFiles = fileArray.filter((file, index, self) => {
            return self.findIndex(f => 
                f.name === file.name && 
                f.size === file.size && 
                f.lastModified === file.lastModified
            ) === index;
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
            
            // Prepare data based on product_type
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
                if (productImage.length === 1) {
                    formDataToSend.append('images[0]', productImage[0]);
                    formDataToSend.append('image_count', productImage.length.toString());
                } else {
                    productImage.forEach((file, index) => {
                        formDataToSend.append(`images[${index}]`, file);
                    });
                    formDataToSend.append('image_count', productImage.length.toString());
                }
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