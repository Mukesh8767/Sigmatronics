import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://qzfyp43wu5.execute-api.us-east-1.amazonaws.com',
    // baseURL:'http://localhost:5000',

 
  withCredentials: true,
});



axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLogin = originalRequest.url.includes('/login');
    const isRefresh = originalRequest.url.includes('/refreshToken');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLogin &&
      !isRefresh
    ) {
      originalRequest._retry = true;

      try {
        const refresh = await axiosInstance.post('api/user/refreshToken');
        const newAccessToken = refresh.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
