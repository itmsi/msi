import { useState, useEffect } from 'react';
import type { BackgroundCheckItem } from '../types/hr';
import { backgroundCheckService } from '../services/hrService';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaDownload } from 'react-icons/fa6';


interface BackgroundCheckTabProps {
  candidateId: string;
  isActive: boolean;
}

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

  if (loading) return <p className="text-sm text-gray-400">Loading background checks...</p>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          <FaPlus className="w-3 h-3" /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No background checks yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.background_check_id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    item.background_check_status === 'Hired' ? 'bg-green-100 text-green-700' :
                    item.background_check_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.background_check_status}
                  </span>
                  <span className="text-xs text-gray-400">{item.created_by} · {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <button onClick={() => { setDeletingId(item.background_check_id); setShowDeleteModal(true); }}
                  className="text-red-400 hover:text-red-600">
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              </div>
              {item.background_check_note && <p className="text-sm text-gray-600 mb-2">{item.background_check_note}</p>}
              {item.file_attachment && (
                <a href={item.file_attachment} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                  <FaDownload className="w-3 h-3" /> Download Attachment
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Background Check</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Check Result</label>
                <div className="flex gap-4 flex-wrap">
                  {['Hired', 'Rejected', 'On Hold'].map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="bg-status" value={s} checked={form.background_check_status === s}
                        onChange={(e) => setForm(f => ({ ...f, background_check_status: e.target.value }))} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.background_check_note} onChange={(e) => setForm(f => ({ ...f, background_check_note: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (PDF)</label>
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
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700" />
                <p className="text-xs text-gray-400 mt-1">Upload background check documents (PDF only, max 10MB)</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this background check?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}
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

export default BackgroundCheckTab;
