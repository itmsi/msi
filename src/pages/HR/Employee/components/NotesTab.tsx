import { useState, useEffect } from 'react';
import { MdSend, MdDelete, MdStickyNote2 } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { notesService } from '../../Candidate/services/hrService';
import type { NoteItem } from '../../Candidate/types/hr';
import formatIndonesianDate from '../../Candidate/utils/date';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

interface NotesTabProps {
    candidateId: string;
    remark?: string | null;
    isActive: boolean;
}

export function NotesTab({ candidateId, remark, isActive }: NotesTabProps) {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchNotes = async () => {
        if (!candidateId) return;
        setLoading(true);
        try {
            const result = await notesService.getList(candidateId);
            setNotes(result.data || []);
        } catch {
            toast.error('Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isActive) fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, candidateId]);

    const handleAdd = async () => {
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            await notesService.create({ candidate_id: candidateId, notes: text.trim(), created_by: 'User' });
            setText('');
            fetchNotes();
        } catch {
            toast.error('Failed to add note');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await notesService.delete(deleteId);
            toast.success('Note deleted');
            setDeleteId(null);
            fetchNotes();
        } catch {
            toast.error('Failed to delete note');
        }
    };

    return (
        <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-[#E7E9F0] p-4 flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Write a note about this candidate..."
                    className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-[#E7E9F0] focus:outline-none focus:ring-2 focus:ring-[#8B93B8]/30"
                />
                <button
                    onClick={handleAdd}
                    disabled={submitting || !text.trim()}
                    className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white bg-[#1F2430] hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
                >
                    <MdSend size={13} /> Send
                </button>
            </div>

            {remark && (
                <div className="bg-[#FFFBEB] rounded-2xl border border-[#F4E3C4] p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1.5 text-[#8A5D1E]">
                        <MdStickyNote2 size={13} /> Remark
                    </span>
                    <p className="text-sm text-[#3A4260] mt-1.5 leading-relaxed">{remark}</p>
                </div>
            )}

            {loading ? (
                <p className="text-[13px] text-[#9AA2BA]">Loading notes...</p>
            ) : notes.length === 0 ? (
                <p className="text-[13px] text-[#9AA2BA]">No notes yet.</p>
            ) : (
                <div className="space-y-2.5">
                    {notes.map((n) => (
                        <div key={n.note_id} className="bg-white rounded-2xl border border-[#E7E9F0] p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#1F2430]">{n.created_by_name || n.created_by || '-'}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#9AA2BA]">{formatIndonesianDate(n.created_at)}</span>
                                    <button onClick={() => setDeleteId(n.note_id)} className="text-[#C4C9DA] hover:text-red-500 transition">
                                        <MdDelete size={14} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-[#5B6480] mt-1.5 leading-relaxed whitespace-pre-wrap">{n.notes}</p>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Note"
                message="Delete this note?"
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                size="sm"
            />
        </div>
    );
}
