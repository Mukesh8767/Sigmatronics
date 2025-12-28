import { format } from "date-fns";
import { Database, MapPin, Clock, SlidersHorizontal } from "lucide-react";
import MapComponent from "./MapComponent";

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

export const Readings = ({
  readings,
  columns,
  selectedColumns,
  onColumnToggle,
  isLoading,
}: EnhancedAnalyticsProps) => {

  const trackingCoordinates = readings
    .map((r) =>
      r.readings?.latitude != null && r.readings?.longitude != null
        ? ([r.readings.latitude, r.readings.longitude] as [number, number])
        : null
    )
    .filter(Boolean) as [number, number][];

  return (
    <div className="space-y-6">

      {/* Filters & Controls */}
      {columns.length > 0 && (
        <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gray-100 dark:bg-[#2C2C2E] rounded-full">
              <SlidersHorizontal className="w-4 h-4 text-gray-900 dark:text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Active Parameters</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {columns.map((column) => {
              const isSelected = selectedColumns.has(column);
              return (
                <button
                  key={column}
                  onClick={() => onColumnToggle(column)}
                  className={`
                     px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border
                     ${isSelected
                      ? 'bg-[#0071E3] border-[#0071E3] text-white shadow-md'
                      : 'bg-white dark:bg-[#2C2C2E] border-gray-200 dark:border-[#3A3A3C] text-gray-600 dark:text-gray-300 hover:border-[#0071E3]'}
                   `}
                >
                  {column}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Readings Table (Apple Style) */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2C2C2E] flex justify-between items-center bg-gray-50/50 dark:bg-[#2C2C2E]/30 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">History Log</span>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-[#3A3A3C] px-2 py-1 rounded-md">
            {readings.length} Records
          </span>
        </div>

        <div className="overflow-auto max-h-[600px] no-scrollbar">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <Clock className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Loading Data...</p>
            </div>
          ) : readings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No readings available for this period.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                <tr>
                  <th className="py-3 px-6 text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#2C2C2E]">
                    Timestamp
                  </th>
                  {Array.from(selectedColumns).map(col => (
                    <th key={col} className="py-3 px-6 text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#2C2C2E]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2C2C2E]">
                {readings.map((r, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/60 transition-colors">
                    <td className="py-3 px-6 min-w-[140px]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                          {format(new Date(r.timestamp), "HH:mm")}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">
                          {format(new Date(r.timestamp), "MMM dd")}
                        </span>
                      </div>
                    </td>
                    {Array.from(selectedColumns).map(col => (
                      <td key={col} className="py-3 px-6 text-sm font-medium text-gray-700 dark:text-[#EFEFF4] font-mono whitespace-nowrap">
                        {r.readings?.[col] !== undefined ? (
                          <span>
                            {r.readings[col]}
                            {(col.toLowerCase().includes('temp')) && <span className="text-xs text-gray-400 ml-0.5">°</span>}
                            {(col.toLowerCase().includes('humid')) && <span className="text-xs text-gray-400 ml-0.5">%</span>}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Map */}
      {trackingCoordinates.length > 0 && (
        <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] rounded-3xl p-1 shadow-sm">
          <div className="px-5 py-4 flex items-center gap-2">
            <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Location History</h3>
          </div>
          <div className="h-[350px] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2C2C2E]">
            <MapComponent latlngs={trackingCoordinates} />
          </div>
        </div>
      )}
    </div>
  );
};

