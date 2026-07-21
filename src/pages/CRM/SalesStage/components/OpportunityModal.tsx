import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { toast } from 'react-hot-toast';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useIupSelect } from '@/hooks/useIupSelect';
import { useEmployeeSelect } from '@/hooks/useEmployeeSelect';
import type { SalesStageOpportunity, SalesStageCreateRequest } from '../types/salesStage';

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
    const initialized = useRef(false);

    const {
        iupOptions,
        handleInputChange: handleIupInputChange,
        handleMenuScrollToBottom: handleIupScroll,
        initializeOptions: initIup,
        loadIupOptions,
    } = useIupSelect();

    const {
        employeeOptions,
        setActiveSales,
        handleInputChange: handleEmpInputChange,
        handleMenuScrollToBottom: handleEmpScroll,
        initializeOptions: initEmp,
        loadEmployeeOptions,
    } = useEmployeeSelect();

    // Set sales filter & initialize on modal open
    useEffect(() => {
        if (isOpen && !initialized.current) {
            initialized.current = true;
            setActiveSales(true);
            initIup();
            initEmp();
        }
        if (!isOpen) {
            initialized.current = false;
        }
    }, [isOpen, initIup, initEmp, setActiveSales]);

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

    const selectedIup = iupOptions.find(o => o.value === iupId) || null;
    const selectedEmp = employeeOptions.find(o => o.value === employeeId) || null;

    // loadOptions functions for CustomAsyncSelect
    const loadIupForSelect = useCallback(async (inputValue: string) => {
        return await loadIupOptions(inputValue, [], 1, true);
    }, [loadIupOptions]);

    const loadEmpForSelect = useCallback(async (inputValue: string) => {
        return await loadEmployeeOptions(inputValue, [], 1, true, true);
    }, [loadEmployeeOptions]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingTask ? 'Edit Opportunity' : 'Tambah Opportunity Baru'}
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4 m-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        IUP <span className="text-red-500">*</span>
                    </label>
                    <CustomAsyncSelect
                        defaultOptions={iupOptions}
                        loadOptions={loadIupForSelect}
                        value={selectedIup}
                        onChange={(option) => setIupId(option?.value || '')}
                        onInputChange={handleIupInputChange}
                        onMenuScrollToBottom={handleIupScroll}
                        placeholder="Cari & pilih IUP..."
                        noOptionsMessage={() => 'IUP tidak ditemukan'}
                        loadingMessage={() => 'Mencari IUP...'}
                        isClearable
                        isSearchable
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sales Employee <span className="text-red-500">*</span>
                    </label>
                    <CustomAsyncSelect
                        defaultOptions={employeeOptions}
                        loadOptions={loadEmpForSelect}
                        value={selectedEmp}
                        onChange={(option) => setEmployeeId(option?.value || '')}
                        onInputChange={handleEmpInputChange}
                        onMenuScrollToBottom={handleEmpScroll}
                        placeholder="Cari & pilih sales..."
                        noOptionsMessage={() => 'Sales tidak ditemukan'}
                        loadingMessage={() => 'Mencari sales...'}
                        isClearable
                        isSearchable
                    />
                </div>
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
