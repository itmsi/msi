import { useState, useEffect } from 'react';
import type { BackgroundCheckItem } from '../../Candidate/types/hr';
import { backgroundCheckService } from '../../Candidate/services/hrService';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaDownload, FaShieldHalved } from 'react-icons/fa6';
import Button from '@/components/ui/button/Button';
import formatIndonesianDate from '../../Candidate/utils/date';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import TextArea from '@/components/form/input/TextArea';
import { Tooltip } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundCheckTabProps {
  candidateId: string;
  isActive: boolean;
}

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  Hired: { bg: '#ECFDF5', fg: '#047857' },
  Rejected: { bg: '#FFF1F2', fg: '#E11D48' },
  'On Hold': { bg: '#FFFBEB', fg: '#B45309' },
};
const DEFAULT_STATUS_STYLE = { bg: '#F5F6F8', fg: '#5B6480' };

const BackgroundCheckTab = ({ candidateId, isActive }: BackgroundCheckTabProps) => {
  const [items, setItems] = useState<BackgroundCheckItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ background_check_status: '', background_check_note: '', file: null as File | null });

  const fetchData = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const result = await backgroundCheckService.getList(candidateId);
      setItems(result.data || []);
    } catch {
      toast.error('Failed to load background checks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, candidateId]);

  const handleSubmit = async () => {
    if (!form.background_check_status) { toast.error('Please select a status'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('candidate_id', candidateId);
      fd.append('background_check_status', form.background_check_status);
      fd.append('background_check_note', form.background_check_note);
      if (form.file) fd.append('file_attachment', form.file);
      await backgroundCheckService.create(fd);
      toast.success('Background check added');
      setShowAddModal(false);
      setForm({ background_check_status: '', background_check_note: '', file: null });
      fetchData();
    } catch {
      toast.error('Failed to add background check');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await backgroundCheckService.delete(deletingId);
      toast.success('Deleted');
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <p className="text-sm text-[#9AA2BA]">Loading background checks...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#5B6480]">
          {items.length} {items.length === 1 ? 'check' : 'checks'}
        </p>
        <Button size="sm" onClick={() => setShowAddModal(true)} startIcon={<FaPlus />}>Add Check</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[#9AA2BA]">No background checks yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E7E9F0]">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Notes</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Created By</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F5]">
              {items.map((item) => {
                const s = STATUS_STYLE[item.background_check_status] || DEFAULT_STATUS_STYLE;
                return (
                  <tr key={item.background_check_id} className="hover:bg-[#FAFAFB] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-[#3A4260]">{item.background_check_note || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-[#5B6480]">{item.created_by_name || '-'}</td>
                    <td className="px-4 py-3 text-[#5B6480]">{formatIndonesianDate(item.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.fg }}>
                        {item.background_check_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {item.file_attachment && (
                          <a
                            href={item.file_attachment?.startsWith('http') ? item.file_attachment + '/download' : item.file_attachment}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#0253a5] border border-[#E7E9F0] rounded-lg hover:bg-[#FAFAFB]"
                          >
                            <FaDownload className="w-3 h-3" /> Download
                          </a>
                        )}
                        <Tooltip content="Delete" position="top">
                          <Button size="sm" variant="transparent" onClick={() => { setDeletingId(item.background_check_id); setShowDeleteModal(true); }} className="text-rose-500!">
                            <FaTrash className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#E7E9F0] shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-5 border-b border-[#E7E9F0]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#ECFDF5] text-[#047857] shrink-0">
                  <FaShieldHalved size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-primary-bold text-[#1F2430]">Add Background Check</h3>
                  <p className="text-xs text-[#9AA2BA] mt-0.5">Record the result of a background verification.</p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#9AA2BA] uppercase tracking-wide mb-1.5">Result</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Hired', 'Rejected', 'On Hold'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, background_check_status: s }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          form.background_check_status === s ? 'bg-[#1F2430] text-white border-[#1F2430]' : 'bg-white text-[#5B6480] border-[#E7E9F0] hover:border-[#C4C9DA]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9AA2BA] uppercase tracking-wide mb-1.5">Notes</label>
                  <TextArea value={form.background_check_note} onChange={(e) => setForm(f => ({ ...f, background_check_note: e.target.value }))} rows={3} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9AA2BA] uppercase tracking-wide mb-1.5">Attachment (PDF)</label>
                  <input type="file" accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        toast.error('File size must be less than 10MB');
                        e.target.value = '';
                        return;
                      }
                      setForm(f => ({ ...f, file: file || null }));
                    }}
                    className="w-full text-sm text-[#5B6480] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#EEF2FF] file:text-[#4338CA]" />
                  <p className="text-xs text-[#9AA2BA] mt-1">Upload background check documents (PDF only, max 10MB)</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E7E9F0] bg-[#FAFAFB]">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Background Check"
        message="Are you sure you want to delete this background check?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        size="sm"
      />
    </div>
  );
};

export default BackgroundCheckTab;
