interface CandidateStatusBadgeProps {
    status: string;
}

// Sesuaikan / tambah mapping kalau backend punya nilai candidate_status lain
// selain "New" dan "Complete" (baru terlihat 2 nilai di sample response).
const STATUS_STYLE: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800 border-blue-200',
    Complete: 'bg-green-100 text-green-800 border-green-200',
};

const DEFAULT_STYLE = 'bg-gray-100 text-gray-800 border-gray-200';

export function CandidateStatusBadge({ status }: CandidateStatusBadgeProps) {
    const style = STATUS_STYLE[status] ?? DEFAULT_STYLE;

    return (
        <span
            className={`inline-flex items-center justify-center rounded-md font-primary px-2 py-0.5 text-xs border ${style}`}
        >
            {status || '-'}
        </span>
    );
}