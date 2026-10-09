import FileUpload from '@/components/ui/FileUpload/FileUpload';
import { useLanguage } from '@/components/lang/useLanguage';
import { formatDateLocal } from '@/helpers/generalHelper';
import { ApplicantFormAttachments, ApplicantFormFile } from '../types/applicant';
import { toDownloadUrl, toPreviewUrl } from '../utils/applicantForm';
import { applicantLabels } from '../language/applicantLabels';
import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

interface ApplicantAttachmentsCardProps {
    attachments: ApplicantFormAttachments;
}

const ACCEPTED_FORMATS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
const ACCEPT_ATTRIBUTE = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';

const CV_TITLE = 'cv';
const PHOTO_TITLE = 'foto';

const ApplicantAttachmentsCard = ({ attachments }: ApplicantAttachmentsCardProps) => {
    const { langField } = useLanguage(applicantLabels);
    const { files, signatureLink, signatureDate } = attachments;

    if (!files.length && !signatureLink) return null;

    const findByTitle = (title: string) =>
        files.find(item => item.file_title.trim().toLowerCase() === title);

    const cvFile = findByTitle(CV_TITLE);
    const photoFile = findByTitle(PHOTO_TITLE);
    // Sisanya masuk panel lainnya, termasuk file berjudul sama yang lebih dari satu.
    const otherFiles = files.filter(item => item !== cvFile && item !== photoFile);

    const [showInformation, setShowInformation] = useState(true);
    const actionToggle = () => setShowInformation(prev => !prev);

    const renderPanel = (id: string, label: string, items: ApplicantFormFile[], colLength: number) => (
        <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
            {items.length === 0 ? (
                <p className="text-sm text-gray-500">{langField('noAttachments')}</p>
            ) : (
                <FileUpload
                    id={id}
                    name={id}
                    label=""
                    accept={ACCEPT_ATTRIBUTE}
                    acceptedFormats={ACCEPTED_FORMATS}
                    multiple
                    viewMode
                    hasDownloadButton
                    previewSize="lg"
                    className={`rm-preview${id === 'applicant_file_others' ? ' rm-multiple' : ''}`}
                    colLength={colLength}
                    existingImageUrl={items.map(item => toDownloadUrl(item.file))}
                    existingFiles={items.map(item => ({
                        file_id: item.file,
                        file_url: toDownloadUrl(item.file),
                        file_name: item.file_title || langField('untitledFile'),
                        file_type: item.file_type === 'image' ? 'image' : 'document',
                    }))}
                    onFileChange={() => undefined}
                />
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <h3
                className={`text-lg font-primary-bold text-center ${showInformation ? 'border-b border-b-gray-300 pb-3' : ''} uppercase text-gray-900 flex justify-center items-center gap-5 cursor-pointer`}
                onClick={actionToggle}
            >
                {langField('attachments')} <LuChevronDown />
            </h3>
            {showInformation && <>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {renderPanel('applicant_file_cv', langField('cvDocument'), cvFile ? [cvFile] : [], 1)}
                    {renderPanel('applicant_file_photo', langField('photo'), photoFile ? [photoFile] : [], 1)}
                </div>

                {otherFiles.length > 0 && renderPanel('applicant_file_others', langField('otherDocuments'), otherFiles, 6)}

                {signatureLink && (
                    <div className='grid grid-cols-6'>
                        <p className="col-span-6 text-sm font-medium text-gray-700">{langField('signature')}</p>
                        <FileUpload
                            id="applicant_signature"
                            name="applicant_signature"
                            label=""
                            accept=".jpg,.jpeg,.png"
                            acceptedFormats={['jpg', 'jpeg', 'png']}
                            multiple
                            viewMode
                            hasDownloadButton
                            previewSize="lg"
                            colLength={1}
                            className='rm-preview'
                            existingImageUrl={[toPreviewUrl(signatureLink)]}
                            existingFiles={[{
                                file_id: signatureLink,
                                file_url: toPreviewUrl(signatureLink),
                                file_name: langField('signature'),
                                file_type: 'image',
                            }]}
                            onFileChange={() => undefined}
                        />
                        <p className="col-span-6 mt-2 text-xs text-gray-500">
                            {langField('signedAt')}: {signatureDate ? formatDateLocal(signatureDate) : '-'}
                        </p>
                    </div>
                )}
            </>}
        </div>
    );
};

export default ApplicantAttachmentsCard;
