import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiDollarSign, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'sonner';
import { getAllPayments } from '../../services/adminService.js';

const statusColors = {
  succeeded: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-amber-50 text-amber-600',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function ManagePayments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const page = Number(searchParams.get('page')) || 1;
  const status = searchParams.get('status') || '';

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPayments({ page, status, limit: 10 });
      setPayments(data.payments);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      const revenue = data.payments
        .filter(p => p.status === 'succeeded')
        .reduce((acc, p) => acc + p.amount, 0);
      setTotalRevenue(revenue);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    const loadPayments = async () => {
      await fetchPayments();
    };

    loadPayments();
  }, [fetchPayments]);

  const updateParams = (updates) => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, ...updates, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <FiDollarSign size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Manage Payments</h1>
                <p className="text-xs text-gray-500">{total} total transactions</p>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 text-right">
              <p className="text-xs text-emerald-600 font-medium">Page Revenue</p>
              <p className="text-lg font-bold text-emerald-700">${(totalRevenue / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'All', value: '' },
              { label: 'Succeeded', value: 'succeeded' },
              { label: 'Pending', value: 'pending' },
              { label: 'Failed', value: 'failed' },
              { label: 'Refunded', value: 'refunded' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => updateParams({ status: f.value })}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                  status === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-20">
              <FiDollarSign size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Course</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Instructor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Platform</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Withdrawn</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition">

                      {/* Student */}
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payment.student?.name}</p>
                          <p className="text-xs text-gray-400">{payment.student?.email}</p>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-700 max-w-40 truncate">{payment.course?.title}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3">
                        <span className="text-sm font-bold text-gray-900">
                          ${(payment.amount / 100).toFixed(2)}
                        </span>
                      </td>

                      {/* Instructor Amount */}
                      <td className="px-5 py-3">
                        <span className="text-sm text-emerald-600">
                          ${((payment.instructorAmount || 0) / 100).toFixed(2)}
                        </span>
                      </td>

                      {/* Platform Amount */}
                      <td className="px-5 py-3">
                        <span className="text-sm text-blue-600">
                          ${((payment.platformAmount || 0) / 100).toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[payment.status]}`}>
                          {payment.status}
                        </span>
                      </td>

                      {/* Withdrawn */}
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          payment.withdrawn
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {payment.withdrawn ? 'Withdrawn' : 'Pending'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} — {total} payments
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