import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { RKAB } from '../types/customerDashboard';
import Badge from '@/components/ui/badge/Badge';

const RkabTable: React.FC<{ 
    rkab: RKAB[], 
    loading: boolean, 
    Icon?: React.ElementType; 
    iconClassName?: string;
}> = ({ rkab, loading, Icon, iconClassName }) => {
    
    const columns: TableColumn<RKAB>[] = [
        {
            name: 'IUP Name',
            selector: (row) => row.nama_iup || '-',
            sortable: false,
            wrap: true,
        },
        {
            name: 'Year',
            selector: (row) => row?.tahun || '-',
            sortable: false,
            wrap: true,
            width: '120px',
        },
        {
            name: 'Target Production ',
            selector: (row) => row.target_production.toLocaleString() || 0,
            center: true,
            wrap: true,
            width: '170px',
        },
        {
            name: 'Current Production ',
            selector: (row) => row.current_production.toLocaleString() || 0,
            center: true,
            wrap: true,
            width: '180px',
        },
        {
            name: 'Achievement',
            cell: (row) => {
                const pct = (row.current_production / row.target_production) * 100;
                const barColor = pct >= 100 ? "#10b981" : pct >= 80 ? "#3b82f6" : "#f59e0b";
                const badgeCls = pct >= 100
                    ? "success"
                    : pct >= 80
                      ? "info"
                      : "warning";

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 min-w-[120px]">
                            <div
                                className="h-2.5 rounded-full"
                                style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                            />
                        </div>
                        <Badge variant="outline" color={badgeCls}>
                            {row.target_production !== 0 ? pct.toFixed(1) : 100}%
                        </Badge>
                    </div>
                )},
            wrap: true,
            width: '250px',
        }
    ];

    return (<>
        {Icon && <Icon className={`h-4 w-4 absolute top-0 bottom-0 m-auto left-5 opacity-4 z-5 ${iconClassName}`} style={{transform: 'scale(30)'}} />}
        <CustomDataTable
            columns={columns}
            data={rkab}
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

export default RkabTable;
