import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { AiOutlineDashboard } from 'react-icons/ai';
import FormActions from '@/components/form/FormActions';
import ProjectForm from './components/ProjectForm';
import { useProjectForm } from './hooks/useProjectForm';
import TaskProjectDevisionTab from './components/TaskProjectDevision/TaskProjectDevisionTab';
import { ActivityTypeBadge } from '../Contractors/components/ContractorBadges';
import { HiOutlineTrendingUp, HiOutlineUserGroup } from 'react-icons/hi';
import SalesTrackingContainer from './components/SalesTracking/SalesTrackingContainer';
import DivisionOverviewContainer from './components/DivisionOverview/DivisionOverviewContainer';

const EditProject: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState< 'project_overview' | 'sales_tracking' | 'division_overview' | 'task_division'>('project_overview');

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

                    {/* Project Information Overview */}
                    {formData.project_name && (
                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-primary-bold text-gray-900 mb-4">Project Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500 mb-1">Project Name</div>
                                    <div className="text-base text-gray-900 font-secondary">{formData.project_name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500 mb-1">Contractor</div>
                                    <div className="text-base text-gray-900 font-secondary">{formData.customer_name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500 mb-1">Sales</div>
                                    <div className="text-base text-gray-900 font-secondary">{formData.employee_name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                                    <ActivityTypeBadge
                                        type={(formData?.status as 'Not Started' | 'Find' | 'Pull' | 'Survey' | 'BAST') || 'Not Started'}
                                    />
                                    {/* <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize min-w-[70px] inline-block text-center ${STATUS_PROJECT[formData.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {formData.status || 'Not Started'}
                                    </span> */}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* End Project Information Overview */}

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('project_overview')}
                                className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                    activeTab === 'project_overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <AiOutlineDashboard size={'1.5rem'} /> Project Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('sales_tracking')}
                                className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                    activeTab === 'sales_tracking'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <HiOutlineTrendingUp size={'1.5rem'} /> Sales Tracking
                            </button>
                            <button
                                onClick={() => setActiveTab('division_overview')}
                                className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                    activeTab === 'division_overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <HiOutlineUserGroup size={'1.5rem'} /> Division Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('task_division')}
                                className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                    activeTab === 'task_division'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <HiOutlineUserGroup size={'1.5rem'} /> Task Project devision
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'project_overview' && id && (<>
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
                    </>)}
                    {activeTab === 'sales_tracking' && (
                        <SalesTrackingContainer 
                            className='md:grid-cols-5 grid gap-6'
                        />
                    )}
                    {activeTab === 'division_overview' && (
                        <DivisionOverviewContainer 
                            className='md:grid-cols-5 grid gap-6'
                        />
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
