import React, { useEffect } from 'react';
import { ReceiptItem } from '../../types/purchaseorder';
import CustomDataTable from '@/components/ui/table';
import { TableColumn } from 'react-data-table-component';
import { formatTanggal } from '@/helpers/generalHelper';
import { Link } from 'react-router';

interface ReceiptTabProps {
    poId: string | undefined;
    receiptList: ReceiptItem[];
    isLoading: boolean;
    pagination: { page: number; limit: number; total: number; totalPages: number };
    onLoad: () => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number, page: number) => void;
}
const ReceiptTab: React.FC<ReceiptTabProps> = ({
    poId,
    receiptList,
    isLoading,
    pagination,
    onLoad,
    onPageChange,
    onRowsPerPageChange,
}) => {
    useEffect(() => {
        if (poId) onLoad();
    }, [poId]);

    const columns: TableColumn<ReceiptItem>[] = [
        {
            name: 'Date',
            selector: row => row.trandate ? formatTanggal(row.trandate) || '-' : '-',
            wrap: true,
            cell: row => (
                <>
                <Link to={`/netsuite/purchase-order/${poId}/receive/${row.receipt_id}`} className="absolute inset-0" />
                <div className="py-1">
                    <div className="font-medium text-gray-900">{row.trandate ? formatTanggal(row.trandate) || '-' : '-'}</div>
                </div>
                </>
            ),
        },
        {
            name: 'Number',
            selector: row => row.tranid || '-',
            center: true,
        },
        {
            name: 'Status',
            selector: row => row.status_display || '-',
            cell: row => (
                row.status !== '' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d0e6ef] text-gray-800 border border-gray-200 capitalize">
                    {row.status_display || '-'}
                </span>
                ) : '-'
            ),
            center: true,
        }
    ];

    return (
        <div className="p-6 font-secondary">
            <CustomDataTable
                columns={columns}
                data={receiptList}
                loading={isLoading}
                pagination
                paginationServer
                paginationTotalRows={pagination.total || 0}
                paginationPerPage={pagination.limit || 10}
                paginationDefaultPage={pagination.page || 1}
                paginationRowsPerPageOptions={[5, 10, 20, 50]}
                onChangePage={onPageChange}
                onChangeRowsPerPage={onRowsPerPageChange}
                fixedHeader
                fixedHeaderScrollHeight="500px"
                highlightOnHover
                persistTableHead
                responsive
                borderRadius="8px"
            />
        </div>
    );
};

export default ReceiptTab;
