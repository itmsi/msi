import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ScoreMetric {
  company_value: string;
  total_score: number;
}

interface BulletChartProps {
  metrics?: ScoreMetric[];
  standardValue?: ScoreMetric[][];
}

const DEFAULT_STANDARDS: ScoreMetric[] = [
  { company_value: 'SIAH', total_score: 40 },
  { company_value: '7 Values', total_score: 60 },
  { company_value: 'SDT', total_score: 40 },
  { company_value: 'CSE', total_score: 40 },
  { company_value: 'EXPERIENCE', total_score: 20 },
];

const BulletChart = ({ metrics = [], standardValue = [DEFAULT_STANDARDS] }: BulletChartProps) => {
  const companyValues = metrics.map((m) => m.company_value);
  const actualScores = metrics.map((m) => m.total_score);

  const standardScores = companyValues.map((cv) => {
    const found = (standardValue[0] || []).find((item) => item.company_value === cv);
    return found ? found.total_score : 0;
  });

  const chartData = {
    labels: companyValues,
    datasets: [
      {
        label: 'Target Range',
        data: standardScores,
        backgroundColor: 'rgba(206, 212, 218, 0.8)',
        borderColor: 'rgba(173, 181, 189, 1)',
        borderWidth: 1,
        order: 2,
      },
      {
        label: 'Actual Performance',
        data: actualScores,
        backgroundColor: actualScores.map((score, i) => {
          const std = standardScores[i];
          if (std === 0) return 'rgba(40, 167, 69, 0.9)';
          if (score >= std * 0.9) return 'rgba(40, 167, 69, 0.9)'; // Green
          if (score >= std * 0.7) return 'rgba(255, 193, 7, 0.9)'; // Yellow
          return 'rgba(220, 53, 69, 0.9)'; // Red
        }),
        borderWidth: 0,
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label;
            const value = context.parsed.y;
            if (label === 'Actual Performance') {
              const std = standardScores[context.dataIndex];
              const pct = std > 0 ? Math.round((value / std) * 100) : 0;
              return `${label}: ${value} (${pct}% of target)`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: { stacked: false },
      y: {
        stacked: false,
        beginAtZero: true,
        title: { display: true, text: 'Score' },
      },
    },
  };

  return (
    <div className="w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BulletChart;
