import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getInstructorProfile,
  updateInstructorProfile,
  uploadAvatar,
  changePassword,
  getPublicProfile,
  getInstructorDashboard,
  getMyCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  requestPublish,
  addLesson,
  updateLesson,
  deleteLesson,
  updateLessonOrder,
  addResource,
  deleteResource,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getEnrolledStudents,
  getCourseAnalytics,
  getMyEarnings,
  connectStripe,
  getStripeStatus,
  withdrawEarnings,
  getCourseQnA,
  replyToQuestion,
  resolveQuestion,
} from '../controllers/instructorController.js';

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'lms/avatars', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
});

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'lms/thumbnails', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
  },
});

const resourceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/resources',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadThumbnail = multer({ storage: thumbnailStorage });
const uploadVideo = multer({ storage: videoStorage });
const uploadResource = multer({ storage: resourceStorage });

const router = express.Router();

router.get('/public/:id', getPublicProfile);

router.use(protect, authorizeRoles('instructor'));

router.get('/profile', getInstructorProfile);
router.put('/profile', updateInstructorProfile);
router.put('/profile/avatar', uploadImage.single('avatar'), uploadAvatar);
router.put('/profile/password', changePassword);

router.get('/dashboard', getInstructorDashboard);
router.get('/earnings', getMyEarnings);

router.get('/stripe/status', getStripeStatus);
router.post('/stripe/connect', connectStripe);
router.post('/stripe/withdraw', withdrawEarnings);

router.get('/courses', getMyCourses);
router.post('/courses', uploadThumbnail.single('thumbnail'), createCourse);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id', uploadThumbnail.single('thumbnail'), updateCourse);
router.delete('/courses/:id', deleteCourse);
router.put('/courses/:id/publish-request', requestPublish);

router.post('/courses/:courseId/lessons', uploadVideo.single('video'), addLesson);
router.put('/courses/:courseId/lessons/order', updateLessonOrder);
router.put('/lessons/:lessonId', uploadVideo.single('video'), updateLesson);
router.delete('/lessons/:lessonId', deleteLesson);
router.post('/lessons/:lessonId/resources', uploadResource.single('resource'), addResource);
router.delete('/lessons/:lessonId/resources/:resourceId', deleteResource);

router.post('/courses/:courseId/quiz', createQuiz);
router.put('/quiz/:quizId', updateQuiz);
router.delete('/quiz/:quizId', deleteQuiz);

router.get('/courses/:courseId/students', getEnrolledStudents);
router.get('/courses/:courseId/analytics', getCourseAnalytics);

router.get('/courses/:courseId/qna', getCourseQnA);
router.post('/qna/:qnaId/reply', replyToQuestion);
router.put('/qna/:qnaId/resolve', resolveQuestion);

export default router;