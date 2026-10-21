import React, { useCallback } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Link, useLocation } from 'react-router-dom';
import { MdContentCopy } from 'react-icons/md';
import CustomDataTable from '@/components/ui/table';
import { formatDateLocal, tableDateFormatTime } from '@/helpers/generalHelper';
import { ApplicantFormListItem, Pagination } from '../types/applicant';
import { APPLICANT_STATUS_DISPLAY, getApplicantFormStatus } from '../utils/applicantStatus';
import { createActionsColumn, createByDateColumn, createDateColumn } from '@/components/ui/table/columnUtils';
import { useLanguage } from '@/components/lang/useLanguage';
import { applicantManage } from '../language/applicantManage';
import { LuLoaderCircle, LuSend } from 'react-icons/lu';
import Switch from '@/components/form/switch/Switch';
import { useHasPermission } from '@/hooks/usePermissions';

const EMAIL_STATUS_CAPTION: Record<'Success' | 'Failed' | 'none', { labelKey: string; className: string; badgeClassName: string }> = {
    Success: { labelKey: 'emailStatusSuccessLabel', className: 'text-green-600', badgeClassName: 'border-green-200 bg-green-50 text-green-700' },
    Failed: { labelKey: 'emailStatusFailedLabel', className: 'text-red-600', badgeClassName: 'border-red-200 bg-red-50 text-red-700' },
    none: { labelKey: 'emailStatusNotSent', className: 'text-gray-500', badgeClassName: 'border-gray-200 bg-gray-50 text-gray-600' },
};

const statusBadgeClass = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium';

interface ApplicantTableProps {
    data: ApplicantFormListItem[];
    loading: boolean;
    pagination: Pagination;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (limit: number, page: number) => void;
    onCopyLink: (row: ApplicantFormListItem) => void;
    resendingIds: string[];
    onResendMail: (row: ApplicantFormListItem) => void;
    onSwitchStatus: (row: ApplicantFormListItem, checked: boolean) => void;
}

const ApplicantTable: React.FC<ApplicantTableProps> = ({
    data,
    loading,
    pagination,
    onChangePage,
    onChangeRowsPerPage,
    onCopyLink,
    resendingIds,
    onResendMail,
    onSwitchStatus,
}) => {
    const location = useLocation();
    const canUpdateStatus = useHasPermission('update_status');
    const canManageEmailStatus = canUpdateStatus;
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

    const emailStatusColumn: TableColumn<ApplicantFormListItem> = {
        id: 'status_send_email',
        name: langField('emailStatus'),
        selector: row => row.status_send_email || '-',
        cell: row => {
            if (row.status_send_email === 'Process') {
                return (
                    <span className={`${statusBadgeClass} border-amber-200 bg-amber-50 text-amber-700`}>
                        <LuLoaderCircle size={13} className="animate-spin" />
                        {langField('emailStatusProcess')}
                    </span>
                );
            }

            const caption = EMAIL_STATUS_CAPTION[row.status_send_email ?? 'none'];
            const isEditable = getApplicantFormStatus(row) !== 'completed' && Boolean(row.applicant_form_invitation_id);

            if (!isEditable) {
                return (
                    <span className={`${statusBadgeClass} ${caption.badgeClassName}`}>
                        {langField(caption.labelKey)}
                    </span>
                );
            }

            return (
                <div className="relative flex items-center gap-3">
                    <Switch
                        label=""
                        checked={row.status_send_email === 'Success'}
                        onChange={checked => onSwitchStatus(row, checked)}
                        showStatusText={false}
                    />
                    <span className={`mt-1 text-xs font-medium italic ${caption.className}`}>
                        {langField(caption.labelKey)}
                    </span>
                </div>
            );
        },
        center: true,
        wrap: true,
        minWidth: '170px',
    };

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
            cell: row => (<>
                <Link
                    to={getDetailPath(row)}
                    state={{ from: location.search }}
                    className="absolute inset-0 cursor-pointer"
                />
                <span>{row.position_applied_for || '-'}</span>
            </>),
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
            width: '200px',
            center: true,
        },
        ...(canManageEmailStatus ? [emailStatusColumn] : []),
        {
            id: 'contact',
            name: langField('contact'),
            selector: row => row.email || row.no_mobile || '-',
            cell: row => (
                <div className="flex flex-col py-2">
                    <span className="text-gray-900 break-all">{row.email || '-'}</span>
                    <span className="text-xs text-gray-500">{row.no_mobile || '-'}</span>
                </div>
            ),
            wrap: true,
            minWidth: '300px',
        },
        createByDateColumn(langField('invitedAt'), 'created_at', 'created_by_name', '320px'),
        createDateColumn(langField('completedAt'), 'completed_at', tableDateFormatTime),
        createActionsColumn([
            {
                title: 'send',
                icon: LuSend,
                onClick: onResendMail,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
                tooltip: langField('resend'),
                permission: 'create',
                disable: row => getApplicantFormStatus(row) === 'completed' || !row.applicant_form_invitation_id || resendingIds.includes(row.id),
                iconClassName: row => (resendingIds.includes(row.id) ? 'animate-pulse' : ''),
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
