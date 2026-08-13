import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdEdit, MdCalendarMonth, MdVerifiedUser, MdAssignment, MdStickyNote2 } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { useCandidateDetail } from './hooks/UsecandidateDetail';
import { CandidateProfileSidebar } from './components/CandidateProfileSidebar';
import { NotesTab } from './components/NotesTab';
import DateInterviewTab from './components/DateInterviewTab';
import BackgroundCheckTab from '../Candidate/components/BackgroundCheckTab';
import DocumentTab from '../Candidate/components/DocumentTab';

type TabKey = 'interview' | 'bgcheck' | 'documents' | 'notes';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'interview', label: 'Date Interview', icon: MdCalendarMonth },
    { key: 'bgcheck', label: 'Background Check', icon: MdVerifiedUser },
    { key: 'documents', label: 'Document Onboarding', icon: MdAssignment },
    { key: 'notes', label: 'Notes', icon: MdStickyNote2 },
];

export default function EmployeeCandidateDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { candidate, loading, error } = useCandidateDetail(id);
    const [tab, setTab] = useState<TabKey>('interview');

    return (
        <>
            <PageMeta
                title={candidate ? `${candidate.candidate_name} - Motor Sights International` : 'Candidate Detail - Motor Sights International'}
                description="Candidate detail profile - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/hr/candidate')}
                        className="flex items-center gap-1.5 text-sm text-[#5B6480] hover:text-[#1F2430] transition-colors"
                    >
                        <MdArrowBack size={16} /> Back to Candidates
                    </button>

                    {candidate && (
                        <PermissionGate permission="update">
                            <Button
                                size="sm"
                                startIcon={<MdEdit size={14} />}
                                onClick={() => navigate(`/hr/candidate/${candidate.candidate_id}/edit`)}
                            >
                                Edit
                            </Button>
                        </PermissionGate>
                    )}
                </div>

                {loading && !candidate ? (
                    <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
                        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 h-96 animate-pulse" />
                        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 h-96 animate-pulse" />
                    </div>
                ) : error || !candidate ? (
                    <div className="bg-white rounded-2xl border border-[#E7E9F0] py-16 text-center">
                        <div className="text-[#3A4260] font-medium mb-1">Candidate not found</div>
                        <div className="text-[13px] text-[#9AA2BA]">{error || 'This candidate may have been removed.'}</div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
                        <CandidateProfileSidebar candidate={candidate} />

                        <div>
                            <div className="flex gap-1 border-b border-[#E7E9F0] overflow-x-auto">
                                {TABS.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => setTab(t.key)}
                                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                                            tab === t.key ? 'border-[#1F2430] text-[#1F2430]' : 'border-transparent text-[#9AA2BA] hover:text-[#5B6480]'
                                        }`}
                                    >
                                        <t.icon size={15} /> {t.label}
                                    </button>
                                ))}
                            </div>

                            <div className="py-5">
                                {tab === 'interview' && <DateInterviewTab candidateId={candidate.candidate_id} isActive={tab === 'interview'} />}
                                {tab === 'bgcheck' && <BackgroundCheckTab candidateId={candidate.candidate_id} isActive={tab === 'bgcheck'} />}
                                {tab === 'documents' && <DocumentTab candidateId={candidate.candidate_id} isActive={tab === 'documents'} />}
                                {tab === 'notes' && <NotesTab candidateId={candidate.candidate_id} remark={candidate.remark} isActive={tab === 'notes'} />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
