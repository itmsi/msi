import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table';
import { ActivityItem, ActivityRow, Pagination } from '../types/activity';
import { ActivityService } from '../services/activityService';
import {
    getActivityStatus,
    parseActivityTimestamp,
} from '../utils/activityFormat';
import ActivityDetailPanel from './ActivityDetailPanel';

interface ActivityTableProps {
    data: ActivityRow[];
    loading: boolean;
    pagination: Pagination;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (limit: number, page: number) => void;
}

const CLIENT_STYLE: Record<string, string> = {
    ITI: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    MSI: 'bg-teal-50 text-teal-700 border-teal-200',
};

// Lebar panel dikirim lewat context, bukan lewat komponen baru setiap kali lebar berubah.
// Komponen baru berarti panel di-mount ulang, sehingga JSON diproses ulang setiap resize.
const PanelWidthContext = createContext(0);

const ExpandedDetail = ({ data: row }: { data: ActivityRow }) => {
    const width = useContext(PanelWidthContext);
    const [detail, setDetail] = useState<ActivityItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        if (!row.activityId) {
            setLoading(false);
            setError('Activity ID is unavailable for this record.');
            return () => {
                active = false;
            };
        }

        setLoading(true);
        setError(null);
        ActivityService.getActivityDetail(row.activityId, row.type_data)
            .then(activity => {
                if (active) setDetail(activity);
            })
            .catch((requestError: Error) => {
                if (active) setError(requestError.message || 'Failed to fetch activity detail');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [row.activityId, row.id, row.type_data]);

    return <ActivityDetailPanel data={detail ?? undefined} width={width} loading={loading} error={error} />;
};

const ActivityTable: React.FC<ActivityTableProps> = ({
    data,
    loading,
    pagination,
    onChangePage,
    onChangeRowsPerPage,
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [panelWidth, setPanelWidth] = useState(0);

    const toggleRow = useCallback((row: ActivityRow) => {
        setExpandedId(prev => (prev === row.id ? null : row.id));
    }, []);

    // Lebar wrapper tabel mengikuti isi (width: max-content), jadi panel detail harus diberi
    // lebar pasti sebesar area yang terlihat. Tanpa ini, JSON yang panjang ikut melebarkan tabel.
    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new ResizeObserver(entries => {
            setPanelWidth(entries[0]?.contentRect.width ?? 0);
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const handlePageChange = useCallback((page: number) => {
        if (page === (pagination?.page || 1)) return;
        onChangePage(page);
    }, [pagination?.page, onChangePage]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        if (limit === (pagination?.limit || 10) && page === (pagination?.page || 1)) return;
        onChangeRowsPerPage(limit, page);
    }, [pagination?.page, pagination?.limit, onChangeRowsPerPage]);

    const columns: TableColumn<ActivityRow>[] = [
        {
            id: 'endpoint',
            name: 'Endpoint Path',
            selector: row => row.url || '-',
            cell: row => (
                <div className="flex flex-col py-2 min-w-0">
                    <span className="font-medium text-gray-900">{row.module_name}</span>
                    <span className="text-xs text-gray-500 font-mono break-all">{row.url || '-'}</span>
                </div>
            ),
            wrap: true,
            minWidth: '320px',
        },
        {
            id: 'timestamp',
            name: 'Timestamp',
            selector: row => row.created_at || '-',
            cell: row => {
                const { date, time } = parseActivityTimestamp(row.created_at);

                return (<>
                    {/* <button onClick={() => toggleRow(row)} className="absolute inset-0 w-full h-full z-10" /> */}
                    <div className="flex flex-col py-2">
                        <span className="font-mono font-medium text-gray-900">{time}</span>
                        <span className="text-xs text-gray-500">
                            {date}
                        </span>
                    </div>
                </>);
            },
            width: '210px',
        },
        {
            id: 'status',
            name: 'Status',
            selector: row => getActivityStatus(row).label,
            cell: row => {
                const status = getActivityStatus(row);

                return (
                    <span
                        className={`inline-flex items-center justify-center px-3 py-1 text-xs border rounded-full font-medium ${status.ok
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                    >
                        {status.label}
                    </span>
                );
            },
            width: '220px',
            center: true,
        },
        {
            id: 'client',
            name: 'Client',
            selector: row => row.client || '-',
            cell: row => (
                <span
                    className={`inline-flex items-center justify-center px-3 py-1 text-xs border rounded-full font-medium ${CLIENT_STYLE[(row.client || '').toUpperCase()] || 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                >
                    {row.client || '-'}
                </span>
            ),
            width: '120px',
            center: true,
        },
        {
            id: 'client_type',
            name: 'Type',
            selector: row => row.type_data || '-',
            cell: row => (
                <span
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef] uppercase`}
                >
                    {row.type_data || '-'}
                </span>
            ),
            width: '120px',
            center: true,
        },
        // {
        //     id: 'records',
        //     name: 'Record Count',
        //     selector: row => getRecordCount(row) ?? -1,
        //     cell: row => {
        //         const recordCount = getRecordCount(row);
        //         const pageInfo = getResponsePageInfo(row);

        //         return (
        //             <div className="flex flex-col py-2">
        //                 <span className="text-gray-900">{recordCount === null ? '-' : `${recordCount} records`}</span>
        //                 {pageInfo && (
        //                     <span className="text-xs text-gray-500">Page {pageInfo.page}/{pageInfo.totalPages}</span>
        //                 )}
        //             </div>
        //         );
        //     },
        //     width: '150px',
        // }
    ];

    return (
        <PanelWidthContext.Provider value={panelWidth}>
            <div ref={containerRef} className="w-full">
                <CustomDataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    keyField="id"
                    pagination
                    paginationServer
                    paginationTotalRows={pagination?.total || 0}
                    paginationPerPage={pagination?.limit || 10}
                    paginationDefaultPage={pagination?.page || 1}
                    paginationRowsPerPageOptions={[10, 20, 50, 100]}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handleRowsPerPageChange}
                    expandableRows
                    expandableRowsComponent={ExpandedDetail}
                    isRowExpanded={(row) => row.id === expandedId}
                    onRowClicked={toggleRow}
                    pointerOnHover
                    responsive
                    highlightOnHover
                    striped={false}
                    persistTableHead
                    borderRadius="8px"
                />
            </div>
        </PanelWidthContext.Provider>
    );
};

export default ActivityTable;
