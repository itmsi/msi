import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { TableColumn } from 'react-data-table-component';
import LoadingSpinner from '@/components/common/Loading';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { useIupBrandUnit } from '../../hooks/useIupBrandUnit';
import BrandUnitForm from './UnitForm';
import type { IupBrandUnitItem } from '../../types/iupmanagement';
import { LuPencil, LuTrash2, LuLoaderCircle, LuCheck, LuX } from 'react-icons/lu';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';

const UnitSection: React.FC = () => {
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; iup_brand_unit_id?: string }>({ show: false });

    const {
        dataUnit,
        loading,
        submitting,
        deletingId,
        deleteBrandUnit,
        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,
        submitForm,
    } = useIupBrandUnit();

    const handleSubmitForm = async () => {
        await submitForm();
    };

    const handleDeleteClick = (iupBrandUnitId: string) => {
        setConfirmDelete({ show: true, iup_brand_unit_id: iupBrandUnitId });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.iup_brand_unit_id) {
            return;
        }

        const success = await deleteBrandUnit(confirmDelete.iup_brand_unit_id);
        if (success) {
            setConfirmDelete({ show: false });
        }
    };

    const handleQtyChange = (value: string) => {
        const qty = Number(value);
        updateField('qty', Number.isNaN(qty) ? 0 : qty);
    };

    const handleInlineQtyChange = (value: string) => {
        const qty = Number(value);
        updateField('qty', Number.isNaN(qty) ? 0 : qty);
    };

    const columns: TableColumn<IupBrandUnitItem>[] = [
        {
            name: 'Brand Unit',
            selector: (row) => row.iup_brand_unit_name,
            cell: (row) => {
                const isEditing = editingId === row.iup_brand_unit_id;

                if (isEditing) {
                    return (
                        <div className="w-full py-2">
                            <Input
                                value={form.name}
                                placeholder="Input brand unit"
                                onChange={(e) => updateField('name', e.target.value)}
                                className={errors.name ? 'border-red-500' : ''}
                                hint={errors.name}
                                error={!!errors.name}
                            />
                        </div>
                    );
                }

                return (
                    <div className="py-2">
                        <p className="font-medium text-gray-900">{row.iup_brand_unit_name || '-'}</p>
                    </div>
                );
            },
            wrap: true,
            sortable: false,
        },
        {
            name: 'Qty',
            selector: (row) => row.iup_brand_unit_qty,
            center: true,
            width: '120px',
            cell: (row) => {
                const isEditing = editingId === row.iup_brand_unit_id;

                if (isEditing) {
                    return (
                        <div className="w-full py-2">
                            <Input
                                type="number"
                                min="1"
                                value={form.qty}
                                placeholder="0"
                                onChange={(e) => handleInlineQtyChange(e.target.value)}
                                className={errors.qty ? 'border-red-500' : ''}
                                hint={errors.qty}
                                error={!!errors.qty}
                            />
                        </div>
                    );
                }

                return <span className="font-medium text-gray-700">{row.iup_brand_unit_qty || '-'}</span>;
            },
        },
        {
            name: 'Actions',
            center: true,
            width: '180px',
            ignoreRowClick: true,
            cell: (row) => {
                const isEditing = editingId === row.iup_brand_unit_id;

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
                            onClick={() => handleDeleteClick(row.iup_brand_unit_id)}
                            disabled={deletingId === row.iup_brand_unit_id || submitting}
                        >
                            {deletingId === row.iup_brand_unit_id ? (
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
        <div className="w-full rounded-2xl border border-slate-300 bg-white">
            <div className="px-5 py-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide">Brand Unit</h2>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-8">
                    <LoadingSpinner />
                </div>
            ) : (!dataUnit || dataUnit.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    No brand unit data available. Click &ldquo;Add Unit&rdquo; to add one.
                </div>
            ) : (
                <div className="p-6 font-secondary">
                    <CustomDataTable
                        columns={columns}
                        data={dataUnit}
                        loading={loading}
                        pagination={false}
                        striped={false}
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="420px"
                        dense
                        keyField="iup_brand_unit_id"
                    />
                </div>
            )}
            {showForm && !editingId && (
                <BrandUnitForm
                    editingId={editingId}
                    form={form}
                    errors={errors}
                    submitting={submitting}
                    updateField={updateField}
                    handleQtyChange={handleQtyChange}
                    closeForm={closeForm}
                    handleSubmitForm={handleSubmitForm}
                />
            )}
            {!showForm && (
            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl">
                <button
                    type="button"
                    onClick={openCreateForm}
                    className="flex items-center gap-1.5 text-sm font-medium"
                    disabled={showForm}
                >
                    <LuPlus size={16} className="text-primary" />
                    Add Unit
                </button>
            </div>
            )}

            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={handleConfirmDelete}
                title="Hapus Brand Unit"
                message="Apakah Anda yakin ingin menghapus data brand unit ini?"
                confirmText="Hapus"
                type="danger"
                loading={submitting || Boolean(deletingId)}
            />
        </div>
    );
}

export default UnitSection;