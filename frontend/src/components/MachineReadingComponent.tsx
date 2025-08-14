import React, { useEffect, useState } from "react";
import { Download, Calendar, Database, MapPin, Filter, RefreshCw, TrendingUp } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axiosInstance from "../../utils/axiosInstance";

interface MachineAnalyticsProps {
  deviceName: string;
}

export const MachineAnalyticsComponent: React.FC<MachineAnalyticsProps> = ({ deviceName }) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [readings, setReadings] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());

  const deviceId = deviceName; // Using deviceName as deviceId directly

  useEffect(() => {
    const fetchAvailableDates = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance(`/api/deviceReading/availableDays/${deviceId}`);
        const data = res.data;
        setAvailableDates(data.dates);
        if (data.dates.length > 0) {
          const latest = new Date(data.dates[data.dates.length - 1]);
          setDateRange([latest, latest]);
        }
      } catch (error) {
        console.error("Error fetching available dates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailableDates();
  }, [deviceId]);

  useEffect(() => {
    const [from, to] = dateRange;
    if (!from || !to) return;
    const fetchReadings = async () => {
      setIsLoading(true);
      try {
        const fromStr = format(from, "yyyy-MM-dd");
        const toStr = format(to, "yyyy-MM-dd");
        const res = await axiosInstance(`/api/deviceReading/readings/by-date/${deviceId}?from=${fromStr}&to=${toStr}`);
        const data = res.data;
        setReadings(data.readings || []);
        const allKeys = new Set<string>();
        data.readings.forEach((r: any) => {
          Object.keys(r.readings || {}).forEach((k) => allKeys.add(k));
        });
        const columnArray = Array.from(allKeys);
        setColumns(columnArray);
        setSelectedColumns(new Set(columnArray));
      } catch (error) {
        console.error("Error fetching readings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReadings();
  }, [dateRange, deviceId]);

  const isDateAvailable = (date: Date) => availableDates.includes(format(date, "yyyy-MM-dd"));

  const handleDownloadExcel = () => {
    if (readings.length === 0 || !dateRange[0] || !dateRange[1]) return;
    const data = readings.map((r) => {
      const row: any = { Timestamp: new Date(r.createdAt).toLocaleString() };
      Array.from(selectedColumns).forEach((col) => row[col] = r.readings?.[col] ?? "-");
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const fromStr = format(dateRange[0], "yyyy-MM-dd");
    const toStr = format(dateRange[1], "yyyy-MM-dd");
    const fileName = `Report_${fromStr}_to_${toStr}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, fileName);
  };

  const getColumnStats = (columnName: string) => {
    const values = readings.map(r => r.readings?.[columnName]).filter(v => v !== null && v !== undefined);
    if (!values.length) return { avg: 0, min: 0, max: 0 };
    const numValues = values.filter(v => typeof v === 'number');
    if (!numValues.length) return { avg: 0, min: 0, max: 0 };
    const avg = numValues.reduce((a, b) => a + b, 0) / numValues.length;
    return { avg: Number(avg.toFixed(2)), min: Math.min(...numValues), max: Math.max(...numValues) };
  };

  const toggleColumnSelection = (column: string) => {
    const newSelected = new Set(selectedColumns);
    newSelected.has(column) ? newSelected.delete(column) : newSelected.add(column);
    setSelectedColumns(newSelected);
  };

  const trackingCoordinates = readings
    .map((r) => r.readings?.latitude != null && r.readings?.longitude != null ? [r.readings.latitude, r.readings.longitude] as [number, number] : null)
    .filter(Boolean) as [number, number][];

  const StatCard = ({ title, value, icon, bg, valueClass }: { title: string; value: string | number; icon: React.ReactNode; bg: string; valueClass?: string }) => (
    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl flex justify-between items-center hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${valueClass || "text-gray-900"}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50">
      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Header Controls */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics Controls</h3>
              <p className="text-gray-600 text-sm mt-1">Configure date range and export options</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative">
                <DatePicker
                  selectsRange
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={(update) => setDateRange(update)}
                  filterDate={isDateAvailable}
                  maxDate={new Date()}
                  isClearable={false}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select Date Range"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black font-medium"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              <button
                onClick={handleDownloadExcel}
                disabled={readings.length === 0 || isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg disabled:bg-gray-300 transition-colors"
              >
                <Download className="w-4 h-4" /> Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Readings" 
            value={readings.length.toLocaleString()} 
            icon={<Database className="w-6 h-6 text-blue-600" />} 
            bg="bg-blue-100" 
          />
          <StatCard 
            title="Parameters" 
            value={columns.length} 
            icon={<TrendingUp className="w-6 h-6 text-green-600" />} 
            bg="bg-green-100" 
          />
          <StatCard 
            title="Date Range" 
            value={dateRange[0] && dateRange[1] ? `${format(dateRange[0], 'MMM dd')} - ${format(dateRange[1], 'MMM dd')}` : 'No range selected'} 
            icon={<Calendar className="w-6 h-6 text-purple-600" />} 
            bg="bg-purple-100" 
          />
          <StatCard 
            title="Available Days" 
            value={availableDates.length} 
            icon={<Calendar className="w-6 h-6 text-orange-600" />} 
            bg="bg-orange-100" 
          />
        </div>

        {/* Column Filters */}
        {columns.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-3 rounded-t-xl">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Parameter Filters</h2>
              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {selectedColumns.size} of {columns.length} selected
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {columns.map((column) => {
                const stats = getColumnStats(column);
                return (
                  <label key={column} className="flex rounded-lg items-start gap-3 p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={selectedColumns.has(column)}
                      onChange={() => toggleColumnSelection(column)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm capitalize truncate">{column}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Avg: <span className="font-medium">{stats.avg}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Min: {stats.min} | Max: {stats.max}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Reading Data</h2>
              {readings.length > 0 && (
                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded-full">
                  {readings.length} records
                </span>
              )}
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            )}
          </div>

          {readings.length > 0 ? (
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                      Timestamp
                    </th>
                    {Array.from(selectedColumns).map((col) => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200 last:border-r-0">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {readings.map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="flex flex-col">
                          <span className="font-medium">{format(new Date(r.createdAt), 'MMM dd, yyyy')}</span>
                          <span className="text-xs text-gray-500">{format(new Date(r.createdAt), 'HH:mm:ss')}</span>
                        </div>
                      </td>
                      {Array.from(selectedColumns).map((col) => (
                        <td key={col} className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200 last:border-r-0 font-mono">
                          {r.readings?.[col] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500">Loading data...</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No Data Available</p>
                  <p className="text-sm">Select a date range to view readings</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location Tracking Map Placeholder */}
        {trackingCoordinates.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-3 rounded-t-xl">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Location Tracking</h2>
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-200 rounded-full">
                {trackingCoordinates.length} coordinates
              </span>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-medium">Map Component</p>
                  <p className="text-sm">Location tracking visualization would appear here</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};