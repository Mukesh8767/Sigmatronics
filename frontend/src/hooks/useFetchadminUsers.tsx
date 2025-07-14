// hooks/useFetchUser.ts
import React from "react";
import axiosInstance from "../../utils/axiosInstance";
import { config } from "../config/config";

export const useFetchUser = (page: number, limit: number = 10) => {
  const [userData, setUserData] = React.useState<{
    users: any[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await axiosInstance.get(
          `/api/user/getAllUsers?page=${page}&limit=${limit}`,
          {
            headers: {
              "Content-Type": "application/json",
             
            },
            
          withCredentials: true

          }
        );

        setUserData(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [page, limit]);

  return { ...userData, loading, error };
};

export const useAllFetchRootUsers = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await axiosInstance.get(
          `/api/user/getAllUsers`
        );
        const allUsers = response.data?.users || [];

        const rootUsers = allUsers.filter((user: any) => !user.parentUser);
        
        setUsers(rootUsers);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return { users, loading, error };
};
