import React from 'react'
import { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { PurchaseOrder } from './types/purchaseorder';
import { formatDateTime } from '@/helpers/fileTypeHelper__belumterpakai';

export default function Manage() {
    const navigate = useNavigate();
    
    const columns: TableColumn<PurchaseOrder>[] = [
        {
            name: 'Date',
            selector: row => row.po_number || '-',
            cell: row => (<>
                <a
                    href={`/netsuite/purchase-order/view/${row.id}`}
                    className="absolute inset-0"
                />
                
                <div className="items-center gap-3 py-2">
                    <div className="block text-sm text-gray-500">{formatDateTime(row.po_date)}</div>
                    <div className="font-medium text-gray-900">{row.po_number || '-'}</div>
                </div>
            </>),
            wrap: true,
        },
        {
            name: 'Name',
            selector: row => row.vendor_name || '-',
            wrap: true,
        },
        {
            name: 'Division',
            cell: row => (
                <div className="flex flex-wrap gap-1 py-1">
                    {row.devision_project_names && row.devision_project_names.length > 0
                        ? row.devision_project_names.map((name, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center justify-center rounded-md font-medium px-2 bg-blue-100 text-blue-800 border border-blue-200"
                            >
                                {name}
                            </span>
                        ))
                        : <span className="text-gray-400 text-sm">-</span>
                    }
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.status || '-',
            cell: row => (
                <ActivityTypeBadge
                    type={(row.status as 'Not Started' | 'Find' | 'Pull' | 'Survey' | 'BAST') || 'Not Started'}
                />
            ),
        },
        {
            name: 'Updated By',
            selector: row => row.updated_by_name || '-',
            cell: row => (
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.updated_by_name || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatDateTime(row.updated_at)}</div>
                </div>
            ),
        },
        createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: handleDelete,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ]),
    ];
    return (
        <div>Manage</div>
    )
}
