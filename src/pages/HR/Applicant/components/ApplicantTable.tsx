import React, { useCallback } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Link, useLocation } from 'react-router-dom';
import { MdContentCopy } from 'react-icons/md';
import CustomDataTable from '@/components/ui/table';
import { formatDateLocal, tableDateFormatTime } from '@/helpers/generalHelper';
import { ApplicantFormListItem, Pagination } from '../types/applicant';
import { APPLICANT_STATUS_DISPLAY, getApplicantFormStatus } from '../utils/applicantStatus';
import { createByDateColumn, createDateColumn } from '@/components/ui/table/columnUtils';
import { useLanguage } from '@/components/lang/useLanguage';
import { applicantManage } from '../language/applicantManage';

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
    const { langField, buildPath } = useLanguage(applicantManage);

    const getDetailPath = (row: ApplicantFormListItem) => buildPath(`/hr/applicants/edit/${row.id}`);

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
            name: langField('fullName'),
            selector: row => row.name || '-',
            cell: row => (<>
                <Link
                    to={getDetailPath(row)}
                    state={{ from: location.search }}
                    className="absolute inset-0 cursor-pointer"
                />
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.name || '-'}</div>
                    <div className='relative z-19 cursor-pointer text-blue-700 hover:text-green-700 flex items-center gap-1 text-xs' onClick={() => onCopyLink(row)}><MdContentCopy />{langField('copyLink')}</div>
                </div>
            </>),
            wrap: true,
            minWidth: '220px',
            pinned: 'left',
        },
        {
            id: 'position_applied_for',
            name: langField('positionAppliedFor'),
            selector: row => row.position_applied_for || '-',
            wrap: true,
            minWidth: '200px',
        },
        {
            id: 'status',
            name: langField('formStatus'),
            selector: row => langField(APPLICANT_STATUS_DISPLAY[getApplicantFormStatus(row)].labelKey),
            cell: row => {
                const status = APPLICANT_STATUS_DISPLAY[getApplicantFormStatus(row)];

                return (
                    <span className={`inline-flex items-center justify-center px-3 py-1 text-xs border rounded-full font-medium ${status.className}`}>
                        {langField(status.labelKey)}
                    </span>
                );
            },
            width: '250px',
            center: true,
        },
        {
            id: 'city',
            name: langField('city'),
            selector: row => row.city || '-',
            wrap: true,
            width: '160px',
        },
        {
            id: 'working_available_date',
            name: langField('availableToWork'),
            selector: row => row.working_available_date || '-',
            format: row => formatDateLocal(row.working_available_date || undefined),
            wrap: true,
            width: '170px',
            center: true,
        },
        {
            id: 'contact',
            name: langField('contact'),
            selector: row => row.email || row.no_mobile || '-',
            cell: row => (<>
                <Link
                    to={getDetailPath(row)}
                    state={{ from: location.search }}
                    className="absolute inset-0 cursor-pointer"
                />
                <div className="flex flex-col py-2">
                    <span className="text-gray-900 break-all">{row.email || '-'}</span>
                    <span className="text-xs text-gray-500">{row.no_mobile || '-'}</span>
                </div>
            </>),
            wrap: true,
            minWidth: '300px',
        },
        createByDateColumn(langField('invitedAt'), 'created_at', 'created_by_name', '320px'),
        createDateColumn(langField('completedAt'), 'completed_at', tableDateFormatTime)
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
