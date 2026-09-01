import api from './api.js';

export const getQuiz = async (courseId, quizId) => {
  const res = await api.get(`/student/courses/${courseId}/quiz/${quizId}`);
  return res.data;
};

export const getQuizForCourse = async (courseId) => {
  const res = await api.get(`/student/courses/${courseId}/quiz-for-course`);
  return res.data;
};

export const submitQuiz = async (courseId, quizId, answers) => {
  const res = await api.post(`/student/courses/${courseId}/quiz/${quizId}/submit`, { answers });
  return res.data;
};

export const getQuizAttempts = async (courseId) => {
  const res = await api.get(`/student/courses/${courseId}/quiz-attempts`);
  return res.data;
};

export const getCourseProgress = async (courseId) => {
  const res = await api.get(`/student/courses/${courseId}/progress`);
  return res.data;
};

export const getLessonToWatch = async (courseId, lessonId) => {
  const res = await api.get(`/student/courses/${courseId}/lessons/${lessonId}`);
  return res.data;
};

export const getMyEnrolledCourses = async () => {
  const res = await api.get('/student/my-courses');
  return res.data;
};
