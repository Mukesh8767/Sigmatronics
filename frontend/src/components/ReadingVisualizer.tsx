import React, { useState, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import {
  Activity,
  MapPin,
  Gauge,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  Maximize2,
  Minimize2,
  Calendar,
  Zap,
  CheckCircle2,
  Info,
  TrendingUp,
  Thermometer,
  Droplets,
  Wind,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100 dark:border-[#2C2C2E] text-xs">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].stroke || payload[0].fill }} />
          <span className="text-gray-600 dark:text-gray-300">
            {payload[0].value.toFixed(2)} {unit}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const ReadingVisualizer: React.FC<ReadingVisualizerProps> = ({ data }) => {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return { parameters: [], chartData: [] };

    // Sort data by date ascending for charts
    const sortedData = [...data].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const chartData: any[] = sortedData.map((d) => ({
      ...d.reading,
      timestamp: d.createdAt,
      displayTime: format(new Date(d.createdAt), "HH:mm"),
      fullTime: format(new Date(d.createdAt), "MMM dd, HH:mm"),
    }));

    return {
      parameters: data[0].solution.parameters,
      chartData,
    };
  }, [data]);

  const { parameters, chartData } = processedData;

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-gray-200 dark:border-[#2C2C2E]">
        <Activity className="w-10 h-10 text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">No Data Available</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "line": return LineChartIcon;
      case "bar": return BarChart3;
      case "pie": return PieChart;
      case "gauge": return Gauge;
      case "geo": return MapPin;
      case "badge": return CheckCircle2;
      case "number": return TrendingUp;
      default: return Activity;
    }
  };

  const getParamIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('temp')) return Thermometer;
    if (l.includes('humid') || l.includes('water')) return Droplets;
    if (l.includes('air') || l.includes('gas')) return Wind;
    if (l.includes('energy') || l.includes('volt')) return Zap;
    return Activity;
  }

  const DataCard = ({ param }: { param: Param }) => {
    const label = param.label || param.key;
    const VisualTypeIcon = getTypeIcon(param.type);
    const ParamIcon = getParamIcon(label);
    // Actually typically [0] is latest in many APIs, but previous code sorted by time for charts. 
    // Let's use the last item of our sorted 'chartData' as the "latest" to be consistent with charts.
    const latestItem = chartData[chartData.length - 1];
    const latestVal = latestItem ? latestItem[param.key] : 0;

    const isExpanded = expandedChart === param.key;
    const color = param.color || "#0071E3";

    const commonCardClasses = `bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-gray-200 dark:border-[#2C2C2E] shadow-sm transition-all duration-300 hover:shadow-md ${isExpanded ? "col-span-1 md:col-span-2 row-span-2" : ""
      }`;

    // --- MAP / GEO ---
    if (param.type === "geo") {
      const latlngs = chartData
        .map((row) =>
          row.latitude && row.longitude ? ([row.latitude, row.longitude] as [number, number]) : null
        )
        .filter(Boolean) as [number, number][];

      return (
        <div className={commonCardClasses}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`}>
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{label}</h4>
          </div>
          <div className="h-64 rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2C2C2E] relative z-0">
            {latlngs.length ? (
              <MapContainer center={latlngs[latlngs.length - 1]} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
                <Polyline positions={latlngs} color={color} weight={4} opacity={0.7} />
                <Marker position={latlngs[latlngs.length - 1]}>
                  <Popup>Latest Position: {format(new Date(latestItem.timestamp), "MMM dd, HH:mm")}</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-[#2C2C2E]">
                <p className="text-gray-400 text-sm">No GPS data available</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // --- BADGE ---
    if (param.type === "badge") {
      return (
        <div className={`${commonCardClasses} flex items-center justify-between`}>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{latestVal}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      );
    }

    // --- NUMBER ---
    if (param.type === "number") {
      return (
        <div className={commonCardClasses}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ParamIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{typeof latestVal === 'number' ? latestVal.toFixed(2) : latestVal}</span>
            {param.unit && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{param.unit}</span>}
          </div>
        </div>
      );
    }

    // --- GAUGE ---
    if (param.type === "gauge") {
      const pct = Math.min(Math.max(Number(latestVal) || 0, 0), 100);
      return (
        <div className={commonCardClasses}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400`}>
                <Gauge className="w-4 h-4" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
            </div>
          </div>
          <div className="relative pt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="h-4 w-full bg-gray-100 dark:bg-[#2C2C2E] rounded-full overflow-hidden">
              <div
                style={{ width: `${pct}%` }}
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 ease-out rounded-full"
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{pct}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
        </div>
      )
    }

    // --- CHARTS (Line / Bar) ---
    return (
      <div className={commonCardClasses}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400`}>
              <VisualTypeIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">{label}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Latest: <span className="font-medium text-gray-700 dark:text-gray-300">{Number(latestVal)?.toFixed(2)} {param.unit}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpandedChart(expandedChart === param.key ? null : param.key)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {expandedChart === param.key ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className={`transition-all duration-300 w-full ${expandedChart === param.key ? "h-96" : "h-48"}`}>
          <ResponsiveContainer width="100%" height="100%">
            {param.type === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" opacity={0.5} />
                <XAxis
                  dataKey="displayTime"
                  stroke="#86868B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#86868B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />
                <Tooltip content={<CustomTooltip unit={param.unit} />} cursor={{ fill: 'transparent' }} />
                <Bar
                  dataKey={param.key}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${param.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" opacity={0.5} />
                <XAxis
                  dataKey="displayTime"
                  stroke="#86868B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#86868B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  domain={['auto', 'auto']} // Auto scale to show variation
                />
                <Tooltip content={<CustomTooltip unit={param.unit} />} />
                <Area
                  type="monotone"
                  dataKey={param.key}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-${param.key})`}
                  animationDuration={1500}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-gray-200 dark:border-[#2C2C2E] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Params</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{parameters.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-gray-200 dark:border-[#2C2C2E] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Readings</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-gray-200 dark:border-[#2C2C2E] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Latest</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
              {data.length ? format(new Date(data[0].createdAt), "HH:mm") : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {parameters.map((param) => (
          <DataCard key={param.key} param={param} />
        ))}
      </div>
    </div>
  );
};

export default ReadingVisualizer;
