import { useState, useEffect } from 'react';
import type { OnBoardDocument } from '../../Candidate/types/hr';
import { documentService } from '../../Candidate/services/hrService';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaDownload, FaFileLines, FaFolderOpen } from 'react-icons/fa6';
import { BsFiletypePdf, BsFiletypeDoc, BsFiletypeXls } from 'react-icons/bs';
import formatIndonesianDate from '../../Candidate/utils/date';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Tooltip } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentTabProps {
  candidateId: string;
  isActive: boolean;
}

const DocumentTab = ({ candidateId, isActive }: DocumentTabProps) => {
  const [docs, setDocs] = useState<OnBoardDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({ on_board_documents_name: '', file: null as File | null });

  const fetchData = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const result = await documentService.getList(candidateId);
      setDocs(result.data || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, candidateId]);

  const handleUpload = async () => {
    if (!form.on_board_documents_name.trim()) { toast.error('Enter document title'); return; }
    if (!form.file) { toast.error('Select a file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('candidate_id', candidateId);
      fd.append('on_board_documents_name', form.on_board_documents_name);
      fd.append('on_board_documents_file', form.file);
      await documentService.create(fd);
      toast.success('Document uploaded');
      setShowAddModal(false);
      setForm({ on_board_documents_name: '', file: null });
      fetchData();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await documentService.delete(deletingId);
      toast.success('Deleted');
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const getFileIcon = (doc: OnBoardDocument) => {
    const name = doc.on_board_documents_file_path?.toLowerCase() || doc.on_board_documents_file?.toLowerCase() || '';
    if (name.endsWith('.pdf')) return <BsFiletypePdf className="w-5 h-5 text-rose-500" />;
    if (name.endsWith('.doc') || name.endsWith('.docx')) return <BsFiletypeDoc className="w-5 h-5 text-[#0253a5]" />;
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return <BsFiletypeXls className="w-5 h-5 text-emerald-600" />;
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif')) return <FaFileLines className="w-5 h-5 text-[#8B5CF6]" />;
    return <FaFileLines className="w-5 h-5 text-[#9AA2BA]" />;
  };

  if (loading) return <p className="text-sm text-[#9AA2BA]">Loading documents...</p>;

  return (
    <div>
      <div className="flex w-full mb-4">
        <Button onClick={() => setShowAddModal(true)} startIcon={<FaPlus />} className="w-full justify-center!">Upload Document</Button>
      </div>

      {docs.length === 0 ? (
        <p className="text-sm text-[#9AA2BA]">No documents uploaded yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#E7E9F0]">
                <th className="w-10 px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Document</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Uploaded By</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Date</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9AA2BA]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F5]">
              {docs.map((doc) => (
                <tr key={doc.on_board_documents_id} className="hover:bg-[#FAFAFB] transition-colors">
                  <td className="px-4 py-3 text-center">{getFileIcon(doc)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#1F2430]">{doc.on_board_documents_name}</span>
                  </td>
                  <td className="px-4 py-3 text-[#5B6480]">{doc.created_by_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-[#9AA2BA]">
                    {formatIndonesianDate(doc.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {doc.on_board_documents_file && (
                        <a href={doc.on_board_documents_file?.startsWith('http') ? doc.on_board_documents_file + '/download' : doc.on_board_documents_file}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#0253a5] border border-[#E7E9F0] rounded-lg hover:bg-[#FAFAFB]">
                          <FaDownload className="w-3 h-3" /> Download
                        </a>
                      )}
                      <Tooltip content="Delete" position="top">
                        <Button size="sm" variant="transparent" onClick={() => { setDeletingId(doc.on_board_documents_id); setShowDeleteModal(true); }} className="text-rose-500!">
                          <FaTrash className="w-3.5 h-3.5" />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EEF2FF] text-[#4338CA] shrink-0">
                  <FaFolderOpen size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-primary-bold text-[#1F2430]">Upload Document</h3>
                  <p className="text-xs text-[#9AA2BA] mt-0.5">Add an onboarding document for this candidate.</p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#9AA2BA] uppercase tracking-wide mb-1.5">Title</label>
                  <Input type="text" value={form.on_board_documents_name}
                    onChange={(e) => setForm(f => ({ ...f, on_board_documents_name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9AA2BA] uppercase tracking-wide mb-1.5">File</label>
                  <input type="file"
                    onChange={(e) => setForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
                    className="w-full text-sm text-[#5B6480] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#EEF2FF] file:text-[#4338CA]" />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E7E9F0] bg-[#FAFAFB]">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
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
        title="Delete Document"
        message="Delete this document?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        size="sm"
      />
    </div>
  );
};

export default DocumentTab;
