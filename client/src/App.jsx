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
  }, []);

  const getDashboard = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* 404 */}
          <Route path="*" element={
            isAuthenticated
              ? <Navigate to={getDashboard()} replace />
              : <NotFound />
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;