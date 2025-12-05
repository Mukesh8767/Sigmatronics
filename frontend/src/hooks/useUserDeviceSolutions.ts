import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface DeviceSolution {
  solutionType: string;
  freq: number;
  solutionName?: string;
}
// interface ParameterType {
//   key: string;
//   label: string;
//   unit: string;
//   type: string; // e.g., "line", "bar", etc.
//   color: string;
//   group: string;
//   threshold: {
//     min: number;
//     max: number;
//   };
//   alert: boolean;
//   reading: number;
// }

export const useUserDeviceSolutions = (userId: string) => {
  const [solutions, setSolutions] = useState<DeviceSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolutions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/api/device/userDevices/${userId}`);
        setSolutions(res.data.solutions || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch solutions");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSolutions();
    }
  }, [userId]);

  return { solutions, loading, error };
};
export type DeviceType = {
  _id: string;
  machineId: string;
  loca: string;
  latitude?: number;
  longitude?: number;
  status: string;
  createdAt: string;
  parameters?: Array<{
    key: string;
    label: string;
    reading?: number;
    unit?: string;
    threshold?: {
      min?: number;
      max?: number;
    };
    [key: string]: any;
  }>;
  [key: string]: any;
};



export const useDevicesBySolution = (
  userId: string,
  solution: string,
  refreshKey = 0
) => {
  const [devices, setDevices] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !solution) return;

    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `/api/device/userDevicesBySolution/${userId}/${solution}`
        );
        setDevices(res.data.Devices || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch devices");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [userId, solution, refreshKey]);

  return { devices, loading, error };
};
