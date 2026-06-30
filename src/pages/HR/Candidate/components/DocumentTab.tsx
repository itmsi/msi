import { useState, useEffect } from 'react';
import type { OnBoardDocument } from '../types/hr';
import { documentService } from '../services/hrService';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import { BsFiletypePdf, BsFiletypeDoc, BsFiletypeXls } from 'react-icons/bs';


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
    if (name.endsWith('.pdf')) return <BsFiletypePdf className="w-5 h-5 text-red-500" />;
    if (name.endsWith('.doc') || name.endsWith('.docx')) return <BsFiletypeDoc className="w-5 h-5 text-blue-500" />;
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return <BsFiletypeXls className="w-5 h-5 text-green-500" />;
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif')) return <FaFileAlt className="w-5 h-5 text-purple-500" />;
    return <FaFileAlt className="w-5 h-5 text-gray-400" />;
  };

  if (loading) return <p className="text-sm text-gray-400">Loading documents...</p>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0253a5] text-white text-sm rounded-lg hover:bg-[#003061]">
          <FaPlus className="w-3 h-3" /> Upload
        </button>
      </div>

      {docs.length === 0 ? (
        <p className="text-sm text-gray-500">No documents uploaded yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-10 px-4 py-3"></th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Document</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Uploaded By</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map((doc) => (
                <tr key={doc.on_board_documents_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">{getFileIcon(doc)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{doc.on_board_documents_name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{doc.created_by || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {doc.on_board_documents_file && (
                        <a href={doc.on_board_documents_file?.startsWith('http') ? doc.on_board_documents_file + '/download' : doc.on_board_documents_file}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
                          <FaDownload className="w-3 h-3" /> Download
                        </a>
                      )}
                      <button onClick={() => { setDeletingId(doc.on_board_documents_id); setShowDeleteModal(true); }}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Delete">
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={form.on_board_documents_name}
                  onChange={(e) => setForm(f => ({ ...f, on_board_documents_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input type="file"
                  onChange={(e) => setForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleUpload} disabled={uploading}
                className="px-4 py-2 text-sm text-white bg-[#0253a5] rounded-lg hover:bg-[#003061] disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <p className="text-sm text-gray-600 mb-6">Delete this document?</p>
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

export default DocumentTab;
