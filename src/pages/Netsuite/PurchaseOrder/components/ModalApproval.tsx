import { useState } from 'react';
import toast from 'react-hot-toast';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { PurchaseOrderService } from '../services/purchaseOrderService';

interface ModalApprovalProps {
    isOpen: boolean;
    titleModal: string;
    descriptionModal: string;
    onClose: () => void;
    poId: number | null;
    onSuccess?: () => void;
    reopen?: boolean;
    resubmit?: boolean;
    submit?: boolean;
}

export default function ModalApproval({ 
    isOpen, 
    titleModal, 
    descriptionModal,
    onClose, 
    poId, 
    onSuccess,
    reopen = false,
    resubmit = false,
    submit = false
}: ModalApprovalProps) {
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setNote('');
        setNoteError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!note.trim()) {
            setNoteError('Note wajib diisi');
            return;
        }
        setNoteError('');

        if (!poId) return;

        setIsSubmitting(true);
        try {
            const response = await PurchaseOrderService.submitApproval({
                id: poId,
                recordType: 'purchaseorder',
                custbody_msi_submit_app_api: submit,
                custbody_msi_reopen_api: reopen,
                custbody_msi_resubmit_api: resubmit,
                note: note.trim(),
            });

            toast.success(response.message || 'Approval berhasil disubmit');
            handleClose();
            onSuccess?.();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Gagal submit approval';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={titleModal}
            description={descriptionModal}
            className="max-w-xl"
        >
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note <span className="text-red-500">*</span>
                    </label>
                    <TextArea
                        name="note"
                        value={note}
                        onChange={(e) => {
                            setNote(e.target.value);
                            if (e.target.value.trim()) setNoteError('');
                        }}
                        rows={5}
                        placeholder="Masukkan catatan approval..."
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
                        {isSubmitting ? 'Submitting...' : 'Submit Approval'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
