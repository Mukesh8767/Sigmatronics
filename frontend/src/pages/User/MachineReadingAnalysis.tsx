import { useEffect, useState } from "react";
import { Download, Calendar, Database, MapPin, Filter, RefreshCw, TrendingUp } from "lucide-react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import UserWrapper from "../Wrappers/UserWrapper";
import axiosInstance from "../../../utils/axiosInstance";
import { ListLoader } from "../../components/ListLoader";
import { Button } from "../../components/button";
import { Back } from "../../components/BackButton";
import MapComponent from "../../components/MapComponent";
import { transformMachineCode } from "../../components/machineCodeEncoder";

export const MachineReadingAnalysis = () => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [readings, setReadings] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const { deviceName } = useParams();

  const decryptId = (encoded: string): string => atob(encoded);
  const deviceId = decryptId(deviceName || '');

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
      const row: any = { Timestamp: new Date(r.timestamp).toLocaleString() };
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

  return (
    <UserWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Back />
            <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Device Reading Analysis</h1>
                <p className="text-gray-600 text-sm">Device ID: {transformMachineCode(deviceId)} | Real-time data monitoring and analysis</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
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
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black font-medium"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
                </div>
                <Button
                  onClick={handleDownloadExcel}
                  disabled={readings.length === 0 || isLoading}
                  variant="primary"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm w-full sm:w-auto disabled:bg-gray-300"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card Examples */}
            <StatCard title="Total Readings" value={readings.length.toLocaleString()} icon={<Database className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" />
            <StatCard title="Parameters" value={columns.length} icon={<TrendingUp className="w-6 h-6 text-green-600" />} bg="bg-green-100" />
            <StatCard title="Date Range" value={dateRange[0] && dateRange[1] ? `${format(dateRange[0], 'MMM dd')} - ${format(dateRange[1], 'MMM dd')}` : 'No range selected'} icon={<Calendar className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" />
          </div>

          {/* Filters */}
          {columns.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="border-b border-gray-200 bg-gray-50  px-6 py-4 flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Column Filters</h2>
                <span className="text-sm text-gray-500">({selectedColumns.size} of {columns.length} selected)</span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {columns.map((column) => {
                  const stats = getColumnStats(column);
                  return (
                    <label key={column} className="flex rounded-2xl items-start gap-3 p-4 border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedColumns.has(column)}
                        onChange={() => toggleColumnSelection(column)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm capitalize truncate">{column}</div>
                        <div className="text-xs text-gray-500 mt-1">Avg: {stats.avg}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3 ">
                <Database className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Reading Data</h2>
                {readings.length > 0 && <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{readings.length} records</span>}
              </div>
              {isLoading && <div className="flex items-center gap-2 text-sm text-gray-600"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div>}
            </div>

            {readings.length > 0 ? (
              <div className="relative">
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto h-100">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">Timestamp</th>
                        {Array.from(selectedColumns).map((col) => (
                          <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200 last:border-r-0">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {readings.map((r, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                            <div className="flex flex-col">
                              <span>{format(new Date(r.timestamp), 'MMM dd, yyyy')}</span>
                              <span className="text-xs text-gray-500">{format(new Date(r.timestamp), 'HH:mm:ss')}</span>
                            </div>
                          </td>
                          {Array.from(selectedColumns).map((col) => (
                            <td key={col} className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200 last:border-r-0 font-mono">{r.readings?.[col] ?? "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden p-4 space-y-4 h-96 overflow-y-auto">
                  {readings.map((r, idx) => (
                    <div key={idx} className="border border-gray-200 bg-gray-50 p-4">
                      <div className="flex justify-between mb-3 border-b pb-3">
                        <span className="text-sm font-semibold text-gray-900">Reading #{idx + 1}</span>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">{format(new Date(r.timestamp), 'MMM dd, yyyy')}</div>
                          <div className="text-xs text-gray-500">{format(new Date(r.timestamp), 'HH:mm:ss')}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from(selectedColumns).map((col) => (
                          <div key={col} className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600 capitalize">{col}:</span>
                            <span className="text-sm text-gray-900 font-mono">{r.readings?.[col] ?? "-"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">{isLoading ? <ListLoader /> : "No Data Available"}</div>
            )}
          </div>

          {/* Map */}
          {trackingCoordinates.length > 0 && (
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Location Tracking</h2>
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-200">{trackingCoordinates.length} coordinates</span>
              </div>
              <div className="p-6">
                <div className="h-[300px] sm:h-96 border border-gray-200">
                  <MapComponent latlngs={trackingCoordinates} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserWrapper>
  );

  function StatCard({ title, value, icon, bg, valueClass }: { title: string; value: string | number; icon: React.ReactNode; bg: string; valueClass?: string }) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${valueClass || "text-gray-900"}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${bg} flex items-center justify-center`}>{icon}</div>
      </div>
    );
  }
};
