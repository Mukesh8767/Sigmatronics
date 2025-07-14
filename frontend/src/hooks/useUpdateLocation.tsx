// hooks/useUpdateLocation.ts
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";

export const useUpdateLocation = () => {
  const updateLocation = async (machineId: string, loca: string) => {
    const response = await axiosInstance.put(`/api/device/updateLocation/${machineId}`, { loca });
    return response.data;
  };

  return { updateLocation };
};
