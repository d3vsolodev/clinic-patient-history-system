import axiosClient from './axiosClient';

export const patientApi = {
  list: (params) => axiosClient.get('/patients', { params }),
  getById: (id) => axiosClient.get(`/patients/${id}`),
  getProfile: (id) => axiosClient.get(`/patients/${id}/profile`),
  getTimeline: (id) => axiosClient.get(`/patients/${id}/timeline`),
  getMedicalHistory: (id) => axiosClient.get(`/patients/${id}/medical-history`),
  getAppointments: (id) => axiosClient.get(`/patients/${id}/appointments`),
  getPrescriptions: (id) => axiosClient.get(`/patients/${id}/prescriptions`),
  getLabResults: (id) => axiosClient.get(`/patients/${id}/lab-results`),
  getBilling: (id) => axiosClient.get(`/patients/${id}/billing`),
  create: (data) => axiosClient.post('/patients', data),
  update: (id, data) => axiosClient.put(`/patients/${id}`, data),
  remove: (id) => axiosClient.delete(`/patients/${id}`),
};
