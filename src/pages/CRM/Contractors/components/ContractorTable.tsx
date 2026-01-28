import React from 'react';
import { TableColumn } from 'react-data-table-component';
import { Contractor } from '../types/contractor';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { createActionsColumn } from '@/components/ui/table';
import { formatDateTime, formatPhoneNumber } from '@/helpers/generalHelper';
import { FaIndustry } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { MdDeleteOutline } from 'react-icons/md';
import { ActivityTypeBadge } from './ContractorBadges';
import { ActiveStatusBadge } from '@/components/ui/badge';
import Badge from '@/components/ui/badge/Badge';

interface ContractorTableProps {
    contractors: Contractor[];
    loading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (limit: number, page: number) => void;
    onDelete?: (contractor: Contractor) => void;
}

const ContractorTable: React.FC<ContractorTableProps> = ({
    contractors,
    loading,
    pagination,
    onPageChange,
    onRowsPerPageChange,
    onDelete,
    // onRowClick,
}) => {
    const navigate = useNavigate();
    const columns: TableColumn<Contractor>[] = [
        {
            name: 'Customer Name',
            selector: (row) => row.customer_name,
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">
                        {row?.customer_name || '-'}
                    </div>
                    <div className="block text-sm text-gray-500">
                        {row?.customer_code && row?.customer_email 
                            ? `${row.customer_email} - ${row.customer_code}`
                            : row?.customer_code || row?.customer_email || '-'
                        }
                    </div>
                    <div className="block text-sm text-gray-500">{`${row?.customer_phone ? formatPhoneNumber(row.customer_phone) : '-'}`}</div>
                </div>
            ),
            sortable: false,
            wrap: true,
            width: '280px',
        },
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
                    </div>
                </div>
            ),
            sortable: false,
            wrap: true,
            width: '280px',
        },
        {
            name: 'Segmentation',
            selector: (row) => row?.segmentation_name_en || '-',
            wrap: true,
        },
        {
            name: 'BIM (%)',
            selector: (row) => row?.bim_persen || '-',
            wrap: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Fleet Count',
            selector: (row) => row.armada,
            center: true,
            wrap: true,
            cell: (row) => <Badge variant='outline'>{row.armada}</Badge>,
        },
        {
            name: 'Contractor',
            selector: (row) => row?.type || '-',
            cell: (row) => <Badge variant='light' color='info'>{row?.type === 'contractor' ? 'Contractor' : row?.type === 'sub_contractor' ? 'Sub Contractor' : '-'}</Badge>,
            sortable: false,
            wrap: true,
            width: '150px',
            center: true,
        },
        {
            name: 'Activity',
            selector: (row) => row?.activity_status || 'find',
            cell: (row) => <ActivityTypeBadge type={(row?.activity_status as 'find' | 'pull' | 'survey') || 'find'} />,
            sortable: false,
            wrap: true,
            center: true,
        },
        {
            name: 'Status',
            selector: (row) => row?.status || 'inactive',
            cell: (row) => <ActiveStatusBadge status={(row?.status as 'active' | 'inactive') || 'inactive'} />,
            width: '120px',
            center: true,
            wrap: true,
        },
        {
            name: 'Updated By',
            selector: row => row.updated_by_name,
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">
                        {row?.updated_by_name || '-'}
                    </div>
                    <div className="block text-sm text-gray-500">{`${formatDateTime(row.updated_at)}`}</div>
                </div>
            ),
            width: '130px'
        },
        createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: onDelete || (() => {}),
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];
    const onRowClick = (contractor: Contractor) => {

        
        navigate(`/crm/contractors/edit/${contractor.iup_customer_id}`);
    }

    return (
        <CustomDataTable
            columns={columns}
            data={contractors}
            loading={loading}
            pagination
            paginationServer
            paginationTotalRows={pagination.total}
            paginationPerPage={pagination.limit}
            paginationDefaultPage={pagination.page}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            onChangePage={onPageChange}
            onChangeRowsPerPage={onRowsPerPageChange}
            onRowClicked={onRowClick}
            highlightOnHover
            striped
            responsive
            fixedHeader
            fixedHeaderScrollHeight="630px"
            // onRowClicked={(row) => navigate(`/crm/contractors/edit/${row.iup_customer_id}`)}
        />
    );
};

export default ContractorTable;
