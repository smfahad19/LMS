import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from './redux/slices/authSlice.js';
import { getMe } from './services/authService.js';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/common/ProtectedRoute.jsx';
import Home from './pages/public/Home.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import NotFound from './pages/error/NotFound.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageCourses from './pages/admin/ManageCourses.jsx';
import ManageEnrollments from './pages/admin/ManageEnrollments.jsx';
import ManagePayments from './pages/admin/ManagePayments.jsx';
import ManageReviews from './pages/admin/ManageReviews.jsx';
import PendingCourses from './pages/admin/PendingCourses.jsx';
import InstructorDashboard from './pages/instructor/InstructorDashboard.jsx';
import MyCourses from './pages/instructor/MyCourses.jsx';
import CreateCourse from './pages/instructor/CreateCourse.jsx';
import ManageCourse from './pages/instructor/ManageCourse.jsx';
import Earnings from './pages/instructor/Earnings.jsx';
import InstructorProfile from './pages/instructor/InstructorProfile.jsx';
import CourseStudents from './pages/instructor/CourseStudents.jsx';
import EnrolledCourses from './pages/student/EnrolledCourses.jsx';
import CourseViewer from './pages/student/CourseViewer.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import BrowseCourses from './pages/student/BrowseCourses.jsx';
import Certificates from './pages/student/Certificates.jsx';
import CourseDetail from './pages/public/CourseDetail.jsx';

const getDashboardForRole = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'instructor') return '/instructor/dashboard';
  return '/student/dashboard';
};

function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated
    ? <Navigate to={getDashboardForRole(user?.role)} replace />
    : children;
}

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getMe();
        dispatch(setCredentials(user));
      } catch {
        dispatch(logout());
      }
    };
    initAuth();
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfile />
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          } />

          <Route path="/admin/manage-courses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageCourses />
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-enrollments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageEnrollments />
            </ProtectedRoute>
          } />

          <Route path="/admin/manage-payments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManagePayments />
            </ProtectedRoute>
          } />

          <Route path="/admin/manage-reviews" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageReviews />
            </ProtectedRoute>
          } />

          <Route path="/admin/pending-courses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PendingCourses />
            </ProtectedRoute>
          } />

          {/* Instructor */}
          <Route path="/instructor/dashboard" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/instructor/courses" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <MyCourses />
            </ProtectedRoute>
          } />
          <Route path="/instructor/courses/create" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="/instructor/courses/:id" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <ManageCourse />
            </ProtectedRoute>
          } />
          <Route path="/instructor/courses/:id/students" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <CourseStudents />
            </ProtectedRoute>
          } />

          <Route path="/instructor/earnings" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <Earnings />
            </ProtectedRoute>
          } />
          <Route path="/instructor/profile" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorProfile />
            </ProtectedRoute>
          } />

          {/* Student */}
          <Route path="/courses" element={
            <BrowseCourses />
          } />
          <Route path="/courses/:id" element={<CourseDetail />} />

          <Route path="/student/certificates" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Certificates />
            </ProtectedRoute>
          } />

          <Route path="/student/my-courses" element={
            <ProtectedRoute allowedRoles={['student']}>
              <EnrolledCourses />
            </ProtectedRoute>
          } />

          <Route path="/student/courses/:courseId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <CourseViewer />
            </ProtectedRoute>
          } />

          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            isAuthenticated
              ? <Navigate to={getDashboardForRole(user?.role)} replace />
              : <NotFound />
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
