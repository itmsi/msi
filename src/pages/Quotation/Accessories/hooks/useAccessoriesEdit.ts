import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AccessoriesValidationErrors } from '../types/accessories';
import { AccessoriesService } from '../services/accessoriesService';
import toast from 'react-hot-toast';

interface FormData {
    accessory_part_number: string;
    accessory_part_name: string;
    accessory_specification: string;
    accessory_brand: string;
    accessory_remark: string;
    accessory_region: string;
    accessory_description: string;
}

export const useAccessoriesEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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

    // Load data saat komponen mount
    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        setFetching(true);
        try {
            const response = await AccessoriesService.getAccessoriesById(id!);
            
            if (response.data?.data) {
                const data = response.data.data;
                setForm({
                    accessory_part_number: data.accessory_part_number || '',
                    accessory_part_name: data.accessory_part_name || '',
                    accessory_specification: data.accessory_specification || '',
                    accessory_brand: data.accessory_brand || '',
                    accessory_remark: data.accessory_remark || '',
                    accessory_region: data.accessory_region || '',
                    accessory_description: data.accessory_description || ''
                });
            }
        } catch (error) {
            console.error('Error loading accessory:', error);
            toast.error('Gagal memuat data accessory');
            navigate('/quotations/accessories');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        // Clear error ketika user edit field
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
            await AccessoriesService.updateAccessories(id!, form);
            toast.success('Accessory berhasil diupdate');
            navigate('/quotations/accessories');
        } catch (error: any) {
            if (error.errors && typeof error.errors === 'object') {
                setErrors(error.errors);
            }
            console.error('Error updating accessory:', error);
            toast.error('Gagal update accessory');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/quotations/accessories');
    };

    return {
        form,
        errors,
        loading,
        fetching,
        handleChange,
        handleSubmit,
        handleBack
    };
}