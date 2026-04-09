import api from './axios';

export const quotationApi = {
  calculate: (data) => api.post('/quotations/calculate', data),
  save: (data) => api.post('/quotations/save', data),
  getMyQuotations: () => api.get('/quotations/my-quotations'),
  getById: (publicId) => api.get(`/quotations/${publicId}`),
  remove: (publicId) => api.delete(`/quotations/${publicId}`),
  exportCalculatedPdf: (data) =>
    api.post('/quotations/calculate/export-pdf', data, { responseType: 'blob' }),
  exportSavedPdf: (publicId) =>
    api.get(`/quotations/${publicId}/export-pdf`, { responseType: 'blob' }),
};
