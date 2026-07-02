import { useState } from 'react';
import { interviewFormService } from '../services/interviewService';
import { getBadgeVariant } from '../utils/utils';
import { toast } from 'react-hot-toast';
import { FaRegPenToSquare, FaChartSimple, FaRegFilePdf } from 'react-icons/fa6';
import { RxPencil2 } from 'react-icons/rx';
import ModalScoreInterview from './ModalScoreInterview';
import { usePDFDownload } from '../hooks/usePDFDownload';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
import HRAccordion from './HRAccordion';

interface FormInterviewTabProps {
  candidateId: string;
}

// ============================================================
// Configuration
// ============================================================

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

interface SubmittedForm {
  id: number;
  name: string;
  role: string;
  date_created: string;
  status: string;
}

// ============================================================
// Main Component
// ============================================================

const FormInterviewTab = ({ candidateId }: FormInterviewTabProps) => {
  const [showCanvas, setShowCanvas] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  const { downloadPDF, isGenerating } = usePDFDownload();

  // Mock data — will be replaced with API call
  const [submittedForms] = useState<SubmittedForm[]>([
    { id: 1, name: 'Admin', role: 'HR', date_created: '12 Jun 2025', status: 'save' },
    { id: 2, name: 'Admin', role: 'HR', date_created: '13 Jun 2025', status: 'submit' },
    { id: 3, name: 'Admin', role: 'HR', date_created: '14 Jun 2025', status: 'submit' },
  ]);

  // Demo score data for chart
  const scoreData = [
    { company_value: 'SIAH', total_score: 18 },
    { company_value: '7 Values', total_score: 27 },
    { company_value: 'CSE', total_score: 16 },
    { company_value: 'SDT', total_score: 30 },
    { company_value: 'EXPERIENCE', total_score: 8 },
  ];

  if (submittedForms.length === 0 && !showCanvas) {
    return (
      <div className="flex justify-center items-center py-12">
        <Button onClick={() => setShowCanvas(true)} startIcon={<RxPencil2 className="w-4 h-4" />}>
          Create Question
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Show form list or scoring canvas */}
      {showCanvas ? (
        <FormScoringCanvas
          candidateId={candidateId}
          editingFormId={editingFormId}
          onBack={() => { setShowCanvas(false); setEditingFormId(null); }}
        />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowCanvas(true)} startIcon={<RxPencil2 className="w-4 h-4" />}>
              Create Question
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date Created</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submittedForms.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{f.name}</td>
                    <td className="px-4 py-3 text-gray-500">{f.role}</td>
                    <td className="px-4 py-3">{f.date_created}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          getBadgeVariant(f.status) === 'success'
                            ? 'bg-green-100 text-green-700'
                            : getBadgeVariant(f.status) === 'primary'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="transparent" onClick={() => { setEditingFormId(f.id); setShowCanvas(true); }} className="text-[#0253a5]!">
                          <FaRegPenToSquare className="w-4 h-4" />
                        </Button>
                        {f.status === 'submit' && (
                          <>
                            <Button size="sm" variant="transparent" onClick={() => setShowScore(true)} className="text-green-600!">
                              <FaChartSimple className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="transparent" onClick={() => downloadPDF({ data_candidate: {}, interview: [] })} disabled={isGenerating} className="text-red-500!">
                              <FaRegFilePdf className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Score Modal */}
      <ModalScoreInterview
        show={showScore}
        onClose={() => setShowScore(false)}
        scoreData={scoreData}
      />
    </div>
  );
};

// ============================================================
// Form Scoring Canvas (replaces the old CanvasFormInterview)
// ============================================================

interface FormScoringCanvasProps {
  candidateId: string;
  editingFormId?: number | null;
  onBack: () => void;
}

const FormScoringCanvas = ({ candidateId, editingFormId, onBack }: FormScoringCanvasProps) => {
  const [activeTab, setActiveTab] = useState<FormType>('siah');
  const isEditMode = !!editingFormId;

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
        <div className="flex items-center gap-2">
          <Button variant="transparent" onClick={onBack}>
            &larr; Back to list
          </Button>
          {isEditMode && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
              Edit Mode
            </span>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            variant="transparent"
            className={`whitespace-nowrap border-b-2 rounded-none! ${
              activeTab === tab.key
                ? 'border-[#0253a5] text-[#0253a5]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'siah' && (
        <ScoringForm
          title="SIAH Assessment"
          caption="Assess sincerity, trustworthiness, altruism, and humility."
          companyValue="SIAH"
          aspects={SIAH_ASPECTS}
          candidateId={candidateId}
        />
      )}
      {activeTab === 'values' && (
        <ScoringForm
          title="7 Values Assessment"
          caption="Evaluate alignment with company's core values."
          companyValue="7 Values"
          aspects={VALUE_ASPECTS}
          candidateId={candidateId}
        />
      )}
      {activeTab === 'cse' && (
        <ScoringForm
          title="CSE Assessment"
          caption="Assess core self-evaluation traits."
          companyValue="CSE"
          aspects={CSE_ASPECTS}
          candidateId={candidateId}
          defaultQuestions
        />
      )}
      {activeTab === 'sdt' && <SDTForm candidateId={candidateId} />}
      {activeTab === 'experience' && (
        <ScoringForm
          title="Experience Assessment"
          caption="Evaluate role fit and contributions."
          companyValue="EXPERIENCE"
          aspects={EXPERIENCE_ASPECTS}
          candidateId={candidateId}
          autoQuestion
        />
      )}
    </div>
  );
};

// ============================================================
// Standard Scoring Form (SIAH, 7 Values, CSE, Experience)
// ============================================================

interface ScoringFormProps {
  title: string;
  caption: string;
  companyValue: string;
  aspects: { key: string; label: string; defaultQ?: string }[];
  candidateId: string;
  defaultQuestions?: boolean;
  autoQuestion?: boolean;
}

const ScoringForm = ({
  title,
  caption,
  companyValue,
  aspects,
  candidateId,
  defaultQuestions,
  autoQuestion,
}: ScoringFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<AspectForm>(() =>
    aspects.reduce(
      (acc, a) => ({
        ...acc,
        [a.key]: { point: '', question: a.defaultQ || '', remark: '' },
      }),
      {}
    )
  );

  const totalScore = aspects.reduce((sum, a) => sum + (parseInt(form[a.key]?.point) || 0), 0);
  const maxScore = aspects.length * 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const detailInterviews = aspects.map((a) => ({
        aspect: a.label,
        question: form[a.key]?.question || a.label,
        answer: form[a.key]?.remark || '',
        score: String(form[a.key]?.point || ''),
      }));

      await interviewFormService.create({
        schedule_interview_id: candidateId,
        company_value: companyValue,
        comment: 'tidak ada komentar',
        detail_interviews: detailInterviews,
      });

      toast.success(`${title} submitted!`);
    } catch (err: unknown) {
      toast.error(`Failed: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h4 className="text-base font-bold text-[#0253a5]">{title}</h4>
        <p className="text-sm text-gray-500 mb-3">{caption}</p>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        Total: <span className="font-semibold">{totalScore}</span> / {maxScore}
      </div>

      <div className="space-y-4">
        <HRAccordion
          allowMultiple
          items={aspects.map((aspect) => ({
            id: aspect.key,
            judul: aspect.label,
            konten: (
              <div className="space-y-3">
                {/* Point Selector - full width */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Specific point</label>
                  <CustomSelect
                    value={form[aspect.key]?.point ? { value: form[aspect.key].point, label: POINT_OPTIONS.find(o => o.value === form[aspect.key].point)?.label || form[aspect.key].point } : null}
                    onChange={(opt) =>
                      setForm((prev) => {
                        const pointVal = opt?.value || '';
                        const updated = { ...prev, [aspect.key]: { ...prev[aspect.key], point: pointVal } };
                        if (autoQuestion && pointVal) {
                          updated[aspect.key].question = aspect.label;
                        }
                        return updated;
                      })
                    }
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
                    <div className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                      {form[aspect.key]?.point || '-'}
                    </div>
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                    <TextArea
                      value={form[aspect.key]?.question || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [aspect.key]: { ...prev[aspect.key], question: e.target.value },
                        }))
                      }
                      rows={2}
                      placeholder={aspect.defaultQ || 'Question'}
                      readonly={defaultQuestions}
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Remark / Answer</label>
                    <TextArea
                      value={form[aspect.key]?.remark || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [aspect.key]: { ...prev[aspect.key], remark: e.target.value },
                        }))
                      }
                      rows={2}
                      placeholder="Remark"
                    />
                  </div>
                </div>
              </div>
            ),
          }))}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : `Save ${title.split(' ')[0]}`}
        </Button>
      </div>
    </form>
  );
};

// ============================================================
// SDT Special Form (dropdown-based with auto points)
// ============================================================

const SDTForm = ({ candidateId }: { candidateId: string }) => {
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
      await interviewFormService.create({
        schedule_interview_id: candidateId,
        company_value: 'SDT',
        comment: 'tidak ada komentar',
        detail_interviews: [
          {
            aspect: currentAspect!.label,
            question: currentAspect!.label,
            answer: remark,
            score: String(pointValue),
          },
        ],
      });
      toast.success('SDT form submitted!');
    } catch (err: unknown) {
      toast.error(`Failed: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h4 className="text-base font-bold text-[#0253a5]">SDT Assessment</h4>
        <p className="text-sm text-gray-500 mb-3">Assess motivation and self-determination.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        {/* Aspect Dropdown */}
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

        {/* Point Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Auto Point</label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-lg font-bold text-gray-700">
            {pointValue || '-'}
          </div>
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
          <TextArea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            placeholder="Remark"
          />
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

export default FormInterviewTab;
