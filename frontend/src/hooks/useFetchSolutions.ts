import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";

export interface SolutionParameter {
  key: string;
  label?: string;
  type: string;
  unit?: string;
  color?: string;
  group?: string;
  alert?:boolean;
  threshold?: { min?: number; max?: number };
}

export interface Solution {
  _id: string;
  name: string;
  description: string;
  code: string;
  parameters: SolutionParameter[];
}

export interface SolutionData {
  name: string;
  description: string;
  code: string;
  parameters: SolutionParameter[];
}

export const useSolutions = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/create/allSolutions`);
      setSolutions(response.data.response);
      setError(null);
    } catch (err) {
      console.error("Error fetching solutions:", err);
      setError("Failed to fetch solutions");
    } finally {
      setLoading(false);
    }
  }, []);

  const createSolution = async (solutionData: SolutionData) => {
    try {
      await axiosInstance.post(`/api/create/solution`, solutionData);
      await fetchSolutions();
    } catch (err) {
      console.error("Error creating solution:", err);
      throw err;
    }
  };

  const updateSolution = async (id: string, solutionData: SolutionData) => {
    try {
      await axiosInstance.put(`/api/deviceReading/updateSolution/${id}`, solutionData);
      await fetchSolutions();
    } catch (err) {
      console.error("Error updating solution:", err);
      throw err;
    }
  };

  const deleteSolution = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/create/deleteSolution/${id}`);
      setSolutions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting solution:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  return {
    solutions,
    loading,
    error,
    fetchSolutions,
    createSolution,
    updateSolution,
    deleteSolution,
  };
};
