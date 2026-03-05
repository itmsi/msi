import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { TaskProjectDevisionRequest, TaskProjectDevision } from '../../types/taskProjectDevision';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useEmployeeSelect } from '@/hooks/useEmployeeSelect';
import { useProjectDetailDivisionSelect } from '@/hooks/useProjectDetailDivisionSelect';
import CustomSelect from '@/components/form/select/CustomSelect';

interface TaskProjectDevisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TaskProjectDevisionRequest) => Promise<boolean>;
    project_id: string;
    editData?: TaskProjectDevision | null;
    onGoToDivision?: () => void;
}

const TaskProjectDevisionModal: React.FC<TaskProjectDevisionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    project_id,
    editData,
    onGoToDivision
}) => {
    const [formData, setFormData] = useState<TaskProjectDevisionRequest>({
        project_detail_devision_id: '',
        title: '',
        description: '',
        employee_id: '',
        date_transaction: new Date().toISOString().split('T')[0]
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const {
        employeeOptions,
        inputValue: employeeInputValue,
        handleInputChange: handleEmployeeInputChange,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions
    } = useEmployeeSelect();

    const {
        options: divisionOptions,
        inputValue: divisionInputValue,
        handleInputChange: handleDivisionInputChange,
        handleMenuScrollToBottom: handleDivisionMenuScrollToBottom,
        initializeOptions: initializeDivisionOptions
    } = useProjectDetailDivisionSelect(project_id);

    useEffect(() => {
        if (isOpen) {
            initializeEmployeeOptions();
            initializeDivisionOptions();
            if (editData) {
                setFormData({
                    project_detail_devision_id: editData.project_detail_devision_id || '',
                    title: editData.title || '',
                    description: editData.description || '',
                    employee_id: editData.employee_id || '',
                    date_transaction: editData.date_transaction ? editData.date_transaction.substring(0, 10) : ''
                });
            } else {
                setFormData({
                    project_detail_devision_id: '',
                    title: '',
                    description: '',
                    employee_id: '',
                    date_transaction: new Date().toISOString().split('T')[0]
                });
            }
            setErrors({});
        }
    }, [isOpen, editData, initializeEmployeeOptions, initializeDivisionOptions]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.project_detail_devision_id) newErrors.project_detail_devision_id = 'Division is required';
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.employee_id) newErrors.employee_id = 'PIC is required';
        if (!formData.date_transaction) newErrors.date_transaction = 'Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setSubmitting(true);
        const success = await onSubmit(formData);
        setSubmitting(false);
        if (success) onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleEmployeeSelect = (selected: any) => {
        setFormData(prev => ({ ...prev, employee_id: selected ? selected.value : '' }));
        if (errors.employee_id) setErrors(prev => ({ ...prev, employee_id: '' }));
    };

    const handleDivisionSelect = (selected: any) => {
        setFormData(prev => ({ ...prev, project_detail_devision_id: selected ? selected.value : '' }));
        if (errors.project_detail_devision_id) setErrors(prev => ({ ...prev, project_detail_devision_id: '' }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? "Edit Task Project Devision" : "Create Task Project Devision"}
            description="Fill the details for task project devision"
            className="max-w-2xl"
        >
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Division *</Label>
                        <CustomSelect
                            id="project_detail_devision_id"
                            name="project_detail_devision_id"
                            value={divisionOptions.find(opt => opt.value === formData.project_detail_devision_id) || null}
                            options={divisionOptions}
                            onChange={handleDivisionSelect}
                            onInputChange={handleDivisionInputChange}
                            onMenuScrollToBottom={handleDivisionMenuScrollToBottom}
                            inputValue={divisionInputValue}
                            placeholder="Search division..."
                            error={errors.project_detail_devision_id}
                            isDisabled={submitting}
                            noOptionsMessage={() => (
                                <div className="py-2 text-center">
                                    <p className="text-sm text-gray-500 mb-2">No division found</p>
                                    {onGoToDivision && (
                                        <button
                                            type="button"
                                            onClick={() => { onClose(); onGoToDivision(); }}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            + Add Division
                                        </button>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                    <div>
                        <Label>Title *</Label>
                        <Input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Task Title"
                            error={!!errors.title}
                            hint={errors.title}
                            disabled={submitting}
                        />
                    </div>
                    <div>
                        <Label>PIC *</Label>
                        <CustomSelect
                            id="employee_id"
                            name="employee_id"
                            value={employeeOptions.find(opt => opt.value === formData.employee_id) || (editData && formData.employee_id === editData.employee_id ? { value: editData.employee_id, label: editData.employee_name } : null)}
                            options={employeeOptions}
                            onChange={handleEmployeeSelect}
                            onInputChange={handleEmployeeInputChange}
                            onMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                            inputValue={employeeInputValue}
                            placeholder="Search employee..."
                            error={errors.employee_id}
                            isDisabled={submitting}
                        />
                    </div>
                    <div>
                        <Label>Date *</Label>
                        <Input
                            type="date"
                            name="date_transaction"
                            value={formData.date_transaction}
                            onChange={handleChange}
                            error={!!errors.date_transaction}
                            hint={errors.date_transaction}
                            disabled={submitting}
                        />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={submitting}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
                        <Button type="submit" disabled={submitting} className="flex items-center">
                            {submitting ? 'Saving...' : 'Save Data'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default TaskProjectDevisionModal;
