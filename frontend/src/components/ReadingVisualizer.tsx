import React, { useState } from 'react';
import {
  Line as LineChart,
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
import {
  Activity,
  MapPin,
  Gauge,
  BarChart3,
  LineChartIcon,
  PieChart,
  Maximize2,
  Minimize2,
  Calendar,
  Hash,
  Zap,
  CheckCircle2,
  Info,
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { formatUpdatedAt } from './tables/MachineOverviewTable';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

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
  solution: { parameters: Param[] };
}

interface ReadingVisualizerProps {
  data: ReadingData[];
}

const ReadingVisualizer: React.FC<ReadingVisualizerProps> = ({ data }) => {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">No reading data found to visualize.</p>
      </div>
    );
  }

  const parameters = data[0].solution.parameters;
  const getValues = (key: string) => data.map((d) => d.reading[key]);
  const getLabels = () =>
    data.map((d) => (d.createdAt ? format(new Date(d.createdAt), 'MMM dd, HH:mm') : ''));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'line': return LineChartIcon;
      case 'bar': return BarChart3;
      case 'pie': return PieChart;
      case 'gauge': return Gauge;
      case 'geo': return MapPin;
      case 'badge': return CheckCircle2;
      case 'number': return Hash;
      default: return Activity;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'line': return 'from-blue-500 to-blue-600';
      case 'bar': return 'from-green-500 to-green-600';
      case 'pie': return 'from-purple-500 to-purple-600';
      case 'gauge': return 'from-orange-500 to-orange-600';
      case 'geo': return 'from-teal-500 to-teal-600';
      case 'badge': return 'from-emerald-500 to-emerald-600';
      case 'number': return 'from-indigo-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const generateChartData = (param: Param) => ({
    labels: getLabels(),
    datasets: [{
      label: `${param.label || param.key}${param.unit ? ` (${param.unit})` : ''}`,
      data: getValues(param.key),
      backgroundColor: param.type === 'pie'
        ? ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
        : `${param.color || '#3b82f6'}20`,
      borderColor: param.color || '#3b82f6',
      borderWidth: 2,
      fill: param.type === 'line',
      tension: 0.4,
      pointBackgroundColor: param.color || '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: '#f3f4f6', borderColor: '#e5e7eb' },
      },
      y: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: '#f3f4f6', borderColor: '#e5e7eb' },
      },
    },
  };

  const DataCard = ({ param }: { param: Param }) => {
    const label = param.label || param.key;
    const Icon = getTypeIcon(param.type);
    const colorClass = getTypeColor(param.type);


    // GEO
   if (param.type === "geo") {
  const values = getValues(param.key); // gets either latitudes or longitudes depending on param.key
  const latestValue = values[values.length - 1];

  const latlngs = data
    .map((row) =>
      row.reading.latitude && row.reading.longitude
        ? ([row.reading.latitude, row.reading.longitude] as [number, number])
        : null
    )
    .filter(Boolean) as [number, number][];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          {/* Label (Lat or Lng) */}
          <h4 className="font-semibold text-gray-900">{label}</h4>

          {/* Show only Lat OR Lng value depending on param */}
          <div className="mt-1 text-sm text-gray-700 font-medium">
            {latestValue ?? "-"}
          </div>
        </div>
      </div>

      {latlngs.length ? (
        <MapContainer
          center={latlngs[0]}
          zoom={13}
          style={{ height: "300px", width: "100%", borderRadius: "8px" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={latlngs} color="blue" weight={3} />
          {latlngs.map((pos, i) => (
            <Marker key={i} position={pos}>
              <Popup>
                Point {i + 1} <br />
                {format(new Date(data[i].createdAt), "MMM dd, HH:mm")}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <p className="text-sm text-gray-500">No GPS coordinates available</p>
      )}
    </div>
  );
}


    // BADGE
    if (param.type === 'badge') {
      const latestValue = getValues(param.key).slice(-1)[0];
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{label}</h4>
            <p className="text-lg font-bold">{latestValue}</p>
          </div>
        </div>
      );
    }

    // NUMBER
    if (param.type === 'number') {
      const latestValue = getValues(param.key).slice(-1)[0];
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">{label}</h4>
          </div>
          <div className="text-3xl font-bold">{latestValue}{param.unit ? ` ${param.unit}` : ''}</div>
        </div>
      );
    }

    // GAUGE
    if (param.type === 'gauge') {
      const latestValue = getValues(param.key).slice(-1)[0];
      const percentage = Math.min(Math.max((latestValue / 100) * 100, 0), 100);
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">{label}</h4>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-orange-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="text-sm text-gray-600 mt-1">{latestValue}{param.unit ? ` ${param.unit}` : ''}</div>
        </div>
      );
    }

    // CHARTS (line, bar, pie)
    if (['line', 'bar', 'pie'].includes(param.type)) {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">{label}</h4>
            </div>
            <button onClick={() => setExpandedChart(expandedChart === param.key ? null : param.key)}>
              {expandedChart === param.key ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
          <div className={`transition-all duration-300 ${expandedChart === param.key ? 'h-[300px]' : 'h-[180px]'}`}>
            <LineChart data={generateChartData(param)} options={chartOptions} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8 text-black">
      <div className="flex items-center justify-center gap-6 p-4 bg-gray-50 rounded-xl">
        <Activity className="w-5 h-5 text-blue-500" />
        <span>{parameters.length} Parameters</span>
        <Calendar className="w-5 h-5 text-green-500" />
        <span>{data.length} Readings</span>
        <Zap className="w-5 h-5 text-purple-500" />
        <span>Live Data</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {parameters.map((param) => (
          <DataCard key={param.key} param={param} />
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Info className="w-6 h-6 text-blue-500" />
          Data Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
            <div className="text-2xl font-bold text-gray-900 mb-1">{data.length}</div>
            <div className="text-sm text-gray-600">Total Readings</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
            <div className="text-2xl font-bold text-gray-900 mb-1">{parameters.length}</div>
            <div className="text-sm text-gray-600">Parameters Tracked</div>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatUpdatedAt(data[0].createdAt)}
            </div>
            <div className="text-sm text-gray-600">Last Updated</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingVisualizer;
