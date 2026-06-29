import { useState, useEffect } from 'react';
import { interviewScheduleService, type InterviewSchedule } from '../services/interviewService';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaPen, FaRegFilePdf } from 'react-icons/fa6';
import { usePDFDownload } from '../hooks/usePDFDownload';

interface DateInterviewTabProps {
  candidateId: string;
  isActive: boolean;
  candidateName?: string;
}

const DateInterviewTab = ({ candidateId, isActive, candidateName }: DateInterviewTabProps) => {
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InterviewSchedule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ date: '', time: '', duration: '' });
  const { downloadPDF, isGenerating } = usePDFDownload();

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
    setForm({ date: '', time: '', duration: '' });
    setShowModal(true);
  };

  const openEdit = (s: InterviewSchedule) => {
    setEditing(s);
    setForm({
      date: s.schedule_interview_date || '',
      time: s.schedule_interview_time || '',
      duration: s.schedule_interview_duration || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.date || !form.time) { toast.error('Date and time required'); return; }
    setSubmitting(true);
    try {
      const payload = {
        candidate_id: candidateId,
        schedule_interview_date: form.date,
        schedule_interview_time: form.time,
        schedule_interview_duration: form.duration,
        systemName: 'interview',
        menuName: 'candidate',
        permissionName: editing ? 'update' : 'create',
      };

      if (editing) {
        await interviewScheduleService.update(editing.id, payload);
        toast.success('Schedule updated');
      } else {
        await interviewScheduleService.create(payload);
        toast.success('Schedule created');
      }
      setShowModal(false);
      fetchData();
    } catch {
      toast.error('Failed to save schedule');
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
      <div className="flex justify-end mb-4">
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          <FaPlus className="w-3 h-3" /> Add Schedule
        </button>
      </div>

      {schedules.length === 0 ? (
        <p className="text-sm text-gray-500">No interview schedules yet.</p>
      ) : (
        <div className="space-y-3">
          {schedules.map((s, idx) => (
            <div key={s.id || idx} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {s.schedule_interview_date} at {s.schedule_interview_time}
                  </p>
                  {s.schedule_interview_duration && (
                    <p className="text-xs text-gray-500">{s.schedule_interview_duration} minutes</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {s.interview && s.interview.length > 0 && (
                    <button
                      onClick={() => downloadPDF({
                        data_candidate: { name_candidate: candidateName },
                        interview: s.interview?.flatMap(iv => iv.form_interviews || []),
                      })}
                      disabled={isGenerating}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Download PDF"
                    >
                      <FaRegFilePdf className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => openEdit(s)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FaPen className="w-3 h-3" />
                  </button>
                  <button onClick={() => { setDeletingId(s.id); setShowDeleteConfirm(true); }}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {s.interview && s.interview.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.interview.map((iv, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {iv.assigned_name} ({iv.assigned_role_alias})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
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
                <input type="date" value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="time" value={form.time}
                  onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input type="text" value={form.duration}
                  onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="e.g. 60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save'}
              </button>
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
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateInterviewTab;
