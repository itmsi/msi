import { useState, useEffect } from 'react';
import { interviewFormService } from '../../Candidate/services/interviewService';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
import HRAccordion from '../../Candidate/components/HRAccordion';
import { motion, AnimatePresence } from 'framer-motion';
import Label from '@/components/form/Label';
import { PermissionGate } from '@/components/common/PermissionComponents';

const POINT_OPTIONS = [
    { value: '', label: 'Select point' },
    { value: '5', label: '5 - Excellent' },
    { value: '4', label: '4 - Good' },
    { value: '3', label: '3 - Average' },
    { value: '2', label: '2 - Poor' },
    { value: '1', label: '1 - Very Poor' },
];

const POINT_STYLE: Record<string, { bg: string; fg: string; border: string }> = {
    '5': { bg: '#ECFDF5', fg: '#047857', border: '#A7F3D0' },
    '4': { bg: '#ECFDF5', fg: '#047857', border: '#A7F3D0' },
    '3': { bg: '#FFFBEB', fg: '#B45309', border: '#FDE68A' },
    '2': { bg: '#FFF7ED', fg: '#C2410C', border: '#FED7AA' },
    '1': { bg: '#FFF1F2', fg: '#E11D48', border: '#FECDD3' },
};
// const INACTIVE_POINT_STYLE = { bg: '#FFFFFF', fg: '#5B6480', border: '#E7E9F0' };
const INACTIVE_POINT_STYLE: Record<string, { bg: string; fg: string; border: string }> = {
    '5': { bg: '#FFFFFF', fg: '#5B6480', border: '#047857' },
    '4': { bg: '#FFFFFF', fg: '#5B6480', border: '#047857' },
    '3': { bg: '#FFFFFF', fg: '#5B6480', border: '#B45309' },
    '2': { bg: '#FFFFFF', fg: '#5B6480', border: '#C2410C' },
    '1': { bg: '#FFFFFF', fg: '#5B6480', border: '#E11D48' },
};

const SIAH_ASPECTS = [
    { key: 'sincerity', label: 'Sincerity' },
    { key: 'trustworthy', label: 'Trustworthy' },
    { key: 'altruism', label: 'Altruism' },
    { key: 'humble', label: 'Humble' },
];

const VALUE_ASPECTS = [
    { key: 'giving_meaning', label: 'Giving Meaning' },
    { key: 'love_to_learn', label: 'Love to learn' },
    { key: 'happy_practice', label: 'Happy practice' },
    { key: 'like_innovation', label: 'Like innovation' },
    { key: 'happy_to_share', label: 'Happy to share' },
    { key: 'embrace_failure', label: 'Embrace failure' },
    { key: 'habit_of_excellence', label: 'Habit of excellence' },
];

const CSE_ASPECTS = [
    { key: 'self_esteem', label: 'Self Esteem', defaultQ: 'Does this person believe in their own worth?' },
    { key: 'self_efficacy', label: 'Self Efficacy', defaultQ: 'Does this person believe they have the ability to complete their work?' },
    { key: 'locus_control', label: 'Locus of control', defaultQ: 'Does this person believe their success is determined by their own actions or external factors?' },
    { key: 'emotional_stability', label: 'Emotional Stability', defaultQ: 'Can this person control their emotions?' },
];

const SDT_ASPECTS = [
    { key: 'l2', label: 'L2 (External Regulation – Driven by rewards or punishments ( not ideal)', point: 20 },
    { key: 'l3', label: 'L3 (Self - Involment and focus on self and other evaluation)', point: 25 },
    { key: 'l4', label: 'L4 (I personally think it is important and consciously give it meaning)', point: 30 },
    { key: 'l5', label: 'L5 (Consistency self-integration of goals)', point: 35 },
    { key: 'l6', label: 'L6 (Interest, happiness, self-satisfaction)', point: 40 },
];

const EXPERIENCE_ASPECTS = [
    { key: 'role_matching', label: 'Role Matching' },
    { key: 'product_knowledge', label: 'Product Knowledge' },
    { key: 'significant_contribution', label: 'Significant Contribution' },
    { key: 'goals_align_with_roe', label: 'Goals align with ROE Company' },
];

type FormType = 'siah' | 'values' | 'cse' | 'sdt' | 'experience';
type AspectForm = Record<string, { point: string; question: string; remark: string }>;

interface FormScoringCanvasProps {
    candidateId: string;
    scheduleId?: string | null;
    editingFormId?: string;
    onBack: () => void;
}

const FormScoringCanvas = ({ candidateId, scheduleId, editingFormId, onBack }: FormScoringCanvasProps) => {
    const scheduleInterviewId = scheduleId || candidateId;
    const [formIdMap, setFormIdMap] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<FormType>('siah');

    useEffect(() => {
        if (!editingFormId) {
            // Adding — always start blank, regardless of what this interviewer already
            // submitted for this schedule; submitting always creates a new record.
            setFormIdMap({});
            setActiveTab('siah');
            return;
        }
        if (!scheduleInterviewId) {
            setFormIdMap({});
            return;
        }
        interviewFormService.getList({ schedule_interview_id: scheduleInterviewId })
            .then((res) => {
                const all = res.data || [];
                // Editing an existing submission — pull company_value -> interviewId from every
                // form that same interviewer submitted for this schedule, no matter how long ago,
                // so switching tabs doesn't accidentally treat an older category as blank.
                const match = all.find((f) => f.interview_id === editingFormId);
                const relevant = match ? all.filter((f) => f.created_by_name === match.created_by_name) : [];

                const map: Record<string, string> = {};
                relevant.forEach((f) => { map[f.company_value] = f.interview_id; });
                setFormIdMap(map);
            })
            .catch(() => { });
    }, [scheduleInterviewId, editingFormId]);

    const tabs: { key: FormType; label: string }[] = [
        { key: 'siah', label: 'SIAH' },
        { key: 'values', label: '7 Values' },
        { key: 'cse', label: 'CSE' },
        { key: 'sdt', label: 'SDT' },
        { key: 'experience', label: 'Experience' },
    ];

    return (
        <div>
            <div className="relative flex gap-1 border-b border-[#E7E9F0] mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative whitespace-nowrap px-6 py-2.5 text-md font-primary transition-colors ${activeTab === tab.key ? 'text-[#0253a5]' : 'text-gray-500 hover:text-[#5B6480]'}`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <motion.div
                                layoutId="scoring-tab-underline"
                                className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#0253a5]"
                                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                            />
                        )}
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                    {activeTab === 'siah' && <ScoringForm title="SIAH Assessment" caption="Assess sincerity, trustworthiness, altruism, and humility." companyValue="SIAH" aspects={SIAH_ASPECTS} scheduleInterviewId={scheduleInterviewId} interviewId={formIdMap['SIAH']} onSuccess={onBack} />}
                    {activeTab === 'values' && <ScoringForm title="7 Values Assessment" caption="Evaluate alignment with company's core values." companyValue="7 Values" aspects={VALUE_ASPECTS} scheduleInterviewId={scheduleInterviewId} interviewId={formIdMap['7 Values']} onSuccess={onBack} />}
                    {activeTab === 'cse' && <ScoringForm title="CSE Assessment" caption="Assess core self-evaluation traits." companyValue="CSE" aspects={CSE_ASPECTS} scheduleInterviewId={scheduleInterviewId} defaultQuestions interviewId={formIdMap['CSE']} onSuccess={onBack} />}
                    {/* {activeTab === 'sdt' && <SDTForm scheduleInterviewId={scheduleInterviewId} interviewId={formIdMap['SDT']} onSuccess={onBack} />} */}
                    {activeTab === 'sdt' && <SDTForm scheduleInterviewId={scheduleInterviewId} interviewId={formIdMap['SDT']} onSuccess={onBack} />}
                    {activeTab === 'experience' && <ScoringForm title="Experience Assessment" caption="Evaluate role fit and contributions." companyValue="EXPERIENCE" aspects={EXPERIENCE_ASPECTS} scheduleInterviewId={scheduleInterviewId} autoQuestion interviewId={formIdMap['EXPERIENCE']} onSuccess={onBack} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

interface ScoringFormProps {
    title: string;
    caption: string;
    companyValue: string;
    aspects: { key: string; label: string; defaultQ?: string }[];
    scheduleInterviewId: string;
    defaultQuestions?: boolean;
    autoQuestion?: boolean;
    interviewId?: string;
    onSuccess?: () => void;
}

const ScoringForm = ({ title, caption, companyValue, aspects, scheduleInterviewId, defaultQuestions, autoQuestion, interviewId, onSuccess }: ScoringFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState<AspectForm>(() =>
        aspects.reduce((acc, a) => ({ ...acc, [a.key]: { point: '', question: a.defaultQ || (autoQuestion ? a.label : ''), remark: '' } }), {})
    );
    const [loadingData, setLoadingData] = useState(false);
    const [isEditing] = useState(interviewId ? true : false);

    // Load existing data if interviewId matches this company_value
    useEffect(() => {
        if (!interviewId) return;
        let cancelled = false;
        setLoadingData(true);
        interviewFormService.getById(interviewId)
            .then((res) => {
                if (cancelled || !res?.data) return;
                const formData = res.data;
                if (formData.company_value !== companyValue) return;
                const loaded: AspectForm = {};
                aspects.forEach((a) => {
                    const match = formData.detail_interviews?.find((d: { aspect: string }) => d.aspect === a.label);
                    loaded[a.key] = {
                        point: match?.score || '',
                        question: match?.question || a.defaultQ || '',
                        remark: match?.answer || '',
                    };
                });
                setForm(loaded);
            })
            .catch(() => toast.error('Failed to load form data'))
            .finally(() => { if (!cancelled) setLoadingData(false); });
        return () => { cancelled = true; };
    }, [interviewId]);

    // const isEditing = interviewId ? true : false;

    const totalScore = aspects.reduce((sum, a) => sum + (parseInt(form[a.key]?.point) || 0), 0);
    const maxScore = aspects.length * 5;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (companyValue === 'SIAH') {
            const isMissingRequired = aspects.some((a) => !form[a.key]?.point || !form[a.key]?.question?.trim());
            if (isMissingRequired) {
                toast.error('Specific point and Question are required for all aspects in SIAH.');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const detailInterviews = aspects.map((a) => ({
                aspect: a.label, question: form[a.key]?.question || a.label, answer: form[a.key]?.remark || '', score: String(form[a.key]?.point || ''),
            }));
            if (isEditing && interviewId) {
                await interviewFormService.update(interviewId, { schedule_interview_id: scheduleInterviewId, company_value: companyValue, comment: 'tidak ada komentar', detail_interviews: detailInterviews });
                toast.success(`${title} updated!`);
            } else {
                await interviewFormService.create({ schedule_interview_id: scheduleInterviewId, company_value: companyValue, comment: 'tidak ada komentar', detail_interviews: detailInterviews });
                toast.success(`${title} submitted!`);
            }
            onSuccess?.();
        } catch (err: unknown) {
            toast.error(`Failed: ${err instanceof Error ? err.message : 'Error'}`);
        } finally { setIsSubmitting(false); }
    };

    if (loadingData) return <p className="text-sm text-gray-500">Loading form data...</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h4 className="text-base font-primary-bold text-[#0253a5]">{title}</h4>
                    <p className="text-sm text-gray-500">{caption}</p>
                </div>
                <div className="inline-flex flex-col items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
                    <div className="text-lg font-primary-bold text-[#1F2430] leading-none">
                        {totalScore}<span className="text-xs font-normal text-gray-500">/{maxScore}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mt-0.5">Total Score</div>
                </div>
            </div>
            <div className="overflow-y-auto mb-0 max-h-[65dvh] md:pb-25 pb-55">
                <HRAccordion
                    allowMultiple
                    defaultOpenFirst
                    items={aspects.map((aspect) => ({
                        id: aspect.key,
                        judul: (
                            <>
                                {aspect.label}
                                {companyValue === 'SIAH' && <span className="text-rose-500 ml-1">*</span>}
                                {form[aspect.key]?.point && (
                                    <span
                                        className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                        style={{
                                            background: (POINT_STYLE[form[aspect.key].point] || INACTIVE_POINT_STYLE).bg,
                                            color: (POINT_STYLE[form[aspect.key].point] || INACTIVE_POINT_STYLE).fg,
                                        }}
                                    >
                                        {form[aspect.key].point}
                                    </span>
                                )}
                            </>
                        ),
                        konten: (
                            <div className="space-y-5">
                                {/* Point Selector — chip-based, single source of truth (no dropdown + readonly duplicate) */}
                                <div>
                                    <Label>
                                        Specific point {companyValue === 'SIAH' && <span className="text-rose-500">*</span>}
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                        {POINT_OPTIONS.filter((o) => o.value).map((opt) => {
                                            const active = form[aspect.key]?.point === opt.value;
                                            const s = active ? (POINT_STYLE[opt.value] || INACTIVE_POINT_STYLE[opt.value]) : INACTIVE_POINT_STYLE[opt.value];
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setForm((prev) => {
                                                        const updated = { ...prev, [aspect.key]: { ...prev[aspect.key], point: opt.value } };
                                                        if (autoQuestion) updated[aspect.key].question = aspect.label;
                                                        return updated;
                                                    })}
                                                    className="px-3 py-1.5 rounded-lg text-sm font-secondary border transition-colors"
                                                    style={{ background: s.bg, color: s.fg, borderColor: s.border }}
                                                >
                                                    {opt.value} · {opt.label.split(' - ')[1]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Row: Question | Remark */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor={form[aspect.key]?.question}>
                                            Question {companyValue === 'SIAH' && <span className="text-rose-500">*</span>}
                                        </Label>
                                        <TextArea
                                            value={form[aspect.key]?.question || ''}
                                            onChange={(e) => setForm((prev) => ({ ...prev, [aspect.key]: { ...prev[aspect.key], question: e.target.value } }))}
                                            rows={5}
                                            placeholder={aspect.defaultQ || 'Question'}
                                            readonly={defaultQuestions || autoQuestion}
                                            className={`${(defaultQuestions || autoQuestion) ? 'border-none resize-none bg-[#e7e7e7] font-primary-bold rounded-lg' : ''}`}
                                        />
                                    </div>
                                    <div>
                                        <Label>Remark / Answer</Label>
                                        <TextArea
                                            value={form[aspect.key]?.remark || ''}
                                            onChange={(e) => setForm((prev) => ({ ...prev, [aspect.key]: { ...prev[aspect.key], remark: e.target.value } }))}
                                            rows={5}
                                            placeholder="Remark"
                                        />
                                    </div>
                                </div>
                            </div>
                        ),
                    }))}
                />
            </div>

            <PermissionGate permission={["create", "update"]}>
                <div className="flex justify-end py-5 px-6 border-t border-gray-200 absolute bottom-0 left-0 right-0 bg-white">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : isEditing ? `Update ${title.replace(' Assessment', '')}` : `Save ${title.replace(' Assessment', '')}`}
                    </Button>
                </div>
            </PermissionGate>
        </form>
    );
};

const SDTForm = ({ scheduleInterviewId, interviewId, onSuccess }: { scheduleInterviewId: string; interviewId?: string; onSuccess?: () => void }) => {
    const [selectedAspect, setSelectedAspect] = useState('');
    const [remark, setRemark] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const currentAspect = SDT_ASPECTS.find((a) => a.key === selectedAspect);
    const pointValue = currentAspect?.point || 0;
    console.log(scheduleInterviewId)
    // Load existing data if editing
    useEffect(() => {
        if (!interviewId) return;
        let cancelled = false;
        setLoadingData(true);
        interviewFormService.getById(interviewId)
            .then((res) => {
                if (cancelled || !res?.data) return;
                const formData = res.data;
                if (formData.company_value !== 'SDT') return;
                if (formData.detail_interviews?.[0]) {
                    const d = formData.detail_interviews[0];
                    const match = SDT_ASPECTS.find((a) => a.label === d.aspect);
                    if (match) setSelectedAspect(match.key);
                    setRemark(d.answer || '');
                }
            })
            .catch(() => toast.error('Failed to load form data'))
            .finally(() => { if (!cancelled) setLoadingData(false); });
        return () => { cancelled = true; };
    }, [interviewId]);

    const isEditing = interviewId ? true : false;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAspect) return;

        setIsSubmitting(true);
        try {
            const payload = {
                schedule_interview_id: scheduleInterviewId,
                company_value: 'SDT',
                comment: 'tidak ada komentar',
                detail_interviews: [{ aspect: currentAspect!.label, question: currentAspect!.label, answer: remark, score: String(pointValue) }],
            };
            if (interviewId && scheduleInterviewId) {
                await interviewFormService.update(interviewId, payload);
                toast.success('SDT form updated!');
            } else {
                await interviewFormService.create(payload);
                toast.success('SDT form submitted!');
            }
            onSuccess?.();
        } catch (err: unknown) { toast.error(`Failed: ${err instanceof Error ? err.message : 'Error'}`); }
        finally { setIsSubmitting(false); }
    };

    if (loadingData) return <p className="text-sm text-gray-500">Loading form data...</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h4 className="text-base font-primary-bold text-[#0253a5]">SDT Assessment</h4>
                <p className="text-sm text-gray-500">Assess motivation and self-determination.</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E7E9F0] p-4 space-y-4">
                <div>
                    <Label>Select SDT Aspect</Label>
                    <CustomSelect
                        value={selectedAspect ? { value: selectedAspect, label: SDT_ASPECTS.find(a => a.key === selectedAspect)?.label || '' } : null}
                        onChange={(opt) => setSelectedAspect(opt?.value || '')}
                        options={SDT_ASPECTS.map((a) => ({ value: a.key, label: a.label }))}
                        placeholder="Choose SDT Aspect..."
                        isSearchable={false}
                        isClearable
                    />
                </div>
                <div><Label>Auto Point</Label><div className="px-3 py-2 bg-[#FAFAFB] border border-[#E7E9F0] rounded-lg text-lg font-bold text-[#1F2430]">{pointValue || '-'}</div></div>
                <div><label>Remark</label>
                    <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} placeholder="Remark" />
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting || !selectedAspect}>
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update SDT' : 'Save SDT'}
                </Button>
            </div>
        </form>
    );
};

export default FormScoringCanvas;
