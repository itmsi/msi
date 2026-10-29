import { useState } from 'react';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';

interface ModalNoteApprovalProps {
    isOpen: boolean;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (note: string) => void;
}

export default function ModalNoteApproval({
    isOpen,
    isSubmitting = false,
    onClose,
    onSubmit,
}: ModalNoteApprovalProps) {
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');

    const handleClose = () => {
        setNote('');
        setNoteError('');
        onClose();
    };

    const handleSubmit = () => {
        if (!note.trim()) {
            setNoteError('Note wajib diisi');
            return;
        }
        setNoteError('');
        onSubmit(note.trim());
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Note Approval"
            description="Isi note terlebih dahulu sebelum Transfer Order dibuat."
            className="max-w-xl"
        >
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note <span className="text-red-500">*</span>
                    </label>
                    <TextArea
                        name="note_approval"
                        value={note}
                        onChange={(e) => {
                            setNote(e.target.value);
                            if (e.target.value.trim()) setNoteError('');
                        }}
                        rows={5}
                        placeholder="Masukkan catatan..."
                        error={!!noteError}
                        hint={noteError}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-6 rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 rounded-full"
                    >
                        {isSubmitting ? 'Creating...' : 'Submit'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
