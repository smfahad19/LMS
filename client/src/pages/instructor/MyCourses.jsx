import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBookOpen, FiPlus, FiEdit2, FiTrash2, FiSend,
  FiUsers, FiStar, FiClock, FiCheck, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'sonner';
import { getMyCourses, deleteCourse, requestPublish } from '../../services/instructorService.js';

const statusConfig = {
  published: { label: 'Published', class: 'bg-emerald-50 text-emerald-600' },
  pending: { label: 'Pending', class: 'bg-amber-50 text-amber-600' },
  rejected: { label: 'Rejected', class: 'bg-red-50 text-red-600' },
  draft: { label: 'Draft', class: 'bg-gray-100 text-gray-600' },
};

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyCourses({ page, status: filter, limit: 9 });
      setCourses(data.courses || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    const loadCourses = async () => {
      await fetchCourses();
    };

    loadCourses();
  }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      setActionLoading(id);
      await deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishRequest = async (id) => {
    try {
      setActionLoading(id);
      await requestPublish(id);
      toast.success('Publish request sent to admin');
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send request');
    } finally {
      setActionLoading(null);
    }
  };

  const getCourseStatus = (course) => {
    if (course.isPublished) return 'published';
    if (course.rejectionReason) return 'rejected';
    if (course.publishRequested) return 'pending';
    return 'draft';
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <FiBookOpen size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">My Courses</h1>
                <p className="text-xs text-gray-500">{total} total courses</p>
              </div>
            </div>
            <Link
              to="/instructor/courses/create"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <FiPlus size={14} />
              Create Course
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { label: 'All', value: '' },
            { label: 'Published', value: 'published' },
            { label: 'Pending', value: 'pending' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl text-center py-20">
            <FiBookOpen size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">No courses yet</p>
            <p className="text-sm text-gray-400 mb-5">Create your first course to get started</p>
            <Link
              to="/instructor/courses/create"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <FiPlus size={14} />
              Create Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const status = getCourseStatus(course);
              const statusStyle = statusConfig[status];
              return (
                <div key={course._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition">

                  {/* Thumbnail */}
                  <div className="relative">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                        <FiBookOpen size={32} className="text-gray-300" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle.class}`}>
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-gray-400">{course.category}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{course.difficulty}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs font-medium text-gray-700">
                        {!course.price || Number(course.price) === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiUsers size={12} />
                        <span>{course.enrolledCount || 0} students</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiStar size={12} />
                        <span>{course.ratingAvg?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {course.rejectionReason && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-2.5 mb-3">
                        <FiAlertCircle size={13} className="text-red-500 mt-0.5" />
                        <p className="text-xs text-red-600">{course.rejectionReason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/instructor/courses/${course._id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                      >
                        <FiEdit2 size={12} />
                        Manage
                      </button>

                      {!course.isPublished && !course.publishRequested && (
                        <button
                          onClick={() => handlePublishRequest(course._id)}
                          disabled={actionLoading === course._id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-medium text-blue-600 hover:bg-blue-100 transition"
                        >
                          <FiSend size={12} />
                          {actionLoading === course._id ? 'Sending...' : 'Submit'}
                        </button>
                      )}

                      {course.publishRequested && !course.isPublished && (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 rounded-xl text-xs font-medium text-amber-600">
                          <FiClock size={12} />
                          In Review
                        </div>
                      )}

                      {course.isPublished && (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 rounded-xl text-xs font-medium text-emerald-600">
                          <FiCheck size={12} />
                          Live
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(course._id)}
                        disabled={actionLoading === course._id}
                        className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-red-400 hover:bg-red-50 hover:border-red-100 transition"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;