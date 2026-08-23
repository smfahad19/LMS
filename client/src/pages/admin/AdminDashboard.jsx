import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiUsers, FiBookOpen, FiDollarSign, FiTrendingUp,
  FiUserCheck, FiClock, FiStar, FiShield, FiGrid,
  FiChevronRight, FiActivity
} from 'react-icons/fi';
import { getDashboardStats } from '../../services/adminService.js';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: <FiUsers size={18} />,
      iconBg: 'bg-blue-100 text-blue-600',
      link: '/admin/manage-users?role=student',
      change: 'Active learners',
    },
    {
      label: 'Total Instructors',
      value: stats?.totalInstructors || 0,
      icon: <FiUserCheck size={18} />,
      iconBg: 'bg-violet-100 text-violet-600',
      link: '/admin/manage-users?role=instructor',
      change: 'Course creators',
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: <FiBookOpen size={18} />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      link: '/admin/manage-courses',
      change: `${stats?.publishedCourses || 0} published`,
    },
    {
      label: 'Total Revenue',
      value: `$${((stats?.totalRevenue || 0) / 100).toFixed(2)}`,
      icon: <FiDollarSign size={18} />,
      iconBg: 'bg-amber-100 text-amber-600',
      link: '/admin/manage-payments',
      change: 'All time earnings',
    },
    {
      label: 'Enrollments',
      value: stats?.totalEnrollments || 0,
      icon: <FiTrendingUp size={18} />,
      iconBg: 'bg-orange-100 text-orange-600',
      link: '/admin/manage-enrollments',
      change: 'Total enrollments',
    },
    {
      label: 'Pending Courses',
      value: stats?.pendingCourses || 0,
      icon: <FiClock size={18} />,
      iconBg: 'bg-red-100 text-red-600',
      link: '/admin/pending-courses',
      change: 'Awaiting approval',
    },
  ];

  const quickActions = [
    { label: 'Manage Users', to: '/admin/manage-users', icon: <FiUsers size={15} />, desc: 'View and manage all users' },
    { label: 'Manage Courses', to: '/admin/manage-courses', icon: <FiBookOpen size={15} />, desc: 'Review and publish courses' },
    { label: 'Payments', to: '/admin/manage-payments', icon: <FiDollarSign size={15} />, desc: 'View all transactions' },
    { label: 'Enrollments', to: '/admin/manage-enrollments', icon: <FiTrendingUp size={15} />, desc: 'Manage student enrollments' },
    { label: 'Reviews', to: '/admin/manage-reviews', icon: <FiStar size={15} />, desc: 'Moderate course reviews' },
    { label: 'Certificates', to: '/admin/certificates', icon: <FiActivity size={15} />, desc: 'Manage certificates' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <FiShield size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((card, i) => (
            <Link
              key={i}
              to={card.link}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.iconBg}`}>
                {card.icon}
              </div>
              <p className="text-xl font-bold text-gray-900 mb-0.5">{card.value}</p>
              <p className="text-xs font-medium text-gray-700 mb-1">{card.label}</p>
              <p className="text-xs text-gray-400">{card.change}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Recent Users */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiUsers size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Recent Users</h2>
              </div>
              <Link to="/admin/manage-users" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <FiChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.recentUsers?.length > 0 ? (
                stats.recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 min-w-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 min-w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${
                      u.role === 'instructor' ? 'bg-violet-50 text-violet-600' :
                      u.role === 'admin' ? 'bg-red-50 text-red-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <FiUsers size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No users yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiDollarSign size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Recent Payments</h2>
              </div>
              <Link to="/admin/payments" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <FiChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.recentPayments?.length > 0 ? (
                stats.recentPayments.map((payment) => (
                  <div key={payment._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    <div className="w-8 h-8 min-w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <FiDollarSign size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{payment.student?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{payment.course?.title}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                      ${(payment.amount / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <FiDollarSign size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No payments yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiBookOpen size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Top Courses</h2>
              </div>
              <Link to="/admin/courses" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <FiChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.topCourses?.length > 0 ? (
                stats.topCourses.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    <span className="text-xs font-bold text-gray-300 w-4 min-w-4">{i + 1}</span>
                    {item.course?.thumbnail ? (
                      <img src={item.course.thumbnail} alt={item.course.title} className="w-8 h-8 min-w-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 min-w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FiBookOpen size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.course?.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                      <FiUsers size={11} />
                      <span>{item.enrolledCount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <FiBookOpen size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No courses yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <FiGrid size={15} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-gray-100">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="flex flex-col items-center text-center p-5 hover:bg-gray-50 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center mb-3 transition text-gray-500 group-hover:text-blue-600">
                  {action.icon}
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-1">{action.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}