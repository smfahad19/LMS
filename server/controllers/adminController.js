import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Certificate from '../models/Certificate.js';
import Review from '../models/Review.js';
import bcrypt from 'bcryptjs';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalInstructors = await User.countDocuments({ role: 'instructor' });
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const pendingCourses = await Course.countDocuments({ isPublished: false });
  const totalEnrollments = await Enrollment.countDocuments();
  
  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const monthlyEnrollments = await Enrollment.aggregate([
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const topCourses = await Enrollment.aggregate([
    { $group: { _id: '$course', enrolledCount: { $sum: 1 } } },
    { $sort: { enrolledCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    
    { $unwind: '$course' }, 
    { $project: { 'course.title': 1, 'course.thumbnail': 1, enrolledCount: 1 } },
  ]);

  const recentUsers = await User.find()
    .select('name email role createdAt avatar')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentPayments = await Payment.find({ status: 'succeeded' })
    .populate('student', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    pendingCourses,
    totalEnrollments,
    totalRevenue: totalRevenue[0]?.total || 0,
    monthlyEnrollments,
    topCourses,
    recentUsers,
    recentPayments,
  });
});

export const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user._id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  if (req.body.name) admin.name = req.body.name;
  if (req.body.bio !== undefined) admin.bio = req.body.bio;

  if (req.file && req.file.path) {
    admin.avatar = req.file.path;
  }

  if (req.body.password) {
    if (!req.body.currentPassword) {
      res.status(400);
      throw new Error('Current password is required');
    }
    const isMatch = await admin.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }
    admin.password = req.body.password;
  }

  await admin.save();

  const updated = await User.findById(req.user._id).select('-password');

  res.status(200).json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    avatar: updated.avatar,
    bio: updated.bio,
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10, search, isBanned } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (isBanned !== undefined) query.isBanned = isBanned === 'true';

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const enrollments = await Enrollment.find({ student: user._id }).populate('course', 'title thumbnail');
  const payments = await Payment.find({ student: user._id }).populate('course', 'title price');

  res.status(200).json({ user, enrollments, payments });
});

export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.bio = req.body.bio || user.bio;
  user.avatar = req.body.avatar || user.avatar;

  const updated = await user.save();
  res.status(200).json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    bio: updated.bio,
    avatar: updated.avatar,
  });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.authProvider === 'google') {
    res.status(400);
    throw new Error('Cannot reset password for Google account');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
});

export const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot ban another admin');
  }

  user.isBanned = true;
  await user.save();

  res.status(200).json({ message: `User ${user.name} has been banned` });
});

export const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isBanned = false;
  await user.save();

  res.status(200).json({ message: `User ${user.name} has been unbanned` });
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['student', 'instructor', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  await user.save();

  res.status(200).json({ message: `User role changed to ${role}` });
});

export const verifyInstructor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'instructor') {
    res.status(400);
    throw new Error('User is not an instructor');
  }

  user.isVerifiedInstructor = true;
  await user.save();

  res.status(200).json({ message: `Instructor ${user.name} verified successfully` });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete another admin');
  }

  await Enrollment.deleteMany({ student: user._id });
  await Payment.deleteMany({ student: user._id });
  await Review.deleteMany({ student: user._id });
  await Certificate.deleteMany({ student: user._id });
  await user.deleteOne();

  res.status(200).json({ message: 'User and all related data deleted successfully' });
});

export const getAllCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isPublished, isFeatured } = req.query;

  const query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'name email avatar')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), courses });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email avatar')
    .populate('lessons');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
  const reviews = await Review.find({ course: course._id }).populate('student', 'name avatar');

  res.status(200).json({ course, enrollmentCount, reviews });
});

export const verifyCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  course.isPublished = true;
  course.rejectionReason = null;
  await course.save();

  res.status(200).json({ message: 'Course verified and published successfully' });
});

export const rejectCourse = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  course.isPublished = false;
  course.rejectionReason = reason || 'Course did not meet platform standards';
  await course.save();

  res.status(200).json({ message: 'Course rejected', reason: course.rejectionReason });
});

export const toggleFeaturedCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  course.isFeatured = !course.isFeatured;
  await course.save();

  res.status(200).json({ message: `Course ${course.isFeatured ? 'marked as featured' : 'removed from featured'}` });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  await Enrollment.deleteMany({ course: course._id });
  await Review.deleteMany({ course: course._id });
  await Certificate.deleteMany({ course: course._id });
  await course.deleteOne();

  res.status(200).json({ message: 'Course and all related data deleted successfully' });
});

export const getAllEnrollments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = {};

  const total = await Enrollment.countDocuments(query);
  const enrollments = await Enrollment.find(query)
    .populate('student', 'name email avatar')
    .populate('course', 'title thumbnail price')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), enrollments });
});

export const manuallyEnrollStudent = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;

  const student = await User.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const alreadyEnrolled = await Enrollment.findOne({ student: studentId, course: courseId });
  if (alreadyEnrolled) {
    res.status(400);
    throw new Error('Student already enrolled in this course');
  }

  const enrollment = await Enrollment.create({ student: studentId, course: courseId });
  course.enrolledCount += 1;
  await course.save();

  res.status(201).json({ message: 'Student enrolled successfully', enrollment });
});

export const cancelEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  await Course.findByIdAndUpdate(enrollment.course, { $inc: { enrolledCount: -1 } });
  await enrollment.deleteOne();

  res.status(200).json({ message: 'Enrollment cancelled successfully' });
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('student', 'name email')
    .populate('course', 'title price')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), payments });
});

export const getAllQuizAttempts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const enrollments = await Enrollment.find({ 'quizAttempts.0': { $exists: true } })
    .populate('student', 'name email')
    .populate('course', 'title')
    .select('student course quizAttempts')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ page: Number(page), enrollments });
});

export const issueCertificateManually = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;
  const { v4: uuidv4 } = await import('uuid');

  const existing = await Certificate.findOne({ student: studentId, course: courseId });
  if (existing) {
    res.status(400);
    throw new Error('Certificate already issued');
  }

  const certificate = await Certificate.create({
    student: studentId,
    course: courseId,
    certificateId: uuidv4(),
  });

  await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { certificateIssued: true }
  );

  res.status(201).json({ message: 'Certificate issued successfully', certificate });
});

export const revokeCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  await Enrollment.findOneAndUpdate(
    { student: certificate.student, course: certificate.course },
    { certificateIssued: false }
  );

  await certificate.deleteOne();
  res.status(200).json({ message: 'Certificate revoked successfully' });
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const total = await Review.countDocuments();
  const reviews = await Review.find()
    .populate('student', 'name email avatar')
    .populate('course', 'title')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), reviews });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  await review.deleteOne();
  res.status(200).json({ message: 'Review deleted successfully' });
});