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
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h1>
            <p className="mt-1 text-sm text-gray-500">
              {enrollments.length} course{enrollments.length === 1 ? '' : 's'} enrolled
            </p>
          </div>
          <button
            type="button"
            onClick={loadEnrollments}
            disabled={loading}
            title="Refresh enrolled courses"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
          >
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <FiBookOpen size={34} className="mx-auto mb-3 text-gray-300" />
            <h2 className="text-base font-semibold text-gray-800">No enrolled courses yet</h2>
            <p className="mt-1 text-sm text-gray-500">Complete a payment and refresh this page to see your course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const progress = Math.min(100, Math.max(0, enrollment.completionPercentage || 0));

              return (
                <article key={enrollment._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  {course?.thumbnail ? (
                    <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-blue-50 text-blue-300">
                      <FiBookOpen size={36} />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-600">{course?.category || 'Course'}</p>
                    <h2 className="mt-1 line-clamp-2 text-base font-bold text-gray-900">{course?.title || 'Unavailable course'}</h2>
                    <p className="mt-2 text-xs text-gray-500">
                      Instructor: {course?.instructor?.name || 'Unknown'}
                    </p>

                    <div className="mt-5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        {enrollment.isCompleted ? <FiCheckCircle className="text-emerald-500" /> : <FiClock className="text-amber-500" />}
                        {enrollment.isCompleted ? 'Completed' : 'In progress'}
                      </span>
                      <span className="font-semibold text-gray-700">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-3 text-xs text-gray-400">
                      Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}
                    </p>
                    <Link
                      to={`/student/courses/${course?._id}`}
                      className="mt-4 block rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Open Course
                    </Link>
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
