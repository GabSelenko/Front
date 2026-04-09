import api from './axios';

export const healthPlanApi = {
  getAll: () => api.get('/health-plans/all'),
  getById: (publicId) => api.get(`/health-plans/${publicId}`),
  create: (data) => api.post('/health-plans/newHealthPlan', data),
  update: (publicId, data) => api.put(`/health-plans/updateHealthPlan/${publicId}`, data),
  remove: (publicId) => api.delete(`/health-plans/delete/${publicId}`),
  addNetworks: (publicId, networkIds) => api.put(`/health-plans/add-network/${publicId}`, networkIds),
};
