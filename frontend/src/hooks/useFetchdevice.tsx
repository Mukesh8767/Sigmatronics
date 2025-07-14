import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

interface AssignedUser {
  _id: string;
  name: string;
  email: string;
}

export interface Device {
  _id: string;
  machineId: string;
  assignedTo: AssignedUser;
  solutionType: string;
  loca: string;
  capacity?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  threshold?: number;
}

interface Stats {
  total: number;
  online: number;
  offline: number;
}

interface UseFetchDeviceReturn {
  devices: Device[];
  stats: Stats;
  loading: boolean;
  error: string | null;
}

export const useFetchDevice = (userId:string): UseFetchDeviceReturn => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, online: 0, offline: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/device/by-user/${userId}`);
        const deviceList: Device[] = response.data.devices || [];

        const onlineCount = deviceList.filter(d => d.status === 'active').length;
        const offlineCount = deviceList.filter(d => d.status === 'inactive').length;

        setDevices(deviceList);
        setStats({
          total: deviceList.length,
          online: onlineCount,
          offline: offlineCount,
        });
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || 'Error fetching devices');
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return { devices, stats, loading, error };
};