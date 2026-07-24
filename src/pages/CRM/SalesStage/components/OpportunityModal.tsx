import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { toast } from 'react-hot-toast';
import type { SalesStageOpportunity, SalesStageCreateRequest } from '../types/salesStage';
import IUPAreaSelectField from '@/components/form/select/IUPAreaSelectField';
import IUPEmployeeCRMSelectField from '@/components/form/select/IUPEmployeeCRMSelectField';

interface OpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SalesStageCreateRequest) => Promise<void>;
    editingTask: SalesStageOpportunity | null;
    defaultStage: string;
}

const OpportunityModal: React.FC<OpportunityModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingTask,
    defaultStage,
}) => {
    const [iupId, setIupId] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [contact, setContact] = useState('');
    const [value, setValue] = useState('');
    const [stage, setStage] = useState(defaultStage);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editingTask) {
            setIupId(editingTask.iup_id || '');
            setEmployeeId(editingTask.employee_id || '');
            setContact(editingTask.contact || '');
            setValue(editingTask.value || '');
            setStage(editingTask.stage);
        } else {
            setIupId('');
            setEmployeeId('');
            setContact('');
            setValue('');
            setStage(defaultStage);
        }
    }, [editingTask, defaultStage, isOpen]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!iupId || !employeeId) {
            toast.error('IUP ID dan Sales Employee wajib diisi');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({
                iup_id: iupId,
                employee_id: employeeId,
                stage: editingTask ? undefined : stage,
                contact: contact || undefined,
                value: value || undefined,
            });
        } finally {
            setSubmitting(false);
        }
    }, [iupId, employeeId, contact, value, stage, editingTask, onSubmit]);
    
    const handleIupChange = (iupId: string) => {
        setIupId(iupId);
    };
    const handleEmployeeChange = (employeeId: string) => {
        setEmployeeId(employeeId);
    }
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingTask ? 'Edit Opportunity' : 'Tambah Opportunity Baru'}
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4 m-4">
                <IUPAreaSelectField
                    value={iupId}
                    onChange={handleIupChange}
                    required
                />
                <IUPEmployeeCRMSelectField
                    value={employeeId}
                    onChange={handleEmployeeChange}
                    required
                    label="Sales Employee"
                    placeholder="Cari & pilih sales..."
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kontak
                    </label>
                    <input
                        type="text"
                        placeholder="Nama kontak PIC"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimasi Nilai
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="9.000.000"
                        value={value ? Number(value.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '');
                            setValue(raw || '');
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">Tulis angka saja, otomatis diformat</p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Menyimpan...' : editingTask ? 'Update' : 'Tambah'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default OpportunityModal;
