import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import ReadingVisualizer from "../../components/ReadingVisualizer";
import { Readings } from "../../components/Readings";
import { Activity, Calendar, RefreshCcw, Download, AlertTriangle, Shield, ChevronLeft } from "lucide-react";
import { transformMachineCode } from "../../components/machineCodeEncoder";
import { decodeBase64 } from "../../../utils/base64";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import axiosInstance from "../../../utils/axiosInstance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "react-datepicker/dist/react-datepicker.css";
import { useFetchLiveAlerts } from "../../hooks/useFetchLiveAlerts";

type ViewMode = "readings" | "analytics" | "alerts";

export const MachineDetailPage = () => {
  const { userId, solution, deviceName } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("readings");

  const decodedDeviceName = deviceName ? decodeBase64(deviceName) : "";
  const { alerts, loading: alertsLoading, error: alertsError } = useFetchLiveAlerts();
  const machineAlerts = useMemo(
    () => alerts.filter((a) => a.machineId === decodedDeviceName),
    [alerts, decodedDeviceName]
  );

  // Readings state
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [readings, setReadings] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  //@ts-ignore
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Analytics state
  const [analyticsReadings, setAnalyticsReadings] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());

  // Fetch available dates
  useEffect(() => {
    if (!decodedDeviceName) return;
    const fetchAvailableDates = async () => {
      try {
        const res = await axiosInstance(`/api/deviceReading/availableDays/${decodedDeviceName}`);
        const data = res.data;
        setAvailableDates(data.dates || []);
        if (data.dates.length > 0) {
          const latest = new Date(data.dates[data.dates.length - 1]);
          setDateRange([latest, latest]);
        }
      } catch (error) {
        console.error("Error fetching available dates:", error);
      }
    };
    fetchAvailableDates();
  }, [decodedDeviceName]);

  // Fetch readings (Live Telemetry -> Now for Analytics Dashboard)
  useEffect(() => {
    const [from, to] = dateRange;
    if (!from || !to || !decodedDeviceName || viewMode !== "analytics") return;

    const fromStr = format(from, "yyyy-MM-dd");
    const toStr = format(to, "yyyy-MM-dd");

    const fetchReadings = async (isFirstLoad = false) => {
      if (isFirstLoad) setIsInitialLoading(true);
      try {
        const res = await axiosInstance(
          `/api/deviceReading/readings/by-date/${decodedDeviceName}?from=${fromStr}&to=${toStr}`
        );
        const data = res.data;
        if (!data.readings || !data.solution) return;
        const solution = data.solution;
        const transformed = data.readings.map((r: any) => ({
          reading: r.readings,
          createdAt: r.createdAt,
          timestamp: r.timestamp,
          solution,
        }));
        setReadings((prev) => {
          const existing = new Set(prev.map((p) => p.timestamp));
          const newItems = transformed.filter((r: any) => !existing.has(r.timestamp));
          if (newItems.length === 0) return prev;
          return [...prev, ...newItems].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
      } catch (error) {
        console.error("Error fetching readings:", error);
      } finally {
        if (isFirstLoad) setIsInitialLoading(false);
      }
    };

    fetchReadings(true);
    const intervalId = setInterval(() => fetchReadings(false), 10000);
    return () => clearInterval(intervalId);
  }, [dateRange, decodedDeviceName, viewMode]);

  // Fetch analytics data (Historical Log -> Now for Readings Tab)
  useEffect(() => {
    const [from, to] = dateRange;
    if (!from || !to || !decodedDeviceName || viewMode !== "readings") return;

    const fetchAnalytics = async () => {
      setIsAnalyticsLoading(true);
      try {
        const fromStr = format(from, "yyyy-MM-dd");
        const toStr = format(to, "yyyy-MM-dd");
        const res = await axiosInstance(`/api/deviceReading/readings/by-date/${decodedDeviceName}?from=${fromStr}&to=${toStr}`);
        const data = res.data;
        setAnalyticsReadings(data.readings || []);
        const allKeys = new Set<string>();
        data.readings.forEach((r: any) => {
          Object.keys(r.readings || {}).forEach((k) => allKeys.add(k));
        });
        const columnArray = Array.from(allKeys);
        setColumns(columnArray);
        setSelectedColumns(new Set(columnArray));
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, decodedDeviceName, viewMode]);

  const isDateAvailable = (date: Date) => {
    const str = format(date, "yyyy-MM-dd");
    return availableDates.includes(str);
  };

  const handleDownloadExcel = () => {
    if (analyticsReadings.length === 0 || !dateRange[0] || !dateRange[1]) return;
    const data = analyticsReadings.map((r) => {
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

  const toggleColumnSelection = (column: string) => {
    const newSelected = new Set(selectedColumns);
    newSelected.has(column) ? newSelected.delete(column) : newSelected.add(column);
    setSelectedColumns(newSelected);
  };

  return (
    <UserWrapper>
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 font-sans">
        {/* Sticky Header with Glassmorphism */}
        <div className="sticky top-0 z-50 bg-[#F5F5F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-[#1C1C1E]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
            {/* Nav Row */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(`/user/${userId}/solutions/${solution}`)}
                className="flex items-center gap-1 text-[#0071E3] hover:opacity-70 transition-opacity font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            </div>

            {/* Title & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                  {decodedDeviceName ? transformMachineCode(decodedDeviceName) : "Machine Details"}
                </h1>
                <p className="text-[#86868B] dark:text-[#98989D] text-sm font-medium">
                  {viewMode === "readings" ? "Telemetry Log" : viewMode === "analytics" ? "Live Dashboard" : "Alert History"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Segmented Control */}
                <div className="bg-[#E5E5EA] dark:bg-[#1C1C1E] p-1 rounded-lg flex items-center">
                  {(["readings", "analytics", "alerts"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`
                            px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                            ${viewMode === mode
                          ? "bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm"
                          : "text-[#86868B] hover:text-black dark:hover:text-white"}
                          `}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Date Picker Button styling wrapper */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-[#86868B]" />
                  </div>
                  <DatePicker
                    selectsRange
                    startDate={dateRange[0]}
                    endDate={dateRange[1]}
                    onChange={(update) => setDateRange(update)}
                    filterDate={isDateAvailable}
                    maxDate={new Date()}
                    isClearable={false}
                    dateFormat="MMM dd, yyyy"
                    placeholderText="Select dates"
                    className="pl-10 pr-4 py-2 bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-lg text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#0071E3] w-[240px] shadow-sm hover:border-[#86868B] transition-colors"
                  />
                </div>

                {viewMode === "readings" && (
                  <button
                    onClick={handleDownloadExcel}
                    disabled={analyticsReadings.length === 0 || isAnalyticsLoading}
                    className="bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white p-2 rounded-lg shadow-sm transition-all"
                    title="Export Data"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          {viewMode === "analytics" ? (
            <div className="animate-fade-in">
              {isRefreshing && !isInitialLoading && (
                <div className="fixed top-24 right-8 z-50">
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur text-xs font-medium text-[#86868B] rounded-full shadow-sm border border-[#E5E5EA] dark:border-[#3A3A3C]">
                    <RefreshCcw className="w-3 h-3 animate-spin" /> Live Updating
                  </span>
                </div>
              )}

              {isInitialLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-[#86868B]">
                  <div className="w-8 h-8 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-medium">Loading telemetry...</p>
                </div>
              ) : readings.length > 0 ? (
                <ReadingVisualizer data={readings} />
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-16 h-16 bg-[#E5E5EA] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-[#86868B]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-white mb-2">No Telemetry Data</h3>
                  <p className="text-[#86868B] max-w-sm">No readings found for this period. Try selecting a different date range.</p>
                </div>
              )}
            </div>
          ) : viewMode === "readings" ? (
            <div className="animate-fade-in">
              <Readings
                readings={analyticsReadings}
                columns={columns}
                selectedColumns={selectedColumns}
                onColumnToggle={toggleColumnSelection}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onExport={handleDownloadExcel}
                isLoading={isAnalyticsLoading}
              />
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Security & Alerts</h3>
                    <p className="text-[#86868B] text-sm">Real-time anomaly detection log</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{machineAlerts.length}</p>
                  <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Total Events</p>
                </div>
              </div>

              {alertsLoading && (
                <div className="text-center py-12 text-[#86868B]">Loading security log...</div>
              )}

              {!alertsLoading && !alertsError && machineAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-[#E5E5EA] dark:border-[#2C2C2E] text-center">
                  <Shield className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">System Healthy</h3>
                  <p className="text-[#86868B]">No anomalies detected in the selected timeframe.</p>
                </div>
              )}

              {!alertsLoading && !alertsError && machineAlerts.length > 0 && (
                <div className="space-y-4">
                  {machineAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{alert.message}</h4>
                          <span className="text-xs text-[#86868B] font-medium whitespace-nowrap ml-4">
                            {format(new Date(alert.createdAt), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <p className="text-[#86868B] text-sm mt-1">
                          Detected anomaly in system patterns.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </UserWrapper>
  );
};

