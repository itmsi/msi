import React, { useState, useEffect } from 'react';
import { Offcanvas } from '@/components/ui/offcanvas';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import { DailyTask, DailyTaskHistory, PRIORITY_OPTIONS, TASK_STATUSES, DailyTaskFormData } from '../types/dailyTask';

interface TaskDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    task: DailyTask | null;
    history: DailyTaskHistory[];
    historyLoading: boolean;
    onSave: (id: string, data: DailyTaskFormData) => Promise<void>;
    onDelete: (id: string) => void;
}

const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
    isOpen,
    onClose,
    task,
    history,
    historyLoading,
    onSave,
    onDelete,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<DailyTaskFormData>({
        daily_task: '',
        priority: 'medium',
        status: 'open',
        daily_task_activity_description: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (task && isOpen) {
            setFormData({
                daily_task: task.daily_task,
                priority: task.priority,
                status: task.status,
                daily_task_activity_description: task.daily_task_activity_description || '',
            });
            setIsEditing(false);
        }
    }, [task, isOpen]);

    if (!task) return null;

    const handleChange = (field: keyof DailyTaskFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.daily_task.trim()) return;
        setSaving(true);
        try {
            await onSave(task.daily_task_activitity_id, formData);
            setIsEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            daily_task: task.daily_task,
            priority: task.priority,
            status: task.status,
            daily_task_activity_description: task.daily_task_activity_description || '',
        });
        setIsEditing(false);
    };

    const priorityColor = formData.priority === 'high' ? 'error' : formData.priority === 'medium' ? 'warning' : 'success';
    const statusColor = (s: string): "primary" | "success" | "warning" | "dark" => {
        switch (s) {
            case 'hold': return 'dark';
            case 'open': return 'primary';
            case 'progress': return 'warning';
            case 'done': return 'success';
            default: return 'dark';
        }
    };
    const priorityOptions = PRIORITY_OPTIONS.map((p) => ({
        value: p.value,
        label: p.label.charAt(0).toUpperCase() + p.label.slice(1),
    }));
    const statusOptions = TASK_STATUSES.map((s) => ({ value: s.id, label: s.title }));
    const selectedPriority = priorityOptions.find((o) => o.value === formData.priority) || null;
    const selectedStatus = statusOptions.find((o) => o.value === formData.status) || null;

    return (
        <Offcanvas isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'Task Details'} width="lg" position="right">
            <div className="p-6 space-y-6">
                {!isEditing ? (
                    /* ─── VIEW MODE ─── */
                    <div>
                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.daily_task}</h3>
                                {task.daily_task_activity_description && (
                                    <p className="text-sm text-gray-600">{task.daily_task_activity_description}</p>
                                )}
                            </div>
                            <div className="flex gap-3 flex-shrink-0 ml-4">
                                <Button onClick={() => setIsEditing(true)}>Edit Task</Button>
                                <Button
                                    variant="outline"
                                    className="!text-red-600 !border-red-300 hover:!bg-red-50"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this task?')) {
                                            onDelete(task.daily_task_activitity_id);
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Priority</span>
                                <div className="mt-1">
                                    <Badge color={priorityColor} variant="light" size="sm">{task.priority}</Badge>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500">Status</span>
                                <div className="mt-1"><Badge color={statusColor(task.status)} variant="light" size="sm">{task.status}</Badge></div>
                            </div>
                            {task.daily_task_activity_done_date && (
                                <div>
                                    <span className="text-gray-500">Done Date</span>
                                    <p className="mt-1 text-gray-900">{task.daily_task_activity_done_date}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500">Created By</span>
                                <p className="mt-1 text-gray-900">{task.created_by_name}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Created At</span>
                                <p className="mt-1 text-gray-900">
                                    {task.created_at
                                        ? new Date(task.created_at).toLocaleDateString('id-ID', {
                                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                          })
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ─── EDIT MODE ─── */
                    <div className="space-y-5">
                        <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
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
                            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave} disabled={!formData.daily_task.trim() || saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Divider + History */}
                {!isEditing && <hr className="border-gray-200" />}

                <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Activity History</h4>
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4 text-center">No history found for this task</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div key={item.daily_task_activity_history_id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-blue-500" /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-700">
                                            {item.status_from ? (
                                                <>Status changed from <span className="font-medium text-gray-900">{item.status_from}</span> to <span className="font-medium text-gray-900">{item.status_to}</span></>
                                            ) : (
                                                <>Created with status <span className="font-medium text-gray-900">{item.status_to}</span></>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {item.created_by_name} • {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Offcanvas>
    );
};

export default TaskDetailDrawer;
