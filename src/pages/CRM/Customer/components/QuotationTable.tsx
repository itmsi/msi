import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { Quotation } from '../types/customerDashboard';

const QuotationTable: React.FC<{ 
    quotations: Quotation[], 
    loading: boolean, 
    Icon?: React.ElementType; 
    iconClassName?: string;
}> = ({ quotations, loading, Icon, iconClassName }) => {
    const columns: TableColumn<Quotation>[] = [
        {
            name: 'Quotation No',
            selector: (row) => row.manage_quotation_no,
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-[#0253a5]">
                        {row.manage_quotation_no}
                    </div>
                </div>
            ),
            width: '220px',
        },
        {
            name: 'Quantity ',
            selector: (row) => row.quantity || 0,
            center: true,
            wrap: true,
            width: '150px',
        },
        {
            name: 'Min',
            selector: (row) => row?.min_price || '-',
            sortable: false,
            cell: (row) => (
                <div className="flex-1 items-center gap-3 py-2">
                    <div className="font-medium text-gray-900 flex">
                        {row?.min_price || '-'}
                    </div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Max',
            selector: (row) => row?.max_price || '-',
            sortable: false,
            cell: (row) => (
                <div className="flex-1 items-center gap-3 py-2">
                    <div className="font-medium text-gray-900 flex">
                        {row?.max_price || '-'}
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
            data={quotations}
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

export default QuotationTable;
