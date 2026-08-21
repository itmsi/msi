import { useState } from 'react';
import {
    MdMail, MdPhone, MdLocationOn, MdCake, MdPerson, MdFavorite, MdPublic,
    MdTag, MdBusiness, MdOutlineFileDownload, MdEditCalendar,
    MdOutlineEditNote, MdGroup,
} from 'react-icons/md';
import type { CandidateDetail } from '../types/Candidate';
import moment from 'moment';
// @ts-expect-error moment ships this locale file without a type declaration for the submodule path
import 'moment/locale/id';
import { STATUS_STYLE, DEFAULT_STATUS_STYLE, COMPANY_STYLE, DEFAULT_COMPANY_STYLE, initials, hue } from './Candidatecard';

interface InfoRowProps {
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}

function InfoRow({ icon: Icon, label, children, fullWidth }: InfoRowProps) {
    return (
        <div className={`flex items-start gap-2.5 py-2 ${fullWidth ? 'col-span-2' : ''}`}>
            <Icon size={15} className="text-[#AAB1C6] mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[10.5px] text-[#9AA2BA] uppercase tracking-wide">{label}</p>
                <p className={`text-[13px] text-[#3A4260] font-secondary font-medium ${fullWidth ? '' : 'truncate'}`}>{children}</p>
            </div>
        </div>
    );
}

function formatDate(value: string | Date | null | undefined) {
    if (!value) return '-';
    const date = moment(value).locale('id');
    return date.isValid() ? date.format('D MMMM YYYY') : '-';
}

function formatAddress(c: CandidateDetail) {
    const parts = [c.candidate_address, c.candidate_city, c.candidate_state, c.candidate_country];
    const seen = new Set<string>();
    const unique = parts.filter((p) => {
        if (!p) return false;
        const key = p.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    return unique.length ? unique.join(', ') : null;
}

interface CandidateProfileSidebarProps {
    candidate: CandidateDetail;
}

export function CandidateProfileSidebar({ candidate }: CandidateProfileSidebarProps) {
    const [imgError, setImgError] = useState(false);

    const s = STATUS_STYLE[candidate.candidate_status] || DEFAULT_STATUS_STYLE;
    const cs = candidate.company_name
        ? COMPANY_STYLE[candidate.company_name] || DEFAULT_COMPANY_STYLE
        : DEFAULT_COMPANY_STYLE;
    const h = hue(candidate.candidate_id);

    const photoSrc = candidate.candidate_foto
        ? (candidate.candidate_foto.startsWith('http') ? `${candidate.candidate_foto}/download` : candidate.candidate_foto)
        : null;
    const resumeUrl = candidate.candidate_resume || null;

    return (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] shadow-sm p-6 lg:sticky lg:top-6">
            <div className="flex flex-col items-center text-center">
                {photoSrc && !imgError ? (
                    <img
                        src={photoSrc}
                        alt={candidate.candidate_name}
                        onError={() => setImgError(true)}
                        className="w-20 h-20 rounded-full object-cover"
                    />
                ) : (
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-secondary font-semibold text-xl"
                        style={{ background: cs.fg }}
                    >
                        {initials(candidate.candidate_name)}
                    </div>
                )}

                <h1 className="text-lg font-primary-bold mt-3 text-[#1F2430]">{candidate.candidate_name}</h1>
                <span className="flex items-center gap-1 text-xs text-[#9AA2BA] mt-1">
                    <MdTag size={12} /> {candidate.candidate_number}
                </span>

                <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-secondary font-semibold mt-3"
                    style={{ background: s.bg, color: s.fg }}
                >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                    {candidate.candidate_status || '-'}
                </span>


            </div>

            <div className="mt-5 pt-5 border-t border-[#E7E9F0] space-y-0.5">
                <InfoRow icon={MdBusiness} label="Applied Role">
                    {candidate.title_name || '-'}
                    {candidate.group_name && (
                        <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-secondary font-medium mt-2"
                            style={{ background: `hsl(${h} 60% 96%)`, color: `hsl(${h} 55% 38%)` }}
                        >
                            <MdGroup size={12} /> {candidate.group_name}
                        </span>
                    )}
                </InfoRow>
                <InfoRow icon={MdBusiness} label="Department / Company">
                    {candidate.department_name || '-'}{candidate.company_name ? ` · ${candidate.company_name}` : ''}
                </InfoRow>
                <InfoRow icon={MdMail} label="Email">{candidate.candidate_email || '-'}</InfoRow>
                <InfoRow icon={MdPhone} label="Phone">{candidate.candidate_phone || '-'}</InfoRow>
                <InfoRow icon={MdLocationOn} label="Address">{formatAddress(candidate) || '-'}</InfoRow>
            </div>

            <div className="mt-2 pt-4 border-t border-[#E7E9F0] grid grid-cols-2 gap-x-2">
                <InfoRow icon={MdPerson} label="Gender">{candidate.candidate_gender || '-'}</InfoRow>
                <InfoRow icon={MdFavorite} label="Marital Status">{candidate.candidate_marital_status || '-'}</InfoRow>
                <InfoRow icon={MdPublic} label="Nationality">{candidate.candidate_nationality || '-'}</InfoRow>
                <InfoRow icon={MdCake} label="Age" fullWidth>
                    {candidate.candidate_date_birth
                        ? `${candidate.candidate_age ?? '-'} th (${formatDate(candidate.candidate_date_birth)})`
                        : (candidate.candidate_age ? `${candidate.candidate_age} th` : '-')}
                </InfoRow>
            </div>

            <div className="mt-2 pt-4 border-t border-[#E7E9F0] space-y-0.5">
                <InfoRow icon={MdEditCalendar} label="PTK Date">
                    {candidate.ptk_date ? formatDate(candidate.ptk_date) : '-'}
                </InfoRow>
                <InfoRow icon={MdOutlineEditNote} label="Offering Date">
                    <span className="inline-flex items-center gap-2">
                        {candidate.offering_letter ? formatDate(candidate.offering_letter) : '-'}
                    </span>
                </InfoRow>
            </div>

            {resumeUrl && (
                <div className="mt-2 pt-4 border-t border-[#E7E9F0]">
                    <a
                        href={resumeUrl.startsWith('http') ? `${resumeUrl}/download` : resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-secondary font-semibold text-white bg-[#1F2430] hover:opacity-90 transition-opacity"
                    >
                        <MdOutlineFileDownload size={15} /> Download CV
                    </a>
                </div>
            )}

            <p className="text-[11px] text-[#C4C9DA] mt-4 text-center">
                Created by {candidate.created_by_name || '-'} · Updated by {candidate.updated_by_name || '-'}
            </p>
        </div>
    );
}
