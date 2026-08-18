import api from './api.js';

export const getDashboardStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getAllUsers = async (params) => {
  const res = await api.get('/admin/users', { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
};

export const resetUserPassword = async (id, newPassword) => {
  const res = await api.put(`/admin/users/${id}/reset-password`, { newPassword });
  return res.data;
};

export const banUser = async (id) => {
  const res = await api.put(`/admin/users/${id}/ban`);
  return res.data;
};

export const unbanUser = async (id) => {
  const res = await api.put(`/admin/users/${id}/unban`);
  return res.data;
};

export const changeUserRole = async (id, role) => {
  const res = await api.put(`/admin/users/${id}/role`, { role });
  return res.data;
};

export const verifyInstructor = async (id) => {
  const res = await api.put(`/admin/users/${id}/verify-instructor`);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const getAllCourses = async (params) => {
  const res = await api.get('/admin/courses', { params });
  return res.data;
};

export const getCourseById = async (id) => {
  const res = await api.get(`/admin/courses/${id}`);
  return res.data;
};

export const verifyCourse = async (id) => {
  const res = await api.put(`/admin/courses/${id}/verify`);
  return res.data;
};

export const rejectCourse = async (id, reason) => {
  const res = await api.put(`/admin/courses/${id}/reject`, { reason });
  return res.data;
};

export const toggleFeaturedCourse = async (id) => {
  const res = await api.put(`/admin/courses/${id}/featured`);
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await api.delete(`/admin/courses/${id}`);
  return res.data;
};

export const getAllEnrollments = async (params) => {
  const res = await api.get('/admin/enrollments', { params });
  return res.data;
};

export const manuallyEnrollStudent = async (data) => {
  const res = await api.post('/admin/enrollments', data);
  return res.data;
};

export const cancelEnrollment = async (id) => {
  const res = await api.delete(`/admin/enrollments/${id}`);
  return res.data;
};

export const getAllPayments = async (params) => {
  const res = await api.get('/admin/payments', { params });
  return res.data;
};

export const issueCertificate = async (data) => {
  const res = await api.post('/admin/certificates', data);
  return res.data;
};

export const revokeCertificate = async (id) => {
  const res = await api.delete(`/admin/certificates/${id}`);
  return res.data;
};

export const getAllReviews = async (params) => {
  const res = await api.get('/admin/reviews', { params });
  return res.data;
};

export const deleteReview = async (id) => {
  const res = await api.delete(`/admin/reviews/${id}`);
  return res.data;
};