import { formatDateTime } from '@/helpers/generalHelper';
import { ApplicantFormListItem } from '../types/applicant';
import { APPLICANT_STATUS_DISPLAY, getApplicantFormStatus } from '../utils/applicantStatus';
import { useLanguage } from '@/components/lang/useLanguage';
import { applicantLabels } from '../language/applicantLabels';

interface ApplicantSummaryCardProps {
    summary: ApplicantFormListItem;
}

const ApplicantSummaryCard = ({ summary }: ApplicantSummaryCardProps) => {
    const { langField } = useLanguage(applicantLabels);
    const status = APPLICANT_STATUS_DISPLAY[getApplicantFormStatus(summary)];

    const rows = [
        { label: langField('invitedAt'), value: summary.created_at ? formatDateTime(summary.created_at) : '-' },
        { label: langField('invitedBy'), value: summary.created_by_name || '-' },
        { label: langField('linkValidUntil'), value: summary.token_expires_at ? formatDateTime(summary.token_expires_at) : '-' },
        { label: langField('completedAt'), value: summary.completed_at ? formatDateTime(summary.completed_at) : '-' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">{langField('formInformation')}</h3>
                <span className={`inline-flex items-center justify-center px-3 py-1 text-xs border rounded-full font-medium ${status.className}`}>
                    {langField(status.labelKey)}
                </span>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-4">
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
