import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdEdit, MdCalendarMonth, MdVerifiedUser, MdAssignment, MdStickyNote2 } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { useCandidateDetail } from './hooks/UsecandidateDetail';
import { CandidateProfileSidebar } from './components/CandidateProfileSidebar';
import { NotesTab } from './components/NotesTab';
import DateInterviewTab from './components/DateInterviewTab';
import BackgroundCheckTab from './components/BackgroundCheckTab';
import DocumentTab from './components/DocumentTab';
import PageHeader from '@/components/common/PageHeader';

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
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get('groupId');
    const backPath = groupId ? `/hr/candidate/group/${groupId}` : '/hr/candidate';
    const { candidate, loading, error } = useCandidateDetail(id);
    const [tab, setTab] = useState<TabKey>('interview');

    return (
        <>
            <PageMeta
                title={'Candidate Detail - Motor Sights International'}
                description="Candidate detail profile - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-4">
                <PageHeader
                    title="Detail Candidate"
                    backPath={() => navigate(backPath)}
                    subtitle={candidate?.candidate_name + ' - ' + candidate?.candidate_number || '-'}
                    actions={
                        <>
                            {candidate && (
                                <PermissionGate permission="update">
                                    <Button
                                        size="sm"
                                        startIcon={<MdEdit size={14} />}
                                        onClick={() => navigate(`/hr/candidate/${candidate.candidate_id}/edit`)}
                                        className="flex items-center gap-2 py-2"
                                    >
                                        Edit
                                    </Button>
                                </PermissionGate>
                            )}
                        </>
                    }
                />

                {loading && !candidate ? (
                    <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
                        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 h-96 animate-pulse" />
                        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 h-96 animate-pulse" />
                    </div>
                ) : error || !candidate ? (
                    <div className="bg-white rounded-2xl border border-[#E7E9F0] py-16 text-center">
                        <div className="text-[#3A4260] font-primary-bold mb-1">Candidate not found</div>
                        <div className="text-[13px] text-[#9AA2BA]">{error || 'This candidate may have been removed.'}</div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
                        <CandidateProfileSidebar candidate={candidate} />

                        <div className='overflow-auto pb-3'>
                            <div className="flex gap-1 px-3 pt-2 overflow-x-auto overflow-y-hidden">
                                {TABS.map((t) => {
                                    const isActive = tab === t.key;
                                    return (
                                        <button
                                            key={t.key}
                                            onClick={() => setTab(t.key)}
                                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap rounded-t-xl border border-b-0 transition-colors ${isActive
                                                ? 'bg-white font-primary-bold text-[#1F2430]  border-t-2xl shadow-[0_-8px_3px_-8px_rgba(15,23,42,0.16),-4px_0_10px_-6px_rgba(15,23,42,0.08),4px_0_10px_-6px_rgba(15,23,42,0.08)] border-[#E7E9F0] -mb-px'
                                                : 'bg-transparent text-[#9AA2BA] hover:text-[#5B6480] border-transparent'
                                                }`}
                                        >
                                            <t.icon size={15} /> {t.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-5 bg-white rounded-2xl shadow-sm overflow-hidden">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={tab}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        {tab === 'interview' && <DateInterviewTab candidateId={candidate.candidate_id} isActive={tab === 'interview'} candidate={candidate} />}
                                        {tab === 'bgcheck' && <BackgroundCheckTab candidateId={candidate.candidate_id} isActive={tab === 'bgcheck'} />}
                                        {tab === 'documents' && <DocumentTab candidateId={candidate.candidate_id} isActive={tab === 'documents'} />}
                                        {tab === 'notes' && <NotesTab candidateId={candidate.candidate_id} remark={candidate.remark} isActive={tab === 'notes'} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
