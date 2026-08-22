import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiTrendingUp, FiTrash2, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'sonner';
import { getAllEnrollments, cancelEnrollment } from '../../services/adminService.js';

export default function ManageEnrollments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const page = Number(searchParams.get('page')) || 1;

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await getAllEnrollments({ page, limit: 10 });
      setEnrollments(data.enrollments);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadEnrollments = async () => {
      try {
        const data = await getAllEnrollments({ page, limit: 10 });
        if (cancelled) return;
        setEnrollments(data.enrollments);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        if (!cancelled) toast.error('Failed to load enrollments');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEnrollments();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this enrollment?')) return;
    try {
      setActionLoading(true);
      await cancelEnrollment(id);
      toast.success('Enrollment cancelled');
      fetchEnrollments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiTrendingUp size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Manage Enrollments</h1>
              <p className="text-xs text-gray-500">{total} total enrollments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-20">
              <FiTrendingUp size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No enrollments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Course</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Progress</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Enrolled On</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {enrollment.student?.avatar ? (
                            <img src={enrollment.student.avatar} alt={enrollment.student.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {enrollment.student?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{enrollment.student?.name}</p>
                            <p className="text-xs text-gray-400">{enrollment.student?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {enrollment.course?.thumbnail ? (
                            <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="w-8 h-8 rounded-lg object-cover" />
                          ) : null}
                          <p className="text-sm text-gray-700 max-w-40 truncate">{enrollment.course?.title}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${enrollment.completionPercentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{enrollment.completionPercentage || 0}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          enrollment.isCompleted
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {enrollment.isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(enrollment.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleCancel(enrollment._id)}
                            disabled={actionLoading}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-500 transition"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Page {page} of {totalPages} — {total} enrollments</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page - 1 })}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <FiChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page + 1 })}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}