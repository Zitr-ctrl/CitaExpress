import axios from 'axios';

const API_URL = 'http://localhost:5054/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then(res => res.data),
  register: (data: { name: string; email: string; password: string; phone: string }) =>
    api.post('/auth/register', data).then(res => res.data),
  me: () => api.get('/auth/me').then(res => res.data),
};

export const businessService = {
  getAll: () => api.get('/businesses').then(res => res.data),
  getById: (id: string) => api.get(`/businesses/${id}`).then(res => res.data),
  getMy: () => api.get('/businesses/my').then(res => res.data),
  create: (data: { name: string; description: string; address: string; phone: string; openTime?: string; closeTime?: string; slotDurationMinutes?: number }) =>
    api.post('/businesses', data).then(res => res.data),
  update: (id: string, data: { name: string; description: string; address: string; phone: string }) =>
    api.put(`/businesses/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/businesses/${id}`).then(res => res.data),
};

export const serviceService = {
  getByBusiness: (businessId: string) => api.get(`/businesses/${businessId}/services`).then(res => res.data),
  getById: (businessId: string, id: string) => api.get(`/businesses/${businessId}/services/${id}`).then(res => res.data),
  create: (businessId: string, data: { name: string; description: string; price: number; durationMinutes: number }) =>
    api.post(`/businesses/${businessId}/services`, data).then(res => res.data),
  update: (businessId: string, id: string, data: { name: string; description: string; price: number; durationMinutes: number }) =>
    api.put(`/businesses/${businessId}/services/${id}`, data).then(res => res.data),
  delete: (businessId: string, id: string) => api.delete(`/businesses/${businessId}/services/${id}`).then(res => res.data),
};

export const reservationService = {
  create: (data: { reservationDate: string; startTime: string; businessId: string; serviceId: string; notes?: string }) =>
    api.post('/reservations', data).then(res => res.data),
  getById: (id: string) => api.get(`/reservations/${id}`).then(res => res.data),
  getMy: () => api.get('/reservations/my').then(res => res.data),
  getByBusiness: (businessId: string) => api.get(`/reservations/business/${businessId}`).then(res => res.data),
  cancel: (id: string) => api.post(`/reservations/${id}/cancel`).then(res => res.data),
  getAvailableSlots: (businessId: string, date: string) =>
    api.get(`/reservations/slots/${businessId}?date=${date}`).then(res => res.data),
};

export const adminService = {
  getAllUsers: () => api.get('/users').then(res => res.data),
  deleteUser: (id: string) => api.delete(`/users/${id}`).then(res => res.data),
  getMyReservations: () => api.get('/reservations/owner/all').then(res => res.data),
  cancelReservation: (id: string) => api.post(`/reservations/${id}/admin-cancel`).then(res => res.data),
};

export default api;