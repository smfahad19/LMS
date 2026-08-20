import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function NotFound() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const getDashboard = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <Link
        to={isAuthenticated ? getDashboard() : '/'}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
      >
        {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
      </Link>
    </div>
  );
}