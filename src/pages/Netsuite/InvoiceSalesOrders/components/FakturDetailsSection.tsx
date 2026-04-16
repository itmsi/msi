import Button from '@/components/ui/button/Button';
import { MdAdd } from 'react-icons/md';
import { FakturDetail } from '../types/faktur';
import { buildFakturDetailColumns } from './FakturDetailsCard';
import { useFakturReferenceSelect } from '../hooks/useFakturReferenceSelect';
import CustomDataTable from '@/components/ui/table';

interface FakturDetailsSectionProps {
    details: FakturDetail[];
    errors: Record<string, string>;
    onAddDetail: () => void;
    onRemoveDetail: (index: number) => void;
    onChangeDetail: (index: number, field: keyof FakturDetail, value: string | number | null) => void;
    barangJasaSelect: ReturnType<typeof useFakturReferenceSelect>;
    satuanUkurSelect: ReturnType<typeof useFakturReferenceSelect>;
    // Summary values computed by parent from formData.details (guaranteed reactive)
    summaryTotalQty: number;
    summarySubtotal: number;
    summaryTax: number;
    summaryGrandTotal: number;
}

export default function FakturDetailsSection({
    details,
    errors,
    onAddDetail,
    onRemoveDetail,
    onChangeDetail,
    barangJasaSelect,
    satuanUkurSelect,
    summaryTotalQty,
    summarySubtotal,
    summaryTax,
    summaryGrandTotal,
}: FakturDetailsSectionProps) {
    // Inject row index into each row so column cells can reference it
    const tableData = details.map((d, i) => ({ ...d, _index: i }));

    const columns = buildFakturDetailColumns(
        errors,
        onChangeDetail,
        onRemoveDetail,
        barangJasaSelect,
        satuanUkurSelect,
    );

    const formatIDR = (value: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2,
        }).format(value);

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-6 min-h-[300px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">Invoice Line Items</h3>
                <Button
                    type="button"
                    onClick={onAddDetail}
                    className="flex items-center gap-2"
                >
                    <MdAdd size={16} />
                    Add Row
                </Button>
            </div>

            {/* Table or empty state */}
            {tableData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-lg mb-2">No line items yet</p>
                    <p className="text-sm">Click "Add Row" to add a detail line item.</p>
                </div>
            ) : (
                <div className="font-secondary">
                    <CustomDataTable
                        columns={columns}
                        data={tableData}
                        pagination={false}
                        responsive
                        striped={false}
                        highlightOnHover
                        noDataComponent={
                            <div className="text-center py-8 text-gray-500">
                                No line items yet
                            </div>
                        }
                    />
                </div>
            )}

            {/* ── Summary Panel — values fed from parent formData.details (always reactive) ── */}
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-1">
                {/* Total Items */}
                <div className="flex justify-between items-center text-sm py-2 mt-2">
                    <span className="font-medium text-blue-600">Total Items</span>
                    <span className="text-gray-700">
                        {details.length} item{details.length !== 1 ? 's' : ''}
                        {summaryTotalQty > 0 ? ` (${summaryTotalQty.toLocaleString('id-ID')} qty)` : ''}
                    </span>
                </div>

                {/* Subtotal (DPP) */}
                <div className="flex justify-between items-center text-sm text-gray-600 py-2">
                    <span>Subtotal (DPP)</span>
                    <span>{formatIDR(summarySubtotal)}</span>
                </div>

                {/* Tax (PPN) */}
                <div className="flex justify-between items-center text-sm text-gray-600 py-2">
                    <span>Tax (PPN)</span>
                    <span>{formatIDR(summaryTax)}</span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center text-base border-t border-gray-200 pt-3 mt-2">
                    <span className="font-primary-bold text-gray-900">Grand Total</span>
                    <span className="font-primary-bold text-blue-700">{formatIDR(summaryGrandTotal)}</span>
                </div>
            </div>
        </div>
    );
}
