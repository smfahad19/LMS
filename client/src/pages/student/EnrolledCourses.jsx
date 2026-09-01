import { useEffect, useState } from 'react';
import { FiBookOpen, FiCheckCircle, FiClock, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { getMediaUrl } from '../../utils/media.js';

export default function EnrolledCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/my-courses');
      setEnrollments(response.data.enrollments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Learning</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">My courses</h1>
            <p className="mt-1 text-sm text-slate-500">
              {enrollments.length} course{enrollments.length === 1 ? '' : 's'} enrolled
            </p>
          </div>

          <button
            type="button"
            onClick={loadEnrollments}
            disabled={loading}
            title="Refresh enrolled courses"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
          >
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <FiBookOpen size={36} className="mx-auto mb-3 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-800">No enrolled courses yet</h2>
            <p className="mt-2 text-sm text-slate-500">Complete a payment and refresh this page to see your learning path.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const progress = Math.min(100, Math.max(0, enrollment.completionPercentage || 0));

              return (
                <article
                  key={enrollment._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="relative">
                    {course?.thumbnail ? (
                      <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="h-44 w-full object-cover" />
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-slate-100 text-slate-300">
                        <FiBookOpen size={34} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">{course?.category || 'Course'}</p>
                      <h2 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900">{course?.title || 'Unavailable course'}</h2>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        {enrollment.isCompleted ? <FiCheckCircle className="text-emerald-500" /> : <FiClock className="text-amber-500" />}
                        {enrollment.isCompleted ? 'Completed' : 'In progress'}
                      </span>
                      <span className="font-semibold text-slate-700">{progress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <p className="text-xs text-slate-400">Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}</p>
                      <Link
                        to={`/student/courses/${course?._id}`}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
