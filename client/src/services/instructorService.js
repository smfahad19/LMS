import api from './api.js';

export const getInstructorDashboard = async () => {
  const res = await api.get('/instructor/dashboard');
  return res.data;
};

export const getMyCourses = async (params) => {
  const res = await api.get('/instructor/courses', { params });
  return res.data;
};

export const createCourse = async (data) => {
  const res = await api.post('/instructor/courses', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateCourse = async (id, data) => {
  const res = await api.put(`/instructor/courses/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await api.delete(`/instructor/courses/${id}`);
  return res.data;
};

export const requestPublish = async (id) => {
  const res = await api.put(`/instructor/courses/${id}/publish-request`);
  return res.data;
};

export const addLesson = async (courseId, data) => {
  const res = await api.post(`/instructor/courses/${courseId}/lessons`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateLesson = async (lessonId, data) => {
  const res = await api.put(`/instructor/lessons/${lessonId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteLesson = async (lessonId) => {
  const res = await api.delete(`/instructor/lessons/${lessonId}`);
  return res.data;
};

export const createQuiz = async (courseId, data) => {
  const res = await api.post(`/instructor/courses/${courseId}/quiz`, data);
  return res.data;
};

export const getMyEarnings = async () => {
  const res = await api.get('/instructor/earnings');
  return res.data;
};

export const getStripeStatus = async () => {
  const res = await api.get('/instructor/stripe/status');
  return res.data;
};

export const connectStripe = async () => {
  const res = await api.post('/instructor/stripe/connect');
  return res.data;
};

export const withdrawEarnings = async () => {
  const res = await api.post('/instructor/stripe/withdraw');
  return res.data;
};