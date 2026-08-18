import { useState, useEffect } from 'react';
import React from 'react';
import { interviewScheduleService, interviewFormService, type InterviewSchedule, type InterviewFormItem, type ScheduleCreateRequest } from '../../Candidate/services/interviewService';
import { generateInterviewPDFBlob } from '../utils/PDFInterviewReport';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaChartSimple, FaChevronDown, FaChevronUp, FaRegFilePdf, FaClipboardCheck, FaRegPenToSquare, FaXmark, FaSpinner } from 'react-icons/fa6';
import { MdCalendarMonth } from 'react-icons/md';
import ModalScoreInterview from '../../Candidate/components/ModalScoreInterview';
import FormScoringCanvas from './FormScoringCanvas';
import { PDFPreviewModal } from './PDFPreviewModal';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import DatePicker from '@/components/form/date-picker';
import { Tooltip } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import formatIndonesianDate from '../../Candidate/utils/date';
import type { CandidateDetail } from '../types/Candidate';

interface DateInterviewTabProps {
  candidateId: string;
  isActive: boolean;
  candidate?: CandidateDetail | null;
}

const ROLE_OPTIONS = ['HR', 'GM', 'VP', 'BOD', 'PUB'];
const DURATION_OPTIONS = ['15m', '30m', '45m', '60m', '90m'];
// Cap chips shown per row so rows with many assigned roles don't grow taller than others.
const MAX_VISIBLE_ROLES = 5;

// Same badge language as the rest of the app (e.g. /netsuite/sales-orders StatusTypeBadge):
// bg-X-100 / text-X-800 / border-X-200, rounded-full, bordered — no custom hex or shadows.
const ROLE_STYLE: Record<string, string> = {
  HR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  GM: 'bg-green-100 text-green-800 border-green-200',
  VP: 'bg-amber-100 text-amber-800 border-amber-200',
  BOD: 'bg-pink-100 text-pink-800 border-pink-200',
  PUB: 'bg-teal-100 text-teal-800 border-teal-200',
};
const DEFAULT_ROLE_STYLE = 'bg-gray-100 text-gray-800 border-gray-200';
// Stored role casing isn't consistent ("hr" vs "HR") — normalize before lookup/display.
const getRoleStyle = (role: string) => ROLE_STYLE[role.toUpperCase()] || DEFAULT_ROLE_STYLE;

const DateInterviewTab = ({ candidateId, isActive, candidate }: DateInterviewTabProps) => {
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InterviewSchedule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteFormConfirm, setShowDeleteFormConfirm] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Panel penilaian interview kini dirender inline di bawah baris jadwalnya,
  // bukan lagi offcanvas — hanya satu panel yang aktif dalam satu waktu.
  const [scoringPanel, setScoringPanel] = useState<{ scheduleId: string; editingFormId?: string } | null>(null);
  const [expandedSchedules, setExpandedSchedules] = useState<Record<string, boolean>>({});
  const [scheduleForms, setScheduleForms] = useState<Record<string, InterviewFormItem[]>>({});
  const [loadingForms, setLoadingForms] = useState<Record<string, boolean>>({});
  const [showFormScore, setShowFormScore] = useState(false);
  const [formScoreData, setFormScoreData] = useState<{ company_value: string; total_score: number }[]>([]);
  const [generatingPdfKey, setGeneratingPdfKey] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; fileName: string; title: string } | null>(null);

  const [form, setForm] = useState({ date: '', time: '', duration: '', assign_role: [] as string[] });

  const getAssignRoleArr = (s: InterviewSchedule): string[] => {
    if (!s.assign_role) return [];
    if (typeof s.assign_role === 'string') return s.assign_role.split(',').map(r => r.trim());
    return (s.assign_role?.role || '').split(',').map(r => r.trim()).filter(Boolean);
  };

  const fetchData = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const result = await interviewScheduleService.getList(candidateId);
      const list = result.data || [];
      setSchedules(list);
      // Prefetch forms per schedule so the row action can tell Add vs Edit apart
      // right away, instead of only after the user expands/opens it once.
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
    forms.map((form) => ({
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

  const handleOpenScoreStats = async (scheduleId: string) => {
    const forms = scheduleForms[scheduleId];
    if (forms) {
      setFormScoreData(getFormScoreData(forms));
      setShowFormScore(true);
      return;
    }

    setLoadingForms(prev => ({ ...prev, [scheduleId]: true }));
    try {
      const result = await interviewFormService.getList({ schedule_interview_id: scheduleId });
      const loadedForms = result.data || [];
      setScheduleForms(prev => ({ ...prev, [scheduleId]: loadedForms }));
      setFormScoreData(getFormScoreData(loadedForms));
      setShowFormScore(true);
    } catch {
      toast.error('Failed to load interview forms');
    } finally {
      setLoadingForms(prev => ({ ...prev, [scheduleId]: false }));
    }
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
    // Normalize casing so chips match ROLE_OPTIONS regardless of how it was stored
    // ("hr" vs "HR") — also self-heals the data since it re-saves uppercase.
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
          <div className="bg-[#FAFAFB] border-b border-[#E7E9F0] px-4 py-3 h-[38px]" />
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#5B6480]">
          {schedules.length} {schedules.length === 1 ? 'schedule' : 'schedules'}
        </p>
        <Button size="sm" onClick={openAdd} startIcon={<FaPlus />}>Add Schedule</Button>
      </div>

      {schedules.length === 0 ? (
        <p className="text-sm text-[#9AA2BA]">No interview schedules yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E7E9F0]">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Created by</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Assigned</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Score</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F5]">
              {schedules.map((s) => (
                <React.Fragment key={s.schedule_interview_id}>
                <tr
                  className={`transition-colors ${
                    expandedSchedules[s.schedule_interview_id] || scoringPanel?.scheduleId === s.schedule_interview_id
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
                            <span key={i} className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs border rounded-full font-medium ${getRoleStyle(role)}`}>
                              {role.toUpperCase()}
                            </span>
                          ))}
                          {extraRoles.length > 0 && (
                            <Tooltip content={extraRoles.map(r => r.toUpperCase()).join(', ')} position="top">
                              <span className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs border rounded-full font-medium ${DEFAULT_ROLE_STYLE}`}>
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
                      const forms = scheduleForms[s.schedule_interview_id] || [];
                      if (!forms.length) return <span className="text-xs text-[#9AA2BA]">Not scored</span>;
                      const totalScore = forms.reduce((sum, f) => sum + (f.detail_interviews?.reduce((s2, d) => s2 + (parseInt(d.score) || 0), 0) || 0), 0);
                      return (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs border rounded-full font-bold bg-indigo-100 text-indigo-800 border-indigo-200">
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Tooltip content={scheduleForms[s.schedule_interview_id]?.length ? 'Edit Score' : 'Add Score'} position="top">
                        <Button size="sm" variant="transparent" onClick={() => openScoringPanel(s.schedule_interview_id)} className="text-[#0253a5]!">
                          {scheduleForms[s.schedule_interview_id]?.length ? <FaClipboardCheck /> : <FaPlus />}
                        </Button>
                      </Tooltip>
                      <Tooltip content="Score Stats" position="top">
                        <Button size="sm" variant="transparent" onClick={() => handleOpenScoreStats(s.schedule_interview_id)} className="text-emerald-600!"><FaChartSimple /></Button>
                      </Tooltip>
                      <Tooltip content="Edit Schedule" position="top">
                        <Button size="sm" variant="transparent" onClick={() => openEdit(s)} className="text-blue-600!"><FaRegPenToSquare /></Button>
                      </Tooltip>
                      <Tooltip content="Delete Schedule" position="top">
                        <Button size="sm" variant="transparent" onClick={() => { setDeletingId(s.schedule_interview_id); setShowDeleteConfirm(true); }} className="text-rose-500!"><FaTrash /></Button>
                      </Tooltip>
                      <Tooltip content={expandedSchedules[s.schedule_interview_id] ? 'Collapse' : 'Expand'} position="top">
                        <Button size="sm" variant="transparent" onClick={() => toggleExpand(s.schedule_interview_id)} className="text-[#9AA2BA]!">
                          {expandedSchedules[s.schedule_interview_id] ? <FaChevronUp /> : <FaChevronDown />}
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
                                // Group forms into scoring sessions per interviewer: consecutive submissions
                                // within SESSION_GAP_MS stay in the same card (one sitting across SIAH/7 Values/
                                // CSE/etc. tabs); a bigger gap means the interviewer came back for a new round,
                                // so it gets its own card instead of silently merging into the old one.
                                const SESSION_GAP_MS = 60 * 60 * 1000;
                                const sorted = [...(scheduleForms[s.schedule_interview_id] || [])].sort(
                                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                                );
                                type FormItem = typeof sorted[number];
                                const sessions: { key: string; interviewer: string; forms: FormItem[] }[] = [];
                                for (const form of sorted) {
                                  const interviewer = form.created_by_name || 'Unknown';
                                  const last = sessions[sessions.length - 1];
                                  const prevForm = last?.forms[last.forms.length - 1];
                                  const gap = prevForm ? new Date(form.created_at).getTime() - new Date(prevForm.created_at).getTime() : Infinity;
                                  if (last && last.interviewer === interviewer && gap <= SESSION_GAP_MS) {
                                    last.forms.push(form);
                                  } else {
                                    sessions.push({ key: form.interview_id, interviewer, forms: [form] });
                                  }
                                }
                                const sessionsPerInterviewer: Record<string, number> = {};
                                sessions.forEach((sess) => {
                                  sessionsPerInterviewer[sess.interviewer] = (sessionsPerInterviewer[sess.interviewer] || 0) + 1;
                                });
                                const roundCounter: Record<string, number> = {};
                                return (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {sessions.map((session) => {
                                      roundCounter[session.interviewer] = (roundCounter[session.interviewer] || 0) + 1;
                                      const round = roundCounter[session.interviewer];
                                      const interviewer = session.interviewer;
                                      const forms = session.forms;
                                      const totalScore = forms.reduce((sum, f) => sum + (f.detail_interviews?.reduce((s, d) => s + (parseInt(d.score) || 0), 0) || 0), 0);
                                      return (
                                        <div key={session.key} className="bg-white rounded-2xl border border-[#E7E9F0] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:border-[#C4C9DA] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:-translate-y-0.5 transition-all">
                                          <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="min-w-0 flex-1">
                                              <h6 className="text-sm font-semibold text-[#1F2430] truncate">
                                                {interviewer}
                                                {sessionsPerInterviewer[interviewer] > 1 && (
                                                  <span className="ml-1.5 text-[10px] font-medium text-[#9AA2BA]">· Round {round}</span>
                                                )}
                                              </h6>
                                              <p className="text-[10px] text-[#C4C9DA] mt-0.5">{formatIndonesianDate(forms[0]?.created_at)}</p>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {getAssignRoleArr(s).length > 0 ? (
                                                  getAssignRoleArr(s).map((role, i) => (
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
                                              <div className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 text-sm font-bold">
                                                {totalScore}
                                              </div>
                                              <div className="text-[9px] uppercase tracking-wide text-[#9AA2BA] mt-1">Score</div>
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap gap-1.5">
                                            {forms.map((form) => {
                                              const score = form.detail_interviews?.reduce((s, d) => s + (parseInt(d.score) || 0), 0) || 0;
                                              return (
                                                <span key={form.interview_id}
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                                                >
                                                  {form.company_value}: {score}
                                                </span>
                                              );
                                            })}
                                          </div>

                                          <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-[#F0F1F5]">
                                            <Tooltip content="Edit Score" position="top">
                                              <Button size="sm" variant="transparent" onClick={() => openScoringPanel(s.schedule_interview_id, forms[0]?.interview_id)} className="text-[#0253a5]!">
                                                <FaClipboardCheck className="w-3.5 h-3.5" />
                                              </Button>
                                            </Tooltip>
                                            <Tooltip content="Score Stats" position="top">
                                              <Button size="sm" variant="transparent" onClick={() => { setFormScoreData(forms.map(f => ({ company_value: f.company_value, total_score: f.detail_interviews?.reduce((s, d) => s + (parseInt(d.score) || 0), 0) || 0 }))); setShowFormScore(true); }} className="text-emerald-600!">
                                                <FaChartSimple className="w-3.5 h-3.5" />
                                              </Button>
                                            </Tooltip>
                                            <Tooltip content="Export PDF" position="top">
                                              <Button
                                                size="sm"
                                                variant="transparent"
                                                disabled={generatingPdfKey === session.key}
                                                onClick={() => handleExportPdf(s, interviewer, forms, session.key)}
                                                className="text-rose-500!"
                                              >
                                                {generatingPdfKey === session.key ? (
                                                  <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                  <FaRegFilePdf className="w-3.5 h-3.5" />
                                                )}
                                              </Button>
                                            </Tooltip>
                                            <Tooltip content="Delete Form" position="top">
                                              <Button size="sm" variant="transparent" onClick={() => { setDeletingFormId(forms[0]?.interview_id); setShowDeleteFormConfirm(true); }} className="text-rose-500!">
                                                <FaTrash className="w-3 h-3" />
                                              </Button>
                                            </Tooltip>
                                          </div>
                                        </div>
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
      )}

      {/* Add/Edit Score Modal — popup kayak Add Schedule, bukan panel inline lagi.
          `key` di-derive dari scheduleId+editingFormId supaya ganti target (mis. dari
          Edit form A langsung ke Add/create baru) memaksa remount penuh — kalau enggak,
          React reuse instance yang sama dan state form lama nyangkut. */}
      <AnimatePresence mode="wait" initial={false}>
        {scoringPanel && (() => {
          const activeSchedule = schedules.find((s) => s.schedule_interview_id === scoringPanel.scheduleId);
          const panelKey = `${scoringPanel.scheduleId}-${scoringPanel.editingFormId || 'new'}`;
          return (
            <motion.div
              key={panelKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
              onClick={closeScoringPanel}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl border border-[#E7E9F0] shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#E7E9F0] shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EEF2FF] text-[#4338CA] shrink-0">
                      <FaClipboardCheck size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-primary-bold text-[#1F2430]">
                        Edit Score
                      </h3>
                      {activeSchedule && (
                        <p className="text-xs text-[#9AA2BA] mt-0.5">
                          {formatIndonesianDate(activeSchedule.schedule_interview_date)} · {activeSchedule.schedule_interview_time}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={closeScoringPanel} title="Close" className="p-2 rounded-full hover:bg-[#F5F6F8] text-[#9AA2BA] shrink-0">
                    <FaXmark size={16} />
                  </button>
                </div>
                <div className="px-6 py-5 overflow-y-auto">
                  <FormScoringCanvas
                    candidateId={candidateId}
                    scheduleId={scoringPanel.scheduleId}
                    editingFormId={scoringPanel.editingFormId}
                    onBack={closeScoringPanel}
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <ModalScoreInterview show={showFormScore} onClose={() => setShowFormScore(false)} scoreData={formScoreData} />

      {pdfPreview && (
        <PDFPreviewModal
          url={pdfPreview.url}
          fileName={pdfPreview.fileName}
          title={pdfPreview.title}
          onClose={closePdfPreview}
        />
      )}

      {/* Add/Edit Schedule Modal (kecil, cukup date/time/duration/role — bukan sidebar) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#E7E9F0] shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#E7E9F0]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EEF2FF] text-[#4338CA] shrink-0">
                    <MdCalendarMonth size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-primary-bold text-[#1F2430]">
                      {editing ? 'Edit Interview Schedule' : 'Add Interview Schedule'}
                    </h3>
                    <p className="text-xs text-[#9AA2BA] mt-0.5">Set the date, time, and interview panel.</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} title="Close" className="p-2 rounded-full hover:bg-[#F5F6F8] text-[#9AA2BA] shrink-0">
                  <FaXmark size={16} />
                </button>
              </div>

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
                  <label className="block text-[11px] font-medium text-[#9AA2BA] uppercase tracking-wide mb-1.5">Duration</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, duration: d }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          form.duration === d ? 'bg-[#1F2430] text-white border-[#1F2430]' : 'bg-white text-[#5B6480] border-[#E7E9F0] hover:border-[#C4C9DA]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="Or type a custom duration, e.g. 75m"
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#9AA2BA] uppercase tracking-wide mb-1.5">Assign Role</label>
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
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            active ? 'bg-[#1F2430] text-white border-[#1F2430]' : 'bg-white text-[#5B6480] border-[#E7E9F0] hover:border-[#C4C9DA]'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E7E9F0] bg-[#FAFAFB]">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save Schedule'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
