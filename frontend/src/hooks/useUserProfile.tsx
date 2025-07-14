// hooks/useUserProfile.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { IUser } from '../types';
import axiosInstance from '../../utils/axiosInstance';

interface UseUserProfileResult {
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

export const useUserProfile = (userId: string): UseUserProfileResult => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/user/getUser/${userId}`);
        setUser(response.data.user);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch user');
        } else {
          setError('Unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    } else {
      setLoading(false);
      setError('User ID not provided');
    }
  }, [userId]);

  return { user, loading, error };
};
