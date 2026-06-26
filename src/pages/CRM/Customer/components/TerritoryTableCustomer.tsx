import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { TerritoryInformation } from '../types/customerDashboard';
import { FaIndustry } from 'react-icons/fa';


const TerritoryTableCustomer: React.FC<{ 
    territory: TerritoryInformation[], 
    loading: boolean,
    Icon?: React.ElementType; 
    iconClassName?: string;
 }> = ({ territory, loading, Icon, iconClassName }) => {
    const columns: TableColumn<TerritoryInformation>[] = [
        {
            name: 'Territory',
            selector: (row) => row?.iup_name || '-',
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900 flex items-center">
                        <FaIndustry className="text-gray-600 text-sm mr-2" /> {row.iup_name}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1 gap">
                        <span className="inline-flex items-center justify-center rounded-md font-medium px-2 bg-blue-100 text-blue-800 border border-blue-200">{`${row.island_name}`}</span>
                        <span className="inline-flex items-center justify-center rounded-md font-medium px-2 bg-green-100 text-green-800 border border-green-200">{`${row.group_name}`}</span>
                        <span className="inline-flex items-center justify-center rounded-md font-medium px-2 bg-orange-100 text-orange-800 border border-orange-200">{`${row.area_name}`}</span>
                        <span className="inline-flex items-center justify-center rounded-md font-medium px-2 bg-purple-100 text-purple-800 border border-purple-200">{`${row.iup_zone_name}`}</span>
                        <span className="inline-flex items-center justify-center rounded-md font-medium px-2 bg-pink-100 text-pink-800 border border-pink-200">{`${row.iup_segmentation_name}`}</span>
                    </div>
                </div>
            ),
            sortable: false,
            wrap: true,
        },
    ];

    return (<>
        {Icon && <Icon className={`h-4 w-4 absolute top-0 bottom-0 m-auto right-[-3rem] opacity-4 z-5 ${iconClassName}`} style={{transform: 'scale(30)'}} />}
        <CustomDataTable
            columns={columns}
            data={territory}
            loading={loading}
            pagination={false}
            highlightOnHover
            striped
            responsive
            fixedHeader
            fixedHeaderScrollHeight="630px"
        />
    </>);
};

export default TerritoryTableCustomer;
