import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiBookOpen, FiUsers, FiDollarSign, FiTrendingUp,
  FiStar, FiClock, FiChevronRight, FiPlus, FiActivity
} from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';

function InstructorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/instructor/dashboard');
        setStats(res.data);
      } catch {
        toast.error('Failed to load dashboard');
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
      label: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: <FiBookOpen size={18} />,
      iconBg: 'bg-blue-100 text-blue-600',
      link: '/instructor/courses',
      sub: `${stats?.publishedCourses || 0} published`,
    },
    {
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: <FiUsers size={18} />,
      iconBg: 'bg-violet-100 text-violet-600',
      link: '/instructor/courses',
      sub: 'Enrolled students',
    },
    {
      label: 'Total Earnings',
      value: `$${((stats?.totalRevenue || 0) / 100).toFixed(2)}`,
      icon: <FiDollarSign size={18} />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      link: '/instructor/earnings',
      sub: 'All time earnings',
    },
    {
      label: 'Pending Courses',
      value: stats?.pendingCourses || 0,
      icon: <FiClock size={18} />,
      iconBg: 'bg-amber-100 text-amber-600',
      link: '/instructor/courses',
      sub: 'Awaiting approval',
    },
  ];

  const quickActions = [
    { label: 'Create Course', to: '/instructor/courses/create', icon: <FiPlus size={15} />, desc: 'Add a new course' },
    { label: 'My Courses', to: '/instructor/courses', icon: <FiBookOpen size={15} />, desc: 'Manage your courses' },
    { label: 'Earnings', to: '/instructor/earnings', icon: <FiDollarSign size={15} />, desc: 'View your earnings' },
    { label: 'Profile', to: '/instructor/profile', icon: <FiActivity size={15} />, desc: 'Update your profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <FiTrendingUp size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Instructor Dashboard</h1>
                <p className="text-xs text-gray-500">Welcome back, {user?.name}</p>
              </div>
            </div>
            <Link
              to="/instructor/courses/create"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <FiPlus size={14} />
              New Course
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, i) => (
            <Link
              key={i}
              to={card.link}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.iconBg}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">{card.value}</p>
              <p className="text-xs font-medium text-gray-700 mb-1">{card.label}</p>
              <p className="text-xs text-gray-400">{card.sub}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Recent Enrollments */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiUsers size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Recent Students</h2>
              </div>
              <Link to="/instructor/courses" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <FiChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.recentEnrollments?.length > 0 ? (
                stats.recentEnrollments.map((enrollment) => (
                  <div key={enrollment._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    {enrollment.student?.avatar ? (
                      <img src={enrollment.student.avatar} alt={enrollment.student.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {enrollment.student?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{enrollment.student?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{enrollment.course?.title}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(enrollment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <FiUsers size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No students yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Wise Stats */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiBookOpen size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Course Performance</h2>
              </div>
              <Link to="/instructor/courses" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <FiChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.courseWiseStats?.length > 0 ? (
                stats.courseWiseStats.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                    {item.course?.thumbnail ? (
                      <img src={item.course.thumbnail} alt={item.course.title} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FiBookOpen size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.course?.title}</p>
                      <div className="flex items-center gap-1">
                        <FiStar size={10} className="text-amber-400" />
                        <span className="text-xs text-gray-400">{item.course?.ratingAvg?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
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

          {/* Monthly Revenue */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiDollarSign size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Monthly Earnings</h2>
              </div>
              <Link to="/instructor/earnings" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <FiChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.monthlyRevenue?.length > 0 ? (
                stats.monthlyRevenue.slice(-5).reverse().map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                    <span className="text-sm text-gray-600">
                      {new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      ${(item.total / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <FiDollarSign size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No earnings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <FiActivity size={15} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
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
                <p className="text-xs text-gray-400">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default InstructorDashboard;