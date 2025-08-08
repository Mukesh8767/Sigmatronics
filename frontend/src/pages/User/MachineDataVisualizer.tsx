import { useEffect, useState } from "react";
import { Back } from "../../components/BackButton";
import ReadingVisualizer from "../../components/ReadingVisualizer";
import UserWrapper from "../Wrappers/UserWrapper";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import axiosInstance from "../../../utils/axiosInstance";
import { useParams } from "react-router-dom";
import { decodeBase64 } from "../../../utils/base64"; // ✅ import

export const DataVisualiser = () => {
  let { deviceName } = useParams();

  deviceName = decodeBase64((deviceName || "").toString());
  console.log("Decoded device name:", deviceName);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [readings, setReadings] = useState<any[]>([]);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const res = await axiosInstance(`/api/deviceReading/availableDays/${deviceName}`);
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
  }, [deviceName]);

  useEffect(() => {
    const [from, to] = dateRange;
    if (!from || !to) return;

    const fromStr = format(from, "yyyy-MM-dd");
    const toStr = format(to, "yyyy-MM-dd");

    const fetchReadings = async () => {
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
      <div className="p-6 text-black">
        <Back />
        <h2 className="text-xl font-semibold mb-4">Machine Data Analysis</h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-gray-500 sm:hidden" />
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
        </div>
      </div>
      <div className="m-3">
        <ReadingVisualizer data={readings} />
      </div>
    </UserWrapper>
  );
};
