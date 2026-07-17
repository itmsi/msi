import React from 'react';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import IupRkabCard from './RKAB_SINGLE_IupRkabCard';
import { IupRkabFormItem } from '../../types/iupmanagement';
import { LuPlus } from 'react-icons/lu';

interface RkabSectionProps {
    rkabEntries: IupRkabFormItem[];
    errors: Record<number, Record<string, string>>;
    isSubmitting?: boolean;
    onAddRkab: () => void;
    onRemoveRkab: (item: IupRkabFormItem, index: number) => void;
    onRkabChange: (index: number, field: keyof IupRkabFormItem, value: string) => void;
    onSaveRkab: (item: IupRkabFormItem, index: number) => void;
    confirmDelete: { show: boolean; iup_rkab_id?: string };
    setConfirmDelete: (val: { show: boolean; iup_rkab_id?: string }) => void;
    handleConfirmDeleted: () => void;
}

const RkabSection: React.FC<RkabSectionProps> = ({
    rkabEntries,
    errors,
    isSubmitting,
    onAddRkab,
    onRemoveRkab,
    onRkabChange,
    onSaveRkab,
    confirmDelete,
    setConfirmDelete,
    handleConfirmDeleted,
}) => {
    return (
        <>
        <div className="w-full rounded-2xl border border-slate-300 bg-white">
            <div className="px-5 py-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide">RKAB</h2>
                    </div>
                </div>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">Rencana Kerja Anggaran Biaya</p>
            </div>

            {(!rkabEntries || rkabEntries.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    Belum ada data RKAB. Klik &ldquo;Add RKAB&rdquo; untuk menambah.
                </div>
            ) : (
                <div className="divide-slate-300 divide-y">
                    {rkabEntries.map((rkab, index) => (
                        <IupRkabCard
                            key={rkab.iup_rkab_id ?? `new-${index}`}
                            rkab={rkab}
                            index={index}
                            errors={errors[index] ?? {}}
                            isSubmitting={isSubmitting}
                            onChange={(field, value) => onRkabChange(index, field, value)}
                            onSave={() => onSaveRkab(rkab, index)}
                            onRemove={() => onRemoveRkab(rkab, index)}
                        />
                    ))}
                </div>
            )}
            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl ">
                <button
                    type="button"
                    onClick={onAddRkab}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Tambah RKAB
                </button>
            </div>
        </div>

        <ConfirmationModal
            isOpen={confirmDelete.show}
            onClose={() => setConfirmDelete({ show: false })}
            onConfirm={handleConfirmDeleted}
            title="Hapus RKAB"
            message="Apakah Anda yakin ingin menghapus data RKAB ini?"
            confirmText="Hapus"
            type="danger"
            loading={isSubmitting}
        />
        </>
    );
};

export default RkabSection;
