import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table';
import { FulfillmentLineItem } from '../types/fulfillment';

interface FulfillmentItemFieldsProps {
    lines: FulfillmentLineItem[];
}

const formatQty = (value: number | string) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);

// Style tabel item lines disamain dengan Item Lines Transfer Order (TransferOrder/Edit.tsx
// readOnlyItemColumns) — heading di atas, tanpa pagination, cell polos text-sm.
export default function FulfillmentItemFields({ lines }: FulfillmentItemFieldsProps) {
    const lineColumns: TableColumn<FulfillmentLineItem>[] = [
        {
            name: 'Item',
            selector: row => row.item_display || '-',
            cell: row => (
                <div className="py-1">
                    <span className="text-sm font-medium text-gray-900">{row.item_display || '-'}</span>
                    {row.memo && <div className="text-xs text-gray-500">{row.memo}</div>}
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
            name: 'Units',
            selector: row => row.units_display || row.units || '-',
            cell: row => <span className="text-sm text-center w-full block">{row.units_display || row.units || '-'}</span>,
            center: true,
            minWidth: '90px',
        },
        {
            name: 'Location',
            selector: row => row.location_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.location_display || '-'}</span>,
            wrap: true,
            minWidth: '200px',
        },
        {
            name: 'Department',
            selector: row => row.department_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.department_display || '-'}</span>,
            wrap: true,
            minWidth: '180px',
        },
        {
            name: 'Class',
            selector: row => row.class_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.class_display || '-'}</span>,
            wrap: true,
            minWidth: '160px',
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
