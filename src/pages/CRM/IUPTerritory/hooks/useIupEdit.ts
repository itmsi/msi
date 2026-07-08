import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IupFormData } from '../types/iupterritory';
import { IupService } from '../services/iupTeritoryService';

export const useIupEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    // State management
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Form data state
    const [formData, setFormData] = useState<IupFormData>({
        iup_id: '',
        company_name: '',
        iup_latitude: '',
        iup_longitude: '',
    });

    // Function to load IUP data by ID
    const loadIupData = async (iupId: string) => {
        try {
            setIsLoading(true);
            const response = await IupService.getIupById(iupId);

            if (response.data.success && response.data.data) {
                const iup = response.data.data;
                
                setFormData({
                    iup_id: iup.iup_id,
                    company_name: iup.company_name || '',
                    iup_latitude: iup.iup_latitude || '',
                    iup_longitude: iup.iup_longitude || '',
                });
                
            } else {
                toast.error('IUP not found');
                navigate('/crm/iup');
            }
        } catch (error: any) {
            console.error('Error loading IUP:', error);
            toast.error('Failed to load IUP data');
            navigate('/crm/iup');
        } finally {
            setIsLoading(false);
        }
    };

    // Form input change handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
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

    // Select change handler
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

    const handleDateChange = (fieldName: string, value: string) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const { [fieldName]: _, ...rest } = prev;
                return rest;
            });
        }
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    // Form submission handler
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (!id) {
            toast.error('IUP ID not found');
            return;
        }

        // Basic validation
        const newErrors: Record<string, string> = {};
        

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors below');
            return;
        }

        try {
            setIsSubmitting(true);
            setErrors({}); // Clear previous errors
            
            const updateData = {
                // ...formData,
                iup_id: formData.iup_id,
                iup_latitude: formData.iup_latitude,
                iup_longitude: formData.iup_longitude,
            };

            const response = await IupService.updateIup(id, updateData);
            
            if (response.success) {
                toast.success('IUP updated successfully');
                navigate('/crm/iup');
            } else {
                toast.error('Failed to update IUP');
            }
        } catch (error: any) {
            console.error('Error updating IUP:', error);
            toast.error('Failed to update IUP');
        } finally {
            setIsSubmitting(false);
        }
    };
    useEffect(() => {
        if (id) {
            loadIupData(id);
        }
    }, [id, navigate]);
        
    return {
        id,
        isLoading,
        isSubmitting,
        formData,
        errors,
        // Form handlers
        handleInputChange,
        handleSelectChange,
        handleDateChange, // Add date change handler
        handleSubmit,
        loadIupData
    };
}