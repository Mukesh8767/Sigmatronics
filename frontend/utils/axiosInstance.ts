import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://16.170.250.207:5000',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // console.log('[Axios Request] Adding access token to headers:', token);
      config.headers.Authorization = `${token}`; 
    } else {
      // console.log('[Axios Request] No access token found in localStorage.');
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // console.warn('[Axios Response] 401 received. Attempting to refresh token.');
      originalRequest._retry = true;

      try {
        // console.log('[Axios Refresh] Sending refresh request...');
        const refresh = await axiosInstance.post('/api/user/refreshToken'); 
        
        const newAccessToken = refresh.data.accessToken;
        // console.log('[Axios Refresh] New access token received:', newAccessToken);

        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `${newAccessToken}`; 

        console.log('[Axios Retry] Retrying original request with new token.');
        return axiosInstance(originalRequest); 
      } catch (refreshError) {
        // console.error('[Axios Refresh Error]', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    console.error('[Axios Response Error]', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
