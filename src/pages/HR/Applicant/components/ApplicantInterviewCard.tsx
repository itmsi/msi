import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { MdDownload } from 'react-icons/md';
import { LuAudioLines, LuChevronDown, LuLoaderCircle, LuRefreshCw, LuSparkles } from 'react-icons/lu';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { useLanguage } from '@/components/lang/useLanguage';
import { AiSummaryPanel } from '@/components/assistant-ui/Aisummarypanel';
import { ApplicantInterviewStep, ApplicantSpeechStatus, ApplicantSummaryAll } from '../types/applicant';
import { toDownloadUrl } from '../utils/applicantForm';
import { applicantLabels } from '../language/applicantLabels';

interface ApplicantInterviewCardProps {
    steps: ApplicantInterviewStep[];
    loading: boolean;
    error: string | null;
    transcribingIds: string[];
    summarizingIds: string[];
    canTranscribe: boolean;
    onTranscribe: (step: ApplicantInterviewStep) => void;
    onSummarize: (step: ApplicantInterviewStep) => void;
    onRetry: () => void;
    summaryAll: ApplicantSummaryAll;
    generatingSummaryAll: boolean;
    onGenerateSummaryAll: () => void;
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
                    className="w-full h-[600px] rounded-lg bg-black"
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

interface SummarySectionProps {
    step: ApplicantInterviewStep;
    summarizing: boolean;
    canSummarize: boolean;
    onSummarize: (step: ApplicantInterviewStep) => void;
}

const SummarySection = ({ step, summarizing, canSummarize, onSummarize }: SummarySectionProps) => {
    const { langField } = useLanguage(applicantLabels);
    const [copied, setCopied] = useState(false);
    const isFailed = step.summaryStatus === 'Failed';

    const handleCopySummary = async () => {
        try {
            await navigator.clipboard.writeText(step.summary);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(langField('summaryCopyFailed'));
        }
    };

    return (
        <div className="space-y-2">
            {step.summary || summarizing ? (
                <AiSummaryPanel
                    summary={step.summary}
                    setPrompt={() => undefined}
                    onGenerate={() => onSummarize(step)}
                    isGenerating={summarizing}
                    hidePromptInput
                    showChatHistory={false}
                    showCopyButton={Boolean(step.summary)}
                    copied={copied}
                    handleCopySummary={handleCopySummary}
                    loadingText={langField('summarizing')}
                />
            ) : (
                <p className="text-sm text-gray-500">{langField('summaryEmpty')}</p>
            )}

            {isFailed && (
                <p className="text-sm text-error-600">
                    {step.summaryMessage || langField('summaryFailedDescription')}
                </p>
            )}

            {canSummarize && (
                <Button
                    size="sm"
                    variant="outline"
                    disabled={!step.audioUrl || summarizing}
                    onClick={() => onSummarize(step)}
                    className="ai-generate-btn flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2.5 rounded-xl shrink-0 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                    startIcon={summarizing
                        ? <LuLoaderCircle size={14} className="animate-spin" />
                        : step.summary ? <LuRefreshCw size={14} /> : <LuSparkles size={14} />}
                >
                    {langField(summarizing ? 'summarizing' : step.summary ? 'regenerateSummary' : 'generateSummary')}
                </Button>
            )}
        </div>
    );
};

type AnswerTab = 'summary' | 'transcript';

interface AnswerTabsProps {
    step: ApplicantInterviewStep;
    summarizing: boolean;
    transcribing: boolean;
    canProcess: boolean;
    onSummarize: (step: ApplicantInterviewStep) => void;
    onTranscribe: (step: ApplicantInterviewStep) => void;
}

const AnswerTabs = ({ step, summarizing, transcribing, canProcess, onSummarize, onTranscribe }: AnswerTabsProps) => {
    const { langField } = useLanguage(applicantLabels);
    const [activeTab, setActiveTab] = useState<AnswerTab>('summary');
    const id = useId();

    const tabs: { key: AnswerTab; labelKey: string; busy: boolean; icon: React.ReactNode }[] = [
        { key: 'summary', labelKey: 'summaryTab', busy: summarizing, icon: <LuSparkles size={14} /> },
        { key: 'transcript', labelKey: 'transcriptTab', busy: transcribing || step.speechStatus === 'Pending', icon: <LuAudioLines size={14} /> },
    ];

    return (
        <div className="min-w-0">
            <div role="tablist" className="flex gap-2 border-b border-gray-200">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            id={`${id}-${tab.key}-tab`}
                            aria-selected={isActive}
                            aria-controls={`${id}-${tab.key}-panel`}
                            onClick={() => setActiveTab(tab.key)}
                            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.busy ? <LuLoaderCircle size={14} className="animate-spin" /> : tab.icon}
                            {langField(tab.labelKey)}
                        </button>
                    );
                })}
            </div>

            <div
                role="tabpanel"
                id={`${id}-${activeTab}-panel`}
                aria-labelledby={`${id}-${activeTab}-tab`}
                className="pt-3"
            >
                {activeTab === 'summary' ? (
                    <SummarySection
                        step={step}
                        summarizing={summarizing}
                        canSummarize={canProcess}
                        onSummarize={onSummarize}
                    />
                ) : (
                    <TranscriptSection
                        step={step}
                        transcribing={transcribing}
                        canTranscribe={canProcess}
                        onTranscribe={onTranscribe}
                    />
                )}
            </div>
        </div>
    );
};

const ApplicantInterviewCard = ({
    steps,
    loading,
    error,
    transcribingIds,
    summarizingIds,
    canTranscribe,
    onTranscribe,
    onSummarize,
    onRetry,
    summaryAll,
    generatingSummaryAll,
    onGenerateSummaryAll,
}: ApplicantInterviewCardProps) => {
    const { lang, langField } = useLanguage(applicantLabels);
    const [showInformation, setShowInformation] = useState(true);
    const [summaryAllCopied, setSummaryAllCopied] = useState(false);

    if (!loading && !error && !steps.length) return null;

    const handleCopySummaryAll = async () => {
        try {
            await navigator.clipboard.writeText(summaryAll.text);
            setSummaryAllCopied(true);
            window.setTimeout(() => setSummaryAllCopied(false), 2000);
        } catch {
            toast.error(langField('summaryCopyFailed'));
        }
    };

    const getQuestion = (item: ApplicantInterviewStep): string => {
        const byLang = { id: item.questionId, en: item.questionEn, zh: item.questionCn }[lang];
        return byLang || item.questionEn || item.questionId || item.questionCn;
    };

    const actionToggle = () => setShowInformation(prev => !prev);

    return (
        <div className="bg-white rounded-2xl shadow-sm py-6 space-y-6 relative">
            <h3
                className={`text-lg font-primary-bold text-center ${showInformation ? 'border-b border-b-gray-300 pb-3' : 'mb-0'} uppercase text-gray-900 flex justify-center items-center gap-5 cursor-pointer`}
                onClick={actionToggle}
            >
                {langField('interviewQuestions')} <LuChevronDown />
            </h3>
            {showTranscriptFeature && canTranscribe && steps.length > 0 && (
                <div className="relative text-center overflow-hidden mb-0"
                    style={{
                        position: 'absolute',
                        right: '1.3rem',
                        top: showInformation ? '.8rem' : '1.2rem',
                    }}>
                    <button
                        type="button"
                        onClick={onGenerateSummaryAll}
                        disabled={generatingSummaryAll}
                        className="ai-generate-btn flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2.5 rounded-xl shrink-0 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {generatingSummaryAll
                            ? <LuLoaderCircle size={16} className="animate-spin" />
                            : <LuSparkles size={16} />}
                        {langField(generatingSummaryAll ? 'summarizing' : summaryAll.text ? 'regenerateSummary' : 'generateSummary')}
                    </button>
                </div>
            )}
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

            {showTranscriptFeature && showInformation && (summaryAll.text || generatingSummaryAll || summaryAll.status === 'Failed') && (
                <div className="px-4 space-y-2">
                    {(summaryAll.text || generatingSummaryAll) && (
                        <AiSummaryPanel
                            summary={summaryAll.text}
                            setPrompt={() => undefined}
                            onGenerate={onGenerateSummaryAll}
                            isGenerating={generatingSummaryAll}
                            hidePromptInput
                            showChatHistory={false}
                            showCopyButton={Boolean(summaryAll.text)}
                            copied={summaryAllCopied}
                            handleCopySummary={handleCopySummaryAll}
                            loadingText={langField('summarizing')}
                        />
                    )}
                    {summaryAll.status === 'Failed' && !generatingSummaryAll && (
                        <p className="text-sm text-error-600">
                            {summaryAll.message || langField('summaryFailedDescription')}
                        </p>
                    )}
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
                                className="border-b border-gray-200 last:border-b-0 px-4 py-5 space-y-4"
                            >

                                <div className={showTranscriptFeature ? 'grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6 items-start' : 'max-w-2xl'}>
                                    <MediaPlayer kind="video" url={item.videoUrl} title={item.videoTitle} />
                                    {/* <MediaPlayer kind="audio" url={item.audioUrl} title={item.audioTitle} /> */}
                                    {showTranscriptFeature && (
                                        <div className="space-y-2">
                                            <div className="space-y-2">
                                                <span className="text-xs font-primary-bold uppercase tracking-wide text-brand-600">
                                                    {langField('question')}
                                                </span>

                                                <div className="bg-brand-50 rounded-lg px-4 py-3 text-sm leading-relaxed text-gray-900 flex gap-3 items-start">
                                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-primary-bold shrink-0">
                                                        {item.step || index + 1}
                                                    </span>
                                                    <p className={`flex-1 mt-0.5 ${question ? '' : 'italic text-gray-500'}`}>
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
                                            <AnswerTabs
                                                step={item}
                                                summarizing={summarizingIds.includes(item.id)}
                                                transcribing={transcribingIds.includes(item.id)}
                                                canProcess={canTranscribe}
                                                onSummarize={onSummarize}
                                                onTranscribe={onTranscribe}
                                            />
                                        </div>
                                    )}
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
