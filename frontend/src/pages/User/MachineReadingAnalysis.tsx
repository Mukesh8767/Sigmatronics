import { useEffect, useState } from "react";
import { Download } from "lucide-react";
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
import MapComponent from "../../components/MapComponent"; // Make sure this is correctly imported

export const MachineReadingAnalysis = () => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [readings, setReadings] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const { deviceName } = useParams();

  const decryptId = (encoded: string): string => {
    return atob(encoded);
  };
  const deviceId = decryptId(deviceName || '');

  useEffect(() => {
    const fetchAvailableDates = async () => {
      const res = await axiosInstance(`/api/deviceReading/availableDays/${deviceId}`);
      const data = res.data;
      setAvailableDates(data.dates);

      if (data.dates.length > 0) {
        const latest = new Date(data.dates[data.dates.length - 1]);
        setDateRange([latest, latest]);
      }
    };
    fetchAvailableDates();
  }, [deviceId]);

  useEffect(() => {
    const [from, to] = dateRange;
    if (!from || !to) return;

    const fetchReadings = async () => {
      const fromStr = format(from, "yyyy-MM-dd");
      const toStr = format(to, "yyyy-MM-dd");

      const res = await axiosInstance(
        `/api/deviceReading/readings/by-date/${deviceId}?from=${fromStr}&to=${toStr}`
      );
      const data = res.data;
      setReadings(data.readings || []);

      const allKeys = new Set<string>();
      data.readings.forEach((r: any) => {
        Object.keys(r.readings || {}).forEach((k) => allKeys.add(k));
      });
      setColumns(Array.from(allKeys));
    };

    fetchReadings();
  }, [dateRange, deviceId]);

  const isDateAvailable = (date: Date) => {
    const str = format(date, "yyyy-MM-dd");
    return availableDates.includes(str);
  };

  const handleDownloadExcel = () => {
    if (readings.length === 0 || !dateRange[0] || !dateRange[1]) return;

    const data = readings.map((r) => {
      const row: any = {
        Timestamp: new Date(r.timestamp).toLocaleString(),
      };
      columns.forEach((col) => {
        row[col] = r.readings?.[col] ?? "-";
      });
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

  const trackingCoordinates = readings
    .map((r) => {
      const lat = r.readings?.latitude;
      const lng = r.readings?.longitude;
      return lat != null && lng != null ? [lat, lng] as [number, number] : null;
    })
    .filter(Boolean) as [number, number][];

  return (
    <UserWrapper>
      <div className="p-4 sm:p-6">
        <Back />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Machine Reading Analysis
          </h1>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap text-black">
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
              className="border px-3 py-2 rounded-lg shadow-sm w-full sm:w-auto text-sm"
            />

            <Button
              onClick={handleDownloadExcel}
              disabled={readings.length === 0}
              variant="primary"
              className="hover:text-blue-400"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Readings {readings.length > 0 ? `(${readings.length})` : ""}
            </h2>
          </div>

          {readings.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-100">
                  {readings.map((r, idx) => (
                    <div key={idx} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          Entry {idx + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(r.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-3">
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {columns.map((col) => (
                          <div key={col} className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {col}:
                            </span>
                            <span className="text-sm text-gray-900">
                              {r.readings?.[col] ?? "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden sm:block">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-gray-700 font-semibold">
                    <tr>
                      <th className="px-6 py-3 text-left">Timestamp</th>
                      {columns.map((col) => (
                        <th key={col} className="px-6 py-3 text-left capitalize">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {readings.map((r, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-gray-800 whitespace-nowrap">
                          {new Date(r.timestamp).toLocaleString()}
                        </td>
                        {columns.map((col) => (
                          <td key={col} className="px-6 py-3 text-gray-800">
                            {r.readings?.[col] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <ListLoader />
            </div>
          )}
        </div>

        {/* MAP SECTION BELOW TABLE */}
        {trackingCoordinates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Tracking Map</h2>
            <MapComponent latlngs={trackingCoordinates} />
          </div>
        )}
      </div>
    </UserWrapper>
  );
};
