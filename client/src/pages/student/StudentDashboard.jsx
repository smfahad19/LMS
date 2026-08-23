import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiBookOpen, FiAward, FiTrendingUp, FiClock,
  FiChevronRight, FiPlay, FiStar, FiCheck
} from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';

function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/student/dashboard');
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
      label: 'Enrolled Courses',
      value: stats?.totalEnrolled || 0,
      icon: <FiBookOpen size={18} />,
      iconBg: 'bg-blue-100 text-blue-600',
      link: '/student/my-courses',
      sub: 'Total courses',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress || 0,
      icon: <FiClock size={18} />,
      iconBg: 'bg-amber-100 text-amber-600',
      link: '/student/my-courses?status=inprogress',
      sub: 'Currently learning',
    },
    {
      label: 'Completed',
      value: stats?.completed || 0,
      icon: <FiCheck size={18} />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      link: '/student/my-courses?status=completed',
      sub: 'Finished courses',
    },
    {
      label: 'Certificates',
      value: stats?.totalCertificates || 0,
      icon: <FiAward size={18} />,
      iconBg: 'bg-violet-100 text-violet-600',
      link: '/student/certificates',
      sub: 'Earned certificates',
    },
  ];

  const quickActions = [
    { label: 'Browse Courses', to: '/courses', icon: <FiBookOpen size={15} />, desc: 'Find new courses' },
    { label: 'My Courses', to: '/student/my-courses', icon: <FiPlay size={15} />, desc: 'Continue learning' },
    { label: 'Certificates', to: '/student/certificates', icon: <FiAward size={15} />, desc: 'View certificates' },
    { label: 'My Profile', to: '/student/profile', icon: <FiTrendingUp size={15} />, desc: 'Update profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <span className="text-white font-bold text-base">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p className="text-xs text-slate-300">Your learning space, all in one place</p>
              </div>
            </div>
            <Link
              to="/courses"
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <FiBookOpen size={14} />
              Browse Courses
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

          {/* Continue Learning */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiPlay size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Continue Learning</h2>
              </div>
              <Link to="/student/my-courses" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                View all <FiChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.recentEnrollments?.length > 0 ? (
                stats.recentEnrollments.map((enrollment) => (
                  <Link
                    key={enrollment._id}
                    to={`/student/courses/${enrollment.course?._id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
                  >
                    {enrollment.course?.thumbnail ? (
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-14 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <FiBookOpen size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate mb-1">
                        {enrollment.course?.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-32">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${enrollment.completionPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{enrollment.completionPercentage || 0}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {enrollment.isCompleted ? (
                        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium">
                          Done
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                          Resume
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-10 text-center">
                  <FiBookOpen size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-4">No courses yet</p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Stats + Certificates */}
          <div className="space-y-5">

            {/* Quiz Stats */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiStar size={15} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Quiz Stats</h2>
              </div>
              {stats?.quizStats?.totalAttempts > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Attempts</span>
                    <span className="text-sm font-bold text-gray-900">{stats.quizStats.totalAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Passed</span>
                    <span className="text-sm font-bold text-emerald-600">{stats.quizStats.passed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Avg Score</span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round(stats.quizStats.avgScore || 0)}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Pass Rate</span>
                      <span className="text-xs text-gray-500">
                        {Math.round((stats.quizStats.passed / stats.quizStats.totalAttempts) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.round((stats.quizStats.passed / stats.quizStats.totalAttempts) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiStar size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No quiz attempts yet</p>
                </div>
              )}
            </div>

            {/* Recent Certificates */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FiAward size={15} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Certificates</h2>
                </div>
                <Link to="/student/certificates" className="text-xs text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="p-5">
                {stats?.totalCertificates > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                      <FiAward size={22} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
                      <p className="text-xs text-gray-400">Certificates earned</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <FiAward size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Complete a course to earn your first certificate</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <FiTrendingUp size={15} className="text-gray-400" />
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

export default StudentDashboard;