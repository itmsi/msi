import { useState, useEffect } from 'react';
import { interviewScheduleService, type InterviewSchedule, type ScheduleCreateRequest } from '../services/interviewService';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaPen, FaChartSimple } from 'react-icons/fa6';
import ModalScoreInterview from './ModalScoreInterview';
import FormScoringCanvas from './FormScoringCanvas';

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
  const [submitting, setSubmitting] = useState(false);
  const [showCanvas, setShowCanvas] = useState<string | null>(null);
  const [showScore, setShowScore] = useState(false);

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

  if (loading) return <p className="text-sm text-gray-400">Loading schedules...</p>;

  return (
    <div>
      <div className="flex w-full mb-4">
        <button onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 px-3 py-1.5 bg-[#0253a5] text-white text-sm rounded-lg hover:bg-[#003061]">
          <FaPlus className="w-3 h-3" /> Add Date of Interview
        </button>
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
                <tr key={s.schedule_interview_id} className="hover:bg-gray-50">
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
                    <div className="text-gray-900">{s.schedule_interview_date ? new Date(s.schedule_interview_date).toLocaleDateString() : '-'}</div>
                    <div className="text-xs text-gray-500">{s.schedule_interview_time} {s.schedule_interview_duration ? `(${s.schedule_interview_duration})` : ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowCanvas(s.schedule_interview_id)} className="p-1.5 text-[#0253a5] hover:bg-blue-50 rounded-lg" title="Form Interview">
                        <FaPlus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setShowScore(true)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Show Score">
                        <FaChartSimple className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Schedule">
                        <FaPen className="w-3 h-3" />
                      </button>
                      <button onClick={() => { setDeletingId(s.schedule_interview_id); setShowDeleteConfirm(true); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Delete Schedule">
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalScoreInterview show={showScore} onClose={() => setShowScore(false)} />

      {/* Form Scoring Offcanvas */}
      {showCanvas && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCanvas(null); }} />
          <div className="relative w-full max-w-4xl bg-white shadow-xl h-full overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Interview Form</h2>
              <button onClick={() => { setShowCanvas(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6">
              <FormScoringCanvas
                candidateId={candidateId}
                scheduleId={showCanvas}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="time" value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input type="text" value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 60" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <p className="text-sm text-gray-600 mb-6">Delete this schedule?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateInterviewTab;
