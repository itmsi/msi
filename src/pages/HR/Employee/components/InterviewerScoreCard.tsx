import { FaChartSimple, FaClipboardCheck, FaRegFilePdf, FaSpinner } from 'react-icons/fa6';
import { MdDeleteOutline } from 'react-icons/md';
import { Tooltip } from '@/components/ui/tooltip';
import { PermissionButton } from '@/components/common/PermissionComponents';
import formatIndonesianDate from '../../Candidate/utils/date';
import { getMultipliedScore } from '../../Candidate/components/InterviewScoreChart';
import type { InterviewFormItem } from '../../Candidate/services/interviewService';
import { getRoleStyle } from '../utils/roleStyle';
import { sortByCategoryOrder } from '../utils/interviewFormHelpers';

interface InterviewerScoreCardProps {
    interviewer: string;
    forms: InterviewFormItem[]; // already deduped by category (one entry per category)
    assignRoles: string[];
    isGeneratingPdf: boolean;
    onEditScore: () => void;
    onShowStats: () => void;
    onExportPdf: () => void;
    onDeleteForm: () => void;
}

const InterviewerScoreCard = ({
    interviewer,
    forms,
    assignRoles,
    isGeneratingPdf,
    onEditScore,
    onShowStats,
    onExportPdf,
    onDeleteForm,
}: InterviewerScoreCardProps) => {
    const totalScore = forms.reduce((sum, f) => {
        const categoryScore = f.detail_interviews?.reduce((s, d) => s + (parseInt(d.score) || 0), 0) || 0;
        return sum + getMultipliedScore(f.company_value, categoryScore);
    }, 0);

    return (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:border-[#C4C9DA] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <h6 className="text-sm font-primary-bold text-[#1F2430]">
                        {interviewer}
                    </h6>
                    <p className="text-[10px] text-[#C4C9DA] mt-0.5">{formatIndonesianDate(forms[0]?.created_at)}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {assignRoles.length > 0 ? (
                            assignRoles.map((role, i) => (
                                <span key={i} className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] border rounded-full font-medium ${getRoleStyle(role)}`}>
                                    {role.toUpperCase()}
                                </span>
                            ))
                        ) : (
                            <span className="text-[11px] text-[#9AA2BA]">No role assigned</span>
                        )}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 text-sm font-bold">
                        {totalScore}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide text-[#9AA2BA] mt-1">Score</div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {sortByCategoryOrder(forms).map((form) => {
                    const categoryScore = form.detail_interviews?.reduce((s, d) => s + (parseInt(d.score) || 0), 0) || 0;
                    const score = getMultipliedScore(form.company_value, categoryScore);
                    return (
                        <span key={form.interview_id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-md font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                        >
                            {form.company_value}: <span className='font-secondary font-semibold'>{score}</span>
                        </span>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-4 mt-3 pt-2 border-t border-[#F0F1F5]">

                <Tooltip content="Edit Score" position="top">
                    <PermissionButton
                        permission={['read']}
                        onClick={onEditScore}
                        className={`p-2 rounded-md text-sm font-medium transition-colors relative text-gray-600 hover:text-gray-700 hover:bg-gray-50 ring-0`}
                    >
                        <FaClipboardCheck className="w-4 h-4" />
                    </PermissionButton>
                </Tooltip>
                <Tooltip content="Score Stats" position="top">
                    <PermissionButton
                        permission={['read']}
                        onClick={onShowStats}
                        className={`p-2 rounded-md text-sm font-medium transition-colors relative text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 ring-0`}
                    >
                        <FaChartSimple className="w-4 h-4" />
                    </PermissionButton>
                </Tooltip>
                <Tooltip content={'Download'} position="top">
                    <PermissionButton
                        permission={['read']}
                        onClick={onExportPdf}
                        className={`p-2 rounded-md text-sm font-medium transition-colors relative text-blue-600 hover:text-blue-700 hover:bg-blue-50 ring-0`}
                        disabled={isGeneratingPdf}
                    >
                        {isGeneratingPdf ? (
                            <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <FaRegFilePdf className="w-4 h-4" />
                        )}
                    </PermissionButton>
                </Tooltip>

                <Tooltip content={'Delete'} position="top">
                    <PermissionButton
                        permission={["delete"]}
                        onClick={onDeleteForm}
                        className={`p-2 rounded-md text-sm font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50 ring-0`}
                    >
                        <MdDeleteOutline className="w-4 h-4" />
                    </PermissionButton>
                </Tooltip>
            </div>
        </div>
    );
};

export default InterviewerScoreCard;
