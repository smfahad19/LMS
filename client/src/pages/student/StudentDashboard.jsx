import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiPlay,
  FiTrendingUp,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Enrolled',
      value: stats?.totalEnrolled || 0,
      icon: <FiBookOpen size={18} />,
      iconBg: 'bg-blue-50 text-blue-600',
      link: '/student/my-courses',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress || 0,
      icon: <FiClock size={18} />,
      iconBg: 'bg-amber-50 text-amber-600',
      link: '/student/my-courses?status=inprogress',
    },
    {
      label: 'Completed',
      value: stats?.completed || 0,
      icon: <FiCheck size={18} />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      link: '/student/my-courses?status=completed',
    },
    {
      label: 'Certificates',
      value: stats?.totalCertificates || 0,
      icon: <FiAward size={18} />,
      iconBg: 'bg-violet-50 text-violet-600',
      link: '/student/certificates',
    },
  ];

  const quickActions = [
    { label: 'Browse Courses', to: '/courses', icon: <FiBookOpen size={15} />, desc: 'Explore more' },
    { label: 'My Courses', to: '/student/my-courses', icon: <FiPlay size={15} />, desc: 'Continue learning' },
    { label: 'Certificates', to: '/student/certificates', icon: <FiAward size={15} />, desc: 'View credentials' },
    { label: 'Profile', to: '/student/profile', icon: <FiTrendingUp size={15} />, desc: 'Update account' },
  ];

  const continueLearning = stats?.recentEnrollments?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Student dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
          >
            Browse courses
            <FiArrowRight size={15} />
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-sm"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
              <p className="mt-1 text-sm text-slate-600">{card.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FiPlay size={14} />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Continue learning</h2>
              </div>
              <Link to="/student/my-courses" className="text-sm font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {continueLearning.length > 0 ? (
                continueLearning.map((enrollment) => {
                  const course = enrollment.course;
                  const progress = Math.min(100, Math.max(0, enrollment.completionPercentage || 0));

                  return (
                    <Link
                      key={enrollment._id}
                      to={`/student/courses/${course?._id}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-slate-50"
                    >
                      <div className="h-16 w-20 overflow-hidden rounded-xl bg-slate-100">
                        {course?.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <FiBookOpen size={20} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-slate-900">{course?.title || 'Course'}</p>
                          <span className={`text-[10px] font-semibold ${enrollment.isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {enrollment.isCompleted ? 'Completed' : 'Resume'}
                          </span>
                        </div>

                        <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${enrollment.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-500">{Math.round(progress)}% complete</p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                  <FiBookOpen size={26} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-500">No courses yet</p>
                  <Link to="/courses" className="mt-4 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <FiAward size={15} />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Performance</h2>
              </div>

              {stats?.quizStats?.totalAttempts > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Attempts</span>
                    <span className="font-semibold text-slate-900">{stats.quizStats.totalAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Passed</span>
                    <span className="font-semibold text-emerald-600">{stats.quizStats.passed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Avg score</span>
                    <span className="font-semibold text-blue-600">{Math.round(stats.quizStats.avgScore || 0)}%</span>
                  </div>
                </div>
              ) : (
                <p className="py-3 text-sm text-slate-500">No quiz attempts yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <FiAward size={15} />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Certificates</h2>
              </div>

              {stats?.totalCertificates > 0 ? (
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-2xl font-bold text-slate-900">{stats.totalCertificates}</p>
                  <p className="text-xs text-slate-500">Certificates earned</p>
                </div>
              ) : (
                <p className="py-3 text-sm text-slate-500">Complete a course to earn your first certificate.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FiTrendingUp size={15} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                  {action.icon}
                </div>
                <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="mt-1 text-xs text-slate-500">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;