import api from './axios';

export const networkApi = {
  getAll: () => api.get('/network/all-networks'),
  getById: (publicId) => api.get(`/network/${publicId}`),
  create: (data) => api.post('/network/new-network', data),
  update: (publicId, data) => api.put(`/network/update/${publicId}`, data),
  remove: (publicId) => api.delete(`/network/delete/${publicId}`),
};
