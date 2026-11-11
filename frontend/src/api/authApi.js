import axiosClient from './axiosClient';

export const authApi = {
  login: (email, password) => axiosClient.post('/auth/login', { email, password }),
  logout: () => axiosClient.post('/auth/logout'),
  me: () => axiosClient.get('/auth/me'),
  refresh: () => axiosClient.post('/auth/refresh'),
  changePassword: (currentPassword, newPassword) =>
    axiosClient.post('/auth/change-password', { currentPassword, newPassword }),
};
