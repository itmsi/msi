import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ScoreMetric {
  company_value: string;
  total_score: number;
}

interface InterviewScoreChartProps {
  metrics?: ScoreMetric[];
}

const STANDARD_VALUES: ScoreMetric[] = [
  { company_value: 'SIAH', total_score: 20 },
  { company_value: '7 Values', total_score: 35 },
  { company_value: 'SDT', total_score: 40 },
  { company_value: 'CSE', total_score: 20 },
  { company_value: 'EXPERIENCE', total_score: 20 },
];

const DESIRED_ORDER = ['SIAH', '7 Values', 'CSE', 'SDT', 'EXPERIENCE'];

const getMultipliedScore = (_companyValue: string, score: number): number => {
  return score;
};

const getEvaluation = (total: number): { remark: string; recommendation: string } => {
  if (total <= 14) return { remark: 'Very Poor', recommendation: 'Reject' };
  if (total <= 27) return { remark: 'Poor', recommendation: 'Reject' };
  if (total <= 41) return { remark: 'Average', recommendation: 'Consideration - need comparison' };
  if (total <= 54) return { remark: 'Good', recommendation: 'Next Process To be Hired' };
  return { remark: 'Excellent', recommendation: 'Next Process To be Hired' };
};

const InterviewScoreChart = ({ metrics = [] }: InterviewScoreChartProps) => {
  const validMetrics = Array.isArray(metrics)
    ? metrics.filter(
        (m) => m && typeof m.total_score === 'number' && m.company_value
      )
    : [];

  const isValid = validMetrics.length >= 1;

  if (!isValid) {
    return (
      <div className="p-4 border rounded bg-white shadow-sm m-2 text-center">
        <h5 className="mb-3 font-semibold">Interview Scoring</h5>
        <p className="text-gray-500">No scoring data available or insufficient data to display chart</p>
      </div>
    );
  }

  const sortedMetrics = [...validMetrics].sort((a, b) => {
    const iA = DESIRED_ORDER.indexOf(a.company_value);
    const iB = DESIRED_ORDER.indexOf(b.company_value);
    return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
  });

  const companyValues = sortedMetrics.map((m) => m.company_value);
  const actualScores = sortedMetrics.map((m) =>
    getMultipliedScore(m.company_value, m.total_score)
  );
  const standardScores = companyValues.map((cv) => {
    const found = STANDARD_VALUES.find((s) => s.company_value === cv);
    return found ? found.total_score : 0;
  });

  const total = sortedMetrics.reduce(
    (sum, m) => sum + getMultipliedScore(m.company_value, m.total_score),
    0
  );
  const { remark, recommendation } = getEvaluation(total);

  const chartData = {
    labels: companyValues,
    datasets: [
      {
        label: 'Standard Target',
        data: standardScores,
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
      },
      {
        label: 'Actual Score',
        data: actualScores,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderWidth: 3,
        pointBackgroundColor: actualScores.map((score, i) =>
          score >= standardScores[i]
            ? 'rgba(40, 167, 69, 1)'
            : 'rgba(220, 53, 69, 1)'
        ),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        mode: 'point' as const,
        intersect: false,
        callbacks: {
          beforeBody: function (tooltipItems: any[]) {
            if (tooltipItems.length > 0) {
              return [`Company Value: ${tooltipItems[0].label}`];
            }
            return [];
          },
          label: function (context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.r;
            const cv = context.label;
            if (datasetLabel === 'Standard Target') return `${datasetLabel}: ${value}`;
            if (datasetLabel === 'Actual Score') {
              const si = companyValues.indexOf(cv);
              const std = standardScores[si];
              const pct = std === 0 ? 100 : Math.round((value / std) * 100);
              const status = std === 0 ? '✓ No Target Required' : value >= std ? '✓ Above Target' : '✗ Below Target';
              return `${datasetLabel}: ${value} (${pct}% - ${status})`;
            }
            return `${datasetLabel}: ${value}`;
          },
          afterBody: function (tooltipItems: any[]) {
            if (tooltipItems.length > 0) {
              const cv = tooltipItems[0].label;
              const si = companyValues.indexOf(cv);
              const actual = actualScores[si];
              const std = standardScores[si];
              if (std > 0) {
                const pct = Math.round((actual / std) * 100);
                const gap = actual - std;
                return [``, `Performance Gap: ${gap >= 0 ? '+' : ''}${gap} points`, `Achievement: ${pct}% of target`];
              }
              return [``, `No target set for this metric`];
            }
            return [];
          },
        },
      },
    },
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: { font: { size: 12, weight: 'bold' as const } },
        ticks: {
          beginAtZero: true,
          stepSize: 10,
          font: { size: 10 },
          backdropColor: 'rgba(255, 255, 255, 0.8)',
        },
        suggestedMin: 0,
        suggestedMax: Math.max(...standardScores, ...actualScores) + 10,
      },
    },
  };

  return (
    <div className="p-4 border rounded bg-white shadow-sm m-2">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart */}
        <div className="w-full lg:w-2/3" style={{ height: '400px' }}>
          <Radar data={chartData} options={options} />
        </div>

        {/* Score Summary */}
        <div className="w-full lg:w-1/3 text-center">
          <div className="mb-4">
            <div className="text-5xl font-bold text-[#0253a5]">{total}</div>
            <div className="text-2xl text-gray-600 mt-1">{remark}</div>
          </div>
          <div className="mb-4">
            <span className="text-gray-400 text-sm">Recommendation</span>
            <h5 className="text-base font-semibold text-gray-800">{recommendation}</h5>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6">
        <h6 className="text-sm font-semibold text-center mb-3">Performance Summary</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {companyValues.map((value, i) => {
            const actual = actualScores[i];
            const std = standardScores[i];
            const pct = std === 0 ? 100 : Math.round((actual / std) * 100);
            const achieved = std === 0 ? true : actual >= std;

            return (
              <div key={value} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-800">{value}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      achieved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {std === 0 ? 'No Target' : achieved ? 'Achieved' : 'Not Achieved'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-600 mb-2">
                  <div className="flex justify-between">
                    <span>Actual Score:</span>
                    <span className="font-bold">{actual}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Target:</span>
                    <span>{std === 0 ? 'No Target' : std}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Percentage:</span>
                    <span className="font-bold text-[#0253a5]">{pct}%</span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${achieved ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InterviewScoreChart;
