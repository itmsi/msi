import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import FormActions from '@/components/form/FormActions';
import ProjectForm from './components/ProjectForm';
import { useProjectForm } from './hooks/useProjectForm';

const EditProject: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const {
        formData,
        isSubmitting,
        isLoadingDetail,
        validationErrors,
        handleChange,
        handleAttachmentChange,
        handleRemoveExistingAttachment,
        handleSubmit,
        loadDetail,
    } = useProjectForm({ mode: 'edit', project_id: id });

    useEffect(() => {
        if (id) {
            loadDetail(id);
        }
    }, [id, loadDetail]);

    if (isLoadingDetail) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading project...</span>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Edit Project | CRM"
                description="Edit CRM project"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/crm/project')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Project</h1>
                        </div>
                    </div>

                    <ProjectForm
                        formData={formData}
                        errors={validationErrors}
                        onChange={handleChange}
                        onAttachmentChange={handleAttachmentChange}
                        onRemoveExistingAttachment={handleRemoveExistingAttachment}
                        isSubmitting={isSubmitting}
                    />

                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute="/crm/project"
                        submitText="Update Project"
                        submittingText="Updating..."
                    />
                </div>
            </div>
        </>
    );
};

export default EditProject;
