import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadAvatar,
  changePassword,
  getStudentDashboard,
  getAllCourses,
  getFeaturedCourses,
  getCourseDetail,
  enrollFreeCourse,
  getMyEnrolledCourses,
  getCourseProgress,
  getLessonToWatch,
  saveVideoProgress,
  markLessonComplete,
  getQuiz,
  submitQuiz,
  getQuizAttempts,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  getMyPayments,
  requestRefund,
  addReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  addNote,
  deleteNote,
  getNotes,
  addBookmark,
  removeBookmark,
  getBookmarks,
  askQuestion,
  getCourseQnA,
  getFreePreviewLesson,
} from '../controllers/studentController.js';

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'lms/avatars', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
});

const uploadImage = multer({ storage: avatarStorage });
const router = express.Router();

router.get('/courses', getAllCourses);
router.get('/courses/featured', getFeaturedCourses);
router.get('/courses/:id', getCourseDetail);
router.get('/lessons/:lessonId/preview', getFreePreviewLesson);
router.get('/certificates/verify/:shareToken', verifyCertificate);

router.use(protect, authorizeRoles('student'));

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.put('/profile/avatar', uploadImage.single('avatar'), uploadAvatar);
router.put('/profile/password', changePassword);

router.get('/dashboard', getStudentDashboard);

router.post('/courses/:id/enroll', enrollFreeCourse);
router.get('/my-courses', getMyEnrolledCourses);

router.get('/courses/:courseId/progress', getCourseProgress);
router.get('/courses/:courseId/lessons/:lessonId', getLessonToWatch);
router.put('/courses/:courseId/lessons/:lessonId/progress', saveVideoProgress);
router.post('/courses/:courseId/lessons/:lessonId/complete', markLessonComplete);

router.get('/courses/:courseId/quiz/:quizId', getQuiz);
router.post('/courses/:courseId/quiz/:quizId/submit', submitQuiz);
router.get('/courses/:courseId/quiz-attempts', getQuizAttempts);

router.get('/certificates', getMyCertificates);
router.get('/certificates/:id', getCertificateById);

router.get('/payments', getMyPayments);
router.post('/payments/:paymentId/refund', requestRefund);

router.post('/courses/:courseId/review', addReview);
router.put('/reviews/:reviewId', updateReview);
router.delete('/reviews/:reviewId', deleteReview);
router.get('/my-reviews', getMyReviews);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:courseId', addToWishlist);
router.delete('/wishlist/:courseId', removeFromWishlist);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

router.get('/courses/:courseId/notes', getNotes);
router.post('/courses/:courseId/lessons/:lessonId/notes', addNote);
router.delete('/courses/:courseId/notes/:noteId', deleteNote);

router.get('/courses/:courseId/bookmarks', getBookmarks);
router.post('/courses/:courseId/lessons/:lessonId/bookmark', addBookmark);
router.delete('/courses/:courseId/lessons/:lessonId/bookmark', removeBookmark);

router.get('/courses/:courseId/qna', getCourseQnA);
router.post('/courses/:courseId/qna', askQuestion);

export default router;