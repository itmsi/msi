import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft, MdTaskAlt } from 'react-icons/md';
import { AiOutlineIdcard } from 'react-icons/ai';
import FormActions from '@/components/form/FormActions';
import ProjectForm from './components/ProjectForm';
import { useProjectForm } from './hooks/useProjectForm';
import TaskProjectDevisionTab from './components/TaskProjectDevision/TaskProjectDevisionTab';

const EditProject: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<'info_project' | 'task_division'>('info_project');

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

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('info_project')}
                                className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                    activeTab === 'info_project'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <AiOutlineIdcard size={'1.5rem'} /> Project Information
                            </button>
                            <button
                                onClick={() => setActiveTab('task_division')}
                                className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                    activeTab === 'task_division'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <MdTaskAlt size={'1.5rem'} /> Task Project devision
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'info_project' && (
                        <div>
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
                    )}

                    {activeTab === 'task_division' && id && (
                        <TaskProjectDevisionTab project_detail_devision_id={id} />
                    )}
                </div>
            </div>
        </>
    );
};

export default EditProject;
