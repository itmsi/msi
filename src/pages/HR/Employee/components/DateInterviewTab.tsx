import { useState, useEffect } from 'react';
import React from 'react';
import { interviewScheduleService, interviewFormService, type InterviewSchedule, type InterviewFormItem, type ScheduleCreateRequest } from '../../Candidate/services/interviewService';
import { generateInterviewPDFBlob } from '../utils/PDFInterviewReport';
import { toast } from 'react-hot-toast';
import { FaPlus, FaChevronDown, FaChevronUp, FaClipboardCheck, FaRegPenToSquare, FaSpinner } from 'react-icons/fa6';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import InterviewScoreChart, { getMultipliedScore } from '../../Candidate/components/InterviewScoreChart';
import FormScoringCanvas from './FormScoringCanvas';
import { PDFPreviewModal } from './PDFPreviewModal';
import InterviewerScoreCard from './InterviewerScoreCard';
import { dedupeFormsByCategory, getAssignRoleArr, getLatestInterviewerForms } from '../utils/interviewFormHelpers';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import DatePicker from '@/components/form/date-picker';
import { Tooltip } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import formatIndonesianDate from '../../Candidate/utils/date';
import type { CandidateDetail } from '../types/Candidate';
import { PermissionButton, PermissionGate } from '@/components/common/PermissionComponents';
import Label from '@/components/form/Label';
import { handleKeyPress } from '@/helpers/generalHelper';

interface DateInterviewTabProps {
    candidateId: string;
    isActive: boolean;
    candidate?: CandidateDetail | null;
}

const ROLE_OPTIONS = ['HR', 'GM', 'VP', 'BOD', 'PUB'];
const MAX_VISIBLE_ROLES = 5;
const ROLE_STYLE: Record<string, string> = {
    HR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    GM: 'bg-green-100 text-green-800 border-green-200',
    VP: 'bg-amber-100 text-amber-800 border-amber-200',
    BOD: 'bg-pink-100 text-pink-800 border-pink-200',
    PUB: 'bg-teal-100 text-teal-800 border-teal-200',
};
const DEFAULT_ROLE_STYLE = 'bg-gray-100 text-gray-800 border-gray-200';
const getRoleStyle = (role: string) => ROLE_STYLE[role.toUpperCase()] || DEFAULT_ROLE_STYLE;
const ROLE_LABEL_OVERRIDES: Record<string, string> = {
    PUB: 'USER',
};
const getRoleLabel = (role: string) => ROLE_LABEL_OVERRIDES[role.toUpperCase()] || role.toUpperCase();

const DateInterviewTab = ({ candidateId, isActive, candidate }: DateInterviewTabProps) => {
    const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<InterviewSchedule | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteFormConfirm, setShowDeleteFormConfirm] = useState(false);
    const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [scoringPanel, setScoringPanel] = useState<{ scheduleId: string; editingFormId?: string } | null>(null);
    const [expandedSchedules, setExpandedSchedules] = useState<Record<string, boolean>>({});
    const [scheduleForms, setScheduleForms] = useState<Record<string, InterviewFormItem[]>>({});
    const [loadingForms, setLoadingForms] = useState<Record<string, boolean>>({});
    const [showFormScore, setShowFormScore] = useState(false);
    const [formScoreData, setFormScoreData] = useState<{ company_value: string; total_score: number }[]>([]);
    const [generatingPdfKey, setGeneratingPdfKey] = useState<string | null>(null);
    const [pdfPreview, setPdfPreview] = useState<{ url: string; fileName: string; title: string } | null>(null);

    const [form, setForm] = useState({ date: '', time: '', duration: '', assign_role: [] as string[] });

    const fetchData = async () => {
        if (!candidateId) return;
        setLoading(true);
        try {
            const result = await interviewScheduleService.getList(candidateId);
            const list = result.data || [];
            setSchedules(list);
            list.forEach((s) => { fetchScheduleForms(s.schedule_interview_id); });
        } catch {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isActive) fetchData();
    }, [isActive, candidateId]);

    const fetchScheduleForms = async (scheduleId: string) => {
        setLoadingForms(prev => ({ ...prev, [scheduleId]: true }));
        try {
            const result = await interviewFormService.getList({ schedule_interview_id: scheduleId });
            setScheduleForms(prev => ({ ...prev, [scheduleId]: result.data || [] }));
        } catch {
            toast.error('Failed to load interview forms');
        } finally {
            setLoadingForms(prev => ({ ...prev, [scheduleId]: false }));
        }
    };

    const toggleExpand = async (scheduleId: string) => {
        const willOpen = !expandedSchedules[scheduleId];
        setExpandedSchedules(prev => ({ ...prev, [scheduleId]: willOpen }));
        if (willOpen && !scheduleForms[scheduleId]) {
            await fetchScheduleForms(scheduleId);
        }
    };

    const openScoringPanel = async (scheduleId: string, editingFormId?: string) => {
        setScoringPanel({ scheduleId, editingFormId });
        if (!scheduleForms[scheduleId]) {
            await fetchScheduleForms(scheduleId);
        }
    };

    const closeScoringPanel = () => {
        if (scoringPanel) fetchScheduleForms(scoringPanel.scheduleId);
        setScoringPanel(null);
    };

    const getFormScoreData = (forms: InterviewFormItem[]) =>
        dedupeFormsByCategory(forms).map((form) => ({
            company_value: form.company_value,
            total_score: form.detail_interviews?.reduce((sum, detail) => sum + (parseInt(detail.score) || 0), 0) || 0,
        }));

    const handleExportPdf = async (schedule: InterviewSchedule, interviewerName: string, forms: InterviewFormItem[], sessionKey: string) => {
        setGeneratingPdfKey(sessionKey);
        try {
            const blob = await generateInterviewPDFBlob({
                data_candidate: {
                    name_candidate: candidate?.candidate_name || 'N/A',
                    gender_candidate: candidate?.candidate_gender || 'N/A',
                    company_candidate: candidate?.company_name || 'N/A',
                    interviewer_candidate: interviewerName,
                    position_candidate: candidate?.title_name || 'N/A',
                    date_interview_candidate: formatIndonesianDate(schedule.schedule_interview_date),
                    age_candidate: candidate?.candidate_age ?? 'N/A',
                    duration_candidate: schedule.schedule_interview_duration || 'N/A',
                },
                interview: forms.map((f) => ({
                    company_value: f.company_value,
                    comment: f.comment,
                    detail_interviews: (f.detail_interviews || []).map((d) => ({
                        aspect: d.aspect,
                        question: d.question,
                        answer: d.answer,
                        score: parseInt(d.score) || 0,
                    })),
                })),
                data_score: getFormScoreData(forms),
            });
            const url = URL.createObjectURL(blob);
            setPdfPreview({
                url,
                fileName: `interview-assessment-${(candidate?.candidate_name || 'candidate').replace(/\s+/g, '-').toLowerCase()}.pdf`,
                title: `Interview Report — ${interviewerName}`,
            });
        } catch {
            toast.error('Failed to generate PDF');
        } finally {
            setGeneratingPdfKey(null);
        }
    };

    const closePdfPreview = () => {
        if (pdfPreview) URL.revokeObjectURL(pdfPreview.url);
        setPdfPreview(null);
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ date: '', time: '', duration: '', assign_role: [] });
        setShowModal(true);
    };

    const openEdit = (s: InterviewSchedule) => {
        setEditing(s);
        const rawDate = s.schedule_interview_date || '';
        const rawTime = s.schedule_interview_time || '';
        const dateOnly = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
        const timeOnly = rawTime.length > 5 ? rawTime.substring(0, 5) : rawTime;
        setForm({ date: dateOnly, time: timeOnly, duration: s.schedule_interview_duration || '', assign_role: getAssignRoleArr(s).map(r => r.toUpperCase()) });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.date || !form.time) { toast.error('Date and time required'); return; }
        setSubmitting(true);
        try {
            const payload: ScheduleCreateRequest = {
                candidate_id: candidateId,
                schedule_interview_date: form.date,
                schedule_interview_time: form.time,
                schedule_interview_duration: form.duration,
                assign_role: form.assign_role.join(', '),
            };
            if (editing) {
                await interviewScheduleService.update(editing.schedule_interview_id, payload);
                toast.success('Schedule updated');
            } else {
                await interviewScheduleService.create(payload);
                toast.success('Schedule created');
            }
            setShowModal(false);
            fetchData();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to save schedule');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await interviewScheduleService.delete(deletingId);
            toast.success('Deleted');
            setShowDeleteConfirm(false);
            setDeletingId(null);
            fetchData();
        } catch {
            toast.error('Delete failed');
        }
    };

    const handleDeleteForm = async () => {
        if (!deletingFormId) return;
        try {
            await interviewFormService.delete(deletingFormId);
            toast.success('Form deleted');
            setShowDeleteFormConfirm(false);
            setDeletingFormId(null);
            const keys = Object.keys(expandedSchedules);
            for (const sid of keys) {
                if (expandedSchedules[sid]) {
                    await fetchScheduleForms(sid);
                }
            }
        } catch {
            toast.error('Delete failed');
        }
    };

    if (loading) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-20 bg-[#F0F1F5] rounded animate-pulse" />
                    <div className="h-9 w-32 bg-[#F0F1F5] rounded-lg animate-pulse" />
                </div>
                <div className="bg-white rounded-2xl border border-[#E7E9F0] overflow-hidden">
                    <div className="bg-[#FAFAFB] border-b border-[#E7E9F0] px-4 py-3 h-9.5" />
                    <div className="divide-y divide-[#F0F1F5]">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="px-4 py-4 flex items-center gap-6">
                                <div className="h-4 w-24 bg-[#F0F1F5] rounded animate-pulse" />
                                <div className="flex gap-1">
                                    <div className="h-5 w-9 bg-[#F0F1F5] rounded animate-pulse" />
                                    <div className="h-5 w-9 bg-[#F0F1F5] rounded animate-pulse" />
                                </div>
                                <div className="ml-auto space-y-1.5">
                                    <div className="h-3.5 w-28 bg-[#F0F1F5] rounded animate-pulse" />
                                    <div className="h-3 w-16 bg-[#F0F1F5] rounded animate-pulse" />
                                </div>
                                <div className="h-7 w-28 bg-[#F0F1F5] rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div>
            <div className="flex items-center justify-end mb-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={openAdd}
                    className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                    size="sm"
                >
                    <MdAdd className="w-4 h-4" />
                    Add Schedule
                </Button>
            </div>

            {schedules.length === 0 ? (
                <p className="text-sm text-[#9AA2BA]">No interview schedules yet.</p>
            ) : (
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-sm">
                            <thead>
                                <tr className="bg-[#dfe8f2] border-b border-[#E7E9F0]">
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Created by</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Assigned</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Score</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Date</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151] w-30 sticky right-0 z-1 bg-[#dfe8f2] shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F1F5]">
                                {schedules.map((s) => (
                                    <React.Fragment key={s.schedule_interview_id}>
                                        <tr
                                            className={`transition-colors font-secondary *:${expandedSchedules[s.schedule_interview_id] || scoringPanel?.scheduleId === s.schedule_interview_id
                                                ? 'bg-[#F5F7FF] shadow-[inset_3px_0_0_0_#4338CA]'
                                                : 'hover:bg-[#FAFAFB]'
                                                }`}
                                        >
                                            <td className="px-4 py-3 text-[#3A4260]">{s.created_by_name || s.created_by || '-'}</td>
                                            <td className="px-4 py-3">
                                                {s.assign_role ? (() => {
                                                    const roles = getAssignRoleArr(s);
                                                    const visibleRoles = roles.slice(0, MAX_VISIBLE_ROLES);
                                                    const extraRoles = roles.slice(MAX_VISIBLE_ROLES);
                                                    return (
                                                        <div className="flex flex-nowrap gap-1">
                                                            {visibleRoles.map((role, i) => (
                                                                <span key={i} className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs border rounded-full font-primary ${getRoleStyle(role)}`}>
                                                                    {getRoleLabel(role)}
                                                                </span>
                                                            ))}
                                                            {extraRoles.length > 0 && (
                                                                <Tooltip content={extraRoles.map(r => getRoleLabel(r)).join(', ')} position="top">
                                                                    <span className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs border rounded-full font-primary ${DEFAULT_ROLE_STYLE}`}>
                                                                        +{extraRoles.length}
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    );
                                                })() : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    if (loadingForms[s.schedule_interview_id]) {
                                                        return <FaSpinner className="w-3.5 h-3.5 animate-spin text-[#9AA2BA]" />;
                                                    }
                                                    const forms = scheduleForms[s.schedule_interview_id] || [];
                                                    if (!forms.length) return <span className="text-xs text-[#9AA2BA]">Not scored</span>;
                                                    const totalScore = getLatestInterviewerForms(forms).reduce((sum, f) => {
                                                        const categoryScore = f.detail_interviews?.reduce((s2, d) => s2 + (parseInt(d.score) || 0), 0) || 0;
                                                        return sum + getMultipliedScore(f.company_value, categoryScore);
                                                    }, 0);
                                                    return (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs border rounded-full font-primary-bold bg-indigo-100 text-indigo-800 border-indigo-200">
                                                                {totalScore}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-[#1F2430]">{formatIndonesianDate(s.schedule_interview_date)}</div>
                                                <div className="text-xs text-[#9AA2BA]">{s.schedule_interview_time} {s.schedule_interview_duration ? `(${s.schedule_interview_duration})` : ''}</div>
                                            </td>
                                            <td
                                                className={`sticky right-0 z-10 ${expandedSchedules[s.schedule_interview_id] || scoringPanel?.scheduleId === s.schedule_interview_id
                                                    ? 'bg-[#F5F7FF]'
                                                    : 'bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center px-4 py-3 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)]">
                                                    {loadingForms[s.schedule_interview_id] ?
                                                        <FaSpinner className="w-3.5 h-3.5 animate-spin text-[#9AA2BA]" />
                                                        :
                                                        <Tooltip content={scheduleForms[s.schedule_interview_id]?.length ? 'Edit Score' : 'Add Score'} position="top">
                                                            <PermissionButton
                                                                permission={['create', 'update']}
                                                                onClick={() => openScoringPanel(s.schedule_interview_id)}
                                                                className={`p-2 rounded-md text-sm font-medium transition-colors relative text-gray-600 hover:text-gray-700 hover:bg-gray-50 ring-0`}
                                                            >
                                                                {scheduleForms[s.schedule_interview_id]?.length ? <FaClipboardCheck className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
                                                            </PermissionButton>
                                                        </Tooltip>
                                                    }
                                                    {/* <Tooltip content="Score Stats" position="top">
                                                        <PermissionButton
                                                            permission={['read']}
                                                            onClick={() => handleOpenScoreStats(s.schedule_interview_id)}
                                                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 ring-0`}
                                                        >
                                                            <FaChartSimple className="w-4 h-4" />
                                                        </PermissionButton>
                                                    </Tooltip> */}
                                                    <Tooltip content="Edit Schedule" position="top">
                                                        <PermissionButton
                                                            permission={['read']}
                                                            onClick={() => openEdit(s)}
                                                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-blue-600 hover:text-blue-700 hover:bg-blue-50 ring-0`}
                                                        >
                                                            <FaRegPenToSquare className="w-4 h-4" />
                                                        </PermissionButton>
                                                    </Tooltip>
                                                    <Tooltip content="Delete Schedule" position="top">
                                                        <PermissionButton
                                                            permission={['delete']}
                                                            onClick={() => { setDeletingId(s.schedule_interview_id); setShowDeleteConfirm(true); }}
                                                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-rose-600 hover:text-rose-700 hover:bg-rose-50 ring-0`}
                                                        >
                                                            <MdDeleteOutline className="w-4 h-4" />
                                                        </PermissionButton>
                                                    </Tooltip>
                                                    <Tooltip content={expandedSchedules[s.schedule_interview_id] ? 'Collapse' : 'Expand'} position="top">
                                                        <Button
                                                            size="sm"
                                                            variant="transparent"
                                                            onClick={() => toggleExpand(s.schedule_interview_id)}
                                                            className="text-[#9AA2BA]!"
                                                        >
                                                            {expandedSchedules[s.schedule_interview_id] ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Collapsible: submitted interview forms + inline scoring panel */}
                                        <tr>
                                            <td colSpan={5} className="p-0">
                                                <AnimatePresence initial={false}>
                                                    {expandedSchedules[s.schedule_interview_id] && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        >
                                                            <div className="px-4 py-3 bg-[#FAFAFB] border-t border-[#E7E9F0] space-y-3">
                                                                {loadingForms[s.schedule_interview_id] ? (
                                                                    <p className="text-sm text-[#9AA2BA]">Loading forms...</p>
                                                                ) : scheduleForms[s.schedule_interview_id]?.length === 0 ? (
                                                                    <p className="text-sm text-[#9AA2BA]">No forms submitted yet.</p>
                                                                ) : (
                                                                    (() => {
                                                                        const byInterviewer = new Map<string, InterviewFormItem[]>();
                                                                        (scheduleForms[s.schedule_interview_id] || []).forEach((form) => {
                                                                            const interviewer = form.created_by_name || 'Unknown';
                                                                            const list = byInterviewer.get(interviewer) || [];
                                                                            list.push(form);
                                                                            byInterviewer.set(interviewer, list);
                                                                        });
                                                                        return (
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                {Array.from(byInterviewer.entries()).map(([interviewer, rawForms]) => {
                                                                                    const forms = dedupeFormsByCategory(rawForms);
                                                                                    const groupKey = forms[0]?.interview_id || interviewer;
                                                                                    return (
                                                                                        <InterviewerScoreCard
                                                                                            key={groupKey}
                                                                                            interviewer={interviewer}
                                                                                            forms={forms}
                                                                                            assignRoles={getAssignRoleArr(s)}
                                                                                            isGeneratingPdf={generatingPdfKey === groupKey}
                                                                                            onEditScore={() => openScoringPanel(s.schedule_interview_id, forms[0]?.interview_id)}
                                                                                            onShowStats={() => { setFormScoreData(getFormScoreData(forms)); setShowFormScore(true); }}
                                                                                            onExportPdf={() => handleExportPdf(s, interviewer, forms, groupKey)}
                                                                                            onDeleteForm={() => { setDeletingFormId(forms[0]?.interview_id); setShowDeleteFormConfirm(true); }}
                                                                                        />
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        );
                                                                    })()
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal
                isOpen={!!scoringPanel}
                onClose={closeScoringPanel}
                className="w-5xl! max-w-full min-h-[90vh] rounded-2xl! border! border-[#E7E9F0]! shadow-xl! max-h-[85vh]! overflow-hidden! flex! flex-col!"
            >
                {scoringPanel && (() => {
                    const activeSchedule = schedules.find((s) => s.schedule_interview_id === scoringPanel.scheduleId);
                    const panelKey = `${scoringPanel.scheduleId}-${scoringPanel.editingFormId || 'new'}`;
                    return (<>
                        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#E7E9F0] shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EEF2FF] text-[#4338CA] shrink-0">
                                    <FaClipboardCheck size={16} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[15px] font-primary-bold text-[#1F2430]">
                                        {scoringPanel.editingFormId ? 'Edit' : 'New'} Score
                                    </h3>
                                    {activeSchedule && (
                                        <p className="text-xs text-[#9AA2BA] mt-0.5">
                                            {formatIndonesianDate(activeSchedule.schedule_interview_date)} · {activeSchedule.schedule_interview_time}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* <button onClick={closeScoringPanel} title="Close" className="p-2 rounded-full hover:bg-[#F5F6F8] text-[#9AA2BA] shrink-0">
                                <FaXmark size={16} />
                            </button> */}
                        </div>
                        <div className="px-6 py-5">
                            <FormScoringCanvas
                                key={panelKey}
                                candidateId={candidateId}
                                scheduleId={scoringPanel.scheduleId}
                                editingFormId={scoringPanel.editingFormId}
                                onBack={closeScoringPanel}
                            />
                        </div>
                    </>);
                })()}
            </Modal>

            <Modal
                isOpen={showFormScore}
                onClose={() => setShowFormScore(false)}
                className="max-w-4xl! rounded-2xl! max-h-[85vh]! overflow-y-auto!"
            >
                <div className="px-0 py-5">
                    <InterviewScoreChart metrics={formScoreData} />
                </div>
            </Modal>

            {pdfPreview && (
                <PDFPreviewModal
                    url={pdfPreview.url}
                    fileName={pdfPreview.fileName}
                    title={pdfPreview.title}
                    onClose={closePdfPreview}
                />
            )}

            {/* Add/Edit Schedule Modal (kecil, cukup date/time/duration/role — bukan sidebar) */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                className="max-w-xl"
                title={`${editing ? 'Edit Interview Schedule' : 'Add Interview Schedule'}`}
                description={editing ? 'Update the date, time, and interview panel.' : 'Set the date, time, and interview panel.'}
            >

                <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <DatePicker
                            id="interview-date"
                            label="Date"
                            placeholder="Select date"
                            defaultDate={form.date ? new Date(form.date) : undefined}
                            onChange={(_, dateStr) => setForm(f => ({ ...f, date: dateStr }))}
                        />
                        <DatePicker
                            id="interview-time"
                            mode="time"
                            label="Time"
                            placeholder="Select time"
                            defaultDate={form.time ? (() => {
                                const d = new Date();
                                const [h, m] = form.time.split(':');
                                d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
                                return d;
                            })() : undefined}
                            onChange={(_, timeStr) => setForm(f => ({ ...f, time: timeStr }))}
                        />
                    </div>

                    <div>
                        <Label htmlFor={form.duration}>Duration of Interview</Label>
                        {/* <div className="flex flex-wrap gap-1.5">
                            {DURATION_OPTIONS.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, duration: d }))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.duration === d ? 'bg-[#0253a5] text-white border-[#0253a5]' : 'bg-white text-[#5B6480] border-[#E7E9F0] hover:border-[#C4C9DA]'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div> */}
                        <Input
                            type="text"
                            value={form.duration}
                            onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                            placeholder="Or type a custom duration, e.g. 75m"
                            onKeyPress={handleKeyPress}

                        />
                    </div>

                    <div>
                        <Label>Assign Role</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {ROLE_OPTIONS.map((role) => {
                                const active = form.assign_role.some(r => r.toUpperCase() === role);
                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setForm(f => ({
                                            ...f,
                                            assign_role: active ? f.assign_role.filter(r => r.toUpperCase() !== role) : [...f.assign_role, role],
                                        }))}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-[#0253a5] text-white border-[#0253a5]' : 'bg-white text-[#5B6480] border-[#E7E9F0] hover:border-[#C4C9DA]'
                                            }`}
                                    >
                                        {getRoleLabel(role)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowModal(false)}
                            disabled={loading}
                            className="rounded-[50px]"
                        >
                            Cancel
                        </Button>
                        <PermissionGate permission={["create", "update"]}>
                            <Button onClick={handleSubmit} disabled={submitting} className='rounded-[50px]'>{submitting ? 'Saving...' : 'Save Schedule'}</Button>
                        </PermissionGate>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirm */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Schedule"
                message="Delete this schedule?"
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                size="sm"
            />

            {/* Delete Form Confirm */}
            <ConfirmationModal
                isOpen={showDeleteFormConfirm}
                onClose={() => setShowDeleteFormConfirm(false)}
                onConfirm={handleDeleteForm}
                title="Delete Interview Form"
                message="Delete this interview form?"
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                size="sm"
            />
        </div>
    );
};

export default DateInterviewTab;
