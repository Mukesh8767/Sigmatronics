import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useParams } from 'react-router-dom';

interface Alert {
  message: string;
  createdAt: string; 
  machineId:string;
}

export const useFetchLiveAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const {userId}=useParams();

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const res = await axiosInstance(`/api/alert/by-user/${userId}`);
        if (!res) {
          throw new Error('Failed to fetch alerts');
        }

        console.log(res);

        const data = res.data;

        const extractedAlerts = data.alerts.map((alert: any) => ({
          message: alert.message,
          createdAt: alert.createdAt,
          machineId:alert.machineId
        }));

        setAlerts(extractedAlerts);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userId]);

  return { alerts, loading, error };
};
