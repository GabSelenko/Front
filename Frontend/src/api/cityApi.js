import api from './axios';

export const cityApi = {
  getAll: () => api.get('/cities/all'),
  getById: (publicId) => api.get(`/cities/${publicId}`),
  create: (data) => api.post('/cities/new-city', data),
  update: (publicId, data) => api.put(`/cities/update/${publicId}`, data),
  remove: (publicId) => api.delete(`/cities/delete/${publicId}`),
};
