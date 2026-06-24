import React, { useMemo } from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { formatDate } from '@/helpers/generalHelper';
import { WorkOrderItem, WorkOrderStatus } from '../types/workorder';
import { LuCheck, LuPaperclip, LuPause, LuPlay } from 'react-icons/lu';
import Button from '@/components/ui/button/Button';
import { Tooltip } from '@/components/ui/tooltip';
import { useTimeProgress } from '@/helpers/timeProgres';
import { StatusTypeBadgeWO } from '@/components/ui/badge/StatusBadge';
import moment from 'moment';

interface WorkOrderTableProps {
    workOrders: WorkOrderItem[];
    loading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (limit: number, page: number) => void;
    onDelete?: (workOrder: WorkOrderItem) => void;
    handleStartRepairProcess: (workOrder: WorkOrderItem) => void;
    handleEndRepairProcess: (workOrder: WorkOrderItem) => void;
    // onRowClick?: (workOrder: WorkOrderItem) => void;
}

const DurationCell: React.FC<{ row: WorkOrderItem }> = ({ row }) => {
    const elapsedTime = useTimeProgress(row?.repair_start_date || null)
    const displayTime = row?.work_order_status === 'complete'
        ? (row?.repair_diff_days || '-')
        : elapsedTime
    return <div className="text-sm text-gray-700 max-w-xs">{displayTime}</div>
}

const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
    workOrders,
    loading,
    pagination,
    onPageChange,
    onRowsPerPageChange,
    handleStartRepairProcess,
    handleEndRepairProcess,
    // onRowClick,
}) => {
    
    const columns: TableColumn<any>[] = useMemo(() => [
        {
            name: 'Work Order No',
            selector: (row) => row.work_order_no,
            cell: (row) => (<>
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-[#0253a5]">
                        {row.work_order_no || '-'}
                    </div>
                    <div className="block text-sm text-gray-500">{formatDate(row.work_order_date)}</div>
                </div>
            </>),
            sortable: false,
            wrap: true,
            width: '280px',
        },
        {
            name: 'Phone Number',
            selector: row => row.phone_number,
            cell: (row) => (
                <div className="text-sm text-gray-700 max-w-xs">
                    {row.phone_number || '-'}
                </div>
            ),
            wrap: true,
            width: '170px',
        },
        // {
        //     name: 'Customer Name',
        //     selector: row => row.customer_name,
        //     cell: (row) => (
        //         <div className="text-sm text-gray-700 max-w-xs">
        //             {row.customer_name || '-'}
        //         </div>
        //     ),
        //     wrap: true,
        //     width: '370px',
        // },
        {
            name: 'No Unit',
            selector: row => row.body_no,
            cell: (row) => (
                <div className="text-sm text-gray-700 font-primary-bold max-w-xs">
                    {row.body_no || '-'}
                </div>
            ),
            wrap: true,
            width: '150px',
        },
        // {
        //     name: 'Category',
        //     selector: row => row.category,
        //     cell: (row) => (
        //         <div className="text-sm text-gray-700 max-w-xs">
        //             {row.category || '-'}
        //         </div>
        //     ),
        //     wrap: true,
        //     width: '370px',
        // },
        {
            name: 'Problem',
            selector: row => row.problem,
            cell: (row) => (
                <div className="text-sm text-gray-800 max-w-xs space-y-2">
                    <p className="leading-relaxed text-gray-700">
                        {row.problem || (
                        <span className="text-gray-400 italic">
                            No problem description
                        </span>
                        )}
                    </p>
                </div>
            ),
            wrap: true,
            width: '370px',
        },
        {
            name: 'Document',
            selector: row => row.work_order_status,
            cell: (row) => (
                <div className="flex flex-col gap-1 py-1 text-xs">
                    {row.image?.length > 0 ? (
                        row.image.map((url: any, i: any) => (
                            <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200"
                            >
                                <LuPaperclip size={14} />
                                Image {i + 1}
                            </a>
                        ))
                    ) : (
                        <span className="text-gray-400">No attachment</span>
                    )}
                </div>
            ),
            wrap: true,
            center: true,
            width: '180px',
        },
        {
            name: 'Status',
            selector: row => row.work_order_status,
            cell: (row) => (
                <StatusTypeBadgeWO
                    type={row.work_order_status as WorkOrderStatus}
                />
                // <Badge
                //     variant="light"
                //     status={row.work_order_status}
                //     showLabel
                // />
            ),
            wrap: true,
            center: true,
            width: '180px',
        },
        {
            name: 'Action',
            selector: row => row.body_no,
            cell: (row) => (
                <div className="text-sm font-primary-bold max-w-xs">
                    {row.work_order_status === 'open' ? (
                        <Tooltip content="Start Repair Process">
                            <Button 
                                className="bg-transparent hover:bg-emerald-100 text-emerald-600 border border-emerald-500 p-2" 
                                size="sm"
                                onClick={() => handleStartRepairProcess(row)}
                            >
                                <LuPlay size={20} />
                            </Button>
                        </Tooltip>

                    ) : row.work_order_status === 'onprogress' ? (
                        <Tooltip content="End Repair Process">
                            <Button 
                                className="bg-transparent hover:bg-blue-100 text-blue-600 border border-blue-500 p-2"
                                size="sm"
                                onClick={() => handleEndRepairProcess(row)}
                            >
                                <LuPause size={20} />
                            </Button>
                        </Tooltip>

                    ) : (
                        <Tooltip content="Repair Process Completed">
                            <div className="bg-green-50 text-green-700 border border-green-200 px-2 py-2 rounded-lg flex items-center justify-center">
                                <LuCheck size={20} />
                            </div>
                        </Tooltip>
                    )}
                    </div>
            ),
            wrap: true,
            center: true,
            width: '170px',
        },
        {
            name: 'Duration',
            selector: row => row.total_duration,
            cell: (row) => <DurationCell row={row} />,
            wrap: true,
            // width: '170px',
        },
        {
            name: 'Start Time',
            selector: row => row.repair_start_date,
            cell: (row) => (
                <div className="text-sm text-gray-800 max-w-xs space-y-2">
                    <p className="leading-relaxed text-gray-700">
                        {row.repair_start_date ? moment(row.repair_start_date, 'YYYY-MM-DD HH:mm:ss').format('DD MMM YYYY HH:mm:ss') : ''}
                    </p>
                </div>
            ),
            wrap: true,
            width: '210px',
        },
        {
            name: 'End Time',
            selector: row => row.repair_end_date,
            cell: (row) => (
                <div className="text-sm text-gray-800 max-w-xs space-y-2">
                    <p className="leading-relaxed text-gray-700">
                        {row.repair_end_date ? moment(row.repair_end_date, 'YYYY-MM-DD HH:mm:ss').format('DD MMM YYYY HH:mm:ss') : ''}
                    </p>
                </div>
            ),
            wrap: true,
            width: '210px',
        }
    ], [handleStartRepairProcess, handleEndRepairProcess]);

    return (
        <CustomDataTable
            columns={columns}
            data={workOrders}
            loading={loading}
            pagination
            paginationServer
            paginationTotalRows={pagination?.total || 0}
            paginationPerPage={pagination?.limit || 10}
            paginationDefaultPage={pagination?.page || 1}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            onChangePage={onPageChange}
            onChangeRowsPerPage={onRowsPerPageChange}
            keyField="work_order_id"
            highlightOnHover
            striped
            responsive
            fixedHeader
            fixedHeaderScrollHeight="630px"
            // onRowClicked={(row) => navigate(`/crm/contractors/edit/${row.iup_customer_id}`)}
        />
    );
};

export default WorkOrderTable;
