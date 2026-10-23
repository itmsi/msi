import { useState } from 'react';
import { MdDownload } from 'react-icons/md';
import { LuAudioLines, LuChevronDown, LuLoaderCircle, LuRefreshCw } from 'react-icons/lu';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantInterviewStep, ApplicantSpeechStatus } from '../types/applicant';
import { toDownloadUrl } from '../utils/applicantForm';
import { applicantLabels } from '../language/applicantLabels';

interface ApplicantInterviewCardProps {
    steps: ApplicantInterviewStep[];
    loading: boolean;
    error: string | null;
    transcribingIds: string[];
    canTranscribe: boolean;
    onTranscribe: (step: ApplicantInterviewStep) => void;
    onRetry: () => void;
}

interface MediaPlayerProps {
    kind: 'video' | 'audio';
    url: string;
    title: string;
}
const showTranscriptFeature = import.meta.env.VITE_FEATURE_INTERVIEW_TRANSCRIPT === 'true';
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

const SPEECH_STATUS_BADGE: Record<Exclude<ApplicantSpeechStatus, null> | 'none', { color: 'success' | 'warning' | 'error' | 'light'; labelKey: string }> = {
    Success: { color: 'success', labelKey: 'transcriptSuccess' },
    Pending: { color: 'warning', labelKey: 'transcriptPending' },
    Failed: { color: 'error', labelKey: 'transcriptFailed' },
    none: { color: 'light', labelKey: 'transcriptNotStarted' },
};

interface TranscriptSectionProps {
    step: ApplicantInterviewStep;
    transcribing: boolean;
    canTranscribe: boolean;
    onTranscribe: (step: ApplicantInterviewStep) => void;
}

const TranscriptSection = ({ step, transcribing, canTranscribe, onTranscribe }: TranscriptSectionProps) => {
    const { langField } = useLanguage(applicantLabels);
    const status = step.speechStatus;
    const badge = SPEECH_STATUS_BADGE[status ?? 'none'];
    const isFailed = status === 'Failed';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-primary-bold uppercase tracking-wide text-gray-600">
                    {langField('answerTranscript')}
                </span>
                <Badge size="sm" color={badge.color}>{langField(badge.labelKey)}</Badge>
            </div>

            {status === 'Success' && (
                <p className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800 whitespace-pre-line">
                    {step.speechText || '-'}
                </p>
            )}

            {status === 'Pending' && (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                    <LuLoaderCircle size={14} className="animate-spin shrink-0" />
                    {langField('transcriptPendingDescription')}
                </p>
            )}

            {(status === null || isFailed) && (
                <div className="flex flex-wrap items-center gap-3">
                    <p className={`flex-1 min-w-40 text-sm ${isFailed ? 'text-error-600' : 'text-gray-500'}`}>
                        {isFailed
                            ? step.speechMessage || langField('transcriptFailedDescription')
                            : langField('transcriptNotStartedDescription')}
                    </p>
                    {canTranscribe && (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!step.audioUrl || transcribing}
                            onClick={() => onTranscribe(step)}
                            startIcon={transcribing
                                ? <LuLoaderCircle size={14} className="animate-spin" />
                                : isFailed ? <LuRefreshCw size={14} /> : <LuAudioLines size={14} />}
                        >
                            {langField(transcribing ? 'transcribing' : isFailed ? 'retryTranscribe' : 'transcribeAudio')}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

const ApplicantInterviewCard = ({
    steps,
    loading,
    error,
    transcribingIds,
    canTranscribe,
    onTranscribe,
    onRetry,
}: ApplicantInterviewCardProps) => {
    const { lang, langField } = useLanguage(applicantLabels);
    const [showInformation, setShowInformation] = useState(true);

    if (!loading && !error && !steps.length) return null;

    const getQuestion = (item: ApplicantInterviewStep): string => {
        const byLang = { id: item.questionId, en: item.questionEn, zh: item.questionCn }[lang];
        return byLang || item.questionEn || item.questionId || item.questionCn;
    };

    const actionToggle = () => setShowInformation(prev => !prev);

    return (
        <div className="bg-white rounded-2xl shadow-sm py-6 space-y-6">
            <h3
                className={`text-lg font-primary-bold text-center ${showInformation ? 'border-b border-b-gray-300 pb-3' : ''} uppercase text-gray-900 flex justify-center items-center gap-5 cursor-pointer`}
                onClick={actionToggle}
            >
                {langField('interviewQuestions')} <LuChevronDown />
            </h3>
            {showInformation && loading && !steps.length && (
                <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <LuLoaderCircle size={15} className="animate-spin" />
                    {langField('loadingInterview')}
                </p>
            )}
            {showInformation && error && !steps.length && (
                <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-error-600">{error}</p>
                    <Button size="sm" variant="outline" onClick={onRetry} startIcon={<LuRefreshCw size={14} />}>
                        {langField('retry')}
                    </Button>
                </div>
            )}
            {showInformation && steps.length > 0 &&
                <div className="space-y-4">
                    {steps.map((item, index) => {
                        const question = getQuestion(item);
                        const focusItems = item.focusAssessment
                            .split(',')
                            .map(focus => focus.trim())
                            .filter(Boolean);

                        return (
                            <div
                                key={item.id || `${item.step}-${index}`}
                                className="border-b border-gray-200 p-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
                                    <div>
                                        <MediaPlayer kind="video" url={item.videoUrl} title={item.videoTitle} />
                                        {/* <MediaPlayer kind="audio" url={item.audioUrl} title={item.audioTitle} /> */}
                                    </div>
                                    <div className="space-y-4 min-w-0">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-primary-bold uppercase tracking-wide text-brand-600">
                                                    {langField('question')}
                                                </span>
                                            </div>

                                            <div className="bg-brand-50 rounded-lg px-4 py-3 text-sm leading-relaxed text-gray-900 flex gap-2 items-center min-h-30">
                                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-primary-bold shrink-0">
                                                    {item.step || index + 1}
                                                </span>
                                                <p className={`flex-1 ${question ? '' : 'italic text-gray-500'}`}>
                                                    {question || langField('questionTextUnavailable')}
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

                                        {showTranscriptFeature && (
                                            <TranscriptSection
                                                step={item}
                                                transcribing={transcribingIds.includes(item.id)}
                                                canTranscribe={canTranscribe}
                                                onTranscribe={onTranscribe}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            }
        </div>
    );
};

export default ApplicantInterviewCard;
