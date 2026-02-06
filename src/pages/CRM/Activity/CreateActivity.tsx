import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import FormActions from '@/components/form/FormActions';

import ActivityForm from '@/pages/CRM/Activity/components/ActivityForm';
import { useActivityForm } from './hooks/useActivityForm';

const CreateActivity: React.FC = () => {
    const navigate = useNavigate();
    
    const {
        formData,
        isSubmitting,
        validationErrors,
        handleChange,
        handleSubmit
    } = useActivityForm({
        mode: 'create'
    });

    return (
        <>
            <PageMeta
                title="Create Activity | CRM"
                description="Create new customer activity transaction"
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
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Activity</h1>
                        </div>
                    </div>
                    
                    <div>
                        <ActivityForm
                            formData={formData}
                            errors={validationErrors}
                            onChange={handleChange}
                            isSubmitting={isSubmitting}
                        />
                    </div>

                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute="/crm/activity"
                        submitText="Create Activity"
                        submittingText="Creating..."
                    />
                </div>
            </div>
        </>
    );
};

export default CreateActivity;