import { useEffect, useState } from "react";
import { Back } from "../../components/BackButton";
import ReadingVisualizer from "../../components/ReadingVisualizer";
import UserWrapper from "../Wrappers/UserWrapper";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import axiosInstance from "../../../utils/axiosInstance";
import { useParams } from "react-router-dom";
import { decodeBase64 } from "../../../utils/base64";
import { transformMachineCode } from "../../components/machineCodeEncoder";

export const DataVisualiser = () => {
  let { deviceName } = useParams();

  deviceName = decodeBase64((deviceName || "").toString());
  console.log("Decoded device name:", deviceName);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [readings, setReadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const res = await axiosInstance(`/api/deviceReading/availableDays/${deviceName}`);
        const data = res.data;
        console.log("Available dates:", data.dates);
        setAvailableDates(data.dates || []);

        if (data.dates.length > 0) {
          const latest = new Date(data.dates[data.dates.length - 1]);
          setDateRange([latest, latest]);
        }
      } catch (error) {
        console.error("Error fetching available dates:", error);
      }
    };

    if (deviceName) {
      fetchAvailableDates();
    }
  }, [deviceName]);

  useEffect(() => {
    const [from, to] = dateRange;
    if (!from || !to || !deviceName) return;

    const fromStr = format(from, "yyyy-MM-dd");
    const toStr = format(to, "yyyy-MM-dd");

    const fetchReadings = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance(
          `/api/deviceReading/readings/by-date/${deviceName}?from=${fromStr}&to=${toStr}`
        );

        const data = res.data;

        if (data.readings && data.readings.length > 0 && data.solution) {
          const solution = data.solution;

          const transformed = data.readings.map((r: any) => ({
            reading: r.readings,
            createdAt: r.createdAt,
            timestamp: r.timestamp,
            solution: solution,
          }));

          setReadings(transformed);
        } else {
          setReadings([]);
        }
      } catch (error) {
        console.error("Error fetching readings:", error);
        setReadings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadings();

    const intervalId = setInterval(fetchReadings, 10000);

    return () => clearInterval(intervalId);
  }, [dateRange, deviceName]);

  const isDateAvailable = (date: Date) => {
    const str = format(date, "yyyy-MM-dd");
    return availableDates.includes(str);
  };

  return (
    <UserWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col space-y-4">
              <Back />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Machine Data Analysis
                  </h1>
                  {deviceName && (
                    <p className="text-sm text-gray-500 mt-1">
                      Device: {transformMachineCode(deviceName)}
                    </p>
                  )}
                </div>
                
                {/* Date Range Picker */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Range:
                  </label>
                  <div className="relative text-black">
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
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[200px]"
                      wrapperClassName="w-full sm:w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm">Loading data...</span>
                </div>
              </div>
            ) : readings.length > 0 ? (
              <div className="p-6">
                <ReadingVisualizer data={readings} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-sm">No data available for the selected date range</p>
                {availableDates.length > 0 && (
                  <p className="text-xs mt-1">
                    Try selecting from available dates: {availableDates.slice(-3).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </UserWrapper>
  );
};