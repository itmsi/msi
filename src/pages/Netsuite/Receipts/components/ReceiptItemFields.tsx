import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table';
import { ReceiptLineItem } from '../types/receipt';

interface ReceiptItemFieldsProps {
    lines: ReceiptLineItem[];
}

const formatQty = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value || 0);

const formatAmount = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);

// Style tabel item lines disamain dengan Item Lines Transfer Order (TransferOrder/Edit.tsx
// readOnlyItemColumns) — heading di atas, tanpa pagination, cell polos text-sm.
export default function ReceiptItemFields({ lines }: ReceiptItemFieldsProps) {
    const lineColumns: TableColumn<ReceiptLineItem>[] = [
        {
            name: 'Item',
            selector: row => row.item_display || '-',
            cell: row => (
                <div className="py-1">
                    <span className="text-sm font-medium text-gray-900">{row.item_display || '-'}</span>
                    {row.description && <div className="text-xs text-gray-500">{row.description}</div>}
                </div>
            ),
            wrap: true,
            minWidth: '240px',
        },
        {
            name: 'Quantity',
            selector: row => row.quantity,
            cell: row => <span className="text-sm text-right w-full block">{formatQty(row.quantity)}</span>,
            right: true,
            minWidth: '110px',
        },
        {
            name: 'Rate',
            selector: row => row.rate,
            cell: row => <span className="text-sm text-right w-full block">{formatAmount(row.rate)}</span>,
            right: true,
            minWidth: '130px',
        },
        {
            name: 'Amount',
            selector: row => row.amount,
            cell: row => <span className="text-sm font-medium text-right w-full block">{formatAmount(row.amount)}</span>,
            right: true,
            minWidth: '140px',
        },
        {
            name: 'Location',
            selector: row => row.location_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.location_display || '-'}</span>,
            wrap: true,
            minWidth: '180px',
        },
        {
            name: 'Department',
            selector: row => row.department_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.department_display || '-'}</span>,
            wrap: true,
            minWidth: '160px',
        },
        {
            name: 'Class',
            selector: row => row.class_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.class_display || '-'}</span>,
            wrap: true,
            minWidth: '160px',
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            cell: row => <span className="text-sm text-gray-600">{row.memo || '-'}</span>,
            wrap: true,
            minWidth: '180px',
        },
    ];

    return (
        <div className="mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900">Item Lines</h3>
            <div className="font-secondary">
                <CustomDataTable
                    columns={lineColumns}
                    data={lines}
                    pagination={false}
                    responsive
                    highlightOnHover
                    striped={false}
                    noDataComponent={
                        <div className="text-center py-8 text-gray-500">No item lines found</div>
                    }
                />
            </div>
        </div>
    );
}
