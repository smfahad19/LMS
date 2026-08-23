import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiTrendingUp, FiClock, FiCheck,
  FiExternalLink, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'sonner';
import {
  getMyEarnings, getStripeStatus,
  connectStripe, withdrawEarnings
} from '../../services/instructorService.js';

function Earnings() {
  const [earnings, setEarnings] = useState(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [earningsData, stripeData] = await Promise.all([
        getMyEarnings(),
        getStripeStatus(),
      ]);
      setEarnings(earningsData);
      setStripeStatus(stripeData);
    } catch {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConnectStripe = async () => {
    try {
      setConnectLoading(true);
      const data = await connectStripe();
      window.open(data.url, '_blank');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to connect Stripe');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw all pending earnings to your Stripe account?')) return;
    try {
      setWithdrawLoading(true);
      const data = await withdrawEarnings();
      toast.success(`$${(data.amount / 100).toFixed(2)} withdrawn successfully`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Earnings',
      value: `$${((earnings?.totalEarnings || 0) / 100).toFixed(2)}`,
      icon: <FiDollarSign size={18} />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      sub: 'All time',
    },
    {
      label: 'Pending Withdrawal',
      value: `$${((earnings?.pendingAmount || 0) / 100).toFixed(2)}`,
      icon: <FiClock size={18} />,
      iconBg: 'bg-amber-100 text-amber-600',
      sub: 'Available to withdraw',
    },
    {
      label: 'Total Withdrawn',
      value: `$${((earnings?.withdrawnAmount || 0) / 100).toFixed(2)}`,
      icon: <FiCheck size={18} />,
      iconBg: 'bg-blue-100 text-blue-600',
      sub: 'Already paid out',
    },
    {
      label: 'Total Sales',
      value: earnings?.recentPayments?.length || 0,
      icon: <FiTrendingUp size={18} />,
      iconBg: 'bg-violet-100 text-violet-600',
      sub: 'Recent transactions',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <FiDollarSign size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Earnings</h1>
                <p className="text-xs text-gray-500">Track your revenue and withdraw earnings</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.iconBg}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">{card.value}</p>
              <p className="text-xs font-medium text-gray-700 mb-0.5">{card.label}</p>
              <p className="text-xs text-gray-400">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Stripe Connect Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <span className="text-violet-600 font-black text-sm">S</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Stripe Account</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {stripeStatus?.connected
                    ? 'Your Stripe account is connected and ready'
                    : 'Connect your Stripe account to receive withdrawals'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {stripeStatus?.connected ? (
                <>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
                    <FiCheck size={12} />
                    Connected
                  </span>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawLoading || (earnings?.pendingAmount || 0) < 100}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                  >
                    <FiDollarSign size={13} />
                    {withdrawLoading ? 'Processing...' : `Withdraw $${((earnings?.pendingAmount || 0) / 100).toFixed(2)}`}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnectStripe}
                  disabled={connectLoading}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  <FiExternalLink size={13} />
                  {connectLoading ? 'Connecting...' : 'Connect Stripe'}
                </button>
              )}
            </div>
          </div>

          {stripeStatus?.connected && (earnings?.pendingAmount || 0) < 100 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mt-4">
              <FiAlertCircle size={14} className="text-amber-500" />
              <p className="text-xs text-amber-700">
                Minimum withdrawal amount is $1.00. Current pending: ${((earnings?.pendingAmount || 0) / 100).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Course Wise Earnings */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Earnings by Course</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {earnings?.courseWiseEarnings?.length > 0 ? (
                earnings.courseWiseEarnings.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    {item.course?.thumbnail ? (
                      <img src={item.course.thumbnail} alt={item.course.title} className="w-9 h-9 rounded-xl object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                        {i + 1}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.course?.title}</p>
                      <p className="text-xs text-gray-400">{item.count} sales</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">
                      ${(item.total / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <FiDollarSign size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No earnings yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Monthly Breakdown</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {earnings?.monthlyEarnings?.length > 0 ? (
                [...earnings.monthlyEarnings].reverse().map((item, i) => {
                  const maxVal = Math.max(...earnings.monthlyEarnings.map(e => e.total));
                  const percent = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                      <span className="text-xs text-gray-500 w-24">
                        {new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-16 text-right">
                        ${(item.total / 100).toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <FiTrendingUp size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No monthly data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Recent Transactions</h2>
          </div>
          {earnings?.recentPayments?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Course</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Your Cut</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {earnings.recentPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {payment.student?.avatar ? (
                            <img src={payment.student.avatar} alt={payment.student.name} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {payment.student?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-gray-700">{payment.student?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-600 max-w-40 truncate block">{payment.course?.title}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-bold text-emerald-600">
                          ${((payment.instructorAmount || 0) / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          payment.withdrawn ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {payment.withdrawn ? 'Withdrawn' : 'Pending'}
                        </span>
                      </td>
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
          ) : (
            <div className="text-center py-10">
              <FiDollarSign size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Earnings;