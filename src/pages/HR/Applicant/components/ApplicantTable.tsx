import React, { useCallback } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdContentCopy, MdVisibility } from 'react-icons/md';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { formatDateLocal, formatDateTime } from '@/helpers/generalHelper';
import { ApplicantFormListItem, Pagination } from '../types/applicant';
import { APPLICANT_STATUS_DISPLAY, getApplicantFormStatus } from '../utils/applicantStatus';

interface ApplicantTableProps {
    data: ApplicantFormListItem[];
    loading: boolean;
    pagination: Pagination;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (limit: number, page: number) => void;
    onCopyLink: (row: ApplicantFormListItem) => void;
}

const ApplicantTable: React.FC<ApplicantTableProps> = ({
    data,
    loading,
    pagination,
    onChangePage,
    onChangeRowsPerPage,
    onCopyLink,
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const getDetailPath = (row: ApplicantFormListItem) => `/hr/applicants/edit/${row.id}`;

    const handlePageChange = useCallback((page: number) => {
        if (page === (pagination?.page || 1)) return;
        onChangePage(page);
    }, [pagination?.page, onChangePage]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        if (limit === (pagination?.limit || 10) && page === (pagination?.page || 1)) return;
        onChangeRowsPerPage(limit, page);
    }, [pagination?.page, pagination?.limit, onChangeRowsPerPage]);

    const columns: TableColumn<ApplicantFormListItem>[] = [
        {
            id: 'name',
            name: 'Nama Lengkap',
            selector: row => row.name || '-',
            cell: row => (<>
                {row.is_completed && (
                    <Link
                        to={getDetailPath(row)}
                        state={{ from: location.search }}
                        className="absolute inset-0 cursor-pointer"
                    />
                )}
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.name || '-'}</div>
                </div>
            </>),
            wrap: true,
            minWidth: '220px',
            pinned: 'left',
        },
        {
            id: 'position_applied_for',
            name: 'Posisi Dilamar',
            selector: row => row.position_applied_for || '-',
            wrap: true,
            minWidth: '200px',
        },
        {
            id: 'contact',
            name: 'Kontak',
            selector: row => row.email || row.no_mobile || '-',
            cell: row => (
                <div className="flex flex-col py-2">
                    <span className="text-gray-900 break-all">{row.email || '-'}</span>
                    <span className="text-xs text-gray-500">{row.no_mobile || '-'}</span>
                </div>
            ),
            wrap: true,
            minWidth: '240px',
        },
        {
            id: 'city',
            name: 'Kota',
            selector: row => row.city || '-',
            wrap: true,
            width: '160px',
        },
        {
            id: 'working_available_date',
            name: 'Tersedia Bekerja',
            selector: row => row.working_available_date || '-',
            format: row => formatDateLocal(row.working_available_date || undefined),
            wrap: true,
            width: '170px',
            center: true,
        },
        {
            id: 'status',
            name: 'Status Formulir',
            selector: row => APPLICANT_STATUS_DISPLAY[getApplicantFormStatus(row)].label,
            cell: row => {
                const status = APPLICANT_STATUS_DISPLAY[getApplicantFormStatus(row)];

                return (
                    <span className={`inline-flex items-center justify-center px-3 py-1 text-xs border rounded-full font-medium ${status.className}`}>
                        {status.label}
                    </span>
                );
            },
            width: '190px',
            center: true,
        },
        {
            id: 'created_at',
            name: 'Tanggal Diundang',
            selector: row => row.created_at || '-',
            cell: row => (
                <div className="flex flex-col py-2">
                    <span className="text-gray-900">{row.created_at ? formatDateTime(row.created_at) : '-'}</span>
                    {row.created_by_name && (
                        <span className="text-xs text-gray-500">oleh {row.created_by_name}</span>
                    )}
                </div>
            ),
            wrap: true,
            width: '220px',
        },
        {
            id: 'completed_at',
            name: 'Tanggal Selesai',
            selector: row => row.completed_at || '-',
            format: row => (row.completed_at ? formatDateTime(row.completed_at) : '-'),
            wrap: true,
            width: '200px',
        },
        createActionsColumn([
            {
                icon: MdVisibility,
                onClick: (row: ApplicantFormListItem) => navigate(getDetailPath(row), { state: { from: location.search } }),
                condition: (row: ApplicantFormListItem) => row.is_completed,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Lihat Detail',
                permission: 'read',
            },
            {
                icon: MdContentCopy,
                onClick: onCopyLink,
                condition: (row: ApplicantFormListItem) => getApplicantFormStatus(row) === 'pending' && Boolean(row.applicant_form_url),
                className: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
                tooltip: 'Salin Link',
                permission: 'read',
                title: 'Aksi',
                width: '110px',
            },
        ]),
    ];

    return (
        <CustomDataTable
            columns={columns}
            data={data}
            loading={loading}
            pagination
            paginationServer
            paginationTotalRows={pagination?.total || 0}
            paginationPerPage={pagination?.limit || 10}
            paginationDefaultPage={pagination?.page || 1}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
            fixedHeader={true}
            fixedHeaderScrollHeight="625px"
            responsive
            highlightOnHover
            striped={false}
            persistTableHead
            borderRadius="8px"
        />
    );
};

export default ApplicantTable;
