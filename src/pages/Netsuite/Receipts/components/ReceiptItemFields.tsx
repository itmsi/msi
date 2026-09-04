import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table';
import { ReceiptLineItem } from '../types/receipt';

interface ReceiptItemFieldsProps {
    lines: ReceiptLineItem[];
    sourceType?: string | null;
}

const formatQty = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value || 0);

const formatAmount = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);

// Style tabel item lines disamain dengan Item Lines Transfer Order (TransferOrder/Edit.tsx
// readOnlyItemColumns) — heading di atas, tanpa pagination, cell polos text-sm.
export default function ReceiptItemFields({ lines, sourceType }: ReceiptItemFieldsProps) {
    // Rate/Amount/Currency cuma relevan untuk receipt yang berkaitan dengan PO
    // (ada nilai pembelian) — Transfer Order & Customer Return tidak punya kolom
    // ini di UI NetSuite.
    const showCost = sourceType === 'purchase_order' || sourceType === 'inbound_shipment';
    // "Restock?" cuma muncul untuk Item Receipt hasil Customer Return.
    const showRestock = sourceType === 'customer_return';

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
            name: 'On Hand',
            selector: row => row.on_hand ?? '-',
            cell: row => <span className="text-sm text-right w-full block">{row.on_hand !== null && row.on_hand !== undefined ? formatQty(row.on_hand) : '-'}</span>,
            right: true,
            minWidth: '100px',
        },
        {
            name: 'Quantity',
            selector: row => row.quantity,
            cell: row => <span className="text-sm text-right w-full block">{formatQty(row.quantity)}</span>,
            right: true,
            minWidth: '110px',
        },
        ...(showCost
            ? [
                {
                    name: 'Rate',
                    selector: (row: ReceiptLineItem) => row.rate,
                    cell: (row: ReceiptLineItem) => <span className="text-sm text-right w-full block">{formatAmount(row.rate)}</span>,
                    right: true,
                    minWidth: '130px',
                },
                {
                    name: 'Currency',
                    selector: (row: ReceiptLineItem) => row.currency_display || '-',
                    cell: (row: ReceiptLineItem) => <span className="text-sm text-center w-full block">{row.currency_display || '-'}</span>,
                    center: true,
                    minWidth: '100px',
                },
                {
                    name: 'Amount',
                    selector: (row: ReceiptLineItem) => row.amount,
                    cell: (row: ReceiptLineItem) => <span className="text-sm font-medium text-right w-full block">{formatAmount(row.amount)}</span>,
                    right: true,
                    minWidth: '140px',
                },
            ]
            : []),
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
            name: 'Landed Cost',
            selector: row => row.landed_cost ?? '-',
            cell: row => <span className="text-sm text-right w-full block">{row.landed_cost !== null && row.landed_cost !== undefined && row.landed_cost !== '' ? formatAmount(Number(row.landed_cost)) : '-'}</span>,
            right: true,
            minWidth: '130px',
        },
        ...(showRestock
            ? [
                {
                    name: 'Restock?',
                    selector: (row: ReceiptLineItem) => (row.restock ? 'Yes' : 'No'),
                    cell: (row: ReceiptLineItem) => <span className="text-sm text-center w-full block">{row.restock ? 'Yes' : 'No'}</span>,
                    center: true,
                    minWidth: '100px',
                },
            ]
            : []),
        {
            name: 'Project Segmentation',
            selector: row => row.cseg_msi_pro_segmen_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.cseg_msi_pro_segmen_display || '-'}</span>,
            wrap: true,
            minWidth: '180px',
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
