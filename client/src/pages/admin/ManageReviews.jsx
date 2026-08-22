import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiStar, FiTrash2, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'sonner';
import { getAllReviews, deleteReview } from '../../services/adminService.js';

export default function ManageReviews() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const page = Number(searchParams.get('page')) || 1;

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllReviews({ page, limit: 10 });
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const loadReviews = async () => {
      await fetchReviews();
    };

    loadReviews();
  }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      setActionLoading(true);
      await deleteReview(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={12}
        className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiStar size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Manage Reviews</h1>
              <p className="text-xs text-gray-500">{total} total reviews</p>
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
          ) : reviews.length === 0 ? (
            <div className="text-center py-20">
              <FiStar size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No reviews found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {reviews.map((review) => (
                <div key={review._id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition">

                  {/* Student Avatar */}
                  <div>
                    {review.student?.avatar ? (
                      <img
                        src={review.student.avatar}
                        alt={review.student.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {review.student?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{review.student?.name}</span>
                        <span className="text-gray-300 mx-2">·</span>
                        <span className="text-xs text-gray-400">{review.student?.email}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500 ml-1">{review.rating}/5</span>
                    </div>

                    {/* Course */}
                    <p className="text-xs text-blue-600 mb-1.5">
                      {review.course?.title}
                    </p>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(review._id)}
                    disabled={actionLoading}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-500 transition"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} — {total} reviews
              </p>
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