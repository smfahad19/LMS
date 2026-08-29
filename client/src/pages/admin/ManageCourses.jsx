import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiBookOpen, FiSearch, FiCheck, FiX, FiStar,
  FiTrash2, FiChevronLeft, FiChevronRight, FiMoreVertical
} from 'react-icons/fi';
import { toast } from 'sonner';
import {
  getAllCourses, verifyCourse, rejectCourse,
  toggleFeaturedCourse, deleteCourse
} from '../../services/adminService.js';

const difficultyColors = {
  Beginner: 'bg-emerald-50 text-emerald-600',
  Intermediate: 'bg-amber-50 text-amber-600',
  Advanced: 'bg-red-50 text-red-600',
};

export default function ManageCourses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const page = Number(searchParams.get('page')) || 1;
  const isPublished = searchParams.get('isPublished') || '';
  const search = searchParams.get('search') || '';
  const allCoursesLimit = 1000;

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllCourses({ page: 1, isPublished, search, limit: allCoursesLimit });
      setCourses(data.courses);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      try {
        const data = await getAllCourses({ page: 1, isPublished, search, limit: allCoursesLimit });
        if (cancelled) return;
        setCourses(data.courses);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        if (!cancelled) toast.error('Failed to load courses');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [page, isPublished, search]);

  const updateParams = (updates) => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, ...updates, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleVerify = async (id) => {
    try {
      setActionLoading(true);
      await verifyCourse(id);
      toast.success('Course published');
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      await rejectCourse(rejectModal._id, rejectReason);
      toast.success('Course rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeatured = async (id) => {
    try {
      setActionLoading(true);
      await toggleFeaturedCourse(id);
      toast.success('Featured status updated');
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      setActionLoading(true);
      await deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiBookOpen size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Manage Courses</h1>
              <p className="text-xs text-gray-500">{total} total courses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                Search
              </button>
            </form>
            <div className="flex gap-2">
              {[
                { label: 'All', value: '' },
                { label: 'Published', value: 'true' },
                { label: 'Pending', value: 'false' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => updateParams({ isPublished: f.value })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isPublished === f.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <FiBookOpen size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No courses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Course</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Instructor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Level</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Price</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Rating</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-10 h-10 rounded-xl object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                              <FiBookOpen size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 max-w-48 truncate">{course.title}</p>
                            <p className="text-xs text-gray-400">{course.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {course.instructor?.avatar ? (
                            <img src={course.instructor.avatar} alt={course.instructor.name} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {course.instructor?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-gray-600">{course.instructor?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${difficultyColors[course.difficulty] || 'bg-gray-50 text-gray-600'}`}>
                          {course.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-700 font-medium">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium w-fit ${
                            course.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {course.isPublished ? 'Published' : 'Pending'}
                          </span>
                          {course.isFeatured && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-600 w-fit">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <FiStar size={12} className="text-amber-400" />
                          <span className="text-sm text-gray-600">{course.ratingAvg?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end relative">
                          <button
                            onClick={() => setActionMenuId(actionMenuId === course._id ? null : course._id)}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                          >
                            <FiMoreVertical size={15} />
                          </button>
                          {actionMenuId === course._id && (
                            <div className="absolute right-0 top-9 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                              {!course.isPublished && (
                                <button
                                  onClick={() => handleVerify(course._id)}
                                  disabled={actionLoading}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                                >
                                  <FiCheck size={13} className="text-emerald-500" />
                                  Publish Course
                                </button>
                              )}
                              {course.isPublished && (
                                <button
                                  onClick={() => { setRejectModal(course); setActionMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                                >
                                  <FiX size={13} className="text-red-500" />
                                  Unpublish
                                </button>
                              )}
                              <button
                                onClick={() => handleFeatured(course._id)}
                                disabled={actionLoading}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                              >
                                <FiStar size={13} className="text-amber-500" />
                                {course.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                              </button>
                              <button
                                onClick={() => handleDelete(course._id)}
                                disabled={actionLoading}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                              >
                                <FiTrash2 size={13} />
                                Delete Course
                              </button>
                            </div>
                          )}
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
              <p className="text-xs text-gray-500">Page {page} of {totalPages} — {total} courses</p>
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

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Unpublish Course</h2>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
                <FiX size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Unpublishing: <span className="font-medium text-gray-900">{rejectModal.title}</span>
            </p>
            <textarea
              rows={3}
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl text-sm font-medium transition">
                {actionLoading ? 'Processing...' : 'Unpublish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}