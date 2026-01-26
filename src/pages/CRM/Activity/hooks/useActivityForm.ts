import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ActivityServices } from '../services/activityServices';
import { ActivityFormData, ActivityValidationErrors } from '../types/activity';
import { formatDateToYMD } from '@/helpers/generalHelper';

interface UseActivityFormProps {
    mode: 'create' | 'edit';
    transactions_id?: string;
    initialData?: ActivityFormData;
}

export const useActivityForm = ({ mode, transactions_id, initialData }: UseActivityFormProps) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ActivityValidationErrors>({});
    
    // Initial form data
    const [formData, setFormData] = useState<ActivityFormData>(initialData || {
        transaction_type: '',
        transaction_source: 'manual',
        iup_customer_id: '',
        customer_iup_name: '',
        transaction_date: formatDateToYMD(new Date()),
        transaction_time: new Date().toTimeString().slice(0, 5), // Current time in HH:MM format
        latitude: 0,
        longitude: 0,
        transcription: '',
        summary_point: '',
        summary_bim: '',
        segmentation_id: '',
        segmentation_properties: {
            segmentation_id: '',
            segmentation_name_en: ''
        },
        image_url: '',
        voice_record_url: ''
    });

    // Handle form field changes
    const handleChange = (field: keyof ActivityFormData, value: any) => {
        setFormData((prev: ActivityFormData) => ({
            ...prev,
            transaction_date: formatDateToYMD(typeof prev.transaction_date === 'string' ? new Date(prev.transaction_date) : prev.transaction_date),
            [field]: value
        }));

        // Clear validation errors when user starts typing
        if (field in validationErrors && validationErrors[field as keyof ActivityValidationErrors]) {
            setValidationErrors((prev: ActivityValidationErrors) => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Validate form data
    const validateForm = (): boolean => {
        const errors: ActivityValidationErrors = {};

        if (!formData.transaction_type) {
            errors.transaction_type = 'Transaction type is required';
        }

        if (!formData.transaction_source) {
            errors.transaction_source = 'Transaction source is required';
        }

        if (!formData.iup_customer_id) {
            errors.iup_customer_id = 'Customer selection is required';
        }

        // if (!formData.transaction_date) {
        //     errors.transaction_date = 'Date is required';
        // }

        // if (!formData.transaction_time) {
        //     errors.transaction_time = 'Time is required';
        // }

        if (!formData.segmentation_id) {
            errors.segmentation_id = 'Segmentation is required';
        }

        if (!formData.latitude || formData.latitude === 0) {
            errors.latitude = 'Latitude is required';
        }

        if (!formData.longitude || formData.longitude === 0) {
            errors.longitude = 'Longitude is required';
        }

        if (!formData.transcription.trim()) {
            errors.transcription = 'Transcription is required';
        }

        if (!formData.summary_point.trim()) {
            errors.summary_point = 'Summary point is required';
        }

        if (!formData.summary_bim.trim()) {
            errors.summary_bim = 'Summary BIM is required';
        }

        // URL validation if provided
        if (formData.image_url && !isValidUrl(formData.image_url)) {
            errors.image_url = 'Please enter a valid image URL';
        }

        if (formData.voice_record_url && !isValidUrl(formData.voice_record_url)) {
            errors.voice_record_url = 'Please enter a valid voice record URL';
        }
        console.log({
            errors
        });
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // URL validation helper
    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (mode === 'edit' && !transactions_id) {
            toast.error('Activity ID is required');
            return;
        }

        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        setIsSubmitting(true);

        try {
            let response;
            
            if (mode === 'create') {
                response = await ActivityServices.createActivity(formData);
            } else {
                response = await ActivityServices.updateActivity(transactions_id!, formData);
            }
            
            if (response.success) {
                const successMessage = mode === 'create' 
                    ? 'Activity created successfully'
                    : 'Activity updated successfully';
                    
                toast.success(response.message || successMessage);
                navigate('/crm/activity');
            } else {
                const errorMessage = `${response.message}`;
                // const errorMessage = mode === 'create'
                //     ? 'Failed to create activity'
                //     : `Failed to update activity ${response.message}`;
                    
                toast.error(errorMessage);
            }
        } catch (error: any) {
            console.error(`Error ${mode}ing activity:`, error);
            
            // Handle API validation errors
            if (error?.response?.data?.message) {
                const messages = Array.isArray(error.response.data.message) 
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
                toast.error(messages);
                
                setValidationErrors({
                    general: messages
                });
            } else {
                const errorMessage = mode === 'create'
                    ? 'Failed to create activity. Please try again.'
                    : 'Failed to update activity. Please try again.';
                    
                toast.error(errorMessage);
                setValidationErrors({
                    general: 'An unexpected error occurred. Please try again.'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update form data (useful for edit mode when loading existing data)
    const updateFormData = (data: ActivityFormData) => {
        setFormData(data);
    };

    return {
        // State
        formData,
        isSubmitting,
        validationErrors,
        
        // Actions
        handleChange,
        handleSubmit,
        updateFormData,
        setValidationErrors
    };
};