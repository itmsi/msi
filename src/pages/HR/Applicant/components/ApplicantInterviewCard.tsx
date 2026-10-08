import { useState } from 'react';
import { MdDownload } from 'react-icons/md';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantInterviewStep } from '../types/applicant';
import { toDownloadUrl } from '../utils/applicantForm';
import { applicantLabels } from '../language/applicantLabels';

interface ApplicantInterviewCardProps {
    steps: ApplicantInterviewStep[];
}

interface MediaPlayerProps {
    kind: 'video' | 'audio';
    url: string;
    title: string;
}

const MediaPlayer = ({ kind, url, title }: MediaPlayerProps) => {
    const { langField } = useLanguage(applicantLabels);
    const [failed, setFailed] = useState(false);
    const source = url ? toDownloadUrl(url) : '';
    // const label = langField(kind === 'video' ? 'questionVideo' : 'audioAnswer');

    return (
        <div className="space-y-2 min-w-0">
            {/* <p className="text-sm font-medium text-gray-700">{label}</p> */}

            {!source || failed ? (
                <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">{langField('fileUnavailable')}</p>
                    {source && (
                        <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                        >
                            <MdDownload size={16} />
                            {langField('downloadFile')}
                        </a>
                    )}
                </div>
            ) : kind === 'video' ? (
                <video
                    controls
                    preload="none"
                    src={source}
                    onError={() => setFailed(true)}
                    className="w-full aspect-video rounded-lg bg-black"
                />
            ) : (
                <audio
                    controls
                    preload="none"
                    src={source}
                    onError={() => setFailed(true)}
                    className="w-full"
                />
            )}

            {title && <p className="text-xs text-gray-500 truncate" title={title}>{title}</p>}
        </div>
    );
};

const ApplicantInterviewCard = ({ steps }: ApplicantInterviewCardProps) => {
    const { lang, langField } = useLanguage(applicantLabels);

    if (!steps.length) return null;

    const getQuestion = (item: ApplicantInterviewStep): string => {
        const byLang = { id: item.questionId, en: item.questionEn, zh: item.questionCn }[lang];
        return byLang || item.questionEn || item.questionId || item.questionCn || '-';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-primary-bold text-center pb-3 border-b border-b-gray-300 uppercase text-gray-900">
                {langField('interviewQuestions')}
            </h3>

            <div className="space-y-4">
                {steps.map((item, index) => {
                    const focusItems = item.focusAssessment
                        .split(',')
                        .map(focus => focus.trim())
                        .filter(Boolean);

                    return (
                        <div
                            key={item.idQuestion || `${item.step}-${index}`}
                            className="border border-gray-200 rounded-xl p-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
                                <div className="space-y-3 min-w-0">
                                    <div className="flex items-center gap-2">

                                        <span className="text-xs font-primary-bold uppercase tracking-wide text-brand-600">
                                            {langField('question')}
                                        </span>
                                    </div>

                                    <div className="bg-brand-50 rounded-lg px-4 py-3 text-sm leading-relaxed text-gray-900 flex gap-2 items-center min-h-30">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-primary-bold shrink-0">
                                            {item.step || index + 1}
                                        </span>
                                        <p className='flex-1'>
                                            {getQuestion(item)}
                                        </p>
                                    </div>

                                    {focusItems.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-gray-500">{langField('focusAssessment')}:</span>
                                            {focusItems.map(focus => (
                                                <span
                                                    key={focus}
                                                    className="px-2 py-0.5 text-xs rounded-full border border-gray-200 bg-gray-50 text-gray-700"
                                                >
                                                    {focus}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <MediaPlayer kind="video" url={item.videoUrl} title={item.videoTitle} />
                                    {/* <MediaPlayer kind="audio" url={item.audioUrl} title={item.audioTitle} /> */}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ApplicantInterviewCard;
