import { MdSend } from 'react-icons/md';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantInvitationField } from '../types/applicant';
import { useApplicantInvitationCreate } from '../hooks/useApplicantInvitationCreate';
import { applicantManage } from '../language/applicantManage';

interface CreateApplicantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const FIELDS: { field: ApplicantInvitationField; labelKey: string; placeholderKey: string; type: string }[] = [
    { field: 'full_name', labelKey: 'fullName', placeholderKey: 'fullNamePlaceholder', type: 'text' },
    { field: 'email', labelKey: 'email', placeholderKey: 'emailPlaceholder', type: 'email' },
    { field: 'no_mobile', labelKey: 'mobileNumber', placeholderKey: 'mobileNumberPlaceholder', type: 'tel' },
];

const CreateApplicantModal = ({ isOpen, onClose, onSuccess }: CreateApplicantModalProps) => {
    const { langField } = useLanguage(applicantManage);
    const { formData, errors, isSubmitting, handleChange, handleSubmit, reset } = useApplicantInvitationCreate(() => {
        onSuccess();
        onClose();
    });

    const handleClose = () => {
        if (isSubmitting) return;
        reset();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={langField('inviteApplicant')}
            description={langField('inviteDescription')}
            className="max-w-lg"
        >
            <div className="p-6 space-y-4 font-secondary">
                {FIELDS.map(({ field, labelKey, placeholderKey, type }) => {
                    const errorKey = errors[field];

                    return (
                        <div key={field}>
                            <Label htmlFor={`invitation_${field}`}>
                                {langField(labelKey)} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id={`invitation_${field}`}
                                name={field}
                                type={type}
                                autoComplete="off"
                                value={formData[field]}
                                placeholder={langField(placeholderKey)}
                                error={Boolean(errorKey)}
                                disabled={isSubmitting}
                                onChange={(e) => handleChange(field, e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleSubmit();
                                }}
                            />
                            {errorKey && <p className="mt-1 text-xs text-red-500">{langField(errorKey)}</p>}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-200">
                <Button type="button" onClick={handleClose} variant="outline" size="sm" disabled={isSubmitting}>
                    {langField('cancel')}
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="sm"
                    className={`flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <MdSend size={16} />
                    {langField(isSubmitting ? 'sending' : 'sendInvitation')}
                </Button>
            </div>
        </Modal>
    );
};

export default CreateApplicantModal;
