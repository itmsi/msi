import React, { useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { MdDeleteOutline } from 'react-icons/md';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/form/input/TextArea';
import InputField from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomDataTable from '@/components/ui/table';
import { PasteItemRow, ResolvedPasteItem, useItemNamesResolver } from '@/hooks/useItemNamesResolver';

interface PasteItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (items: ResolvedPasteItem[]) => void;
    itemTypeIds?: string[];
    existingInternalIds: string[];
}

const STATUS_LABEL: Record<PasteItemRow['status'], { label: string; className: string }> = {
    found: { label: 'Found', className: 'bg-green-50 text-green-700 border-green-200' },
    ambiguous: { label: 'Ambiguous', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    not_found: { label: 'Not Found', className: 'bg-red-50 text-red-700 border-red-200' },
    duplicate: { label: 'Duplicate', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const PasteItemsModal: React.FC<PasteItemsModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemTypeIds,
    existingInternalIds,
}) => {
    const [pasteText, setPasteText] = useState('');

    const {
        rows,
        summary,
        resolvedItems,
        loading,
        error,
        resolveText,
        selectMatch,
        updateQuantity,
        removeRow,
        reset,
    } = useItemNamesResolver(itemTypeIds);

    const handleClose = () => {
        setPasteText('');
        reset();
        onClose();
    };

    const handleValidate = () => {
        resolveText(pasteText, existingInternalIds);
    };

    const handleConfirm = () => {
        onConfirm(resolvedItems);
        handleClose();
    };

    const handleCopyFailed = () => {
        const failedRows = rows
            .filter(row => row.status !== 'found')
            .map(row => `${row.name}\t${row.quantity}`)
            .join('\n');

        if (failedRows) navigator.clipboard?.writeText(failedRows);
    };

    const columns: TableColumn<PasteItemRow>[] = [
        {
            name: 'No',
            selector: row => row.rowNumber,
            width: '70px',
            center: true,
        },
        {
            name: 'Display Name (Excel)',
            selector: row => row.name,
            cell: row => (
                <div className="py-2 font-medium text-gray-900">{row.name}</div>
            ),
            wrap: true,
            minWidth: '220px',
        },
        {
            name: 'Qty',
            selector: row => row.quantity,
            cell: row => (
                <InputField
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateQuantity(row.key, Number(e.target.value))}
                    className="h-9 py-1 w-24 text-sm"
                    min="1"
                />
            ),
            width: '120px',
            center: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            cell: row => (
                <span className={`inline-flex items-center justify-center px-3 py-1 text-xs border rounded-full font-medium ${STATUS_LABEL[row.status].className}`}>
                    {STATUS_LABEL[row.status].label}
                </span>
            ),
            width: '140px',
            center: true,
        },
        {
            name: 'Item Master',
            selector: row => row.selectedInternalId || '',
            cell: row => {
                if (row.status === 'not_found') {
                    return <span className="text-sm text-gray-400">Tidak ditemukan di master item</span>;
                }

                // Baris ambigu dan duplikat tetap bisa diganti pilihannya oleh user
                if (row.matches.length > 1) {
                    const options = row.matches.map(match => ({
                        value: match.internalId,
                        label: `${match.itemId} — ${match.displayName}`,
                    }));

                    return (
                        <div className="w-full py-2">
                            <CustomSelect
                                id={`match-${row.key}`}
                                name={`match-${row.key}`}
                                value={options.find(option => option.value === row.selectedInternalId) || null}
                                onChange={(selected) => selectMatch(row.key, selected?.value || null)}
                                options={options}
                                placeholder={`Pilih 1 dari ${options.length} kandidat`}
                                isClearable={true}
                                isSearchable={true}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                className="w-full"
                            />
                        </div>
                    );
                }

                const match = row.matches[0];
                return (
                    <div className="items-center py-2">
                        <div className="font-medium text-gray-900">{match?.itemId || '-'}</div>
                        <div className="block text-sm text-gray-500">{match?.displayName || '-'}</div>
                    </div>
                );
            },
            wrap: true,
            minWidth: '320px',
        },
        {
            name: '',
            cell: row => (
                <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Hapus baris"
                >
                    <MdDeleteOutline size={18} />
                </button>
            ),
            width: '70px',
            center: true,
        },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Paste Items from Excel"
            description="Salin kolom Display Name dan Quantity dari Excel, lalu tempel di bawah ini"
            className="max-w-6xl"
        >
            <div className="p-6 space-y-4 font-secondary">
                <div>
                    <TextArea
                        name="paste_items"
                        rows={5}
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={'WASHER\t5\nSEAL RING\t10'}
                        className="font-mono text-sm"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                            Satu baris satu item. Kolom kedua diisi quantity, kalau kosong dianggap 1.
                        </p>
                        <Button
                            type="button"
                            onClick={handleValidate}
                            disabled={!pasteText.trim() || loading}
                            size="sm"
                            className={(!pasteText.trim() || loading) ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            {loading ? 'Memvalidasi...' : 'Validasi ke Master Item'}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {rows.length > 0 && (
                    <>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                                Total {summary.total}
                            </span>
                            <span className="px-3 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                                Found {summary.found}
                            </span>
                            <span className="px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                                Ambiguous {summary.ambiguous}
                            </span>
                            <span className="px-3 py-1 rounded-full border bg-red-50 text-red-700 border-red-200">
                                Not Found {summary.notFound}
                            </span>
                            <span className="px-3 py-1 rounded-full border bg-gray-100 text-gray-600 border-gray-200">
                                Duplicate {summary.duplicate}
                            </span>
                        </div>

                        {summary.ambiguous > 0 && (
                            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                                Ada {summary.ambiguous} nama yang cocok ke lebih dari satu item. Pilih item yang benar dahulu supaya bisa ditambahkan.
                            </p>
                        )}

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <CustomDataTable
                                columns={columns}
                                data={rows}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 20, 50]}
                                responsive
                                highlightOnHover={false}
                                striped={false}
                                persistTableHead
                                borderRadius="8px"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-gray-200">
                <div>
                    {rows.length > 0 && summary.found < summary.total && (
                        <Button
                            type="button"
                            onClick={handleCopyFailed}
                            variant="outline"
                            size="sm"
                        >
                            Copy baris yang gagal
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Button type="button" onClick={handleClose} variant="outline" size="sm">
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={resolvedItems.length === 0}
                        size="sm"
                        className={resolvedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        Tambahkan {resolvedItems.length} item
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PasteItemsModal;
