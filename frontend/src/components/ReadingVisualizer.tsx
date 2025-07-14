import React from 'react';
import {
  Line as LineChart,
  Bar as BarChart,
  Pie,
  
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Param {
  key: string;
  label?: string;
  unit?: string;
  type: string;
  color?: string;
}

interface ReadingData {
  reading: Record<string, any>;
  createdAt: string;
  solution: {
    parameters: Param[];
  };
}

interface ReadingVisualizerProps {
  data: ReadingData[];
}

const ReadingVisualizer: React.FC<ReadingVisualizerProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const parameters = data[0].solution.parameters;

  const getValues = (key: string) => data.map(d => d.reading[key]);

  const getLabels = () =>
    data.map((d) =>
      d.createdAt ? format(new Date(d.createdAt), 'yyyy-MM-dd HH:mm') : ''
    );

  const generateChartData = (param: Param) => {
    const values = getValues(param.key);
    const labels = getLabels();
    const color = param.color || '#4b5563';

    return {
      labels,
      datasets: [
        {
          label: `${param.label || param.key}${param.unit ? ` (${param.unit})` : ''}`,
          data: values,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
      {parameters.map((param) => {
        const values = getValues(param.key);
        const label = param.label || param.key;
        const unit = param.unit || '';

        if (param.type === 'geo') {
          return (
            <div key={param.key} className="p-4 border border-slate-300 rounded-xl">
              <h4 className="mb-1 font-semibold capitalize">{label}</h4>
              <ul className="text-gray-700 text-lg">
                {values.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (param.type === 'badge') {
          const latest = values[values.length - 1];
          return (
            <div key={param.key} className="p-4 border border-slate-300 rounded-xl">
              <h4 className="mb-1 font-semibold">{label}</h4>
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                {latest}
              </span>
            </div>
          );
        }

        if (param.type === 'gauge' || param.type === 'number') {
          const latest = values[values.length - 1];
          return (
            <div key={param.key} className="p-4 border border-slate-300 rounded-xl">
              <h4 className="mb-1 font-semibold">{label}</h4>
              <div className="text-black text-3xl font-bold">
                {latest} {unit}
              </div>
            </div>
          );
        }

        if (param.type === 'line') {
          return (
            <div key={param.key} className="p-4 border border-slate-300 rounded-xl">
              <h4 className="mb-2 font-semibold">{label} (Line)</h4>
              <LineChart data={generateChartData(param)} />
            </div>
          );
        }

        if (param.type === 'bar') {
          return (
            <div key={param.key} className="p-4 border border-slate-300 rounded-xl">
              <h4 className="mb-2 font-semibold">{label} (Bar)</h4>
              <BarChart data={generateChartData(param)} />
            </div>
          );
        }

        if (param.type === 'pie') {
          return (
            <div key={param.key} className="p-4 border border-slate-300 rounded-xl">
              <h4 className="mb-2 font-semibold">{label} (Pie)</h4>
              <Pie data={generateChartData(param)} />
            </div>
          );
        }

        const latest = values[values.length - 1];
        return (
          <div key={param.key} className="p-4 border border-slate-300 rounded-xl">
            <h4 className="mb-1 font-semibold">{label}</h4>
            <div className="text-gray-700 text-base">{latest}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ReadingVisualizer;
