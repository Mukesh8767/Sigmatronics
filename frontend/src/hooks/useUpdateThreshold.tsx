import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export const useUpdateThreshold = () => {
  const [thresholdloading, setthresholdloading] = useState(false);
  const [thresholderror, setthresholderror] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateThreshold = async (machineId: string, threshold: number) => {
    setthresholdloading(true);
    setthresholderror(null);
    setSuccess(false);

    try {
      const response = await axiosInstance.put(
        `/api/device/updateThreshold/${machineId}`,
        { threshold }
      );

      if (response.status === 200) {
        setSuccess(true);
      } else {
        throw new Error("Failed to update threshold");
      }
    } catch (err: any) {
      setthresholderror(err.response?.data?.message || err.message || "An thresholderror occurred");
    } finally {
      setthresholdloading(false);
    }
  };

  return { updateThreshold, thresholdloading, thresholderror, success };
};
