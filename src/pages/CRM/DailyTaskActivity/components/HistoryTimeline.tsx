import React, { useMemo } from 'react';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import Badge from '@/components/ui/badge/Badge';
import type { TableColumn } from 'react-data-table-component';
import { DailyTaskHistory, DailyTask } from '../types/dailyTask';

interface HistoryTimelineProps {
    history: DailyTaskHistory[];
    loading: boolean;
    tasks: DailyTask[];
}

const getStatusColor = (status: string): "primary" | "success" | "warning" | "dark" => {
    switch (status) {
        case 'hold': return 'dark';
        case 'open': return 'primary';
        case 'progress': return 'warning';
        case 'done': return 'success';
        default: return 'dark';
    }
};

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, loading, tasks }) => {
    const taskMap = useMemo(() => {
        const map = new Map<string, string>();
        tasks.forEach((t) => map.set(t.daily_task_activitity_id, t.daily_task));
        return map;
    }, [tasks]);

    const columns: TableColumn<DailyTaskHistory>[] = useMemo(
        () => [
            {
                name: 'Task',
                sortable: true,
                cell: (row) => (
                    <span className="text-sm font-medium text-gray-900">
                        {taskMap.get(row.daily_task_activitity_id) ||
                            row.daily_task_activitity_id ||
                            '-'}
                    </span>
                ),
            },
            {
                name: 'From',
                width: '150px',
                cell: (row) =>
                    row.status_from ? (
                        <Badge color={getStatusColor(row.status_from)} variant="light" size="sm">
                            {row.status_from}
                        </Badge>
                    ) : (
                        <span className="text-gray-400 text-sm">-</span>
                    ),
            },
            {
                name: 'To',
                width: '150px',
                cell: (row) => (
                    <Badge color={getStatusColor(row.status_to)} variant="light" size="sm">
                        {row.status_to}
                    </Badge>
                ),
            },
            {
                name: 'Date',
                sortable: true,
                cell: (row) => (
                    <span className="text-sm text-gray-600">
                        {new Date(row.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                ),
            },
            {
                name: 'By',
                width: '250px',
                cell: (row) => (
                    <span className="text-sm text-gray-600">
                        {row.created_by_name ? row.created_by_name : '-'}
                    </span>
                ),
            },
        ],
        [taskMap]
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>

            <CustomDataTable
                columns={columns}
                data={history}
                loading={loading}
                pagination
                paginationServer={false}
                paginationTotalRows={history.length}
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50]}
                noDataComponent={
                    <div className="text-center py-10">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No activity history yet</p>
                        <p className="text-xs text-gray-400">
                            History will appear when tasks are moved between columns
                        </p>
                    </div>
                }
                striped={false}
                highlightOnHover
                responsive
                persistTableHead
                fixedHeader
                fixedHeaderScrollHeight="400px"
                borderRadius="8px"
            />
        </div>
    );
};

export default HistoryTimeline;
