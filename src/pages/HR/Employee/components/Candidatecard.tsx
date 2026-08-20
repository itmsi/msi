import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
    MdGroup,
    MdCheckCircle,
    MdCancel,
    MdHelpOutline,
    MdEdit,
    MdMoreVert,
    MdSchedule,
    MdDeleteOutline,
} from 'react-icons/md';
import type { CandidateItem } from '../types/Candidate';
import { getRoleStyle } from '../utils/roleStyle';

interface CandidateCardProps {
    candidate: CandidateItem;
    onView: (candidate: CandidateItem) => void;
    onEdit: (candidate: CandidateItem) => void;
    onDelete: (candidate: CandidateItem) => void;
    index: number;
}

export const initials = (name: string | null | undefined) => {
    if (!name?.trim()) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
};

export const hue = (id: string) => {
    const idx = Math.min(5, Math.max(id.length - 1, 0));
    const code = id.charCodeAt(idx) || 0;
    return (code * 37) % 360;
};

const formatDate = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const normalizeAssignRole = (value: string[] | string | null | undefined): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

export const STATUS_STYLE: Record<string, { bg: string; fg: string; dot: string }> = {
    New: { bg: '#EEF2FF', fg: '#4338CA', dot: '#6366F1' },
    Screening: { bg: '#FFFBEB', fg: '#B45309', dot: '#F59E0B' },
    Interviewed: { bg: '#FFF7ED', fg: '#C2410C', dot: '#F97316' },
    Offering: { bg: '#FFFBEB', fg: '#B45309', dot: '#F59E0B' },
    Hired: { bg: '#ECFDF5', fg: '#047857', dot: '#10B981' },
    Complete: { bg: '#ECFDF5', fg: '#047857', dot: '#10B981' },
    Rejected: { bg: '#FFF1F2', fg: '#E11D48', dot: '#F43F5E' },
};
export const DEFAULT_STATUS_STYLE = { bg: '#F5F6F8', fg: '#5B6480', dot: '#9AA2BA' };

export const OFFERING_STYLE: Record<string, { bg: string; fg: string; Icon: typeof MdCheckCircle; label: string }> = {
    OK: { bg: '#ECFDF5', fg: '#047857', Icon: MdCheckCircle, label: 'Accepted' },
    'NOT OK': { bg: '#FFF1F2', fg: '#E11D48', Icon: MdCancel, label: 'Declined' },
};

export const COMPANY_STYLE: Record<string, { bg: string; fg: string }> = {
    IEL: { bg: '#EFF6FF', fg: '#1D4ED8' },
    'IEL-1': { bg: '#ECFEFF', fg: '#0E7490' },
    'IEL-2': { bg: '#F0FDFA', fg: '#0F766E' },
    ETI: { bg: '#FFFBEB', fg: '#B45309' },
    ITI: { bg: '#FFF7ED', fg: '#C2410C' },
    IEC: { bg: '#FDF2F8', fg: '#BE185D' },
    'IEC-1': { bg: '#FCE7F3', fg: '#9D174D' },
    MSF: { bg: '#F5F3FF', fg: '#6D28D9' },
    MSI: { bg: '#EEF2FF', fg: '#4338CA' },
    MSW: { bg: '#F0FDF4', fg: '#15803D' },
    MSO: { bg: '#FEF2F2', fg: '#B91C1C' },
    MSP: { bg: '#F1F5F9', fg: '#334155' },
};
export const DEFAULT_COMPANY_STYLE = { bg: '#F5F6F8', fg: '#8891AB' };

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-28 shrink-0 text-[13px]">{label}</div>
            <div className="text-[13px] font-secondary font-semibold text-[#1F2430] min-w-0">{children}</div>
        </div>
    );
}

export function CandidateCard({ candidate, onView, onEdit, onDelete, index }: CandidateCardProps) {
    const s = STATUS_STYLE[candidate.candidate_status] || DEFAULT_STATUS_STYLE;
    const cs = candidate.company_name
        ? COMPANY_STYLE[candidate.company_name] || DEFAULT_COMPANY_STYLE
        : DEFAULT_COMPANY_STYLE;
    const h = hue(candidate.candidate_id);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const handleCardClick = () => onView(candidate);
    const handleCardKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView(candidate);
        }
    };

    const offering = candidate.candidate_status_offering_letter
        ? OFFERING_STYLE[candidate.candidate_status_offering_letter]
        : null;

    const interviewDate = candidate.schedule_interview?.schedule_interview_date
        ? formatDate(candidate.schedule_interview.schedule_interview_date)
        : null;
    const interviewTime = candidate.schedule_interview?.schedule_interview_time || null;
    const assignedRoles = normalizeAssignRole(candidate.schedule_interview?.assign_role);
    const MAX_VISIBLE_ROLES = 5;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * .1, duration: 0.2 }}
            className={`relative bg-white rounded-b-2xl border hover:border-[#C4C9DA] shadow-lg/10 hover:shadow-black/4 transition-all duration-200`} style={{ borderColor: cs.fg + '50' }}>
            <div className="h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${cs.fg}, ${s.dot})` }} />
            <div ref={menuRef} className="absolute top-4 right-4 z-10">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen((v) => !v);
                    }}
                    aria-label="Candidate actions"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-[#9AA2BA] hover:bg-[#F0F1F5] hover:text-[#5B6480] transition"
                >
                    <MdMoreVert size={18} />
                </button>

                {menuOpen && (
                    <div
                        role="menu"
                        className="absolute right-0 mt-1 w-44 bg-white rounded-lg border border-[#E7E9F0] shadow-lg py-1"
                    >
                        <button
                            type="button"
                            role="menuitem"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(false);
                                onEdit(candidate);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#3A4260] hover:bg-[#F5F6F8] transition"
                        >
                            <MdEdit size={14} /> Edit candidate
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(false);
                                onDelete(candidate);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#E11D48] hover:bg-[#FFF1F2] transition"
                        >
                            <MdDeleteOutline size={14} /> Delete candidate
                        </button>
                        {/* TODO: tambahkan aksi lain di sini kalau endpoint-nya sudah ada,
                            mis. "Update status", "Send offering letter", "Delete candidate" */}
                    </div>
                )}
            </div>
            <div
                role="button"
                tabIndex={0}
                onClick={handleCardClick}
                onKeyDown={handleCardKeyDown}
                className="p-5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#8B93B8]/40 rounded-2xl"
            >
                <div className="flex items-start justify-between mb-4 pr-8">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-secondary font-semibold text-white"
                            style={{ background: cs.fg }}
                        >
                            {initials(candidate.candidate_name)}
                        </div>
                        <div className="min-w-0">
                            <div className="text-[15px] font-primary-bold truncate leading-tight">
                                {candidate.candidate_name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[11px] text-[#9AA2BA]">
                                    {candidate.candidate_number}
                                </span>
                                <span
                                    className="inline-flex items-center gap-1 text-[10.5px] font-primary-bold px-2 py-0.5 rounded-full"
                                    style={{ background: s.bg, color: s.fg }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                    {candidate.candidate_status || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-1 space-y-1">
                    <DetailRow label="Company">
                        {candidate.company_name ? (
                            <span
                                className="inline-flex items-center text-[11.5px] font-secondary font-semibold px-2 py-0.5 rounded-md"
                                style={{ background: cs.bg, color: cs.fg }}
                            // style={{ background: `linear-gradient(90deg, ${cs.fg}, ${s.fg + '50'})` }}
                            >
                                {candidate.company_name}
                            </span>
                        ) : (
                            <span className="font-normal text-[#C4C9DA] italic">Not set</span>
                        )}
                    </DetailRow>
                    <DetailRow label="Department">
                        {candidate.department_name || <span className="font-normal text-[#C4C9DA] italic">Not set</span>}
                    </DetailRow>
                    <DetailRow label="Applied Role">
                        {candidate.title_name || <span className="font-normal text-[#C4C9DA] italic">Not set</span>}
                    </DetailRow>
                    <DetailRow label="Interview Date">
                        {interviewDate ? (
                            <span className="inline-flex items-center gap-1">
                                <MdSchedule size={12} className="text-[#AAB1C6]" />
                                {interviewDate}
                                {interviewTime && <span className="text-[#9AA2BA] font-normal">· {interviewTime}</span>}
                            </span>
                        ) : (
                            <span className="font-normal text-[#C4C9DA] italic">Not scheduled</span>
                        )}
                    </DetailRow>
                    <DetailRow label="Assigned">
                        {assignedRoles.length > 0 ? (() => {
                            const visibleRoles = assignedRoles.slice(0, MAX_VISIBLE_ROLES);
                            return (
                                <div className="flex flex-wrap gap-1">
                                    {visibleRoles.map((role, i) => (
                                        <span
                                            key={i}
                                            className={`shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-secondary font-semibold border rounded-full ${getRoleStyle(role)}`}
                                        >
                                            {role.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            );
                        })() : (
                            <span className="font-normal text-[#C4C9DA] italic">Unassigned</span>
                        )}
                    </DetailRow>
                    <DetailRow label="Offering Letter">
                        {offering ? (
                            <span
                                className="inline-flex items-center gap-1 text-[11px] font-secondary font-semibold px-2 py-0.5 rounded-md"
                                style={{ background: offering.bg, color: offering.fg }}
                            >
                                <offering.Icon size={12} /> {offering.label}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-primary-bold px-2 py-0.5 rounded-md bg-[#F5F6F8] text-[#9AA2BA]">
                                <MdHelpOutline size={12} /> Awaiting
                            </span>
                        )}
                    </DetailRow>
                </div>

                {candidate.group_name && (
                    <div className="mb-4 mt-2">
                        <span
                            className="inline-flex items-center gap-1 text-[11px] font-primary-bold px-2 py-0.5 rounded-md"
                            style={{ background: `hsl(${h} 60% 96%)`, color: `hsl(${h} 55% 38%)` }}
                        >
                            <MdGroup size={12} /> {candidate.group_name}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export const animationVariants = {
    container: {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    },
    item: {
        hidden: { opacity: 0, x: 10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3, ease: 'easeOut' }
        },
        exit: {
            opacity: 0,
            x: -10,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    },
    row: {
        hidden: { opacity: 0, x: -10 },
        visible: (index: any) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.2,
                delay: index * 0.07,
                ease: "easeOut"
            }
        }),
        exit: {
            opacity: 0,
            x: -10,
            transition: {
                duration: 0.1,
                ease: "easeIn"
            }
        }
    }
}