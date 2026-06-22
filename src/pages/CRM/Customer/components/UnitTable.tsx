import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { Unit } from '../types/customerDashboard';


const UnitTable: React.FC<{ 
    units: Unit[], 
    loading: boolean, 
    Icon?: React.ElementType; 
    iconClassName?: string;
}> = ({ units, loading, Icon, iconClassName }) => {
    const columns: TableColumn<Unit>[] = [
        {
            name: 'Brand',
            selector: (row) => row.brand_name || '-',
            sortable: false,
            wrap: true,
            width: '150px',
        },
        {
            name: 'Specification',
            selector: (row) => row?.type || '-',
            sortable: false,
            cell: (row) => (
                <div className="flex-1 items-center gap-3 py-2">
                    <div className="font-medium text-gray-900 flex">
                        {row?.specification || '-'}
                    </div>
                    <div className="block text-sm text-gray-500 flex">
                        {row?.type || '-'} {`${row.engine ? `(${row.engine})` : ''}`}
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
        }
    ];

    return (<>
        {Icon && <Icon className={`h-4 w-4 absolute top-0 bottom-0 m-auto left-5 opacity-4 z-5 ${iconClassName}`} style={{transform: 'scale(30)'}} />}
        <CustomDataTable
            columns={columns}
            data={units}
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

export default UnitTable;
