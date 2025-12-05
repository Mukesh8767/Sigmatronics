/* CLEAN + MOBILE OPTIMIZED VISUALIZER */

import React, { useState } from "react";
import { Line as LineChart } from "react-chartjs-2";
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
} from "chart.js";

import { format } from "date-fns";
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
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { formatUpdatedAt } from "./tables/MachineOverviewTable";

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

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

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
      <div className="bg-white border rounded-2xl p-10 text-center shadow-sm">
        <Activity className="w-8 h-8 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-700 font-medium">No Data Available</p>
      </div>
    );
  }

  const parameters = data[0].solution.parameters;
  const getValues = (key: string) => data.map((d) => d.reading[key]);
  const getLabels = () =>
    data.map((d) =>
      d.createdAt ? format(new Date(d.createdAt), "MMM dd, HH:mm") : ""
    );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "line":
        return LineChartIcon;
      case "bar":
        return BarChart3;
      case "pie":
        return PieChart;
      case "gauge":
        return Gauge;
      case "geo":
        return MapPin;
      case "badge":
        return CheckCircle2;
      case "number":
        return Hash;
      default:
        return Activity;
    }
  };

  const generateChartData = (param: Param) => ({
    labels: getLabels(),
    datasets: [
      {
        label: `${param.label || param.key}${
          param.unit ? ` (${param.unit})` : ""
        }`,
        data: getValues(param.key),
        backgroundColor: `${param.color || "#3b82f6"}20`,
        borderColor: param.color || "#3b82f6",
        borderWidth: 1.8,
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", font: { size: 10 } },
      },
      y: {
        ticks: { color: "#6b7280", font: { size: 10 } },
      },
    },
  };

  const DataCard = ({ param }: { param: Param }) => {
    const label = param.label || param.key;
    const Icon = getTypeIcon(param.type);

    const latestValue = getValues(param.key).slice(-1)[0];

    /* GEO */
    if (param.type === "geo") {
      const latlngs = data
        .map((row) =>
          row.reading.latitude && row.reading.longitude
            ? ([row.reading.latitude, row.reading.longitude] as [
                number,
                number
              ])
            : null
        )
        .filter(Boolean) as [number, number][];

      return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <Icon className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">{label}</h4>
          </div>

          {latlngs.length ? (
            <MapContainer
              center={latlngs[0]}
              zoom={13}
              className="h-56 w-full rounded-xl"
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={latlngs} color="blue" />
              {latlngs.map((pos, i) => (
                <Marker key={i} position={pos}>
                  <Popup>{format(new Date(data[i].createdAt), "MMM dd, HH:mm")}</Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <p className="text-sm text-gray-500">No location data</p>
          )}
        </div>
      );
    }

    /* BADGE */
    if (param.type === "badge") {
      return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="text-lg mt-1">{latestValue}</p>
          </div>
          <Icon className="w-6 h-6 text-green-600" />
        </div>
      );
    }

    /* NUMBER */
    if (param.type === "number") {
      return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-3xl mt-2 font-bold">
            {latestValue}
            {param.unit ? ` ${param.unit}` : ""}
          </p>
        </div>
      );
    }

    /* GAUGE */
    if (param.type === "gauge") {
      const pct = Math.min(Math.max(latestValue, 0), 100);

      return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <p className="font-semibold mb-2 text-gray-900">{label}</p>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${pct}%` }}
              className="h-2 bg-orange-500 rounded-full"
            />
          </div>
          <p className="text-sm mt-2">{latestValue}%</p>
        </div>
      );
    }

    /* CHARTS (simple + mobile first) */
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">{label}</p>
          </div>

          <button
            onClick={() =>
              setExpandedChart(expandedChart === param.key ? null : param.key)
            }
            className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {expandedChart === param.key ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>

        <div
          className={`transition-all ${
            expandedChart === param.key ? "h-64" : "h-40"
          }`}
        >
          <LineChart data={generateChartData(param)} options={chartOptions} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 px-2 ">

      {/* Summary Bar */}
      <div className="bg-white rounded-2xl border shadow-sm py-4 px-6 flex items-center justify-around text-sm">
        <span className="flex items-center gap-1">
          <Activity className="w-4 h-4 text-blue-600" />
          {parameters.length} Params
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-green-600" />
          {data.length} Readings
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-purple-600" />
          Live
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parameters.map((param) => (
          <DataCard key={param.key} param={param} />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" /> Summary
        </h3>

        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-xl font-bold">{data.length}</p>
            <p className="text-xs text-gray-500">Readings</p>
          </div>

          <div>
            <p className="text-xl font-bold">{parameters.length}</p>
            <p className="text-xs text-gray-500">Parameters</p>
          </div>

          <div>
            <p className="text-sm font-bold">
              {formatUpdatedAt(data[0].createdAt)}
            </p>
            <p className="text-xs text-gray-500">Last Updated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingVisualizer;
