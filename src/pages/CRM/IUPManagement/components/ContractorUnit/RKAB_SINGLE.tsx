import React, { useState } from 'react';
import { LuCheck, LuLoaderCircle, LuPencil, LuPlus, LuTrash2, LuX } from 'react-icons/lu';
import { TableColumn } from 'react-data-table-component';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { LoadingSpinner } from '@/components/common/Loading';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { useIupRkab } from '../../hooks/useIupRkab';
import { handleDecimalInput, handleKeyPress } from '@/helpers/generalHelper';
import type { IupRkab } from '../../types/iupmanagement';

const RkabSection: React.FC = () => {
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; iup_rkab_id?: string }>({ show: false });

    const { 
        dataRkab,
        loading,
        submitting,
        deletingId,
        deleteRkab,

        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,

        submitForm,
    } = useIupRkab();
    
    const handleSubmitForm = async () => {
        await submitForm();
    };

    const handleDeleteClick = (iupRkabId: string) => {
        setConfirmDelete({ show: true, iup_rkab_id: iupRkabId });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.iup_rkab_id) {
            return;
        }

        const success = await deleteRkab(confirmDelete.iup_rkab_id);
        if (success) {
            setConfirmDelete({ show: false });
        }
    };

    const handleNumericChange = (
        field: 'current' | 'target',
        value: string
    ) => {
        handleDecimalInput(
            value,
            (validValue) => updateField(field, validValue),
            () => updateField(field, ''),
            true,
            9,
            4,
        );
    };

    const columns: TableColumn<IupRkab>[] = [
        {
            name: 'Year',
            selector: (row) => row.iup_rkab_year,
            cell: (row) => {
                const isEditing = editingId === row.iup_rkab_id;

                if (isEditing) {
                    return (
                        <div className="w-full py-2">
                            <Input
                                placeholder="YYYY"
                                maxLength={4}
                                value={form.year}
                                onChange={(e) => updateField('year', e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={errors.year ? 'border-red-500' : ''}
                                hint={errors.year}
                                error={!!errors.year}
                            />
                        </div>
                    );
                }

                return <span className="font-medium text-gray-900">{row.iup_rkab_year || '-'}</span>;
            },
            wrap: true,
            sortable: false,
        },
        {
            name: 'Current Production',
            selector: (row) => row.iup_rkab_current_production,
            cell: (row) => {
                const isEditing = editingId === row.iup_rkab_id;

                if (isEditing) {
                    return (
                        <div className="w-full py-2">
                            <Input
                                type="text"
                                placeholder="0"
                                value={form.current}
                                onChange={(e) => handleNumericChange('current', e.target.value)}
                                className={errors.current ? 'border-red-500' : ''}
                                hint={errors.current as string | undefined}
                                error={!!errors.current}
                            />
                        </div>
                    );
                }

                return <span className="font-medium text-gray-700">{row.iup_rkab_current_production || '-'}</span>;
            },
            wrap: true,
        },
        {
            name: 'Target Production',
            selector: (row) => row.iup_rkab_target_production,
            cell: (row) => {
                const isEditing = editingId === row.iup_rkab_id;

                if (isEditing) {
                    return (
                        <div className="w-full py-2">
                            <Input
                                type="text"
                                placeholder="0"
                                value={form.target}
                                onChange={(e) => handleNumericChange('target', e.target.value)}
                                className={errors.target ? 'border-red-500' : ''}
                                hint={errors.target as string | undefined}
                                error={!!errors.target}
                            />
                        </div>
                    );
                }

                return <span className="font-medium text-gray-700">{row.iup_rkab_target_production || '-'}</span>;
            },
            wrap: true,
        },
        {
            name: 'Actions',
            center: true,
            width: '180px',
            ignoreRowClick: true,
            cell: (row) => {
                const isEditing = editingId === row.iup_rkab_id;

                if (isEditing) {
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                className="p-2"
                                onClick={handleSubmitForm}
                                disabled={submitting}
                            >
                                {submitting ? <LuLoaderCircle size={15} className="animate-spin" /> : <LuCheck size={15} />}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="p-2"
                                onClick={closeForm}
                                disabled={submitting}
                            >
                                <LuX size={15} />
                            </Button>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="transparent"
                            size="sm"
                            className="p-2"
                            onClick={() => openEditForm(row)}
                            disabled={submitting}
                        >
                            <LuPencil size={15} />
                        </Button>
                        <Button
                            type="button"
                            variant="transparent"
                            size="sm"
                            className="p-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(row.iup_rkab_id)}
                            disabled={deletingId === row.iup_rkab_id || submitting}
                        >
                            {deletingId === row.iup_rkab_id ? (
                                <LuLoaderCircle size={15} className="animate-spin" />
                            ) : (
                                <LuTrash2 size={15} />
                            )}
                        </Button>
                    </div>
                );
            },
        },
    ];

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

            {loading ? (
                <div className="py-8">
                    <LoadingSpinner />
                </div>
            ) : (!dataRkab || dataRkab.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    Belum ada data RKAB. Klik &ldquo;Add RKAB&rdquo; untuk menambah.
                </div>
            ) : (
                <div className="p-6 font-secondary">
                <CustomDataTable
                    columns={columns}
                    data={dataRkab}
                    loading={loading}
                    pagination={false}
                    striped={false}
                    highlightOnHover
                    responsive
                    fixedHeader
                    fixedHeaderScrollHeight="420px"
                    dense
                    keyField="iup_rkab_id"
                />
                </div>
            )}


            {showForm && !editingId && (
                <div className="px-5 py-4 border-b border-slate-300 bg-slate-50">
                    <p className="text-sm font-primary-bold text-slate-800 mb-3">
                        {editingId ? 'Edit RKAB' : 'Add New RKAB'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <Label htmlFor="rkab-year">Tahun</Label>
                            <Input
                                id="rkab-year"
                                placeholder="YYYY"
                                maxLength={4}
                                value={form.year}
                                onChange={(e) => updateField('year', e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={errors.year ? 'border-red-500' : ''}
                                hint={errors.year}
                                error={!!errors.year}
                            />
                        </div>

                        <div>
                            <Label htmlFor="rkab-current">Current Production</Label>
                            <Input
                                id="rkab-current"
                                type="text"
                                placeholder="0"
                                value={form.current}
                                onChange={(e) => handleNumericChange('current', e.target.value)}
                                className={errors.current ? 'border-red-500' : ''}
                                hint={errors.current as string | undefined}
                                error={!!errors.current}
                            />
                        </div>

                        <div>
                            <Label htmlFor="rkab-target">Target Production</Label>
                            <Input
                                id="rkab-target"
                                type="text"
                                placeholder="0"
                                value={form.target}
                                onChange={(e) => handleNumericChange('target', e.target.value)}
                                className={errors.target ? 'border-red-500' : ''}
                                hint={errors.target as string | undefined}
                                error={!!errors.target}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-[50px] py-2"
                            onClick={closeForm}
                            disabled={submitting}
                        >
                            <LuX size={14} />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="rounded-[50px] py-2"
                            onClick={handleSubmitForm}
                            disabled={submitting}
                        >
                            {submitting ? <LuLoaderCircle size={14} className="animate-spin" /> : <LuCheck size={14} />}
                            {editingId ? 'Update RKAB' : 'Save RKAB'}
                        </Button>
                    </div>
                </div>
            )}
            {!showForm && (
            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl ">
                <button
                    type="button"
                    onClick={openCreateForm}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Tambah RKAB
                </button>
            </div>
            )}
        </div>

        <ConfirmationModal
            isOpen={confirmDelete.show}
            onClose={() => setConfirmDelete({ show: false })}
            onConfirm={handleConfirmDelete}
            title="Hapus RKAB"
            message="Apakah Anda yakin ingin menghapus data RKAB ini?"
            confirmText="Hapus"
            type="danger"
            loading={submitting || Boolean(deletingId)}
        />

        </>
    );
};

export default RkabSection;
