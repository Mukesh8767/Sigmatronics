import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserWrapper from "../Wrappers/UserWrapper";
import ReadingVisualizer from "../../components/ReadingVisualizer";
import { EnhancedAnalytics } from "../../components/EnhancedAnalytics";
import { ArrowLeft, Activity, Calendar, RefreshCcw, Download, NotepadText, Bell, AlertTriangle, Shield } from "lucide-react";
import { transformMachineCode } from "../../components/machineCodeEncoder";
import { decodeBase64 } from "../../../utils/base64";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import axiosInstance from "../../../utils/axiosInstance";
import { Button } from "../../components/button";
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

  // Fetch available dates for readings
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

  // Fetch readings
  useEffect(() => {
    const [from, to] = dateRange;
    if (!from || !to || !decodedDeviceName || viewMode !== "readings") return;

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

  // Fetch analytics data
  useEffect(() => {
    const [from, to] = dateRange;
    if (!from || !to || !decodedDeviceName || viewMode !== "analytics") return;

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
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="bg-white border-b border-[#d1d5db] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Back Button */}
            <button
              onClick={() => navigate(`/user/${userId}/solutions/${solution}`)}
              className="flex items-center gap-1.5 text-sm text-[#0073bb] hover:text-[#005a8c] mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Devices
            </button>

            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-[#16191f] mb-1 flex items-center gap-1">
                  <NotepadText />
                  {viewMode === "readings"
                    ? "Device Readings"
                    : viewMode === "analytics"
                      ? "Device Analytics"
                      : "Device Alerts"}
                </h1>
                {decodedDeviceName && (
                  <p className="text-sm text-[#545b64]">
                    Device: <span className="font-mono text-[#0073bb]">{transformMachineCode(decodedDeviceName)}</span>
                  </p>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-[#f9fafb] border border-[#d1d5db] rounded p-1">
                <button
                  onClick={() => setViewMode("readings")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === "readings"
                    ? "bg-white text-[#16191f] shadow-sm border border-[#d1d5db]"
                    : "text-[#545b64] hover:text-[#16191f]"
                    }`}
                >
                  <Activity className="w-4 h-4" />
                  Readings
                </button>
                <button
                  onClick={() => setViewMode("analytics")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === "analytics"
                    ? "bg-white text-[#16191f] shadow-sm border border-[#d1d5db]"
                    : "text-[#545b64] hover:text-[#16191f]"
                    }`}
                >
                  <NotepadText className="w-4 h-4" />
                  Analytics
                </button>
                <button
                  onClick={() => setViewMode("alerts")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === "alerts"
                    ? "bg-white text-[#16191f] shadow-sm border border-[#d1d5db]"
                    : "text-[#545b64] hover:text-[#16191f]"
                    }`}
                >
                  <Bell className="w-4 h-4" />
                  Alerts
                </button>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#545b64]" />
                <label className="text-sm font-medium text-[#545b64]">Date range:</label>
              </div>
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
                  placeholderText="Select date range"
                  className="border border-[#d1d5db] rounded px-3 py-1.5 text-sm text-[#16191f] focus:outline-none focus:ring-1 focus:ring-[#0073bb] focus:border-[#0073bb] min-w-[240px]"
                />
              </div>
              {viewMode === "analytics" && (
                <Button
                  onClick={handleDownloadExcel}
                  disabled={analyticsReadings.length === 0 || isAnalyticsLoading}
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#0073bb] hover:bg-[#f0f5ff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {viewMode === "readings" ? (
            <div className="bg-white border border-[#d1d5db] rounded relative">
              {isRefreshing && !isInitialLoading && (
                <div className="absolute top-3 right-3 flex items-center text-xs text-[#545b64] z-10 bg-white px-2 py-1 rounded border border-[#d1d5db]">
                  <RefreshCcw className="w-3 h-3 animate-spin mr-1" />
                  Refreshing
                </div>
              )}
              {isInitialLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2 text-[#545b64]">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0073bb] border-t-transparent"></div>
                    <span className="text-sm">Loading data...</span>
                  </div>
                </div>
              ) : readings.length > 0 ? (
                <div className="p-4">
                  <ReadingVisualizer data={readings} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-[#545b64]">
                  <Calendar className="w-10 h-10 mb-3 text-[#9ca3af]" />
                  <p className="text-sm font-medium">No data available for the selected date range</p>
                  {availableDates.length > 0 && (
                    <p className="text-xs mt-1 text-[#9ca3af]">
                      Try selecting from available dates: {availableDates.slice(-3).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : viewMode === "analytics" ? (
            <EnhancedAnalytics
              readings={analyticsReadings}
              columns={columns}
              selectedColumns={selectedColumns}
              onColumnToggle={toggleColumnSelection}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onExport={handleDownloadExcel}
              isLoading={isAnalyticsLoading}
            />
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-[#d1d5db] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f0f5ff] flex items-center justify-center text-[#0073bb]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#16191f]">Machine alerts</p>
                    <p className="text-xs text-[#545b64]">
                      {decodedDeviceName ? transformMachineCode(decodedDeviceName) : "Device"} · Live anomalies feed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#16191f]">{machineAlerts.length}</p>
                  <p className="text-xs text-[#545b64]">total alerts</p>
                </div>
              </div>

              {alertsLoading && (
                <div className="bg-white border border-[#d1d5db] rounded-lg p-6 text-center text-[#545b64]">
                  Loading alerts...
                </div>
              )}

              {alertsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700">
                  Unable to load alerts: {alertsError}
                </div>
              )}

              {!alertsLoading && !alertsError && machineAlerts.length === 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-lg p-8 text-center text-[#0b3b2e]">
                  <Shield className="w-10 h-10 mx-auto mb-3" />
                  <p className="text-lg font-semibold">No alerts detected</p>
                  <p className="text-sm text-[#1f4f3f]">This machine is currently healthy.</p>
                </div>
              )}

              {!alertsLoading && !alertsError && machineAlerts.length > 0 && (
                <div className="space-y-3">
                  {machineAlerts.map((alert) => (
                    <div
                      key={alert.createdAt + alert.message}
                      className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-sm flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#111827]">{alert.message}</p>
                        <p className="text-xs text-[#6b7280] mt-1">
                          {format(new Date(alert.createdAt), "PPpp")}
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
