import { formatDateTime } from '@/helpers/generalHelper';
import { ApplicantFormListItem } from '../types/applicant';
import { APPLICANT_STATUS_DISPLAY, getApplicantFormStatus } from '../utils/applicantStatus';

interface ApplicantSummaryCardProps {
    summary: ApplicantFormListItem;
}

const ApplicantSummaryCard = ({ summary }: ApplicantSummaryCardProps) => {
    const status = APPLICANT_STATUS_DISPLAY[getApplicantFormStatus(summary)];

    const rows = [
        { label: 'Tanggal Diundang', value: summary.created_at ? formatDateTime(summary.created_at) : '-' },
        { label: 'Diundang Oleh', value: summary.created_by_name || '-' },
        { label: 'Link Berlaku Sampai', value: summary.token_expires_at ? formatDateTime(summary.token_expires_at) : '-' },
        { label: 'Tanggal Selesai', value: summary.completed_at ? formatDateTime(summary.completed_at) : '-' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Informasi Formulir</h3>
                <span className={`inline-flex items-center justify-center px-3 py-1 text-xs border rounded-full font-medium ${status.className}`}>
                    {status.label}
                </span>
            </div>

            <dl className="space-y-3">
                {rows.map(row => (
                    <div key={row.label}>
                        <dt className="text-sm text-gray-500">{row.label}</dt>
                        <dd className="text-sm text-gray-900 font-medium">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};

export default ApplicantSummaryCard;
