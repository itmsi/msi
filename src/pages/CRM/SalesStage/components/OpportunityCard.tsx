import React from 'react';
import Badge from '@/components/ui/badge/Badge';
import { MdOutlinePersonOutline } from 'react-icons/md';
import { SOLUTION_COLORS } from '../types/salesStage';
import { stageStyles } from '../constants/stageIupStyles';
import { fmtCard } from '../utils/formatters';

// TODO: ganti `any` dengan tipe content opportunity yang sebenarnya kalau sudah ada
export interface OpportunityCardContent {
    stage?: string;
    contractor?: string;
    iup_name?: string;
    province?: string;
    commodity?: 'nikel' | 'batubara' | string;
    solution?: string;
    sales_name?: string;
    total_reviews?: number;
    actual_value?: string | null;
    value?: string | null;
    progress_pct?: number;
}

interface OpportunityCardProps {
    title: string;
    content: OpportunityCardContent;
}

const CommodityBadge: React.FC<{ commodity?: string }> = ({ commodity }) => {
    if (commodity === 'nikel') {
        return <Badge color="indigo" variant="light" size="sm">NIKEL</Badge>;
    }
    if (commodity === 'batubara') {
        return <Badge color="dark" variant="light" size="sm">BATUBARA</Badge>;
    }
    return null;
};

const CardHeader: React.FC<{ title: string; commodity?: string }> = ({ title, commodity }) => (
    <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm font-primary-bold text-gray-900 leading-snug line-clamp-2 flex-1">
            {title}
        </h4>
        <CommodityBadge commodity={commodity} />
    </div>
);

const ProgressRing: React.FC<{ progressPct: number }> = ({ progressPct }) => (
    <div
        className="w-10 h-10 rounded-full relative flex-none"
        style={{
            background: `conic-gradient(var(--primary-600, #1E4FA0) ${progressPct}%, #e5e7eb 0)`,
        }}
    >
        <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
            <span className="text-[11px] font-secondary">{progressPct}%</span>
        </div>
    </div>
);

const CardFooter: React.FC<{ stage: string; content: OpportunityCardContent }> = ({ stage, content }) => {
    if (stage === 'hypercare') {
        return (
            <span className="text-[11px] text-gray-400">
                {content.total_reviews || 0} review
            </span>
        );
    }

    if (stage === 'deal' && content.actual_value) {
        return (
            <>
                <span className="text-[11px] font-semibold text-green-600">
                    {fmtCard(content.actual_value)}
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-400">{fmtCard(content.value ?? null)}</span>
                </div>
            </>
        );
    }

    return <ProgressRing progressPct={content.progress_pct || 0} />;
};

const OpportunityCard: React.FC<OpportunityCardProps> = React.memo(({ title, content }) => {
    const stage = content.stage || 'pull';
    const secondary = content.contractor ? `IUP: ${content.iup_name}` : (content.province || '');
    const style = stageStyles[stage] ?? stageStyles.find;

    return (
        <div
            className="rounded-lg p-3 cursor-pointer transition-all duration-150 hover:shadow-md"
            style={{ background: style.bgGradient, boxShadow: '0px 3px 10px -9px #6c6c6c' }}
        >
            <CardHeader title={title} commodity={content.commodity} />

            <p className="text-[11px] mb-1">{secondary}</p>

            {content.solution && (
                <div className="mb-1.5">
                    <Badge
                        color={(SOLUTION_COLORS[content.solution] || 'info') as any}
                        variant="light"
                        size="sm"
                    >
                        {content.solution}
                    </Badge>
                </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center text-sm gap-1.5 text-gray-600 leading-none">
                    <MdOutlinePersonOutline size={15} />
                    <span className="w-25 truncate">{content.sales_name || '-'}</span>
                </div>
                <CardFooter stage={stage} content={content} />
            </div>
        </div>
    );
});

OpportunityCard.displayName = 'OpportunityCard';

export default OpportunityCard;