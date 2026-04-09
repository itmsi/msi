import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import InputField from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { MdDelete } from 'react-icons/md';
import { FakturDetail } from '../types/faktur';
import { useFakturReferenceSelect } from '../hooks/useFakturReferenceSelect';
import { TableColumn } from 'react-data-table-component';

interface FakturDetailRowProps {
    detail: FakturDetail;
    index: number;
    errors: Record<string, string>;
    onChange: (index: number, field: keyof FakturDetail, value: string | number | null) => void;
    onRemove: (index: number) => void;
    barangJasaSelect: ReturnType<typeof useFakturReferenceSelect>;
    satuanUkurSelect: ReturnType<typeof useFakturReferenceSelect>;
}

// Helper to build column definitions for the FakturDetail table
export function buildFakturDetailColumns(
    errors: Record<string, string>,
    onChange: (index: number, field: keyof FakturDetail, value: string | number | null) => void,
    onRemove: (index: number) => void,
    barangJasaSelect: ReturnType<typeof useFakturReferenceSelect>,
    satuanUkurSelect: ReturnType<typeof useFakturReferenceSelect>,
): TableColumn<FakturDetail & { _index: number }>[] {
    return [
        {
            name: 'Goods/Services',
            cell: (row) => (
                    <CustomAsyncSelect
                        defaultOptions={barangJasaSelect.referenceOptions}
                        value={barangJasaSelect.referenceOptions.find(o => o.value === row.barang_or_jasa) || null}
                        onChange={(val) => onChange(row._index, 'barang_or_jasa', val?.value || '')}
                        onInputChange={barangJasaSelect.handleInputChange}
                        onMenuScrollToBottom={barangJasaSelect.handleMenuScrollToBottom}
                        isLoading={barangJasaSelect.pagination.loading}
                        placeholder="Select"
                        menuPortalTarget={document.body}
                        menuPosition="fixed" className='w-full'
                    />
            ),
            minWidth: '280px',
            sortable: false,
        },
        {
            name: 'Product Code',
            cell: (row) => (
                <div className="w-full">
                    <InputField
                        type="text"
                        value={row.kode_barang_jasa || ''}
                        onChange={(e) => onChange(row._index, 'kode_barang_jasa', e.target.value)}
                        className="w-full border-1 rounded p-1 px-2 text-sm"
                    />
                </div>
            ),
            minWidth: '280px',
            sortable: false,
        },
        {
            name: 'Item Name',
            cell: (row) => (
                <div className="w-full">
                    <InputField
                        type="text"
                        value={row.nama_barang_or_jasa || ''}
                        onChange={(e) => onChange(row._index, 'nama_barang_or_jasa', e.target.value)}
                        className={`border-1 rounded p-1 px-2 w-full text-sm ${errors[`detail_${row._index}_nama_barang_or_jasa`] ? 'border-red-500' : ''}`}
                        placeholder="Item name"
                    />
                    {errors[`detail_${row._index}_nama_barang_or_jasa`] && (
                        <span className="text-red-500 text-xs mt-1 block">
                            {errors[`detail_${row._index}_nama_barang_or_jasa`]}
                        </span>
                    )}
                </div>
            ),
            minWidth: '400px',
            sortable: false,
        },
        {
            name: 'Unit of Measure',
            cell: (row) => (
                <div className="w-full">
                    <CustomAsyncSelect
                        defaultOptions={satuanUkurSelect.referenceOptions}
                        value={satuanUkurSelect.referenceOptions.find(o => o.value === row.nama_satuan_ukur) || null}
                        onChange={(val) => onChange(row._index, 'nama_satuan_ukur', val?.value || '')}
                        onInputChange={satuanUkurSelect.handleInputChange}
                        onMenuScrollToBottom={satuanUkurSelect.handleMenuScrollToBottom}
                        isLoading={satuanUkurSelect.pagination.loading}
                        placeholder="Select"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
            ),
            minWidth: '280px',
            sortable: false,
        },
        {
            name: 'Quantity',
            cell: (row) => (
                <div className="w-full">
                    <InputField
                        type="number"
                        value={row.jumlah_barang_jasa ?? ''}
                        // onChange={(e) => onChange(row._index, 'jumlah_barang_jasa', Number(e.target.value))}
                        // onFocus={(e) => e.target.select()}
                        className="border-1 rounded p-1 px-2 text-center text-sm disabled:bg-gray-100"
                        placeholder="0" 
                        disabled
                    />
                </div>
            ),
            minWidth: '150px',
            center: true,
            sortable: false,
        },
        {
            name: 'Unit Price',
            cell: (row) => (
                <div className="w-full">
                <InputField
                    type="number"
                    value={row.harga_satuan ?? ''}
                    // onChange={(e) => onChange(row._index, 'harga_satuan', Number(e.target.value))}
                    // onFocus={(e) => e.target.select()}
                    className="border-1 rounded p-1 px-2 text-center text-sm disabled:bg-gray-100"
                    placeholder="0" 
                    disabled
                />
                </div>
            ),
            minWidth: '280px',
            center: true,
            sortable: false,
        },
        {
            name: 'Total Discount',
            cell: (row) => (
                <div className="w-full">
                    <InputField
                        type="number"
                        value={row.total_diskon ?? ''}
                        // onChange={(e) => onChange(row._index, 'total_diskon', Number(e.target.value))}
                        // onFocus={(e) => e.target.select()}
                        className="border-1 rounded p-1 px-2 text-center text-sm disabled:bg-gray-100"
                        placeholder="0" 
                        disabled
                    />
                </div>
            ),
            minWidth: '280px',
            center: true,
            sortable: false,
        },
        {
            name: 'DPP',
            cell: (row) => (
                <div className="w-full">
                    <InputField
                        type="number"
                        value={row.dpp ?? ''}
                        // onChange={(e) => onChange(row._index, 'dpp', Number(e.target.value))}
                        // onFocus={(e) => e.target.select()}
                        className="border-1 rounded p-1 px-2 text-center text-sm disabled:bg-gray-100"
                        placeholder="0" 
                        disabled
                    />
                </div>
            ),
            minWidth: '280px',
            center: true,
            sortable: false,
        },
        {
            name: 'VAT Rate (%)',
            cell: (row) => (
                <div className="w-full">
                    <InputField
                            type="number"
                            value={row.tarif_ppn ?? ''}
                            // onChange={(e) => onChange(row._index, 'tarif_ppn', Number(e.target.value))}
                            // onFocus={(e) => e.target.select()}
                            className="border-1 rounded p-1 px-2 text-center text-sm disabled:bg-gray-100"
                            placeholder="0" 
                            disabled
                        />
                </div>
            ),
            minWidth: '150px',
            center: true,
            sortable: false,
        },
        {
            name: 'VAT Amount',
            cell: (row) => (
                <div className="w-full">
                    <InputField
                        type="number"
                        value={row.ppn ?? ''}
                        // onChange={(e) => onChange(row._index, 'ppn', Number(e.target.value))}
                        // onFocus={(e) => e.target.select()}
                        className="border-1 rounded p-1 px-2 text-center text-sm disabled:bg-gray-100"
                        placeholder="0" 
                        disabled
                    />
                </div>
            ),
            minWidth: '280px',
            center: true,
            sortable: false,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(row._index)}
                    className="p-1 text-red-600 hover:text-red-800 border-red-200 hover:bg-red-50"
                >
                    <MdDelete size={16} />
                </Button>
            ),
            width: '80px',
            center: true,
            sortable: false,
        },
    ];
}

// Legacy card component — kept as named export for any residual imports
export default function FakturDetailsCard(_props: FakturDetailRowProps) {
    return null;
}
