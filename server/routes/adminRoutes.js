import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  resetUserPassword,
  banUser,
  unbanUser,
  changeUserRole,
  verifyInstructor,
  deleteUser,
  getAllCourses,
  getCourseById,
  verifyCourse,
  rejectCourse,
  toggleFeaturedCourse,
  deleteCourse,
  getAllEnrollments,
  manuallyEnrollStudent,
  cancelEnrollment,
  getAllPayments,
  getAllQuizAttempts,
  issueCertificateManually,
  revokeCertificate,
  getAllReviews,
  deleteReview,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserByAdmin);
router.put('/users/:id/reset-password', resetUserPassword);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);
router.put('/users/:id/role', changeUserRole);
router.put('/users/:id/verify-instructor', verifyInstructor);
router.delete('/users/:id', deleteUser);

router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id/verify', verifyCourse);
router.put('/courses/:id/reject', rejectCourse);
router.put('/courses/:id/featured', toggleFeaturedCourse);
router.delete('/courses/:id', deleteCourse);

router.get('/enrollments', getAllEnrollments);
router.post('/enrollments', manuallyEnrollStudent);
router.delete('/enrollments/:id', cancelEnrollment);

router.get('/payments', getAllPayments);

router.get('/quiz-attempts', getAllQuizAttempts);

router.post('/certificates', issueCertificateManually);
router.delete('/certificates/:id', revokeCertificate);

router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

export default router;