import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table';
import { formatTanggal } from '@/helpers/generalHelper';
import { RelatedFulfillmentReceiptRow, useFulfillmentReceiptTab } from '../../hooks/useFulfillmentReceiptTab';

interface FulfillmentReceiptTabProps {
    tranid: string | undefined;
    toNetsuiteId: string | null | undefined;
}

export default function FulfillmentReceiptTab({ tranid, toNetsuiteId }: FulfillmentReceiptTabProps) {
    const navigate = useNavigate();
    const { items, loading, error, fetchRelated } = useFulfillmentReceiptTab(tranid, toNetsuiteId);

    useEffect(() => {
        fetchRelated();
    }, [fetchRelated]);

    const columns: TableColumn<RelatedFulfillmentReceiptRow>[] = [
        {
            name: 'Date',
            selector: row => row.date || '-',
            cell: row => <span className="text-sm text-gray-700">{row.date ? formatTanggal(row.date) : '-'}</span>,
            width: '150px',
        },
        {
            name: 'Type',
            selector: row => row.type,
            cell: row => (
                <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded-full bg-[#d0e6ef] text-gray-800">
                    {row.type}
                </span>
            ),
            width: '160px',
        },
        {
            name: 'Number',
            selector: row => row.number || '-',
            cell: row => <span className="text-sm font-medium text-gray-900">{row.number || '-'}</span>,
            wrap: true,
            width: '200px',
        },
        {
            name: 'Status',
            selector: row => row.status_label || '-',
            wrap: true,
            width: '200px',
        },
        {
            name: 'Link Type',
            selector: () => 'Receipt/Fulfillment',
            cell: () => <span className="text-sm text-gray-500">Receipt/Fulfillment</span>,
            wrap: true,
        },
    ];

    return (
        <div className="p-6 font-secondary">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
            <CustomDataTable
                columns={columns}
                data={items}
                loading={loading}
                pagination={false}
                responsive
                highlightOnHover
                striped={false}
                onRowClicked={(row) => navigate(row.type === 'Item Fulfillment'
                    ? `/netsuite/fulfillments/view/${row.netsuite_id}`
                    : `/netsuite/receipts/view/${row.netsuite_id}`
                )}
                noDataComponent={
                    <div className="p-6 text-center text-sm text-gray-500">No related Fulfillment or Receipt found</div>
                }
            />
        </div>
    );
}
