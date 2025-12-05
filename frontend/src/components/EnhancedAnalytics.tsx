import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, startOfHour, startOfDay, startOfMinute } from "date-fns";
import { Calendar, Database, MapPin, Filter, TrendingUp, Clock } from "lucide-react";
import MapComponent from "./MapComponent";

type TimeGranularity = "minute" | "hour" | "day";

interface EnhancedAnalyticsProps {
  readings: any[];
  columns: string[];
  selectedColumns: Set<string>;
  onColumnToggle: (column: string) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
  onExport: () => void;
  isLoading: boolean;
}

export const EnhancedAnalytics = ({
  readings,
  columns,
  selectedColumns,
  onColumnToggle,
  dateRange,
  isLoading,
}: EnhancedAnalyticsProps) => {
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>("hour");
  const [selectedChartColumn, setSelectedChartColumn] = useState<string | null>(null);

  // Aggregate data based on time granularity
  const aggregatedData = useMemo(() => {
    if (!readings.length || !selectedChartColumn) return [];

    const grouped = new Map<string, { time: string; value: number; count: number }>();

    readings.forEach((r) => {
      const timestamp = new Date(r.timestamp);
      let key: string;
      let timeLabel: string;

      switch (timeGranularity) {
        case "minute":
          key = format(startOfMinute(timestamp), "yyyy-MM-dd HH:mm");
          timeLabel = format(timestamp, "HH:mm");
          break;
        case "hour":
          key = format(startOfHour(timestamp), "yyyy-MM-dd HH:00");
          timeLabel = format(timestamp, "MMM dd, HH:00");
          break;
        case "day":
          key = format(startOfDay(timestamp), "yyyy-MM-dd");
          timeLabel = format(timestamp, "MMM dd, yyyy");
          break;
      }

      const value = r.readings?.[selectedChartColumn];
      if (value !== null && value !== undefined && typeof value === "number") {
        const existing = grouped.get(key);
        if (existing) {
          existing.value += value;
          existing.count += 1;
        } else {
          grouped.set(key, { time: timeLabel, value, count: 1 });
        }
      }
    });

    return Array.from(grouped.entries())
      .map(([key, item]) => ({
        key,
        time: item.time,
        value: item.value / item.count, // Average
        raw: item.value,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [readings, timeGranularity, selectedChartColumn]);

  const getColumnStats = (columnName: string) => {
    const values = readings
      .map((r) => r.readings?.[columnName])
      .filter((v) => v !== null && v !== undefined && typeof v === "number");
    if (!values.length) return { avg: 0, min: 0, max: 0 };
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      avg: Number(avg.toFixed(2)),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  const trackingCoordinates = readings
    .map((r) =>
      r.readings?.latitude != null && r.readings?.longitude != null
        ? ([r.readings.latitude, r.readings.longitude] as [number, number])
        : null
    )
    .filter(Boolean) as [number, number][];

  const numericColumns = columns.filter((col) => {
    const sample = readings.find((r) => r.readings?.[col] !== undefined);
    return sample && typeof sample.readings[col] === "number";
  });

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#545b64] font-medium mb-0.5">Total Readings</p>
              <p className="text-xl font-semibold text-[#16191f]">{readings.length.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-[#f0f5ff] rounded">
              <Database className="w-4 h-4 text-[#0073bb]" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#545b64] font-medium mb-0.5">Parameters</p>
              <p className="text-xl font-semibold text-[#16191f]">{columns.length}</p>
            </div>
            <div className="p-2 bg-[#d1fae5] rounded">
              <TrendingUp className="w-4 h-4 text-[#10b981]" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#d1d5db] rounded px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#545b64] font-medium mb-0.5">Date Range</p>
              <p className="text-sm font-semibold text-[#16191f]">
                {dateRange[0] && dateRange[1]
                  ? `${format(dateRange[0], "MMM dd")} - ${format(dateRange[1], "MMM dd")}`
                  : "No range"}
              </p>
            </div>
            <div className="p-2 bg-[#fef3c7] rounded">
              <Calendar className="w-4 h-4 text-[#d97706]" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {numericColumns.length > 0 && (
        <div className="bg-white border border-[#d1d5db] rounded">
          <div className="border-b border-[#d1d5db] px-4 py-3 bg-[#f9fafb]">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#545b64]" />
                <h2 className="text-sm font-semibold text-[#16191f]">Time Series Chart</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedChartColumn || ""}
                  onChange={(e) => setSelectedChartColumn(e.target.value || null)}
                  className="text-xs border border-[#d1d5db] rounded px-2 py-1 text-[#16191f] focus:outline-none focus:ring-1 focus:ring-[#0073bb]"
                >
                  <option value="">Select parameter</option>
                  {numericColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1 border border-[#d1d5db] rounded overflow-hidden">
                  {(["minute", "hour", "day"] as TimeGranularity[]).map((gran) => (
                    <button
                      key={gran}
                      onClick={() => setTimeGranularity(gran)}
                      className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeGranularity === gran
                          ? "bg-[#0073bb] text-white"
                          : "bg-white text-[#545b64] hover:bg-[#f9fafb]"
                      }`}
                    >
                      {gran.charAt(0).toUpperCase() + gran.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            {selectedChartColumn && aggregatedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={aggregatedData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0073bb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0073bb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    stroke="#6b7280"
                    fontSize={11}
                    tick={{ fill: "#6b7280" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#6b7280" fontSize={11} tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0073bb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-[#545b64]">
                Select a parameter to view chart
              </div>
            )}
          </div>
        </div>
      )}

      {/* Column Filters */}
      {columns.length > 0 && (
        <div className="bg-white border border-[#d1d5db] rounded">
          <div className="border-b border-[#d1d5db] px-4 py-3 bg-[#f9fafb]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#545b64]" />
              <h2 className="text-sm font-semibold text-[#16191f]">Column Filters</h2>
              <span className="text-xs text-[#545b64]">
                ({selectedColumns.size} of {columns.length} selected)
              </span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {columns.map((column) => {
              const stats = getColumnStats(column);
              return (
                <label
                  key={column}
                  className="flex items-start gap-2 p-2.5 border border-[#d1d5db] rounded hover:border-[#0073bb] cursor-pointer transition-colors bg-[#f9fafb] hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.has(column)}
                    onChange={() => onColumnToggle(column)}
                    className="mt-0.5 w-4 h-4 text-[#0073bb] border-[#d1d5db] focus:ring-[#0073bb]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#16191f] capitalize truncate">{column}</div>
                    <div className="text-[10px] text-[#545b64] mt-0.5">Avg: {stats.avg}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-[#d1d5db] rounded">
        <div className="border-b border-[#d1d5db] px-4 py-3 bg-[#f9fafb] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#545b64]" />
            <h2 className="text-sm font-semibold text-[#16191f]">Reading Data</h2>
            {readings.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[#dbeafe] text-[#1e40af] rounded">
                {readings.length} records
              </span>
            )}
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#545b64]">
              <Clock className="w-3.5 h-3.5 animate-spin" /> Loading...
            </div>
          )}
        </div>

        {readings.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="hidden md:block min-w-full">
              <table className="w-full text-sm">
                <thead className="bg-[#f9fafb] border-b border-[#d1d5db]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#545b64] uppercase tracking-wide border-r border-[#d1d5db]">
                      Timestamp
                    </th>
                    {Array.from(selectedColumns).map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-[#545b64] uppercase tracking-wide border-r border-[#d1d5db] last:border-r-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {readings.map((r, idx) => (
                    <tr key={idx} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-2.5 text-xs text-[#16191f] border-r border-[#d1d5db]">
                        <div className="flex flex-col">
                          <span>{format(new Date(r.timestamp), "MMM dd, yyyy")}</span>
                          <span className="text-[10px] text-[#545b64]">
                            {format(new Date(r.timestamp), "HH:mm:ss")}
                          </span>
                        </div>
                      </td>
                      {Array.from(selectedColumns).map((col) => (
                        <td
                          key={col}
                          className="px-4 py-2.5 text-xs text-[#16191f] border-r border-[#d1d5db] last:border-r-0 font-mono"
                        >
                          {r.readings?.[col] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden p-3 space-y-2 max-h-96 overflow-y-auto">
              {readings.map((r, idx) => (
                <div key={idx} className="border border-[#d1d5db] bg-[#f9fafb] rounded p-3">
                  <div className="flex justify-between mb-2 border-b border-[#d1d5db] pb-2">
                    <span className="text-xs font-semibold text-[#16191f]">Reading #{idx + 1}</span>
                    <div className="text-right">
                      <div className="text-xs text-[#545b64]">{format(new Date(r.timestamp), "MMM dd, yyyy")}</div>
                      <div className="text-[10px] text-[#545b64]">{format(new Date(r.timestamp), "HH:mm:ss")}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from(selectedColumns).map((col) => (
                      <div key={col} className="flex justify-between">
                        <span className="text-xs font-medium text-[#545b64] capitalize">{col}:</span>
                        <span className="text-xs text-[#16191f] font-mono">{r.readings?.[col] ?? "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-[#545b64]">
            {isLoading ? "Loading..." : "No data available"}
          </div>
        )}
      </div>

      {/* Map */}
      {trackingCoordinates.length > 0 && (
        <div className="bg-white border border-[#d1d5db] rounded">
          <div className="border-b border-[#d1d5db] px-4 py-3 bg-[#f9fafb] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#545b64]" />
            <h2 className="text-sm font-semibold text-[#16191f]">Location Tracking</h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-[#d1fae5] text-[#065f46] rounded">
              {trackingCoordinates.length} coordinates
            </span>
          </div>
          <div className="p-4">
            <div className="h-[300px] border border-[#d1d5db] rounded overflow-hidden">
              <MapComponent latlngs={trackingCoordinates} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

