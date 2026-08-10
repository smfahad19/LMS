import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';
import Payment from '../models/Payment.js';
import Certificate from '../models/Certificate.js';
import QnA from '../models/QnA.js';
import Notification from '../models/Notification.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getInstructorProfile = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.user._id).select('-password');
  if (!instructor) {
    res.status(404);
    throw new Error('Instructor not found');
  }
  res.status(200).json(instructor);
});

export const updateInstructorProfile = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.user._id);
  if (!instructor) {
    res.status(404);
    throw new Error('Instructor not found');
  }

  instructor.name = req.body.name || instructor.name;
  instructor.bio = req.body.bio || instructor.bio;
  instructor.avatar = req.body.avatar || instructor.avatar;

  const updated = await instructor.save();
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

  const instructor = await User.findById(req.user._id);

  if (instructor.avatar && instructor.avatar.includes('cloudinary')) {
    const publicId = instructor.avatar.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }

  instructor.avatar = req.file.path;
  await instructor.save();

  res.status(200).json({ avatar: instructor.avatar });
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

  const instructor = await User.findById(req.user._id).select('+password');

  if (instructor.authProvider === 'google') {
    res.status(400);
    throw new Error('Google account password cannot be changed here');
  }

  const isMatch = await instructor.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  instructor.password = newPassword;
  await instructor.save();

  res.status(200).json({ message: 'Password changed successfully' });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.params.id).select(
    'name bio avatar role isVerifiedInstructor createdAt'
  );

  if (!instructor || instructor.role !== 'instructor') {
    res.status(404);
    throw new Error('Instructor not found');
  }

  const courses = await Course.find({
    instructor: instructor._id,
    isPublished: true,
  }).select('title thumbnail ratingAvg enrolledCount difficulty category');

  const totalStudents = await Enrollment.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseData',
      },
    },
    { $unwind: '$courseData' },
    { $match: { 'courseData.instructor': instructor._id } },
    { $count: 'total' },
  ]);

  res.status(200).json({
    instructor,
    courses,
    totalStudents: totalStudents[0]?.total || 0,
    totalCourses: courses.length,
  });
});

export const getInstructorDashboard = asyncHandler(async (req, res) => {
  const totalCourses = await Course.countDocuments({ instructor: req.user._id });
  const publishedCourses = await Course.countDocuments({ instructor: req.user._id, isPublished: true });
  const pendingCourses = await Course.countDocuments({ instructor: req.user._id, isPublished: false });

  const myCoursesIds = await Course.find({ instructor: req.user._id }).distinct('_id');

  const totalStudents = await Enrollment.countDocuments({ course: { $in: myCoursesIds } });

  const totalRevenue = await Payment.aggregate([
    { $match: { course: { $in: myCoursesIds }, status: 'succeeded' } },
    { $group: { _id: null, total: { $sum: '$instructorAmount' } } },
  ]);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { course: { $in: myCoursesIds }, status: 'succeeded' } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$instructorAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const recentEnrollments = await Enrollment.find({ course: { $in: myCoursesIds } })
    .populate('student', 'name email avatar')
    .populate('course', 'title thumbnail')
    .sort({ createdAt: -1 })
    .limit(5);

  const courseWiseStats = await Enrollment.aggregate([
    { $match: { course: { $in: myCoursesIds } } },
    { $group: { _id: '$course', enrolledCount: { $sum: 1 } } },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $project: {
        'course.title': 1,
        'course.thumbnail': 1,
        'course.ratingAvg': 1,
        'course.isPublished': 1,
        enrolledCount: 1,
      },
    },
    { $sort: { enrolledCount: -1 } },
  ]);

  res.status(200).json({
    totalCourses,
    publishedCourses,
    pendingCourses,
    totalStudents,
    totalRevenue: totalRevenue[0]?.total || 0,
    monthlyRevenue,
    recentEnrollments,
    courseWiseStats,
  });
});

export const getMyCourses = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { instructor: req.user._id };
  if (status === 'published') query.isPublished = true;
  if (status === 'pending') query.isPublished = false;

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .select('title thumbnail category difficulty isPublished isFeatured ratingAvg enrolledCount rejectionReason createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    courses,
  });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  }).populate('lessons');

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  const quiz = await Quiz.findOne({ course: course._id, lesson: null });
  const enrolledCount = await Enrollment.countDocuments({ course: course._id });
  const reviews = await Review.find({ course: course._id })
    .populate('student', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ course, quiz, enrolledCount, reviews });
});

export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, difficulty, price, duration } = req.body;

  if (!title || !description || !category || !difficulty) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const course = await Course.create({
    title,
    description,
    category,
    difficulty,
    price: price || 0,
    duration: duration || '',
    instructor: req.user._id,
    thumbnail: req.file ? req.file.path : '',
    isPublished: false,
  });

  res.status(201).json(course);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  course.title = req.body.title || course.title;
  course.description = req.body.description || course.description;
  course.category = req.body.category || course.category;
  course.difficulty = req.body.difficulty || course.difficulty;
  course.price = req.body.price !== undefined ? req.body.price : course.price;
  course.duration = req.body.duration || course.duration;

  if (req.file) {
    if (course.thumbnail && course.thumbnail.includes('cloudinary')) {
      const publicId = course.thumbnail.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    course.thumbnail = req.file.path;
  }

  const updated = await course.save();
  res.status(200).json(updated);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  const enrolledStudents = await Enrollment.countDocuments({ course: course._id });
  if (enrolledStudents > 0) {
    res.status(400);
    throw new Error('Cannot delete course with enrolled students');
  }

  const lessons = await Lesson.find({ course: course._id });
  for (const lesson of lessons) {
    if (lesson.videoUrl && lesson.videoUrl.includes('cloudinary')) {
      const publicId = lesson.videoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }
    await lesson.deleteOne();
  }

  if (course.thumbnail && course.thumbnail.includes('cloudinary')) {
    const publicId = course.thumbnail.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }

  await Quiz.deleteMany({ course: course._id });
  await Review.deleteMany({ course: course._id });
  await course.deleteOne();

  res.status(200).json({ message: 'Course deleted successfully' });
});

export const requestPublish = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  const lessonsCount = await Lesson.countDocuments({ course: course._id });
  if (lessonsCount === 0) {
    res.status(400);
    throw new Error('Course must have at least one lesson before publishing');
  }

  course.publishRequested = true;
  course.rejectionReason = null;
  await course.save();

  res.status(200).json({ message: 'Publish request sent to admin for review' });
});

export const addLesson = asyncHandler(async (req, res) => {
  const { title, order, isFreePreview, duration } = req.body;

  const course = await Course.findOne({
    _id: req.params.courseId,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a video');
  }

  if (!title || !order) {
    res.status(400);
    throw new Error('Please provide lesson title and order');
  }

  const lesson = await Lesson.create({
    course: course._id,
    title,
    videoUrl: req.file.path,
    duration: duration || 0,
    order: Number(order),
    isFreePreview: isFreePreview === 'true',
  });

  course.lessons.push(lesson._id);
  await course.save();

  const enrolledStudents = await Enrollment.find({ course: course._id }).select('student');

  if (enrolledStudents.length > 0) {
    const notifications = enrolledStudents.map((e) => ({
      user: e.student,
      title: 'New Lesson Added',
      message: `New lesson "${title}" added in ${course.title}`,
      type: 'new_lesson',
      link: `/courses/${course._id}/lessons/${lesson._id}`,
    }));
    await Notification.insertMany(notifications);
  }

  res.status(201).json(lesson);
});

export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const course = await Course.findOne({
    _id: lesson.course,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(403);
    throw new Error('Not authorized');
  }

  lesson.title = req.body.title || lesson.title;
  lesson.order = req.body.order ? Number(req.body.order) : lesson.order;
  lesson.isFreePreview =
    req.body.isFreePreview !== undefined
      ? req.body.isFreePreview === 'true'
      : lesson.isFreePreview;
  lesson.duration = req.body.duration || lesson.duration;

  if (req.file) {
    if (lesson.videoUrl && lesson.videoUrl.includes('cloudinary')) {
      const publicId = lesson.videoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }
    lesson.videoUrl = req.file.path;
  }

  const updated = await lesson.save();
  res.status(200).json(updated);
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const course = await Course.findOne({
    _id: lesson.course,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (lesson.videoUrl && lesson.videoUrl.includes('cloudinary')) {
    const publicId = lesson.videoUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  }

  course.lessons = course.lessons.filter(
    (l) => l.toString() !== lesson._id.toString()
  );
  await course.save();
  await lesson.deleteOne();

  res.status(200).json({ message: 'Lesson deleted successfully' });
});

export const updateLessonOrder = asyncHandler(async (req, res) => {
  const { lessons } = req.body;

  const course = await Course.findOne({
    _id: req.params.courseId,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  for (const item of lessons) {
    await Lesson.findByIdAndUpdate(item.id, { order: item.order });
  }

  res.status(200).json({ message: 'Lesson order updated successfully' });
});

export const addResource = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const course = await Course.findOne({
    _id: lesson.course,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a resource file');
  }

  lesson.resources.push({
    title: req.body.title || req.file.originalname,
    fileUrl: req.file.path,
  });

  await lesson.save();
  res.status(200).json(lesson);
});

export const deleteResource = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const course = await Course.findOne({
    _id: lesson.course,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(403);
    throw new Error('Not authorized');
  }

  lesson.resources = lesson.resources.filter(
    (r) => r._id.toString() !== req.params.resourceId
  );

  await lesson.save();
  res.status(200).json({ message: 'Resource deleted successfully' });
});

export const createQuiz = asyncHandler(async (req, res) => {
  const { title, questions, passingScore, lessonId } = req.body;

  const course = await Course.findOne({
    _id: req.params.courseId,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  if (!title || !questions || questions.length === 0) {
    res.status(400);
    throw new Error('Please provide quiz title and at least one question');
  }

  const quiz = await Quiz.create({
    course: course._id,
    lesson: lessonId || null,
    title,
    questions,
    passingScore: passingScore || 60,
  });

  res.status(201).json(quiz);
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const course = await Course.findOne({
    _id: quiz.course,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(403);
    throw new Error('Not authorized');
  }

  quiz.title = req.body.title || quiz.title;
  quiz.questions = req.body.questions || quiz.questions;
  quiz.passingScore = req.body.passingScore || quiz.passingScore;

  const updated = await quiz.save();
  res.status(200).json(updated);
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const course = await Course.findOne({
    _id: quiz.course,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await quiz.deleteOne();
  res.status(200).json({ message: 'Quiz deleted successfully' });
});

export const getEnrolledStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const course = await Course.findOne({
    _id: req.params.courseId,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  const total = await Enrollment.countDocuments({ course: course._id });
  const enrollments = await Enrollment.find({ course: course._id })
    .populate('student', 'name email avatar')
    .select('student completionPercentage isCompleted createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    enrollments,
  });
});

export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.courseId,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  const totalEnrolled = await Enrollment.countDocuments({ course: course._id });
  const completed = await Enrollment.countDocuments({ course: course._id, isCompleted: true });

  const monthlyEnrollments = await Enrollment.aggregate([
    { $match: { course: course._id } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const revenue = await Payment.aggregate([
    { $match: { course: course._id, status: 'succeeded' } },
    { $group: { _id: null, total: { $sum: '$instructorAmount' } } },
  ]);

  const quizStats = await Enrollment.aggregate([
    { $match: { course: course._id } },
    { $unwind: '$quizAttempts' },
    {
      $group: {
        _id: '$quizAttempts.quiz',
        totalAttempts: { $sum: 1 },
        passed: { $sum: { $cond: ['$quizAttempts.passed', 1, 0] } },
        avgScore: { $avg: '$quizAttempts.score' },
      },
    },
  ]);

  const reviews = await Review.find({ course: course._id })
    .populate('student', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    totalEnrolled,
    completed,
    completionRate:
      totalEnrolled > 0 ? ((completed / totalEnrolled) * 100).toFixed(1) : 0,
    monthlyEnrollments,
    totalRevenue: revenue[0]?.total || 0,
    quizStats,
    reviews,
    ratingAvg: course.ratingAvg,
    ratingCount: course.ratingCount,
  });
});

export const getMyEarnings = asyncHandler(async (req, res) => {
  const myCoursesIds = await Course.find({ instructor: req.user._id }).distinct('_id');

  const totalEarnings = await Payment.aggregate([
    { $match: { course: { $in: myCoursesIds }, status: 'succeeded' } },
    { $group: { _id: null, total: { $sum: '$instructorAmount' } } },
  ]);

  const withdrawnAmount = await Payment.aggregate([
    { $match: { course: { $in: myCoursesIds }, status: 'succeeded', withdrawn: true } },
    { $group: { _id: null, total: { $sum: '$instructorAmount' } } },
  ]);

  const pendingAmount = await Payment.aggregate([
    { $match: { course: { $in: myCoursesIds }, status: 'succeeded', withdrawn: false } },
    { $group: { _id: null, total: { $sum: '$instructorAmount' } } },
  ]);

  const monthlyEarnings = await Payment.aggregate([
    { $match: { course: { $in: myCoursesIds }, status: 'succeeded' } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$instructorAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const courseWiseEarnings = await Payment.aggregate([
    { $match: { course: { $in: myCoursesIds }, status: 'succeeded' } },
    { $group: { _id: '$course', total: { $sum: '$instructorAmount' }, count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $project: {
        'course.title': 1,
        'course.thumbnail': 1,
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  const recentPayments = await Payment.find({
    course: { $in: myCoursesIds },
    status: 'succeeded',
  })
    .populate('student', 'name email avatar')
    .populate('course', 'title thumbnail')
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    totalEarnings: totalEarnings[0]?.total || 0,
    withdrawnAmount: withdrawnAmount[0]?.total || 0,
    pendingAmount: pendingAmount[0]?.total || 0,
    monthlyEarnings,
    courseWiseEarnings,
    recentPayments,
  });
});

export const connectStripe = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.user._id);

  const account = await stripe.accounts.create({
    type: 'express',
    email: instructor.email,
    capabilities: {
      transfers: { requested: true },
    },
  });

  instructor.stripeAccountId = account.id;
  await instructor.save();

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.CLIENT_URL}/instructor/stripe/refresh`,
    return_url: `${process.env.CLIENT_URL}/instructor/stripe/success`,
    type: 'account_onboarding',
  });

  res.status(200).json({ url: accountLink.url });
});

export const getStripeStatus = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.user._id);

  if (!instructor.stripeAccountId) {
    return res.status(200).json({ connected: false });
  }

  const account = await stripe.accounts.retrieve(instructor.stripeAccountId);

  res.status(200).json({
    connected: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    stripeAccountId: instructor.stripeAccountId,
  });
});

export const withdrawEarnings = asyncHandler(async (req, res) => {
  const instructor = await User.findById(req.user._id);

  if (!instructor.stripeAccountId) {
    res.status(400);
    throw new Error('Please connect your Stripe account first');
  }

  const myCoursesIds = await Course.find({ instructor: req.user._id }).distinct('_id');

  const pendingPayments = await Payment.find({
    course: { $in: myCoursesIds },
    status: 'succeeded',
    withdrawn: false,
  });

  if (pendingPayments.length === 0) {
    res.status(400);
    throw new Error('No pending earnings to withdraw');
  }

  const totalAmount = pendingPayments.reduce((acc, p) => acc + p.instructorAmount, 0);

  if (totalAmount < 100) {
    res.status(400);
    throw new Error('Minimum withdrawal amount is $1.00 (100 cents)');
  }

  const transfer = await stripe.transfers.create({
    amount: Math.floor(totalAmount),
    currency: 'usd',
    destination: instructor.stripeAccountId,
  });

  await Payment.updateMany(
    { _id: { $in: pendingPayments.map((p) => p._id) } },
    { withdrawn: true, withdrawnAt: new Date(), transferId: transfer.id }
  );

  res.status(200).json({
    message: 'Withdrawal successful',
    amount: totalAmount,
    transferId: transfer.id,
  });
});
export const getCourseQnA = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.courseId,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found or not authorized');
  }

  const { page = 1, limit = 10, isResolved } = req.query;
  const query = { course: course._id };
  if (isResolved !== undefined) query.isResolved = isResolved === 'true';

  const total = await QnA.countDocuments(query);
  const questions = await QnA.find(query)
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

export const replyToQuestion = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Reply content is required');
  }

  const qna = await QnA.findById(req.params.qnaId);
  if (!qna) {
    res.status(404);
    throw new Error('Question not found');
  }

  const course = await Course.findOne({
    _id: qna.course,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(403);
    throw new Error('Not authorized');
  }

  qna.replies.push({
    user: req.user._id,
    content,
    isInstructor: true,
  });

  await qna.save();

  await Notification.create({
    user: qna.student,
    title: 'Instructor replied to your question',
    message: `${req.user.name} replied to your question in ${course.title}`,
    type: 'enrollment',
    link: `/courses/${course._id}/lessons/${qna.lesson}`,
  });

  res.status(200).json(qna);
});

export const resolveQuestion = asyncHandler(async (req, res) => {
  const qna = await QnA.findById(req.params.qnaId);
  if (!qna) {
    res.status(404);
    throw new Error('Question not found');
  }

  const course = await Course.findOne({
    _id: qna.course,
    instructor: req.user._id,
  });

  if (!course) {
    res.status(403);
    throw new Error('Not authorized');
  }

  qna.isResolved = true;
  await qna.save();

  res.status(200).json({ message: 'Question marked as resolved' });
});