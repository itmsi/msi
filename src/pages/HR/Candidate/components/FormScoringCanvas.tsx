import { useState } from 'react';
import { interviewFormService } from '../services/interviewService';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';

const POINT_OPTIONS = [
  { value: '', label: 'Select point' },
  { value: '5', label: '5 - Excellent' },
  { value: '4', label: '4 - Good' },
  { value: '3', label: '3 - Average' },
  { value: '2', label: '2 - Poor' },
  { value: '1', label: '1 - Very Poor' },
];

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
  { key: 'locus_control', label: 'Locus of Control', defaultQ: 'Is their success determined by own actions or external factors?' },
  { key: 'emotional_stability', label: 'Emotional Stability', defaultQ: 'Can this person control their emotions?' },
];

const SDT_ASPECTS = [
  { key: 'l2', label: 'L2 (External Regulation)', point: 20 },
  { key: 'l3', label: 'L3 (Self-Involvement)', point: 25 },
  { key: 'l4', label: 'L4 (Conscious Meaning)', point: 30 },
  { key: 'l5', label: 'L5 (Self-Integration)', point: 35 },
  { key: 'l6', label: 'L6 (Intrinsic Motivation)', point: 40 },
];

const EXPERIENCE_ASPECTS = [
  { key: 'role_matching', label: 'Role Matching' },
  { key: 'product_knowledge', label: 'Product Knowledge' },
  { key: 'significant_contribution', label: 'Significant Contribution' },
  { key: 'goals_align', label: 'Goals align with ROE' },
];

type FormType = 'siah' | 'values' | 'cse' | 'sdt' | 'experience';
type AspectForm = Record<string, { point: string; question: string; remark: string }>;

interface FormScoringCanvasProps {
  candidateId: string;
  scheduleId?: string | null;
  onBack: () => void;
}

const FormScoringCanvas = ({ candidateId, scheduleId, onBack }: FormScoringCanvasProps) => {
  const [activeTab, setActiveTab] = useState<FormType>('cse');
  const scheduleInterviewId = scheduleId || candidateId;

  const tabs: { key: FormType; label: string }[] = [
    { key: 'siah', label: 'SIAH' },
    { key: 'values', label: '7 Values' },
    { key: 'cse', label: 'CSE' },
    { key: 'sdt', label: 'SDT' },
    { key: 'experience', label: 'Experience' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="transparent" onClick={onBack}>&larr; Back to list</Button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <Button key={tab.key} onClick={() => setActiveTab(tab.key)} variant="transparent"
            className={`whitespace-nowrap border-b-2 rounded-none! ${activeTab === tab.key ? 'border-[#0253a5] text-[#0253a5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'siah' && <ScoringForm title="SIAH Assessment" caption="Assess sincerity, trustworthiness, altruism, and humility." companyValue="SIAH" aspects={SIAH_ASPECTS} scheduleInterviewId={scheduleInterviewId} />}
      {activeTab === 'values' && <ScoringForm title="7 Values Assessment" caption="Evaluate alignment with company's core values." companyValue="7 Values" aspects={VALUE_ASPECTS} scheduleInterviewId={scheduleInterviewId} />}
      {activeTab === 'cse' && <ScoringForm title="CSE Assessment" caption="Assess core self-evaluation traits." companyValue="CSE" aspects={CSE_ASPECTS} scheduleInterviewId={scheduleInterviewId} defaultQuestions />}
      {activeTab === 'sdt' && <SDTForm scheduleInterviewId={scheduleInterviewId} />}
      {activeTab === 'experience' && <ScoringForm title="Experience Assessment" caption="Evaluate role fit and contributions." companyValue="EXPERIENCE" aspects={EXPERIENCE_ASPECTS} scheduleInterviewId={scheduleInterviewId} autoQuestion />}
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
}

const ScoringForm = ({ title, caption, companyValue, aspects, scheduleInterviewId, defaultQuestions, autoQuestion }: ScoringFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<AspectForm>(() =>
    aspects.reduce((acc, a) => ({ ...acc, [a.key]: { point: '', question: a.defaultQ || '', remark: '' } }), {})
  );

  const totalScore = aspects.reduce((sum, a) => sum + (parseInt(form[a.key]?.point) || 0), 0);
  const maxScore = aspects.length * 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const detailInterviews = aspects.map((a) => ({
        aspect: a.label, question: form[a.key]?.question || a.label, answer: form[a.key]?.remark || '', score: parseInt(form[a.key]?.point) || 0,
      }));
      await interviewFormService.submit({ schedule_interview_id: scheduleInterviewId, interviews: [{ company_value: companyValue, comment: 'tidak ada komentar', detail_interviews: detailInterviews }] });
      toast.success(`${title} submitted!`);
    } catch (err: unknown) {
      toast.error(`Failed: ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><h4 className="text-base font-bold text-[#0253a5]">{title}</h4><p className="text-sm text-gray-500 mb-3">{caption}</p></div>
      <div className="text-sm text-gray-600 mb-2">Total: <span className="font-semibold">{totalScore}</span> / {maxScore}</div>
      <div className="space-y-4">
        {aspects.map((aspect) => (
          <div key={aspect.key} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Score</label>
                <CustomSelect
                  value={form[aspect.key]?.point ? { value: form[aspect.key].point, label: POINT_OPTIONS.find(o => o.value === form[aspect.key].point)?.label || form[aspect.key].point } : null}
                  onChange={(opt) => setForm((prev) => {
                    const pointVal = opt?.value || '';
                    const updated = { ...prev, [aspect.key]: { ...prev[aspect.key], point: pointVal } };
                    if (autoQuestion && pointVal) updated[aspect.key].question = aspect.label;
                    return updated;
                  })}
                  options={POINT_OPTIONS.filter(o => o.value !== '')}
                  placeholder="Select point"
                  isSearchable={false}
                  isClearable
                />
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-gray-500 mb-1">{aspect.label}</label>
                <TextArea value={form[aspect.key]?.question || ''} onChange={(e) => setForm((prev) => ({ ...prev, [aspect.key]: { ...prev[aspect.key], question: e.target.value } }))}
                  rows={2} placeholder={aspect.defaultQ || 'Question'} readonly={defaultQuestions} />
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-gray-500 mb-1">Remark / Answer</label>
                <TextArea value={form[aspect.key]?.remark || ''} onChange={(e) => setForm((prev) => ({ ...prev, [aspect.key]: { ...prev[aspect.key], remark: e.target.value } }))}
                  rows={2} placeholder="Remark" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : `Save ${title.split(' ')[0]}`}
        </Button>
      </div>
    </form>
  );
};

const SDTForm = ({ scheduleInterviewId }: { scheduleInterviewId: string }) => {
  const [selectedAspect, setSelectedAspect] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentAspect = SDT_ASPECTS.find((a) => a.key === selectedAspect);
  const pointValue = currentAspect?.point || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAspect) return;
    setIsSubmitting(true);
    try {
      await interviewFormService.submit({
        schedule_interview_id: scheduleInterviewId,
        interviews: [{ company_value: 'SDT', comment: 'tidak ada komentar', detail_interviews: [{ aspect: currentAspect!.label, question: currentAspect!.label, answer: remark, score: pointValue }] }],
      });
      toast.success('SDT form submitted!');
    } catch (err: unknown) { toast.error(`Failed: ${err instanceof Error ? err.message : 'Error'}`); }
    finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><h4 className="text-base font-bold text-[#0253a5]">SDT Assessment</h4><p className="text-sm text-gray-500 mb-3">Assess motivation and self-determination.</p></div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select SDT Aspect</label>
          <CustomSelect
            value={selectedAspect ? { value: selectedAspect, label: SDT_ASPECTS.find(a => a.key === selectedAspect)?.label || '' } : null}
            onChange={(opt) => setSelectedAspect(opt?.value || '')}
            options={SDT_ASPECTS.map((a) => ({ value: a.key, label: a.label }))}
            placeholder="Choose SDT Aspect..."
            isSearchable={false}
            isClearable
          />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Auto Point</label><div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-lg font-bold text-gray-700">{pointValue || '-'}</div></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
          <TextArea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} placeholder="Remark" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting || !selectedAspect}>
          {isSubmitting ? 'Saving...' : 'Save SDT'}
        </Button>
      </div>
    </form>
  );
};

export default FormScoringCanvas;
