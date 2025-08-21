import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export interface Alert {
  message: string;
  createdAt: string;
  machineId: string;
}

interface AlertsApiResponse {
  alerts: Alert[];
}

export const useFetchLiveAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useParams();

  useEffect(() => {
    if (!userId) return;

    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axiosInstance.get<AlertsApiResponse>(
          `/api/alert/by-user/${userId}`
        );


        if (!res.data || !Array.isArray(res.data.alerts)) {
          throw new Error("Invalid alerts response format");
        }

        // Assign alerts directly (no need to remap if API matches interface)
        setAlerts(res.data.alerts);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userId]);

  return { alerts, loading, error };
};
