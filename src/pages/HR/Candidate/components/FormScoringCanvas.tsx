import { useState, useEffect } from 'react';
import { interviewFormService } from '../services/interviewService';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
import HRAccordion from './HRAccordion';

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
  { key: 'locus_control', label: 'Locus of Control', defaultQ: 'Does this person believe their success is determined by their own actions or external factors?' },
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
  { key: 'goals_align', label: 'Goals align with ROE Company' },
];

type FormType = 'siah' | 'values' | 'cse' | 'sdt' | 'experience';
type AspectForm = Record<string, { point: string; question: string; remark: string }>;

interface FormScoringCanvasProps {
  candidateId: string;
  scheduleId?: string | null;
  editingFormId?: string;
  onBack: () => void;
}

const FormScoringCanvas = ({ candidateId, scheduleId, editingFormId }: FormScoringCanvasProps) => {
  const scheduleInterviewId = scheduleId || candidateId;
  const [formIdMap, setFormIdMap] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<FormType>('siah');

  // Load all existing interviews for this schedule → map company_value → interview_id
  useEffect(() => {
    if (!scheduleInterviewId) return;
    interviewFormService.getList({ schedule_interview_id: scheduleInterviewId })
      .then((res) => {
        const map: Record<string, string> = {};
        (res.data || []).forEach((f) => {
          map[f.company_value] = f.interview_id;
        });
        setFormIdMap(map);
        // If editingFormId provided, find its company_value and set that tab
        if (editingFormId) {
          const match = (res.data || []).find((f) => f.interview_id === editingFormId);
          if (match) {
            const key = match.company_value === '7 Values' ? 'values'
              : match.company_value === 'SIAH' ? 'siah'
                : match.company_value === 'CSE' ? 'cse'
                  : match.company_value === 'SDT' ? 'sdt'
                    : match.company_value === 'EXPERIENCE' ? 'experience'
                      : 'siah';
            setActiveTab(key);
          }
        }
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
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <Button key={tab.key} onClick={() => setActiveTab(tab.key)} variant="transparent"
            className={`whitespace-nowrap border-b-2 rounded-none! ${activeTab === tab.key ? 'border-[#0253a5] text-[#0253a5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'siah' && <ScoringForm title="SIAH Assessment" caption="Assess sincerity, trustworthiness, altruism, and humility." companyValue="SIAH" aspects={SIAH_ASPECTS} scheduleInterviewId={scheduleInterviewId} interviewId={formIdMap['SIAH']} />}
      {activeTab === 'values' && <ScoringForm title="7 Values Assessment" caption="Evaluate alignment with company's core values." companyValue="7 Values" aspects={VALUE_ASPECTS} scheduleInterviewId={scheduleInterviewId} interviewId={formIdMap['7 Values']} />}
      {activeTab === 'cse' && <ScoringForm title="CSE Assessment" caption="Assess core self-evaluation traits." companyValue="CSE" aspects={CSE_ASPECTS} scheduleInterviewId={scheduleInterviewId} defaultQuestions interviewId={formIdMap['CSE']} />}
      {activeTab === 'sdt' && <SDTForm scheduleInterviewId={scheduleInterviewId} interviewId={formIdMap['SDT']} />}
      {activeTab === 'experience' && <ScoringForm title="Experience Assessment" caption="Evaluate role fit and contributions." companyValue="EXPERIENCE" aspects={EXPERIENCE_ASPECTS} scheduleInterviewId={scheduleInterviewId} autoQuestion interviewId={formIdMap['EXPERIENCE']} />}
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
}

const ScoringForm = ({ title, caption, companyValue, aspects, scheduleInterviewId, defaultQuestions, autoQuestion, interviewId }: ScoringFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<AspectForm>(() =>
    aspects.reduce((acc, a) => ({ ...acc, [a.key]: { point: '', question: a.defaultQ || '', remark: '' } }), {})
  );
  const [loadingData, setLoadingData] = useState(false);

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

  const isEditing = interviewId ? true : false;

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
    } catch (err: unknown) {
      toast.error(`Failed: ${err instanceof Error ? err.message : 'Error'}`);
    } finally { setIsSubmitting(false); }
  };

  if (loadingData) return <p className="text-sm text-gray-400">Loading form data...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><h4 className="text-base font-bold text-[#0253a5]">{title}</h4><p className="text-sm text-gray-500 mb-3">{caption}</p></div>
      <div className="text-sm text-gray-600 mb-2">Total: <span className="font-semibold">{totalScore}</span> / {maxScore}</div>
      <div className="space-y-4">
        <HRAccordion
          allowMultiple
          items={aspects.map((aspect) => ({
            id: aspect.key,
            judul: (
              <>
                {aspect.label}
                {companyValue === 'SIAH' && <span className="text-red-500 ml-1">*</span>}
              </>
            ),
            konten: (
              <div className="space-y-3">
                {/* Point Selector - full width */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Specific point {companyValue === 'SIAH' && <span className="text-red-500">*</span>}
                  </label>
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
                </div>
                {/* Row: Point (readonly) | Question | Remark */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Point</label>
                    <div className="h-16 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                      {form[aspect.key]?.point || '-'}
                    </div>
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Question {companyValue === 'SIAH' && <span className="text-red-500">*</span>}
                    </label>
                    <TextArea value={form[aspect.key]?.question || ''} onChange={(e) => setForm((prev) => ({ ...prev, [aspect.key]: { ...prev[aspect.key], question: e.target.value } }))}
                      rows={2} placeholder={aspect.defaultQ || 'Question'} readonly={defaultQuestions} />
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Remark / Answer</label>
                    <TextArea value={form[aspect.key]?.remark || ''} onChange={(e) => setForm((prev) => ({ ...prev, [aspect.key]: { ...prev[aspect.key], remark: e.target.value } }))}
                      rows={2} placeholder="Remark" />
                  </div>
                </div>
              </div>
            ),
          }))}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? `Update ${title.replace(' Assessment', '')}` : `Save ${title.replace(' Assessment', '')}`}
        </Button>
      </div>
    </form>
  );
};

const SDTForm = ({ scheduleInterviewId, interviewId }: { scheduleInterviewId: string; interviewId?: string }) => {
  const [selectedAspect, setSelectedAspect] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const currentAspect = SDT_ASPECTS.find((a) => a.key === selectedAspect);
  const pointValue = currentAspect?.point || 0;

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
      if (isEditing && interviewId) {
        await interviewFormService.update(interviewId, payload);
        toast.success('SDT form updated!');
      } else {
        await interviewFormService.create(payload);
        toast.success('SDT form submitted!');
      }
    } catch (err: unknown) { toast.error(`Failed: ${err instanceof Error ? err.message : 'Error'}`); }
    finally { setIsSubmitting(false); }
  };

  if (loadingData) return <p className="text-sm text-gray-400">Loading form data...</p>;

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
          {isSubmitting ? 'Saving...' : isEditing ? 'Update SDT' : 'Save SDT'}
        </Button>
      </div>
    </form>
  );
};

export default FormScoringCanvas;
