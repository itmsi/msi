import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import { DailyTask, DailyTaskFormData, PRIORITY_OPTIONS, TASK_STATUSES } from '../types/dailyTask';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DailyTaskFormData) => Promise<void>;
    editingTask: DailyTask | null;
    defaultStatus?: string;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingTask,
    defaultStatus = 'open',
}) => {
    const [formData, setFormData] = React.useState<DailyTaskFormData>({
        daily_task: '',
        priority: 'medium',
        status: defaultStatus,
        daily_task_activity_description: '',
    });
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (editingTask) {
            setFormData({
                daily_task: editingTask.daily_task,
                priority: editingTask.priority,
                status: editingTask.status,
                daily_task_activity_description: editingTask.daily_task_activity_description || '',
            });
        } else {
            setFormData({
                daily_task: '',
                priority: 'medium',
                status: defaultStatus,
                daily_task_activity_description: '',
            });
        }
    }, [editingTask, defaultStatus, isOpen]);

    const handleChange = (field: keyof DailyTaskFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.daily_task.trim()) return;

        setSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({ daily_task: '', priority: 'medium', status: 'open', daily_task_activity_description: '' });
        } finally {
            setSubmitting(false);
        }
    };

    const priorityOptions = PRIORITY_OPTIONS.map((p) => ({
        value: p.value,
        label: p.label.charAt(0).toUpperCase() + p.label.slice(1),
    }));

    const statusOptions = TASK_STATUSES.map((s) => ({
        value: s.id,
        label: s.title,
    }));

    const selectedPriority = priorityOptions.find(o => o.value === formData.priority) || null;
    const selectedStatus = statusOptions.find(o => o.value === formData.status) || null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingTask ? 'Edit Task' : 'Create Task'} isFullscreen={false} className="max-w-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                        Task Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter task name..."
                        value={formData.daily_task}
                        onChange={(e) => handleChange('daily_task', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Priority</label>
                    <CustomSelect
                        options={priorityOptions}
                        value={selectedPriority}
                        onChange={(val) => handleChange('priority', val?.value || 'medium')}
                    />
                </div>

                <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Status</label>
                    <CustomSelect
                        options={statusOptions}
                        value={selectedStatus}
                        onChange={(val) => handleChange('status', val?.value || 'open')}
                    />
                </div>

                <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        placeholder="Add description..."
                        value={formData.daily_task_activity_description}
                        onChange={(e) => handleChange('daily_task_activity_description', e.target.value)}
                        rows={3}
                        className="font-secondary h-auto w-full rounded-lg border border-gray-300 appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 bg-transparent text-gray-800 resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!formData.daily_task.trim() || submitting}
                    >
                        {submitting
                            ? 'Saving...'
                            : editingTask
                            ? 'Update Task'
                            : 'Create Task'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskFormModal;
