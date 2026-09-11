import React, { useCallback } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Link, useLocation } from 'react-router-dom';
import { MdOutlineSync } from 'react-icons/md';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { createByDateColumn } from '@/components/ui/table/columnUtils';
import { formatDateTime, formatTanggal } from '@/helpers/generalHelper';
import { Pagination, TransferOrderListItem } from '../types/transferOrder';

interface TransferOrderTableProps {
    data: TransferOrderListItem[];
    loading: boolean;
    pagination: Pagination;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (limit: number, page: number) => void;
    onSyncById: (row: TransferOrderListItem) => void;
}

const TransferOrderTable: React.FC<TransferOrderTableProps> = ({
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

    const columns: TableColumn<TransferOrderListItem>[] = [
        {
            name: 'Document Number',
            selector: row => row.tranid || '-',
            cell: row => (<>
                <Link
                    to={`/netsuite/transfer-orders/edit/${row.netsuite_id || row.id}${location.search}`}
                    className="absolute inset-0"
                />
                <div className="items-center py-2">
                    <div className="font-medium text-gray-900">{row.tranid || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatTanggal(row.tran_date || '-')}</div>
                </div>
            </>),
            wrap: true,
            width: '230px',
            pinned: 'left',
        },
        {
            name: 'From Location',
            selector: row => row.from_location_name || '-',
            wrap: true,
            width: '260px',
        },
        {
            name: 'To Location',
            selector: row => row.to_location_name || '-',
            wrap: true,
            width: '260px',
        },
        {
            name: 'Status',
            selector: row => row.status_name || row.status_code || '-',
            cell: row => (
                <div className="items-center capitalize">
                    {row.status_name ? (
                        <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                            {row.status_name}
                        </span>
                    ) : '-'}
                </div>
            ),
            center: true,
            width: '280px'
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            cell: row => (
                <div className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={row.memo || ''}>
                    {row.memo || '-'}
                </div>
            ),
            wrap: true,
            minWidth: '180px',
        },
        {
            id: 'created_by',
            name: 'Created By',
            selector: row => row.netsuite_id || row.id,
            cell: row => (<>
                <Link
                    to={`/netsuite/transfer-orders/edit/${row.netsuite_id || row.id}${location.search}`}
                    className="absolute inset-0"
                />
                <div className="flex flex-col py-2">
                    <span className="font-medium text-gray-900">
                        {row.created_by_name || '-'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.created_at ? formatDateTime(row.created_at) : '-'}
                    </span>
                    <span className="text-xs text-gray-500">
                        TO ID: {row.netsuite_id || '-'}
                    </span>
                </div>
            </>),
            wrap: true,
            width: '320px'
        },
        createByDateColumn('Updated By', 'updated_at', 'updated_by_name', '320px'),
        createActionsColumn([
            {
                icon: MdOutlineSync,
                onClick: onSyncById,
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Sync this TO',
                permission: 'read',
            }
        ]),
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

export default TransferOrderTable;
