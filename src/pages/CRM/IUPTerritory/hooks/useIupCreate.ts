import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { IupService } from '../services/iupTeritoryService';
import { IupFormData } from '../types/iupterritory';


export const useIupCreate = () => {
    const navigate = useNavigate();

    const isLoading = false;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState<IupFormData>({
        iup_id: '',
        iup_latitude: '',
        iup_longitude: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const { [name]: _, ...rest } = prev;
                return rest;
            });
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: name === 'area_size_ha' ? value : value
        }));
    };

    const handleSelectChange = (field: string, value: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();

        setIsSubmitting(true);
        setErrors({});

        try {
            // Prepare payload with all required data
            const payload = {
                ...formData
            };

            await IupService.createIup(payload);
            toast.success('IUP created successfully!');
            navigate('/crm/iup');
        } catch (error: any) {
            console.error('Error creating IUP:', error);
            toast.error(error.response?.data?.message || 'Failed to create IUP');
        } finally {
            setIsSubmitting(false);
        }
    };


    return {
        isLoading,
        isSubmitting,
        formData,
        errors,
        handleInputChange,
        handleSelectChange,
        handleSubmit
    };
}