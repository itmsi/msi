import { MdPeople, MdCheckCircle, MdCancel, MdHelpOutline } from 'react-icons/md';
import StatCard, { type StatCardColor } from '@/components/ui/summaryCard/Statcard';
import type { CandidateOfferingCount } from '../types/Candidate';

interface OfferingSummaryCardsProps {
    counts: CandidateOfferingCount | null;
    total: number;
}

// Outer shape overridden to match this module's card language (rounded-2xl + border,
// no shadow) — see CandidateCard / empty-state cards in Manage.tsx.
const CARD_CLASSNAME = 'rounded-2xl! border! border-[#E7E9F0]! shadow-none!';

const TILES: { key: 'all' | 'ok' | 'not_ok' | 'null'; label: string; icon: typeof MdPeople; color: StatCardColor }[] = [
    { key: 'all', label: 'All', icon: MdPeople, color: 'gray' },
    { key: 'ok', label: 'Accepted', icon: MdCheckCircle, color: 'green' },
    { key: 'not_ok', label: 'Declined', icon: MdCancel, color: 'red' },
    { key: 'null', label: 'Awaiting', icon: MdHelpOutline, color: 'amber' },
];

export function OfferingSummaryCards({ counts, total }: OfferingSummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TILES.map(({ key, label, icon, color }) => (
                <StatCard
                    key={key}
                    icon={icon}
                    label={label}
                    value={key === 'all' ? counts?.all ?? total : counts?.[key] ?? 0}
                    color={color}
                    className={CARD_CLASSNAME}
                />
            ))}
        </div>
    );
}
