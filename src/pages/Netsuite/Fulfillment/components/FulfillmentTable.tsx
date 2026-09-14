import React, { useCallback } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Link, useLocation } from 'react-router-dom';
import { MdOutlineSync } from 'react-icons/md';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { formatDateTime, formatTanggal } from '@/helpers/generalHelper';
import { FulfillmentItem, Pagination } from '../types/fulfillment';

interface FulfillmentTableProps {
    data: FulfillmentItem[];
    loading: boolean;
    pagination: Pagination;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (limit: number, page: number) => void;
    onSyncById: (row: FulfillmentItem) => void;
}

const FulfillmentTable: React.FC<FulfillmentTableProps> = ({
    data,
    loading,
    pagination,
    onChangePage,
    onChangeRowsPerPage,
    onSyncById,
}) => {
    const location = useLocation();
    const handlePageChange = useCallback((page: number) => {
        if (page === (pagination?.page || 1)) return;
        onChangePage(page);
    }, [pagination?.page, onChangePage]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        if (limit === (pagination?.limit || 10) && page === (pagination?.page || 1)) return;
        onChangeRowsPerPage(limit, page);
    }, [pagination?.page, pagination?.limit, onChangeRowsPerPage]);

    const detailPath = (row: FulfillmentItem) => `/netsuite/fulfillments/view/${row.netsuite_id || row.id}${location.search}`;

    const columns: TableColumn<FulfillmentItem>[] = [
        {
            id: 'doc_number',
            name: 'Document Number',
            selector: row => row.number || '-',
            cell: row => (<>
                <Link to={detailPath(row)} className="absolute inset-0" />
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.number || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatTanggal(row.date)}</div>
                </div>
            </>),
            wrap: true,
            width: '230px',
            pinned: 'left'
        },
        {
            id: 'source_type',
            name: 'Type',
            selector: row => row.source_type_display || '-',
            wrap: true,
            width: '200px',
            center: true,
        },
        {
            id: 'entity_name',
            name: 'Vendor / Customer',
            selector: row => row.entity_name || '-',
            cell: row => <span>{row.source_type === 'transfer_order' ? '-' : (row.entity_name || '-')}</span>,
            wrap: true,
            width: '260px',
        },
        {
            id: 'createdfrom',
            name: 'Created From',
            selector: row => row.createdfrom_number || '-',
            wrap: true,
            minWidth: '260px',
        },
        {
            id: 'location',
            name: 'Location',
            selector: row => row.location_display || '-',
            wrap: true,
            width: '220px',
        },
        {
            id: 'transferlocation',
            name: 'Ship To',
            selector: row => row.transferlocation_display || '-',
            wrap: true,
            width: '220px',
        },
        {
            id: 'status',
            name: 'Status',
            selector: row => row.status_label || '-',
            cell: row => (
                <div className="items-center capitalize">
                    {row.status_label ? (
                        <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                            {row.status_label}
                        </span>
                    ) : '-'}
                </div>
            ),
            center: true,
            width: '180px'
        },
        {
            id: 'created_by',
            name: 'Created By',
            selector: row => row.netsuite_id || row.id,
            cell: row => (<>
                <Link to={detailPath(row)} className="absolute inset-0" />
                <div className="flex flex-col py-2">
                    <span className="font-medium text-gray-900">
                        {row.created_by_name || row.created_by_netsuite || '-'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.created_at ? formatDateTime(row.created_at) : '-'}
                    </span>
                    <span className="text-xs text-gray-500">
                        Fulfillment ID: {row.netsuite_id || '-'}
                    </span>
                </div>
            </>),
            wrap: true,
            width: '320px'
        },
        createActionsColumn([
            {
                icon: MdOutlineSync,
                onClick: onSyncById,
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Sync this Fulfillment',
                permission: 'read',
                width: '88px',
            },
        ])
    ];

    return (
        <CustomDataTable
            columns={columns}
            data={data}
            loading={loading}
            pagination
            paginationServer
            paginationTotalRows={pagination?.total || 0}
            paginationPerPage={pagination?.limit || 10}
            paginationDefaultPage={pagination?.page || 1}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
            fixedHeader={true}
            fixedHeaderScrollHeight="625px"
            responsive
            highlightOnHover
            striped={false}
            persistTableHead
            borderRadius="8px"
        />
    );
};

export default FulfillmentTable;
