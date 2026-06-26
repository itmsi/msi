import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { SalesOrder } from '../types/customerDashboard';
import { formatCurrencyDynamic, formatDate } from '@/helpers/generalHelper';

const SalesOrderTable: React.FC<{ 
    salesOrders: SalesOrder[], 
    loading: boolean, 
    Icon?: React.ElementType; 
    iconClassName?: string;
}> = ({ salesOrders, loading, Icon, iconClassName }) => {
    const columns: TableColumn<SalesOrder>[] = [
        {
            name: 'Sales Order No',
            selector: (row) => row.manage_sales_order_no,
            cell: (row) => (
                <div className="items-center">
                    <div className="font-medium text-gray-900">
                        {row.manage_sales_order_no}
                    </div>
                    <div className="block text-sm text-gray-500">{formatDate(row.manage_sales_order_date)} - {formatDate(row.manage_sales_order_valid_date)}</div>
                </div>
            ),
            width: '220px',
        },
        {
            name: 'Product',
            selector: (row) => row?.msi_product || '-',
            sortable: false,
            cell: (row) => (
                <div className="flex-1 items-center gap-3 py-2">
                    <div className="font-medium text-gray-900 flex">
                        {row?.msi_product || '-'}
                    </div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Model',
            selector: (row) => row?.msi_model || '-',
            sortable: false,
            cell: (row) => (
                <div className="flex-1 items-center gap-3 py-2">
                    <div className="font-medium text-gray-900 flex">
                        {row?.msi_model || '-'}
                    </div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Quantity ',
            selector: (row) => row.quantity || 0,
            center: true,
            wrap: true,
            width: '150px',
        },
        {
            name: 'Price',
            selector: (row) => row?.min_price || '-',
            sortable: false,
            cell: (row) => (
                <div className="flex-1 items-center gap-3 py-2">
                    <div className="font-medium text-gray-900 flex">
                        {row.min_price ? formatCurrencyDynamic(row.min_price, 'IDR') : '-'}
                    </div>
                </div>
            ),
            wrap: true,
        },
    ];

    return (<>
        {Icon && <Icon className={`h-4 w-4 absolute top-0 bottom-0 m-auto left-5 opacity-4 z-5 ${iconClassName}`} style={{transform: 'scale(30)'}} />}
        <CustomDataTable
            columns={columns}
            data={salesOrders}
            // headerBackground="#fafafa"
            loading={loading}
            pagination={false}
            highlightOnHover
            striped={false}
            responsive
            fixedHeader
            fixedHeaderScrollHeight="630px"
        />
        </>
    );
};

export default SalesOrderTable;
