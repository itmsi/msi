import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table';
import { InventoryAdjustmentLineItem } from '../types/inventoryAdjustment';

interface InventoryAdjustmentItemFieldsProps {
    lines: InventoryAdjustmentLineItem[];
}

const formatQty = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);

const formatAmount = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);

// Urutan & label kolom disamain persis dengan sublist "Inventory Adjustment" di
// UI NetSuite, kecuali kolom Item: label atas/bawah (item_displayname/item_display)
// sengaja dibuat berbeda dari NetSuite (satu kolom "Item" biasa) atas permintaan.
export default function InventoryAdjustmentItemFields({ lines }: InventoryAdjustmentItemFieldsProps) {
    const lineColumns: TableColumn<InventoryAdjustmentLineItem>[] = [
        {
            name: 'Item',
            selector: row => row.item_display || '-',
            cell: row => (
                <div className="py-1">
                    <span className="text-sm font-medium text-gray-900">{row.item_displayname || '-'}</span>
                    {row.item_display && <div className="text-xs text-gray-500">{row.item_display}</div>}
                </div>
            ),
            wrap: true,
            minWidth: '220px',
        },
        {
            name: 'Description',
            selector: row => row.description || '-',
            cell: row => <span className="text-sm text-gray-600">{row.description || '-'}</span>,
            wrap: true,
            minWidth: '180px',
        },
        {
            name: 'Location',
            selector: row => row.location_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.location_display || '-'}</span>,
            wrap: true,
            minWidth: '160px',
        },
        {
            name: 'Units',
            selector: row => row.units_display || row.units || '-',
            cell: row => <span className="text-sm text-center w-full block">{row.units_display || row.units || '-'}</span>,
            center: true,
            minWidth: '90px',
        },
        {
            name: 'Qty. On Hand',
            selector: row => row.quantityonhand ?? '-',
            cell: row => <span className="text-sm text-right w-full block">{row.quantityonhand !== null && row.quantityonhand !== undefined ? formatQty(row.quantityonhand) : '-'}</span>,
            right: true,
            minWidth: '110px',
        },
        {
            name: 'Current Value',
            selector: row => row.currentvalue ?? '-',
            cell: row => <span className="text-sm text-right w-full block">{row.currentvalue !== null && row.currentvalue !== undefined && row.currentvalue !== '' ? formatAmount(row.currentvalue) : '-'}</span>,
            right: true,
            minWidth: '130px',
        },
        {
            name: 'Department',
            selector: row => row.department_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.department_display || '-'}</span>,
            wrap: true,
            minWidth: '150px',
        },
        {
            name: 'Class',
            selector: row => row.class_display || '-',
            cell: row => <span className="text-sm text-gray-600">{row.class_display || '-'}</span>,
            wrap: true,
            minWidth: '150px',
        },
        {
            name: 'Adjust Qty. By',
            selector: row => row.adjustqtyby ?? row.quantity,
            cell: row => <span className="text-sm text-right w-full block">{formatQty(row.adjustqtyby ?? row.quantity)}</span>,
            right: true,
            minWidth: '120px',
        },
        {
            name: 'New Quantity',
            selector: row => row.newquantity ?? '-',
            cell: row => <span className="text-sm text-right w-full block">{row.newquantity !== null && row.newquantity !== undefined ? formatQty(row.newquantity) : '-'}</span>,
            right: true,
            minWidth: '120px',
        },
        {
            name: 'Est. Unit Cost',
            selector: row => row.custcol_me_proposed_unit_cost ?? row.unit_cost ?? '-',
            cell: row => {
                const value = row.custcol_me_proposed_unit_cost ?? row.unit_cost;
                return <span className="text-sm text-right w-full block">{value !== null && value !== undefined ? formatAmount(value) : '-'}</span>;
            },
            right: true,
            minWidth: '130px',
        },
        {
            name: 'Proposed Lot Quantity',
            selector: row => row.custcol_me_proposed_lot_qty ?? '-',
            cell: row => <span className="text-sm text-right w-full block">{row.custcol_me_proposed_lot_qty !== null && row.custcol_me_proposed_lot_qty !== undefined ? formatQty(row.custcol_me_proposed_lot_qty) : '-'}</span>,
            right: true,
            minWidth: '150px',
        },
        {
            name: 'Proposed Lot Number (+)',
            selector: row => row.custcol_me_proposed_lot_num_txt || '-',
            cell: row => <span className="text-sm text-gray-600">{row.custcol_me_proposed_lot_num_txt || '-'}</span>,
            wrap: true,
            minWidth: '170px',
        },
        {
            name: 'Proposed Lot Number (-)',
            selector: row => row.custcol_me_proposed_lot_num_neg_txt || '-',
            cell: row => <span className="text-sm text-gray-600">{row.custcol_me_proposed_lot_num_neg_txt || '-'}</span>,
            wrap: true,
            minWidth: '170px',
        },
        {
            name: 'Inventory Detail',
            selector: row => row.inventorydetail ?? '-',
            cell: row => <span className="text-sm text-gray-600">{row.inventorydetail ?? '-'}</span>,
            wrap: true,
            minWidth: '130px',
        },
        {
            name: 'ME - Purchase Number (Line)',
            selector: row => row.custcol_me_purchase_number_line || '-',
            cell: row => <span className="text-sm text-gray-600">{row.custcol_me_purchase_number_line || '-'}</span>,
            wrap: true,
            minWidth: '190px',
        },
        {
            name: 'ME - Landed Cost (IA)',
            selector: row => row.custcol_me_landed_cost_ia ?? '-',
            cell: row => <span className="text-sm text-right w-full block">{row.custcol_me_landed_cost_ia !== null && row.custcol_me_landed_cost_ia !== undefined && row.custcol_me_landed_cost_ia !== '' ? formatAmount(row.custcol_me_landed_cost_ia) : '-'}</span>,
            right: true,
            minWidth: '150px',
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
