import React, { useEffect } from 'react';
import { HistoryLogItem } from '../../types/purchaseorder';
import CustomDataTable from '@/components/ui/table';
import { TableColumn } from 'react-data-table-component';
import { formatTanggal } from '@/helpers/generalHelper';
import { Link } from 'react-router';
import { createByDateColumn } from '@/components/ui/table/columnUtils';

interface HistoryReceiptTabProps {
    poId: string | undefined;
    logList: HistoryLogItem[];
    isLoading: boolean;
    onLoad: () => void;
}
const HistoryReceiptTab: React.FC<HistoryReceiptTabProps> = ({
    poId,
    logList,
    isLoading,
    onLoad,
    // onPageChange,
    // onRowsPerPageChange,
}) => {
    useEffect(() => {
        if (poId) onLoad();
    }, [poId]);

    const columns: TableColumn<HistoryLogItem>[] = [
        {
            name: 'Date',
            selector: row => row.trandate ? formatTanggal(row.trandate) || '-' : '-',
            cell: row => (
                <>
                <Link to={`/netsuite/purchase-order/${poId}/receive/${row.id}`} className="absolute inset-0" />
                <div className="py-1">
                    <div className="font-medium text-gray-900">{row.trandate ? formatTanggal(row.trandate) || '-' : '-'}</div>
                </div>
                </>
            ),
            width: '200px',
        },
        {
            name: 'Message',
            selector: row => row.msg_error || '-',
            wrap: true,
        },
        createByDateColumn('Updated By', 'created_at', 'created_by_name'),
    ];

    return (
        <div className="p-6 font-secondary">
            <CustomDataTable
                columns={columns}
                data={logList}
                loading={isLoading}
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

export default HistoryReceiptTab;
