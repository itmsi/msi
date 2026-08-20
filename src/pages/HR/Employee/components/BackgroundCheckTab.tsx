import { useState, useEffect } from 'react';
import type { BackgroundCheckItem } from '../../Candidate/types/hr';
import { backgroundCheckService } from '../../Candidate/services/hrService';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button/Button';
import formatIndonesianDate from '../../Candidate/utils/date';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { Modal } from '@/components/ui/modal';
import TextArea from '@/components/form/input/TextArea';
import { Tooltip } from '@/components/ui/tooltip';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { FaRegFilePdf } from 'react-icons/fa';
import { PermissionButton, PermissionGate } from '@/components/common/PermissionComponents';
import Label from '@/components/form/Label';
import { StatusTypeBadgeCandidate } from '@/components/ui/badge/StatusBadge';

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
            <div className="flex items-center justify-end mb-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(true)}
                    className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                    size="sm"
                >
                    <MdAdd className="w-4 h-4" />
                    Add Check
                </Button>
            </div>

            {items.length === 0 ? (
                <p className="text-sm text-[#9AA2BA]">No background checks yet.</p>
            ) : (
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-272 text-sm">
                            <thead>
                                <tr className="bg-[#dfe8f2] border-b border-[#E7E9F0]">
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Notes</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Created By</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151]">Date</th>
                                    <th className="text-center px-4 py-3 font-secondary font-semibold text-[#374151]">Status</th>
                                    <th className="text-left px-4 py-3 font-secondary font-semibold text-[#374151] w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F1F5]">
                                {items.map((item) => {
                                    return (
                                        <tr key={item.background_check_id} className="hover:bg-[#FAFAFB] transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-[#3A4260]">{item.background_check_note || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-[#5B6480]">{item.created_by_name || '-'}</td>
                                            <td className="px-4 py-3 text-[#5B6480]">{formatIndonesianDate(item.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <div className="items-center flex justify-center capitalize">
                                                    {item.background_check_status ? (
                                                        <StatusTypeBadgeCandidate
                                                            type={item.background_check_status as 'Hired' | 'Rejected' | 'On Hold'}
                                                            label={item.background_check_status || undefined}
                                                        />
                                                    ) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Tooltip content={item.file_attachment ? 'Download' : 'File Not Found'} position="top">
                                                        <PermissionButton
                                                            permission={['read']}
                                                            onClick={() => {
                                                                if (!item.file_attachment) return;
                                                                const downloadUrl = item.file_attachment.startsWith('http')
                                                                    ? `${item.file_attachment}/download`
                                                                    : item.file_attachment;
                                                                window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                                                            }}
                                                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-blue-600 hover:text-blue-700 hover:bg-blue-50`}
                                                            disabled={!item.file_attachment}
                                                        >
                                                            <FaRegFilePdf className="w-4 h-4" />
                                                        </PermissionButton>
                                                    </Tooltip>
                                                    <Tooltip content={'Delete'} position="top">
                                                        <PermissionButton
                                                            permission={["create", "update"]}
                                                            onClick={() => { setDeletingId(item.background_check_id); setShowDeleteModal(true); }}
                                                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50`}
                                                        >
                                                            <MdDeleteOutline className="w-4 h-4" />
                                                        </PermissionButton>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                className="max-w-xl"
                title={`Add Background Check`}
                description={`Record the result of a background verification.`}
            >
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <Label>Result</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {['Hired', 'Rejected', 'On Hold'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, background_check_status: s }))}
                                    className={`px-3 py-1.5 rounded-full text-xs font-primary-bold border transition-colors ${form.background_check_status === s ? 'bg-[#0253a5] text-white border-[#0253a5]' : 'bg-white text-[#5B6480] border-[#E7E9F0] hover:border-[#C4C9DA]'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Notes</Label>
                        <TextArea value={form.background_check_note} onChange={(e) => setForm(f => ({ ...f, background_check_note: e.target.value }))} rows={3} />
                    </div>
                    <div>
                        <Label>Attachment (PDF)</Label>
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
                            className="w-full text-sm text-[#5B6480] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-primary-bold file:bg-[#EEF2FF] file:text-[#4338CA]" />
                        <p className="text-xs text-[#9AA2BA] mt-1">Upload background check documents (PDF only, max 10MB)</p>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddModal(false)}
                            className="rounded-[50px]"
                        >
                            Cancel
                        </Button>
                        <PermissionGate permission={["create", "update"]}>
                            <Button
                                onClick={handleSubmit}
                                className='rounded-[50px]'
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save'}
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
