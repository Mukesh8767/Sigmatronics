import { useEffect, useState } from 'react';
import axios from 'axios';
import type { IUser } from '../types';
import axiosInstance from '../../utils/axiosInstance';
type Device = {
  machineId: string;
  name?: string;
  status?: string;
};
interface IUserWithDevices extends IUser {
  devices?: Device[];
}

interface UseSubUsersResult {
  subUsers: IUserWithDevices[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

export const useSubUsers = (
  page: number = 1,
  limit: number = 10,
  userId: string
): UseSubUsersResult => {
  const [subUsers, setSubUsers] = useState<IUserWithDevices []>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubUsers = async () => {
      setLoading(true);

      try {
        const response = await axiosInstance.get(
          `/api/user/getSubUser/${userId}?page=${page}&limit=${limit}`
        );

        setSubUsers(response.data.users);
        setTotalUsers(response.data.totalUsers);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch sub-users');
        } else {
          setError('Unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSubUsers();
    }
  }, [page, limit, userId]);

  return {
    subUsers,
    totalUsers,
    totalPages,
    currentPage,
    loading,
    error,
  };
};
