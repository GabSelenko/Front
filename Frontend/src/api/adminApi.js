import api from './axios';

export const adminApi = {
  getAllUsers: () => api.get('/admin/all'),
  getUser: (publicId) => api.get(`/admin/${publicId}`),
  blockUser: (publicId) => api.put(`/admin/block/${publicId}`),
  unblockUser: (publicId) => api.put(`/admin/unblock/${publicId}`),
  forceLogout: (publicId) => api.put(`/admin/force-logout/${publicId}`),
  deleteUser: (publicId) => api.delete(`/admin/delete/${publicId}`),
};
