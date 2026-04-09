import api from './axios';

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile/update', data),
  changeEmail: (data) => api.post('/users/profile/change-email', data),
  deleteAccount: () => api.delete('/users/profile/delete'),
};
