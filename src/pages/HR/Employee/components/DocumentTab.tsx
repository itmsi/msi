import { useState, useEffect } from 'react';
import type { OnBoardDocument } from '../../Candidate/types/hr';
import { documentService } from '../../Candidate/services/hrService';
import { toast } from 'react-hot-toast';
import { FaFileArrowDown, FaFileLines, FaRegFileExcel, FaRegFileImage, FaRegFilePdf } from 'react-icons/fa6';
import formatIndonesianDate from '../../Candidate/utils/date';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { MdAdd } from 'react-icons/md';
import { PermissionButton, PermissionGate } from '@/components/common/PermissionComponents';
import Label from '@/components/form/Label';
import { Tooltip } from '@/components/ui/tooltip';
import { FaRegFileWord } from 'react-icons/fa';

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
        if (name.endsWith('.pdf')) return <FaRegFilePdf className="w-5 h-5 text-rose-500" />;
        if (name.endsWith('.doc') || name.endsWith('.docx')) return <FaRegFileWord className="w-5 h-5 text-[#0253a5]" />;
        if (name.endsWith('.xls') || name.endsWith('.xlsx')) return <FaRegFileExcel className="w-5 h-5 text-emerald-600" />;
        if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif')) return <FaRegFileImage className="w-5 h-5 text-[#8B5CF6]" />;
        return <FaFileLines className="w-5 h-5 text-[#9AA2BA]" />;
    };

    if (loading) return <p className="text-sm text-[#9AA2BA]">Loading documents...</p>;

    return (
        <div>
            <div className="flex items-center justify-end mb-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(true)}
                    className="rounded-md w-full md:w-50 flex items-center justify-center gap-2"
                    size="sm"
                >
                    <MdAdd className="w-4 h-4" />
                    Upload Document
                </Button>
            </div>

            {docs.length === 0 ? (
                <p className="text-sm text-[#9AA2BA]">No documents uploaded yet.</p>
            ) : (
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-272.5 text-sm">
                            <thead>
                                <tr className="bg-[#dfe8f2] border-b border-[#E7E9F0]">
                                    <th className="w-10 px-2 py-3"></th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Document</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Uploaded By</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Date</th>
                                    <th className="text-center px-4 py-3 font-secondary font-semibold text-[#374151]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F1F5]">
                                {docs.map((doc) => (
                                    <tr key={doc.on_board_documents_id} className="hover:bg-[#FAFAFB] transition-colors">
                                        <td className="px-0 py-3 text-center justify-items-end" valign='middle'>{getFileIcon(doc)}</td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-[#1F2430]">{doc.on_board_documents_name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-[#5B6480]">{doc.created_by_name || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-[#9AA2BA]">
                                            {formatIndonesianDate(doc.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center">
                                                {doc.on_board_documents_file && (
                                                    <Tooltip content={'Download Document'} position="top">
                                                        <PermissionButton
                                                            permission={['read']}
                                                            onClick={() => {
                                                                if (!doc.on_board_documents_file) return;
                                                                const downloadUrl = doc.on_board_documents_file.startsWith('http')
                                                                    ? `${doc.on_board_documents_file}/download`
                                                                    : doc.on_board_documents_file;
                                                                window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                                                            }}
                                                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-blue-600 hover:text-blue-700 hover:bg-blue-50`}
                                                        >
                                                            <FaFileArrowDown className="w-4 h-4" />
                                                        </PermissionButton>
                                                    </Tooltip>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                className="max-w-xl"
                title="Upload Document"
                description="Add an onboarding document for this candidate."
            >
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <Label>Title</Label>
                        <Input type="text" value={form.on_board_documents_name}
                            onChange={(e) => setForm(f => ({ ...f, on_board_documents_name: e.target.value }))} />
                    </div>
                    <div>
                        <Label>File</Label>
                        <input type="file"
                            onChange={(e) => setForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
                            className="w-full text-sm text-[#5B6480] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#EEF2FF] file:text-[#4338CA]" />
                    </div>
                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddModal(false)}
                            disabled={loading}
                            className="rounded-[50px]"
                        >
                            Cancel
                        </Button>
                        <PermissionGate permission={["create", "update"]}>
                            <Button
                                onClick={handleUpload}
                                className='rounded-[50px]'
                                disabled={uploading}
                            >
                                {uploading ? 'Saving...' : 'Save'}
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

            </Modal>

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
