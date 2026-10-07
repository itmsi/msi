import { useState } from 'react';
import toast from 'react-hot-toast';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { BillPaymentService } from '../services/billPaymentService';
import { getProfile } from '@/helpers/generalHelper';

interface ModalApprovalProps {
    isOpen: boolean;
    titleModal: string;
    descriptionModal: string;
    onClose: () => void;
    billPaymentId: number | null;
    action: 'approve' | 'reject';
    approverNetsuiteId: string | null;
    onSuccess?: () => void;
}

export default function ModalApproval({
    isOpen,
    titleModal,
    descriptionModal,
    onClose,
    billPaymentId,
    action,
    approverNetsuiteId,
    onSuccess,
}: ModalApprovalProps) {
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.email || null;
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setNote('');
        setNoteError('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!note.trim()) {
            setNoteError('Note wajib diisi');
            return;
        }
        setNoteError('');

        if (!billPaymentId) return;
        if (!approverNetsuiteId || isNaN(Number(approverNetsuiteId))) {
            toast.error('NetSuite ID user yang login tidak ditemukan');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await BillPaymentService.submitApproval({
                id: billPaymentId,
                recordType: 'vendorpayment',
                actionId: action,
                note: note.trim(),
                noteTitle: profileSSOId,
                custbody_me_wf_next_approver_blank: Number(approverNetsuiteId),
            });

            toast.success(response.message || (action === 'approve' ? 'Approve berhasil' : 'Reject berhasil'));
            handleClose();
            onSuccess?.();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || `Gagal ${action}`;
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const buttonLabel = isSubmitting ? 'Submitting...' : action === 'approve' ? 'Approve' : 'Reject';

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
                        placeholder={`Masukkan catatan ${action}...`}
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
                        className={`px-6 rounded-full ${action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                        {buttonLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
