import InterviewScoreChart from './InterviewScoreChart';
import Button from '@/components/ui/button/Button';

interface ScoreMetric {
  company_value: string;
  total_score: number;
}

interface ModalScoreInterviewProps {
  show: boolean;
  onClose: () => void;
  scoreData?: ScoreMetric[];
}

const ModalScoreInterview = ({ show, onClose, scoreData }: ModalScoreInterviewProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto p-1 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <Button variant="transparent" onClick={onClose} className="text-gray-400! text-xl p-2">&times;</Button>
        </div>
        <InterviewScoreChart metrics={scoreData} />
      </div>
    </div>
  );
};

export default ModalScoreInterview;
