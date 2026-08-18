import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiBookOpen, FiDollarSign, FiTrendingUp,
  FiUserCheck, FiClock, FiStar, FiShield
} from 'react-icons/fi';
import { getDashboardStats } from '../../services/adminService.js';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: <FiUsers size={20} />,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/users?role=student',
    },
    {
      label: 'Total Instructors',
      value: stats?.totalInstructors || 0,
      icon: <FiUserCheck size={20} />,
      color: 'bg-purple-50 text-purple-600',
      link: '/admin/users?role=instructor',
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: <FiBookOpen size={20} />,
      color: 'bg-green-50 text-green-600',
      link: '/admin/courses',
    },
    {
      label: 'Total Revenue',
      value: `$${((stats?.totalRevenue || 0) / 100).toFixed(2)}`,
      icon: <FiDollarSign size={20} />,
      color: 'bg-yellow-50 text-yellow-600',
      link: '/admin/payments',
    },
    {
      label: 'Total Enrollments',
      value: stats?.totalEnrollments || 0,
      icon: <FiTrendingUp size={20} />,
      color: 'bg-orange-50 text-orange-600',
      link: '/admin/enrollments',
    },
    {
      label: 'Pending Courses',
      value: stats?.pendingCourses || 0,
      icon: <FiClock size={20} />,
      color: 'bg-red-50 text-red-600',
      link: '/admin/courses?isPublished=false',
    },
    {
      label: 'Published Courses',
      value: stats?.publishedCourses || 0,
      icon: <FiStar size={20} />,
      color: 'bg-teal-50 text-teal-600',
      link: '/admin/courses?isPublished=true',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <FiShield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Platform overview and management</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <Link
              key={i}
              to={card.link}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Users */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Recent Users</h2>
              <Link to="/admin/users" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentUsers?.length > 0 ? (
                stats.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                      user.role === 'instructor'
                        ? 'bg-purple-50 text-purple-600'
                        : user.role === 'admin'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No users yet</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Recent Payments</h2>
              <Link to="/admin/payments" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentPayments?.length > 0 ? (
                stats.recentPayments.map((payment) => (
                  <div key={payment._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                      <FiDollarSign size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {payment.student?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{payment.course?.title}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      ${(payment.amount / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No payments yet</p>
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Top Courses</h2>
              <Link to="/admin/courses" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.topCourses?.length > 0 ? (
                stats.topCourses.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                    {item.course?.thumbnail ? (
                      <img
                        src={item.course.thumbnail}
                        alt={item.course.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FiBookOpen size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.course?.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FiUsers size={13} />
                      <span>{item.enrolledCount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No courses yet</p>
              )}
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Manage Users', to: '/admin/users', icon: <FiUsers size={16} />, color: 'text-blue-600 bg-blue-50' },
              { label: 'Manage Courses', to: '/admin/courses', icon: <FiBookOpen size={16} />, color: 'text-green-600 bg-green-50' },
              { label: 'Manage Payments', to: '/admin/payments', icon: <FiDollarSign size={16} />, color: 'text-yellow-600 bg-yellow-50' },
              { label: 'Manage Reviews', to: '/admin/reviews', icon: <FiStar size={16} />, color: 'text-purple-600 bg-purple-50' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-gray-50 transition text-sm font-medium text-gray-700"
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}