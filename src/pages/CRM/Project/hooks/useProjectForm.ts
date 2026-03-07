import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ProjectService } from '../services/projectService';
import { ProjectAttachment, ProjectFormData, ProjectItemDetails, ProjectValidationErrors } from '../types/project';
import { AuthService } from '@/services/authService';
import { formatCurrencyForBackend } from '@/helpers/generalHelper';

interface UseProjectFormProps {
    mode: 'create' | 'edit';
    project_id?: string;
}

export const useProjectForm = ({ mode, project_id }: UseProjectFormProps) => {
    const employeeId = useMemo(() => {
        const user = AuthService.getCurrentUser();
        return user?.employee_id || '';
    }, []);

    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(true);
    const [validationErrors, setValidationErrors] = useState<ProjectValidationErrors>({});

    const [formData, setFormData] = useState<ProjectFormData>({
        iup_id: '',
        iup_name: '',
        iup_customer_id: '',
        customer_name: '',
        project_name: '',
        propose_unit: '',
        propose_value: '',
        status: '',
        description: '',
        remark: '',
        employee_id: employeeId,
        employee_name: '',
        propose_solution: '',
        pain_point: '',
        property_attachment_files: [],
        property_attachment_delete: [],
        property_attachment: null,
    });

    // Load detail for edit mode
    const loadDetail = useCallback(async (id: string) => {
        try {
            setIsLoadingDetail(true);
            const response = await ProjectService.getProjectById(id);
            const detail = (response.data as any)?.data as ProjectItemDetails;

            if (detail) {
                // Normalize property_attachment
                let existingAttachments: ProjectAttachment[] = [];
                if (detail.property_attachment) {
                    if (typeof detail.property_attachment === 'string') {
                        try { existingAttachments = JSON.parse(detail.property_attachment); } catch {}
                    } else if (Array.isArray(detail.property_attachment)) {
                        existingAttachments = detail.property_attachment;
                    }
                }

                setFormData({
                    iup_id: detail.iup_id || '',
                    iup_name: detail.iup_name || '',
                    iup_customer_id: detail.iup_customer_id || '',
                    customer_name: detail.customer_name || '',
                    project_name: detail.project_name || '',
                    propose_unit: detail.propose_unit ?? '',
                    propose_value: detail.propose_value ?? '',
                    status: detail.status || '',
                    description: detail.description || '',
                    remark: detail.remark || '',
                    employee_id: detail.employee_id || employeeId,
                    employee_name: detail.employee_name || '',
                    propose_solution: detail.propose_solution || '',
                    pain_point: detail.pain_point || '',
                    property_attachment: existingAttachments,
                    property_attachment_files: [],
                    property_attachment_delete: [],
                });
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load project data');
        } finally {
            setIsLoadingDetail(false);
        }
    }, [employeeId]);

    const handleChange = (field: keyof ProjectFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (validationErrors[field as keyof ProjectValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Handle new attachment files
    const handleAttachmentChange = (files: File | File[] | null) => {
        if (!files) {
            setFormData(prev => ({ ...prev, property_attachment_files: [] }));
        } else if (Array.isArray(files)) {
            setFormData(prev => ({ ...prev, property_attachment_files: files }));
        } else {
            setFormData(prev => ({ ...prev, property_attachment_files: [files] }));
        }
    };

    // Handle removing existing attachment
    const handleRemoveExistingAttachment = (index?: number) => {
        if (index === undefined) return;
        const existingList = Array.isArray(formData.property_attachment)
            ? [...formData.property_attachment]
            : [];
        const removed = existingList.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            property_attachment: existingList,
            property_attachment_delete: [
                ...(prev.property_attachment_delete || []),
                ...removed
            ]
        }));
    };

    // Build FormData for API submission
    const buildFormData = (): FormData => {
        const fd = new FormData();
        fd.append('iup_customer_id', formData.iup_customer_id);
        fd.append('propose_unit', String(formData.propose_unit ?? ''));
        
        // Convert propose_value to backend format (dot decimal)
        const proposeValueForBackend = formatCurrencyForBackend(formData.propose_value);
        fd.append('propose_value', proposeValueForBackend);
        
        fd.append('status', formData.status);
        fd.append('description', formData.description);
        fd.append('remark', formData.remark);
        fd.append('employee_id', formData.employee_id);
        if (formData.project_name) fd.append('project_name', formData.project_name);
        fd.append('propose_solution', formData.propose_solution);
        fd.append('pain_point', formData.pain_point);

        // Attach new files
        if (formData.property_attachment_files && formData.property_attachment_files.length > 0) {
            formData.property_attachment_files.forEach(file => {
                fd.append('property_attachment', file);
            });
        }

        // Attach delete list for edit
        if (mode === 'edit' && formData.property_attachment_delete && formData.property_attachment_delete.length > 0) {
            fd.append('property_attachment_delete', JSON.stringify(formData.property_attachment_delete));
        }

        return fd;
    };

    const handleSubmit = async () => {
        if (mode === 'edit' && !project_id) {
            toast.error('Project ID is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const fd = buildFormData();
            let response: any;

            if (mode === 'create') {
                response = await ProjectService.createProject(fd);
            } else {
                response = await ProjectService.updateProject(project_id!, fd);
            }

            if (response?.status || response?.success) {
                toast.success(mode === 'create' ? 'Project created successfully' : 'Project updated successfully');
                navigate('/crm/project');
            } else {
                toast.error(response?.message || 'Operation failed');
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
            const messages = Array.isArray(message) ? message.join(', ') : message;
            toast.error(messages);
            setValidationErrors({ general: messages });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        isSubmitting,
        isLoadingDetail,
        validationErrors,
        handleChange,
        handleAttachmentChange,
        handleRemoveExistingAttachment,
        handleSubmit,
        loadDetail,
        setValidationErrors,
    };
};
