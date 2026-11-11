import axiosClient from './axiosClient';

export const doctorApi = {
  list: (params) => axiosClient.get('/doctors', { params }),
  getById: (id) => axiosClient.get(`/doctors/${id}`),
  create: (data) => axiosClient.post('/doctors', data),
  update: (id, data) => axiosClient.put(`/doctors/${id}`, data),
  remove: (id) => axiosClient.delete(`/doctors/${id}`),
  getAppointments: (id, params) => axiosClient.get(`/doctors/${id}/appointments`, { params }),
  getPatients: (id) => axiosClient.get(`/doctors/${id}/patients`),
};

export const departmentApi = {
  list: () => axiosClient.get('/departments'),
  getById: (id) => axiosClient.get(`/departments/${id}`),
  create: (data) => axiosClient.post('/departments', data),
  update: (id, data) => axiosClient.put(`/departments/${id}`, data),
  remove: (id) => axiosClient.delete(`/departments/${id}`),
};

export const appointmentApi = {
  list: (params) => axiosClient.get('/appointments', { params }),
  getById: (id) => axiosClient.get(`/appointments/${id}`),
  create: (data) => axiosClient.post('/appointments', data),
  update: (id, data) => axiosClient.put(`/appointments/${id}`, data),
  cancel: (id) => axiosClient.patch(`/appointments/${id}/cancel`),
  confirm: (id) => axiosClient.patch(`/appointments/${id}/confirm`),
  checkIn: (id) => axiosClient.patch(`/appointments/${id}/check-in`),
  checkOut: (id) => axiosClient.patch(`/appointments/${id}/complete`),
  complete: (id) => axiosClient.patch(`/appointments/${id}/complete`),
};

export const dashboardApi = {
  get: () => axiosClient.get('/dashboard'),
};
