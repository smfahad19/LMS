import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';
import Certificate from '../models/Certificate.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import QnA from '../models/QnA.js';

export const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id).select('-password');
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.status(200).json(student);
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  student.name = req.body.name || student.name;
  student.bio = req.body.bio || student.bio;
  student.avatar = req.body.avatar || student.avatar;

  const updated = await student.save();
  res.status(200).json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    bio: updated.bio,
    avatar: updated.avatar,
    role: updated.role,
  });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const student = await User.findById(req.user._id);

  if (student.avatar && student.avatar.includes('cloudinary')) {
    const publicId = student.avatar.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }

  student.avatar = req.file.path;
  await student.save();

  res.status(200).json({ avatar: student.avatar });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const student = await User.findById(req.user._id).select('+password');

  if (student.authProvider === 'google') {
    res.status(400);
    throw new Error('Google account password cannot be changed here');
  }

  const isMatch = await student.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  student.password = newPassword;
  await student.save();
  

  res.status(200).json({ message: 'Password changed successfully' });
});

export const getStudentDashboard = asyncHandler(async (req, res) => {
  const totalEnrolled = await Enrollment.countDocuments({ student: req.user._id });
  const completed = await Enrollment.countDocuments({ student: req.user._id, isCompleted: true });
  const inProgress = totalEnrolled - completed;
  const totalCertificates = await Certificate.countDocuments({ student: req.user._id });

  const recentEnrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      select: 'title thumbnail instructor category',
      populate: { path: 'instructor', select: 'name avatar' },
    })
    .select('course completionPercentage isCompleted lastWatchedLesson createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const quizStats = await Enrollment.aggregate([
    { $match: { student: req.user._id } },
    { $unwind: '$quizAttempts' },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        passed: { $sum: { $cond: ['$quizAttempts.passed', 1, 0] } },
        avgScore: { $avg: '$quizAttempts.score' },
      },
    },
  ]);

  const unreadNotifications = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    totalEnrolled,
    completed,
    inProgress,
    totalCertificates,
    recentEnrollments,
    quizStats: quizStats[0] || { totalAttempts: 0, passed: 0, avgScore: 0 },
    unreadNotifications,
  });
});

export const getAllCourses = asyncHandler(async (req, res) => {
  const { search, category, difficulty, minPrice, maxPrice, rating, page = 1, limit = 12 } = req.query;

  const query = { isPublished: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }
  if (rating) query.ratingAvg = { $gte: Number(rating) };

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'name avatar isVerifiedInstructor')
    .select('title thumbnail category difficulty price duration ratingAvg ratingCount enrolledCount isFeatured')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ isFeatured: -1, createdAt: -1 });

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    courses,
  });
});

export const getFeaturedCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true, isFeatured: true })
    .populate('instructor', 'name avatar isVerifiedInstructor')
    .select('title thumbnail category difficulty price duration ratingAvg enrolledCount')
    .limit(8)
    .sort({ createdAt: -1 });

  res.status(200).json(courses);
});

export const getCourseDetail = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, isPublished: true })
    .populate('instructor', 'name avatar bio isVerifiedInstructor')
    .populate({
      path: 'lessons',
      select: 'title duration order isFreePreview',
      options: { sort: { order: 1 } },
    });

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const reviews = await Review.find({ course: course._id })
    .populate('student', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  let isEnrolled = false;
  let enrollment = null;

  if (req.user) {
    enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });
    isEnrolled = !!enrollment;
  }

  res.status(200).json({ course, reviews, isEnrolled, enrollment });
});

export const enrollFreeCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (!course.isPublished) {
    res.status(400);
    throw new Error('Course is not available');
  }

  if (course.price > 0) {
    res.status(400);
    throw new Error('This is a paid course — complete payment first');
  }

  const alreadyEnrolled = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  });

  if (alreadyEnrolled) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
  });

  await Course.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });

  await Notification.create({
    user: req.user._id,
    title: 'Enrollment Successful',
    message: `You have successfully enrolled in ${course.title}`,
    type: 'enrollment',
    link: `/courses/${course._id}`,
  });

  res.status(201).json({ message: 'Enrolled successfully', enrollment });
});

export const getMyEnrolledCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { student: req.user._id };
  if (status === 'completed') query.isCompleted = true;
  if (status === 'inprogress') query.isCompleted = false;

  const total = await Enrollment.countDocuments(query);
  const enrollments = await Enrollment.find(query)
    .populate({
      path: 'course',
      select: 'title thumbnail instructor category difficulty duration',
      populate: { path: 'instructor', select: 'name avatar' },
    })
    .select('course completionPercentage isCompleted lastWatchedLesson lastWatchedTime createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ updatedAt: -1 });

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    enrollments,
  });
});

export const getCourseProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  })
    .populate('completedLessons', 'title order duration')
    .populate('lastWatchedLesson', 'title order videoUrl')
    .populate('quizAttempts.quiz', 'title passingScore');

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });

  res.status(200).json({
    enrollment,
    totalLessons,
    completedLessonsCount: enrollment.completedLessons.length,
    completionPercentage: enrollment.completionPercentage,
    isCompleted: enrollment.isCompleted,
    certificateIssued: enrollment.certificateIssued,
    lastWatchedLesson: enrollment.lastWatchedLesson,
    lastWatchedTime: enrollment.lastWatchedTime,
  });
});

export const getLessonToWatch = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const lesson = await Lesson.findOne({
    _id: req.params.lessonId,
    course: req.params.courseId,
  }).populate('resources');

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  enrollment.lastWatchedLesson = lesson._id;
  await enrollment.save();

  res.status(200).json({
    lesson,
    lastWatchedTime: enrollment.lastWatchedTime || 0,
  });
});

export const saveVideoProgress = asyncHandler(async (req, res) => {
  const { lastWatchedTime } = req.body;

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  enrollment.lastWatchedLesson = req.params.lessonId;
  enrollment.lastWatchedTime = lastWatchedTime || 0;
  await enrollment.save();

  res.status(200).json({ message: 'Progress saved' });
});

export const markLessonComplete = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const alreadyCompleted = enrollment.completedLessons.some(
    (l) => l.toString() === lesson._id.toString()
  );

  if (!alreadyCompleted) {
    enrollment.completedLessons.push(lesson._id);
  }

  const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });
  enrollment.completionPercentage = Math.round(
    (enrollment.completedLessons.length / totalLessons) * 100
  );

  if (enrollment.completionPercentage === 100) {
    const quiz = await Quiz.findOne({ course: req.params.courseId });

    let quizPassed = true;

    if (quiz) {
      const attempts = enrollment.quizAttempts.filter(
        (a) => a.quiz.toString() === quiz._id.toString()
      );
      const passedAttempt = attempts.find((a) => a.passed === true);
      quizPassed = !!passedAttempt;
    }

    if (quizPassed) {
      enrollment.isCompleted = true;

      const existingCertificate = await Certificate.findOne({
        student: req.user._id,
        course: req.params.courseId,
      });

      if (!existingCertificate) {
        const shareToken = uuidv4();
        await Certificate.create({
          student: req.user._id,
          course: req.params.courseId,
          certificateId: uuidv4(),
          shareToken,
        });

        enrollment.certificateIssued = true;

        await Notification.create({
          user: req.user._id,
          title: 'Certificate Issued',
          message: `Congratulations! Your certificate for ${lesson.title} is ready`,
          type: 'certificate',
          link: `/certificates`,
        });
      }
    }
  }

  enrollment.lastWatchedLesson = lesson._id;
  await enrollment.save();

  res.status(200).json({
    message: alreadyCompleted ? 'Lesson already completed' : 'Lesson marked as complete',
    completionPercentage: enrollment.completionPercentage,
    isCompleted: enrollment.isCompleted,
    certificateIssued: enrollment.certificateIssued,
  });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const quiz = await Quiz.findById(req.params.quizId).select('-questions.correctAnswer');

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const attempts = enrollment.quizAttempts.filter(
    (a) => a.quiz.toString() === quiz._id.toString()
  );

  if (quiz.maxAttempts > 0 && attempts.length >= quiz.maxAttempts) {
    res.status(400);
    throw new Error(`Maximum ${quiz.maxAttempts} attempts allowed for this quiz`);
  }

  res.status(200).json({
    quiz,
    attemptsTaken: attempts.length,
    maxAttempts: quiz.maxAttempts,
    passed: attempts.some((a) => a.passed),
  });
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const attempts = enrollment.quizAttempts.filter(
    (a) => a.quiz.toString() === quiz._id.toString()
  );

  if (quiz.maxAttempts > 0 && attempts.length >= quiz.maxAttempts) {
    res.status(400);
    throw new Error(`Maximum ${quiz.maxAttempts} attempts allowed`);
  }

  let totalPoints = 0;
  let earnedPoints = 0;
  const results = [];

  for (const question of quiz.questions) {
    totalPoints += question.points;
    const studentAnswer = answers[question._id?.toString()];
    const isCorrect =
      studentAnswer?.toString().toLowerCase() === question.correctAnswer.toLowerCase();

    if (isCorrect) earnedPoints += question.points;

    results.push({
      questionText: question.questionText,
      yourAnswer: studentAnswer || 'Not answered',
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: question.points,
    });
  }

  const score = Math.round((earnedPoints / totalPoints) * 100);
  const passed = score >= quiz.passingScore;

  enrollment.quizAttempts.push({
    quiz: quiz._id,
    score,
    passed,
    attemptedAt: new Date(),
  });

  if (passed && enrollment.completionPercentage === 100) {
    enrollment.isCompleted = true;

    const existingCertificate = await Certificate.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });

    if (!existingCertificate) {
      const shareToken = uuidv4();
      await Certificate.create({
        student: req.user._id,
        course: req.params.courseId,
        certificateId: uuidv4(),
        shareToken,
      });

      enrollment.certificateIssued = true;

      await Notification.create({
        user: req.user._id,
        title: 'Certificate Issued',
        message: `Congratulations! You passed the quiz and your certificate is ready`,
        type: 'certificate',
        link: `/certificates`,
      });
    }
  }

  await enrollment.save();

  res.status(200).json({
    score,
    passed,
    passingScore: quiz.passingScore,
    earnedPoints,
    totalPoints,
    results,
    message: passed
      ? 'Congratulations! You passed the quiz'
      : `You need ${quiz.passingScore}% to pass. Try again!`,
  });
});

export const getQuizAttempts = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  }).populate('quizAttempts.quiz', 'title passingScore');

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  res.status(200).json({ quizAttempts: enrollment.quizAttempts });
});

export const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id })
    .populate('course', 'title thumbnail instructor duration category')
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json(certificates);
});

export const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    _id: req.params.id,
    student: req.user._id,
  })
    .populate('course', 'title thumbnail instructor duration category')
    .populate('student', 'name email');

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  res.status(200).json(certificate);
});

export const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    shareToken: req.params.shareToken,
  })
    .populate('course', 'title thumbnail instructor duration category')
    .populate('student', 'name');

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found or invalid');
  }

  res.status(200).json({
    valid: true,
    certificate,
  });
});

export const getMyPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const total = await Payment.countDocuments({
    student: req.user._id,
    status: 'succeeded',
  });

  const payments = await Payment.find({
    student: req.user._id,
    status: 'succeeded',
  })
    .populate('course', 'title thumbnail instructor')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    payments,
  });
});

export const requestRefund = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    student: req.user._id,
    status: 'succeeded',
  });

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.withdrawn) {
    res.status(400);
    throw new Error('Cannot refund — earnings already withdrawn by instructor');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: payment.course,
  });

  if (enrollment && enrollment.completionPercentage > 30) {
    res.status(400);
    throw new Error('Cannot refund — more than 30% of course completed');
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
  });

  payment.status = 'refunded';
  await payment.save();

  if (enrollment) {
    await Course.findByIdAndUpdate(payment.course, { $inc: { enrolledCount: -1 } });
    await enrollment.deleteOne();
  }

  await Notification.create({
    user: req.user._id,
    title: 'Refund Processed',
    message: 'Your refund has been processed successfully',
    type: 'payment',
    link: `/payments`,
  });

  res.status(200).json({
    message: 'Refund processed successfully',
    refundId: refund.id,
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled to review this course');
  }

  const alreadyReviewed = await Review.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this course');
  }

  const review = await Review.create({
    student: req.user._id,
    course: req.params.courseId,
    rating,
    comment,
  });

  const allReviews = await Review.find({ course: req.params.courseId });
  const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

  await Course.findByIdAndUpdate(req.params.courseId, {
    ratingAvg: Math.round(avgRating * 10) / 10,
    ratingCount: allReviews.length,
  });

  res.status(201).json(review);
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    student: req.user._id,
  });

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.rating = req.body.rating || review.rating;
  review.comment = req.body.comment || review.comment;
  const updated = await review.save();

  const allReviews = await Review.find({ course: review.course });
  const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

  await Course.findByIdAndUpdate(review.course, {
    ratingAvg: Math.round(avgRating * 10) / 10,
  });

  res.status(200).json(updated);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    student: req.user._id,
  });

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const courseId = review.course;
  await review.deleteOne();

  const allReviews = await Review.find({ course: courseId });
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
      : 0;

  await Course.findByIdAndUpdate(courseId, {
    ratingAvg: Math.round(avgRating * 10) / 10,
    ratingCount: allReviews.length,
  });

  res.status(200).json({ message: 'Review deleted successfully' });
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ student: req.user._id })
    .populate('course', 'title thumbnail')
    .sort({ createdAt: -1 });

  res.status(200).json(reviews);
});

export const getWishlist = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'title thumbnail instructor category difficulty price ratingAvg enrolledCount',
    populate: { path: 'instructor', select: 'name avatar' },
  });

  res.status(200).json(student.wishlist);
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const student = await User.findById(req.user._id);

  const alreadyInWishlist = student.wishlist.includes(req.params.courseId);
  if (alreadyInWishlist) {
    res.status(400);
    throw new Error('Course already in wishlist');
  }

  student.wishlist.push(req.params.courseId);
  await student.save();

  res.status(200).json({ message: 'Course added to wishlist' });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id);

  student.wishlist = student.wishlist.filter(
    (id) => id.toString() !== req.params.courseId
  );

  await student.save();

  res.status(200).json({ message: 'Course removed from wishlist' });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const total = await Notification.countDocuments({ user: req.user._id });
  const notifications = await Notification.find({ user: req.user._id })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    notifications,
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true }
  );

  res.status(200).json({ message: 'Notification marked as read' });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });

  res.status(200).json({ message: 'All notifications marked as read' });
});

export const addNote = asyncHandler(async (req, res) => {
  const { content, timestamp } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Note content is required');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  enrollment.notes.push({
    lesson: req.params.lessonId,
    content,
    timestamp: timestamp || 0,
  });

  await enrollment.save();

  res.status(201).json({ message: 'Note added', notes: enrollment.notes });
});

export const deleteNote = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  enrollment.notes = enrollment.notes.filter(
    (n) => n._id.toString() !== req.params.noteId
  );

  await enrollment.save();

  res.status(200).json({ message: 'Note deleted', notes: enrollment.notes });
});

export const getNotes = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  }).populate('notes.lesson', 'title order');

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  res.status(200).json({ notes: enrollment.notes });
});

export const addBookmark = asyncHandler(async (req, res) => {
  const { timestamp, note } = req.body;

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const alreadyBookmarked = enrollment.bookmarks.find(
    (b) => b.lesson.toString() === req.params.lessonId
  );

  if (alreadyBookmarked) {
    res.status(400);
    throw new Error('Lesson already bookmarked');
  }

  enrollment.bookmarks.push({
    lesson: req.params.lessonId,
    timestamp: timestamp || 0,
    note: note || '',
  });

  await enrollment.save();

  res.status(201).json({ message: 'Bookmark added', bookmarks: enrollment.bookmarks });
});

export const removeBookmark = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  enrollment.bookmarks = enrollment.bookmarks.filter(
    (b) => b.lesson.toString() !== req.params.lessonId
  );

  await enrollment.save();

  res.status(200).json({ message: 'Bookmark removed', bookmarks: enrollment.bookmarks });
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  }).populate('bookmarks.lesson', 'title order duration');

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  res.status(200).json({ bookmarks: enrollment.bookmarks });
});

export const askQuestion = asyncHandler(async (req, res) => {
  const { question, lessonId } = req.body;

  if (!question) {
    res.status(400);
    throw new Error('Question is required');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const course = await Course.findById(req.params.courseId);

  const qna = await QnA.create({
    course: req.params.courseId,
    lesson: lessonId || null,
    student: req.user._id,
    question,
  });

  await Notification.create({
    user: course.instructor,
    title: 'New Question',
    message: `${req.user.name} asked a question in ${course.title}`,
    type: 'enrollment',
    link: `/instructor/courses/${course._id}/qna`,
  });

  res.status(201).json(qna);
});

export const getCourseQnA = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const { page = 1, limit = 10 } = req.query;
  const total = await QnA.countDocuments({ course: req.params.courseId });

  const questions = await QnA.find({ course: req.params.courseId })
    .populate('student', 'name avatar')
    .populate('lesson', 'title')
    .populate('replies.user', 'name avatar role')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    questions,
  });
});

export const getFreePreviewLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findOne({
    _id: req.params.lessonId,
    isFreePreview: true,
  }).select('title videoUrl duration order');

  if (!lesson) {
    res.status(404);
    throw new Error('Free preview not available for this lesson');
  }

  res.status(200).json(lesson);
});