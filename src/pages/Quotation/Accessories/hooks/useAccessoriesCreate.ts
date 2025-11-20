import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AccessoriesValidationErrors } from "../types/accessories";
import { AccessoriesService } from "../services/accessoriesService";

interface FormData {
    accessory_part_number: string;
    accessory_part_name: string;
    accessory_specification: string;
    accessory_brand: string;
    accessory_remark: string;
    accessory_region: string;
    accessory_description: string;
}

export const useCreateAccessories = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<AccessoriesValidationErrors>({});
    
    const [form, setForm] = useState<FormData>({
        accessory_part_number: '',
        accessory_part_name: '',
        accessory_specification: '',
        accessory_brand: '',
        accessory_remark: '',
        accessory_region: '',
        accessory_description: ''
    });

    const handleChange = (field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        // Clear error saat user mulai mengetik
        if (errors[field as keyof AccessoriesValidationErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<AccessoriesValidationErrors> = {};

        if (!form.accessory_part_number.trim()) {
            newErrors.accessory_part_number = 'Part number wajib diisi';
        }

        if (!form.accessory_part_name.trim()) {
            newErrors.accessory_part_name = 'Part name wajib diisi';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        setLoading(true);

        try {
            await AccessoriesService.createAccessories(form);
            toast.success('Accessory berhasil dibuat');
            navigate('/quotations/accessories');
        } catch (error: any) {
            if (error.errors && typeof error.errors === 'object') {
                setErrors(error.errors);
            }
            console.error('Error creating accessory:', error);
            toast.error('Gagal membuat accessory');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/quotations/accessories');
    };

    return {
        loading,
        errors,
        form,
        handleChange,
        handleSubmit,
        handleBack
    };
};