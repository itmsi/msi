import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import Loading from '@/components/common/Loading';
import FormActions from '@/components/form/FormActions';

import { ActivityServices } from '@/pages/CRM/Activity/services/activityServices';
import ActivityForm from '@/pages/CRM/Activity/components/ActivityForm';
import { useActivityForm } from './hooks/useActivityForm';
import { formatDateToYMD } from '@/helpers/generalHelper';

const EditActivity: React.FC = () => {
    const navigate = useNavigate();
    const { transactions_id } = useParams<{ transactions_id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    
    const {
        formData,
        isSubmitting,
        validationErrors,
        handleChange,
        handleSubmit,
        updateFormData,
    } = useActivityForm({
        mode: 'edit',
        transactions_id
    });

    // Load activity data for editing
    useEffect(() => {
        const loadActivity = async () => {
            if (!transactions_id) {
                toast.error('Activity ID is required');
                navigate('/crm/activity');
                return;
            }

            try {
                setIsLoading(true);
                const response = await ActivityServices.getActivityById(transactions_id);
                
                if (response.success && response.data) {
                    const activity = response.data;
                    
                    // Transform activity data to form data
                    updateFormData({
                        transaction_type: activity.transaction_type,
                        transaction_source: activity.transaction_source,
                        iup_customer_id: activity.iup_customer_id,
                        customer_iup_name: activity.customer_iup_name,
                        transaction_date: activity.transaction_date || formatDateToYMD(new Date()),
                        transaction_time: activity.transaction_time || new Date().toTimeString().slice(0, 5),
                        latitude: parseFloat(activity.latitude) || 0,
                        longitude: parseFloat(activity.longitude) || 0,
                        transcription: activity.transcription,
                        summary_point: activity.summary_point,
                        summary_bim: activity.summary_bim,
                        segmentation_id: activity.segmentation_id,
                        segmentation_properties: activity.segmentation_properties,
                        image_url: activity.image_url || '',
                        voice_record_url: activity.voice_record_url || ''
                    });
                } else {
                    toast.error('Activity not found');
                    navigate('/crm/activity');
                }
            } catch (error: any) {
                console.error('Error loading activity:', error);
                toast.error('Failed to load activity data');
                navigate('/crm/activity');
            } finally {
                setIsLoading(false);
            }
        };

        loadActivity();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <>
                <PageMeta
                    title="Edit Activity | CRM"
                    description="Edit customer activity transaction"
                    image="/motor-sights-international.png"
                />
                <Loading />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title="Edit Activity | CRM"
                description="Edit customer activity transaction"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* Header */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/crm/activity')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Activity</h1>
                        </div>
                    </div>

                    
                    {/* Form Content */}
                    <div>
                        <ActivityForm
                            formData={formData}
                            errors={validationErrors}
                            onChange={handleChange}
                            isSubmitting={isSubmitting}
                        />
                    </div>

                    {/* Form Actions */}
                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute="/crm/activity"
                        submitText="Update Activity"
                        submittingText="Updating..."
                    />

                </div>
            </div>
    
        </>
    );
};

export default EditActivity;