import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export const useUpdateCapacity = () => {
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [capacitySuccess, setCapacitySuccess] = useState(false);

  const updateCapacity = async (machineId: string, capacity: number) => {
    setCapacityLoading(true);
    setCapacityError(null);
    setCapacitySuccess(false);

    try {
      const response = await axiosInstance.put(
        `/api/device/updateCapacity/${machineId}`,
        { capacity }
      );

      if (response.status === 200) {
        setCapacitySuccess(true);
      } else {
        throw new Error("Failed to update capacity");
      }
    } catch (err: any) {
      setCapacityError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setCapacityLoading(false);
    }
  };

  return {
    updateCapacity,
    capacityLoading,
    capacityError,
    capacitySuccess,
  };
};
