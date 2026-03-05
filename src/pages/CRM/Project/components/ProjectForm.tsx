import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { ProjectAttachment, ProjectFormData, ProjectValidationErrors } from '../types/project';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import IupContractorSelect from '@/components/form/select/IupContractorSelect';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import { useEmployeeSelect } from '@/hooks/useEmployeeSelect';
import { formatNumberInputwithComma, handleDecimalInputComma, handleKeyPress } from '@/helpers/generalHelper';

interface ProjectFormProps {
    formData: ProjectFormData;
    errors: ProjectValidationErrors;
    onChange: (field: keyof ProjectFormData, value: any) => void;
    onAttachmentChange: (files: File | File[] | null) => void;
    onRemoveExistingAttachment: (index?: number) => void;
    isSubmitting: boolean;
}

const STATUS_OPTIONS = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'Find', label: 'Find' },
    { value: 'Pull', label: 'Pull' },
    { value: 'Survey', label: 'Survey' },
    { value: 'BAST', label: 'BAST' },
];

interface ContractorSelectOption {
    value: string;
    label: string;
    customer_name?: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    formData,
    errors,
    onChange,
    onAttachmentChange,
    onRemoveExistingAttachment,
    isSubmitting,
}) => {
    const {
        employeeOptions,
        inputValue: employeeInputValue,
        handleInputChange: handleEmployeeInputChange,
        pagination: employeePagination,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions
    } = useEmployeeSelect();
        
    const initReference = useRef(false);

    const [selectedEmployee, setSelectedEmployee] = useState<{ value: string; label: string } | null>(null);
    
    useEffect(() => {
        if (!initReference.current) {
            initReference.current = true;
            initializeEmployeeOptions();
        }
    }, []);


    // Sync employee selection when editing
    useEffect(() => {
        if (formData.employee_id && formData.employee_name) {
            setSelectedEmployee({
                value: formData.employee_id,
                label: formData.employee_name,
            });
        } else {
            setSelectedEmployee(null);
        }
    }, [formData.employee_id, formData.employee_name]);

    // Handle IUP and Contractor selection from the reusable component - memoized
    const handleIupChange = useCallback((iup: { value: string; label: string } | null) => {
        if (iup) {
            onChange('iup_id', iup.value);
            onChange('iup_name', iup.label);
        } else {
            onChange('iup_id', '');
            onChange('iup_name', '');
        }
    }, [onChange]);

    const handleContractorChange = useCallback((contractor: ContractorSelectOption | null) => {
        if (contractor) {
            onChange('iup_customer_id', contractor.value);
            onChange('customer_name', contractor.customer_name || contractor.label || '');
        } else {
            onChange('iup_customer_id', '');
            onChange('customer_name', '');
        }
    }, [onChange]);

    // Memoized values to prevent unnecessary re-renders
    const iupValue = useMemo(() => {
        return formData.iup_id && formData.iup_name ? {
            value: formData.iup_id,
            label: formData.iup_name
        } : null;
    }, [formData.iup_id, formData.iup_name]);

    const contractorValue = useMemo(() => {
        return formData.iup_customer_id && formData.customer_name ? {
            value: formData.iup_customer_id,
            label: formData.customer_name
        } : null;
    }, [formData.iup_customer_id, formData.customer_name]);

    // Build existing image URLs for FileUpload
    const existingAttachments = Array.isArray(formData.property_attachment)
        ? (formData.property_attachment as ProjectAttachment[]).map(a => a.file_url)
        : [];

    return (
        <div className="space-y-6">
            {/* Project Info Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">Project Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Name */}
                    <div>
                        <Label htmlFor="project_name">Project Name</Label>
                        <Input
                            id="project_name"
                            type="text"
                            value={formData.project_name || ''}
                            onChange={(e) => onChange('project_name', e.target.value)}
                            placeholder="Enter project name"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* IUP Selection and Contractor - Reusable Component */}
                    <IupContractorSelect
                        iupValue={iupValue}
                        contractorValue={contractorValue}
                        iupLabel="IUP Selection"
                        iupRequired={true}
                        iupError={errors.iup_id}
                        contractorLabel="Contractor"
                        contractorRequired={true}
                        contractorError={errors.iup_customer_id}
                        onIupChange={handleIupChange}
                        onContractorChange={handleContractorChange}
                        disabled={isSubmitting}
                        layout="horizontal"
                        gridCols="grid-cols-1 md:grid-cols-2"
                        className="md:col-span-2"
                    />
                    {/* Employee */}
                    <div>
                        <Label htmlFor="employee-select">Sales</Label>
                        <CustomAsyncSelect
                            id="employee-select"
                            placeholder="Search employee..."
                            value={selectedEmployee}
                            defaultOptions={employeeOptions}
                            loadOptions={handleEmployeeInputChange}
                            onMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                            isLoading={employeePagination.loading}
                            noOptionsMessage={() => 'No employees found'}
                            loadingMessage={() => 'Loading...'}
                            isSearchable={true}
                            inputValue={employeeInputValue}
                            className="w-full"
                            onInputChange={handleEmployeeInputChange}
                            onChange={(option: any) => {
                                setSelectedEmployee(option || null);
                                if (option) {
                                    onChange('employee_id', option.value);
                                    onChange('employee_name', option.label);
                                } else {
                                    onChange('employee_id', '');
                                    onChange('employee_name', '');
                                }
                            }}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <CustomSelect
                            id="status"
                            name="status"
                            value={STATUS_OPTIONS.find(o => o.value === formData.status) || null}
                            onChange={(option) => onChange('status', option?.value || '')}
                            options={STATUS_OPTIONS}
                            placeholder="Select status..."
                            isClearable={true}
                            isSearchable={false}
                            className="w-full"
                        />
                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                    </div>

                    {/* Propose Unit */}
                    <div>
                        <Label htmlFor="propose_unit">Propose Unit</Label>
                        <Input
                            id="propose_unit"
                            value={formData.propose_unit}
                            onChange={(e) => onChange('propose_unit', e.target.value)}
                            onKeyPress={handleKeyPress}
                            error={!!errors.propose_unit}
                            maxLength={10}
                            disabled={isSubmitting}
                        />
                        {errors.propose_unit && <p className="text-red-500 text-sm mt-1">{errors.propose_unit}</p>}
                    </div>

                    {/* Propose Value */}
                    <div>
                        <Label htmlFor="propose_value">Propose Value</Label>
                        
                        <Input
                            id="propose_value"
                            value={formData.propose_value === null ? '' : formatNumberInputwithComma(formData.propose_value || '')}
                            onChange={(e) => {
                                const rawValue = e.target.value;

                                handleDecimalInputComma(
                                    rawValue,
                                    (validValue) => onChange('propose_value', validValue),
                                    () => onChange('propose_value', ''),
                                    true,
                                    20,
                                    2
                                );
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Detail Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">Detail</h3>
                <div className="grid grid-cols-1 gap-6">
                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <TextArea
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('description', e.target.value)}
                            placeholder="Project description..."
                            rows={4}
                            disabled={isSubmitting}
                            className="flex"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Pain Point */}
                    <div>
                        <Label htmlFor="pain_point">Pain Point</Label>
                        <TextArea
                            value={formData.pain_point}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('pain_point', e.target.value)}
                            placeholder="Customer pain points..."
                            rows={4}
                            disabled={isSubmitting}
                            className="flex"
                        />
                        {errors.pain_point && <p className="text-red-500 text-sm mt-1">{errors.pain_point}</p>}
                    </div>

                    {/* Propose Solution */}
                    <div>
                        <Label htmlFor="propose_solution">Propose Solution</Label>
                        <TextArea
                            value={formData.propose_solution}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('propose_solution', e.target.value)}
                            placeholder="Proposed solution..."
                            rows={4}
                            disabled={isSubmitting}
                            className="flex"
                        />
                        {errors.propose_solution && <p className="text-red-500 text-sm mt-1">{errors.propose_solution}</p>}
                    </div>

                    {/* Remark */}
                    <div>
                        <Label htmlFor="remark">Remark</Label>
                        <TextArea
                            value={formData.remark}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('remark', e.target.value)}
                            placeholder="Additional remarks..."
                            rows={3}
                            disabled={isSubmitting}
                            className="flex"
                        />
                        {errors.remark && <p className="text-red-500 text-sm mt-1">{errors.remark}</p>}
                    </div>
                </div>
            </div>

            {/* Attachments Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">Attachments</h3>
                <FileUpload
                    id="property_attachment"
                    name="property_attachment"
                    label="Project Attachments"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    icon="upload"
                    acceptedFormats={['jpg', 'jpeg', 'png', 'pdf']}
                    maxSize={5}
                    multiple={true}
                    currentFiles={formData.property_attachment_files || []}
                    existingImageUrl={existingAttachments.length > 0 ? existingAttachments : null}
                    onFileChange={onAttachmentChange}
                    onRemoveExistingImage={onRemoveExistingAttachment}
                    validationError={errors.property_attachment || ''}
                    disabled={isSubmitting}
                    description="Format: JPG, JPEG, PNG, PDF - Max 5MB each"
                    showPreview={true}
                    previewSize="lg"
                    colLength={4}
                />
            </div>

            {/* General Error */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
            )}
        </div>
    );
};

export default ProjectForm;
