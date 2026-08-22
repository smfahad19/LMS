import { useCallback, useEffect, useState } from 'react';
import {
  FiBookOpen, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiClock
} from 'react-icons/fi';
import { toast } from 'sonner';
import { getAllCourses, verifyCourse, rejectCourse } from '../../services/adminService.js';

export default function PendingCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCourses({ page, isPublished: 'false', limit: 10 });
      setCourses(data.courses);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load pending courses');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const loadCourses = async () => {
      await fetchCourses();
    };

    loadCourses();
  }, [fetchCourses]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await verifyCourse(id);
      toast.success('Course approved and published');
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(rejectModal._id);
      await rejectCourse(rejectModal._id, rejectReason);
      toast.success('Course rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <FiClock size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pending Course Reviews</h1>
              <p className="text-xs text-gray-500">{total} courses awaiting approval</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl text-center py-20">
            <FiCheck size={32} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">All caught up!</p>
            <p className="text-sm text-gray-400">No courses pending review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course._id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start gap-4">

                  {/* Thumbnail */}
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-20 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FiBookOpen size={20} className="text-gray-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-0.5">{course.title}</h3>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5">
                            {course.instructor?.avatar ? (
                              <img src={course.instructor.avatar} alt={course.instructor.name} className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {course.instructor?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs text-gray-500">{course.instructor?.name}</span>
                          </div>
                          <span className="text-gray-300">·</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            course.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600' :
                            course.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {course.difficulty}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">{course.category}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs font-medium text-gray-700">
                            {course.price === 0 ? 'Free' : `$${course.price}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Submitted {new Date(course.updatedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(course._id)}
                          disabled={actionLoading === course._id}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                        >
                          <FiCheck size={14} />
                          {actionLoading === course._id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setRejectModal(course)}
                          disabled={actionLoading === course._id}
                          className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-medium transition"
                        >
                          <FiX size={14} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <FiChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Reject Course</h2>
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <FiX size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Rejecting: <span className="font-medium text-gray-900">{rejectModal.title}</span>
            </p>
            <textarea
              rows={3}
              placeholder="Reason for rejection (instructor ko dikhega)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl text-sm font-medium transition"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}