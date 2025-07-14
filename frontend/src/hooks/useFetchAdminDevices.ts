
import React from "react";
import axiosInstance from "../../utils/axiosInstance";
interface Device {
  _id: string;
  machineId: string;
  machineName: string;
  assignedTo: string;
  solutionType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const useAllFetchDevices = () => {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDevices = async () => {
      try {
        

        const response = await axiosInstance.get(
          `/api/device/all-devices`
        );

        
        const allDevices = response.data.response || [];

        setDevices(allDevices);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return { devices, loading, error };
};
