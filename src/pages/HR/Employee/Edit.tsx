import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { useCandidateDetail } from './hooks/UsecandidateDetail';
import CreateCandidateForm from './CreateCandidateForm';
import type { Candidate } from './types/hr';

export default function EmployeeCandidateEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { candidate, loading, error } = useCandidateDetail(id);

    const backToDetail = () => navigate(`/hr/candidate/${id}`);

    return (
        <>
            <PageMeta title="Edit Candidate - Motor Sights International" description="Edit candidate profile - Motor Sights International" />

            <div className="space-y-4">
                <button
                    onClick={backToDetail}
                    className="flex items-center gap-1.5 text-sm text-[#5B6480] hover:text-[#1F2430] transition-colors"
                >
                    <MdArrowBack size={16} /> Back to Detail
                </button>

                <div className="bg-white rounded-2xl border border-[#E7E9F0] shadow-sm max-w-3xl mx-auto">
                    <div className="px-6 py-4 border-b border-[#E7E9F0]">
                        <h3 className="text-lg font-primary-bold text-[#1F2430]">
                            {candidate ? `Edit ${candidate.candidate_name}` : 'Edit Candidate'}
                        </h3>
                        <p className="mt-1 text-sm text-[#9AA2BA]">Update the candidate information below</p>
                    </div>

                    <div className="p-6 font-secondary">
                        {loading && !candidate ? (
                            <div className="h-64 animate-pulse rounded-lg bg-[#F5F6F8]" />
                        ) : error || !candidate ? (
                            <div className="text-center py-10">
                                <p className="text-[#3A4260] font-primary-bold mb-1">Candidate not found</p>
                                <p className="text-[13px] text-[#9AA2BA]">{error || 'This candidate may have been removed.'}</p>
                            </div>
                        ) : (
                            <CreateCandidateForm
                                initialData={candidate as unknown as Candidate}
                                onSave={backToDetail}
                                onCancel={backToDetail}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
