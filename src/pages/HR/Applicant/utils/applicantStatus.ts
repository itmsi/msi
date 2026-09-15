import { ApplicantFormListItem, ApplicantFormStatus } from '../types/applicant';

export const getApplicantFormStatus = (
    applicant: Pick<ApplicantFormListItem, 'is_completed' | 'token_expires_at'>,
    now: Date = new Date()
): ApplicantFormStatus => {
    if (applicant.is_completed) return 'completed';
    if (!applicant.token_expires_at) return 'pending';

    const expiresAt = new Date(applicant.token_expires_at);
    if (isNaN(expiresAt.getTime())) return 'pending';

    return expiresAt.getTime() < now.getTime() ? 'expired' : 'pending';
};

export const APPLICANT_STATUS_DISPLAY: Record<ApplicantFormStatus, { label: string; className: string }> = {
    completed: { label: 'Selesai', className: 'bg-green-50 text-green-700 border-green-200' },
    pending: { label: 'Menunggu Pengisian', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    expired: { label: 'Kadaluarsa', className: 'bg-red-50 text-red-700 border-red-200' },
};
