import React, { useState, useCallback } from 'react';
import TextArea from '@/components/form/input/TextArea';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import { ProjectAttachment, DivisionOverviewFormData } from '../../types/divisionOverview';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { MdSave } from 'react-icons/md';

interface DivisionOverviewFormProps {
    formData: DivisionOverviewFormData;
    onFormDataChange: (formData: DivisionOverviewFormData) => void;
    onSubmit: (formData: DivisionOverviewFormData) => Promise<void>;
    isSubmitting?: boolean;
    showActions?: boolean;
    submitButtonText?: string;
}

const DivisionOverviewForm: React.FC<DivisionOverviewFormProps> = ({
    formData,
    onFormDataChange,
    onSubmit,
    isSubmitting = false,
    showActions = true,
    submitButtonText = 'Simpan Perubahan'
}) => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleRemarksChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const remarks = e.target.value;
        onFormDataChange({ ...formData, remarks });
        
        // Clear error jika ada
        if (errors.remarks) {
            setErrors(prev => ({ ...prev, remarks: '' }));
        }
    }, [formData, onFormDataChange, errors.remarks]);

    const onAttachmentChange = useCallback((files: File | File[] | null) => {
        const newFiles = Array.isArray(files) ? files : files ? [files] : [];
        onFormDataChange({
            ...formData,
            property_attachment_files: newFiles
        });
        
        // Clear error jika ada
        if (errors.property_attachment) {
            setErrors(prev => ({ ...prev, property_attachment: '' }));
        }
    }, [formData, onFormDataChange, errors.property_attachment]);

    const onRemoveExistingAttachment = useCallback((index?: number) => {
        if (index !== undefined && formData.existing_attachments) {
            const attachmentToRemove = formData.existing_attachments[index];
            if (attachmentToRemove) {
                // Add to delete list
                const deleteList = formData.property_attachment_delete || [];
                const newDeleteList = [...deleteList, attachmentToRemove];
                
                // Remove from existing list
                const newExisting = [...formData.existing_attachments];
                newExisting.splice(index, 1);
                
                onFormDataChange({
                    ...formData,
                    existing_attachments: newExisting,
                    property_attachment_delete: newDeleteList
                });
            }
        }
    }, [formData, onFormDataChange]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.remarks || formData.remarks.trim() === '') {
            newErrors.remarks = 'Remarks wajib diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const existingAttachments = Array.isArray(formData.existing_attachments)
            ? (formData.existing_attachments as ProjectAttachment[]).map(a => a.file_url)
            : [];

    return (
        <div className="space-y-6">
            {/* Remarks Field */}
            <div>
                <Label htmlFor="remarks">
                    Remarks <span className="text-red-500">*</span>
                </Label>
                <TextArea
                    placeholder="Masukkan remarks..."
                    rows={4}
                    value={formData.remarks}
                    onChange={handleRemarksChange}
                    error={!!errors.remarks}
                    hint={errors.remarks}
                    disabled={isSubmitting}
                    className="mt-2"
                />
            </div>

            {/* File Upload Field */}
            <div>
                <FileUpload
                    id={`property_attachment-${Math.random().toString(36).substr(2, 9)}`}
                    name="property_attachment"
                    label="Project Attachments"
                    accept="image/jpeg,image/jpg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    icon="upload"
                    acceptedFormats={['jpg', 'jpeg', 'png', 'doc', 'docx', 'pdf']}
                    maxSize={5}
                    multiple={true}
                    currentFiles={formData.property_attachment_files || []}
                    existingImageUrl={existingAttachments.length > 0 ? existingAttachments : null}
                    onFileChange={onAttachmentChange}
                    onRemoveExistingImage={onRemoveExistingAttachment}
                    validationError={errors.property_attachment || ''}
                    disabled={isSubmitting}
                    description="Format: JPG, JPEG, PNG, PDF, DOC, DOCX - Max 5MB each"
                    showPreview={true}
                    previewSize="lg"
                    colLength={4}
                />
            </div>

            {/* Form Actions */}
            {showActions && (
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 flex items-center gap-2 rounded-full"
                        >
                            <MdSave size={20} />
                            {isSubmitting ? 'Menyimpan...' : submitButtonText}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DivisionOverviewForm;