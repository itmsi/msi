import { useState, useEffect } from 'react';
import React from 'react';
import { interviewScheduleService, interviewFormService, type InterviewSchedule, type InterviewFormItem, type ScheduleCreateRequest } from '../services/interviewService';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaPen, FaChartSimple, FaChevronDown, FaChevronUp, FaRegFilePdf, FaRegPenToSquare } from 'react-icons/fa6';
import ModalScoreInterview from './ModalScoreInterview';
import FormScoringCanvas from './FormScoringCanvas';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import DatePicker from '@/components/form/date-picker';
import { motion, AnimatePresence } from 'framer-motion';
import formatIndonesianDate from '../utils/date';

interface DateInterviewTabProps {
  candidateId: string;
  isActive: boolean;
}

const ROLE_OPTIONS = ['HR', 'GM', 'VP', 'BOD', 'PUB'];

const DateInterviewTab = ({ candidateId, isActive }: DateInterviewTabProps) => {
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InterviewSchedule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteFormConfirm, setShowDeleteFormConfirm] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCanvas, setShowCanvas] = useState<{ scheduleId: string; editingFormId?: string } | null>(null);
  const [expandedSchedules, setExpandedSchedules] = useState<Record<string, boolean>>({});
  const [scheduleForms, setScheduleForms] = useState<Record<string, InterviewFormItem[]>>({});
  const [loadingForms, setLoadingForms] = useState<Record<string, boolean>>({});
  const [showFormScore, setShowFormScore] = useState(false);
  const [formScoreData, setFormScoreData] = useState<{ company_value: string; total_score: number }[]>([]);

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
      setSchedules(result.data || []);
    } catch {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) fetchData();
  }, [isActive, candidateId]);

  const toggleExpand = async (scheduleId: string) => {
    const willOpen = !expandedSchedules[scheduleId];
    setExpandedSchedules(prev => ({ ...prev, [scheduleId]: willOpen }));
    if (willOpen && !scheduleForms[scheduleId]) {
      setLoadingForms(prev => ({ ...prev, [scheduleId]: true }));
      try {
        const result = await interviewFormService.getList({ schedule_interview_id: scheduleId });
        setScheduleForms(prev => ({ ...prev, [scheduleId]: result.data || [] }));
      } catch {
        toast.error('Failed to load interview forms');
      } finally {
        setLoadingForms(prev => ({ ...prev, [scheduleId]: false }));
      }
    }
  };

  const getFormScoreData = (forms: InterviewFormItem[]) =>
    forms.map((form) => ({
      company_value: form.company_value,
      total_score: form.detail_interviews?.reduce((sum, detail) => sum + (parseInt(detail.score) || 0), 0) || 0,
    }));

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
    setForm({ date: dateOnly, time: timeOnly, duration: s.schedule_interview_duration || '', assign_role: getAssignRoleArr(s) });
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
      // Refresh forms for all open schedules
      const keys = Object.keys(expandedSchedules);
      for (const sid of keys) {
        if (expandedSchedules[sid]) {
          const result = await interviewFormService.getList({ schedule_interview_id: sid });
          setScheduleForms(prev => ({ ...prev, [sid]: result.data || [] }));
        }
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading schedules...</p>;

  return (
    <div>
      <div className="flex w-full mb-4">
        <Button onClick={openAdd} startIcon={<FaPlus />} className="w-full justify-center">Add Date of Interview</Button>
      </div>

      {schedules.length === 0 ? (
        <p className="text-sm text-gray-500">No interview schedules yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created by</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedules.map((s) => (
                <React.Fragment key={s.schedule_interview_id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">{s.created_by_name || s.created_by || '-'}</td>
                  <td className="px-4 py-3">
                    {s.assign_role ? (
                      <div className="flex flex-wrap gap-1">
                        {getAssignRoleArr(s).map((role, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{role}</span>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{formatIndonesianDate(s.schedule_interview_date)}</div>
                    <div className="text-xs text-gray-500">{s.schedule_interview_time} {s.schedule_interview_duration ? `(${s.schedule_interview_duration})` : ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="transparent" onClick={() => setShowCanvas({ scheduleId: s.schedule_interview_id })} className="text-[#0253a5]!"><FaPlus /></Button>
                      <Button size="sm" variant="transparent" onClick={() => handleOpenScoreStats(s.schedule_interview_id)} className="text-green-600!"><FaChartSimple /></Button>
                      <Button size="sm" variant="transparent" onClick={() => openEdit(s)} className="text-blue-600!"><FaPen /></Button>
                      <Button size="sm" variant="transparent" onClick={() => { setDeletingId(s.schedule_interview_id); setShowDeleteConfirm(true); }} className="text-red-400!"><FaTrash /></Button>
                      <Button size="sm" variant="transparent" onClick={() => toggleExpand(s.schedule_interview_id)} className="text-gray-400!">
                        {expandedSchedules[s.schedule_interview_id] ? <FaChevronUp /> : <FaChevronDown />}
                      </Button>
                    </div>
                  </td>
                </tr>
                {/* Collapsible: submitted interview forms */}
                <tr>
                  <td colSpan={4} className="p-0">
                    <AnimatePresence initial={false}>
                      {expandedSchedules[s.schedule_interview_id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            {loadingForms[s.schedule_interview_id] ? (
                              <p className="text-sm text-gray-400">Loading forms...</p>
                            ) : scheduleForms[s.schedule_interview_id]?.length === 0 ? (
                              <p className="text-sm text-gray-500">No forms submitted yet.</p>
                            ) : (
                              (() => {
                                // Group forms by interviewer (created_by_name)
                                const grouped: Record<string, typeof scheduleForms[string]> = {};
                                for (const form of scheduleForms[s.schedule_interview_id] || []) {
                                  const key = form.created_by_name || 'Unknown';
                                  if (!grouped[key]) grouped[key] = [];
                                  grouped[key].push(form);
                                }
                                return (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(grouped).map(([interviewer, forms]) => {
                                      const totalScore = forms.reduce((sum, f) => sum + (f.detail_interviews?.reduce((s, d) => s + (parseInt(d.score) || 0), 0) || 0), 0);
                                      return (
                                        <div key={interviewer} className="bg-white rounded-lg border border-gray-200 p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <h6 className="text-sm font-semibold text-gray-800 mb-0">{interviewer}</h6>
                                            <span className="text-[10px] text-gray-400">Score: {totalScore}</span>
                                          </div>
                                          <p className="text-xs text-gray-500 mb-2">
                                            Interviewer: <span className="font-medium text-gray-700">{getAssignRoleArr(s).join(', ') || '-'}</span>
                                          </p>
                                          <div className="flex flex-wrap gap-1.5 mb-2">
                                            {forms.map((form) => {
                                              const score = form.detail_interviews?.reduce((s, d) => s + (parseInt(d.score) || 0), 0) || 0;
                                              return (
                                                <span key={form.interview_id}
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                                >
                                                  {form.company_value}: {score}
                                                </span>
                                              );
                                            })}
                                          </div>
                                          <div className="flex items-center gap-1 mt-2">
                                            <Button size="sm" variant="transparent" onClick={() => setShowCanvas({ scheduleId: s.schedule_interview_id, editingFormId: forms[0]?.interview_id })} className="text-[#0253a5]!">
                                              <FaRegPenToSquare className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button size="sm" variant="transparent" onClick={() => { setFormScoreData(forms.map(f => ({ company_value: f.company_value, total_score: f.detail_interviews?.reduce((s, d) => s + (parseInt(d.score) || 0), 0) || 0 }))); setShowFormScore(true); }} className="text-green-600!">
                                              <FaChartSimple className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button size="sm" variant="transparent" className="text-red-500!">
                                              <FaRegFilePdf className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button size="sm" variant="transparent" onClick={() => { setDeletingFormId(forms[0]?.interview_id); setShowDeleteFormConfirm(true); }} className="text-red-400!">
                                              <FaTrash className="w-3 h-3" />
                                            </Button>
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

      <ModalScoreInterview show={showFormScore} onClose={() => setShowFormScore(false)} scoreData={formScoreData} />

      {/* Form Scoring Offcanvas */}
      {showCanvas && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCanvas(null); }} />
          <div className="relative w-full max-w-4xl bg-white shadow-xl h-full overflow-y-auto">
            <div className="sticky top-18 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="transparent" onClick={() => { setShowCanvas(null); fetchData(); }} className="text-sm">&larr; Back</Button>
                <h2 className="text-lg font-semibold">Interview Form</h2>
              </div>
              <Button variant="transparent" onClick={() => { setShowCanvas(null); }} className="text-gray-400! text-xl">&times;</Button>
            </div>
            <div className="p-6 mt-13">
              <FormScoringCanvas
                candidateId={candidateId}
                scheduleId={showCanvas.scheduleId}
                editingFormId={showCanvas.editingFormId}
                onBack={() => { setShowCanvas(null); fetchData(); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Interview Schedule</h3>
            <div className="space-y-4">
              <div>
                <DatePicker
                  id="interview-date"
                  label="Date"
                  placeholder="Select date"
                  defaultDate={form.date ? new Date(form.date) : undefined}
                  isStatic={true}
                  onChange={(_, dateStr) => setForm(f => ({ ...f, date: dateStr }))}
                />
              </div>
              <div>
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
                  isStatic={true}
                  onChange={(_, timeStr) => setForm(f => ({ ...f, time: timeStr }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <Input type="text" value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {ROLE_OPTIONS.map((role) => (
                    <label key={role} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.assign_role.includes(role)}
                        onChange={(e) => setForm(f => ({ ...f, assign_role: e.target.checked ? [...f.assign_role, role] : f.assign_role.filter(r => r !== role) }))}
                        className="rounded border-gray-300 text-[#0253a5] focus:ring-[#0253a5]" />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}

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
