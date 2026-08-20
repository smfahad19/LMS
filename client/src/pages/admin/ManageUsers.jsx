import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiUsers, FiSearch,FiEdit2, FiTrash2,
  FiLock, FiUnlock, FiShield, FiChevronLeft, FiChevronRight,
  FiUserCheck, FiMoreVertical, FiX
} from 'react-icons/fi';
import { toast } from 'sonner';
import {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  changeUserRole,
  verifyInstructor,
  resetUserPassword,
} from '../../services/adminService.js';

const roleColors = {
  admin: 'bg-red-50 text-red-600',
  instructor: 'bg-violet-50 text-violet-600',
  student: 'bg-blue-50 text-blue-600',
};

export default function ManageUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const role = searchParams.get('role') || '';
  const search = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(search);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers({ page, role, search, limit: 10 });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const data = await getAllUsers({ page, role, search, limit: 10 });
        if (cancelled) return;
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        if (!cancelled) toast.error('Failed to load users');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [page, role, search]);

  const updateParams = (updates) => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, ...updates, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleBan = async (id, isBanned) => {
    try {
      setActionLoading(true);
      if (isBanned) {
        await unbanUser(id);
        toast.success('User unbanned');
      } else {
        await banUser(id);
        toast.success('User banned');
      }
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setActionLoading(true);
      await deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      setActionLoading(true);
      await changeUserRole(id, role);
      toast.success(`Role changed to ${role}`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Role change failed');
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
    }
  };

  const handleVerifyInstructor = async (id) => {
    try {
      setActionLoading(true);
      await verifyInstructor(id);
      toast.success('Instructor verified');
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setActionLoading(true);
      await resetUserPassword(resetPasswordModal._id, newPassword);
      toast.success('Password reset successfully');
      setResetPasswordModal(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <FiUsers size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Manage Users</h1>
                <p className="text-xs text-gray-500">{total} total users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
              >
                Search
              </button>
            </form>

            {/* Role Filter */}
            <div className="flex gap-2">
              {['', 'student', 'instructor', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => updateParams({ role: r })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition capitalize ${
                    role === r
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r === '' ? 'All' : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <FiUsers size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Role</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Auth</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Joined</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">

                      {/* User */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          user.isBanned
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>

                      {/* Auth */}
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-500 capitalize">
                          {user.authProvider || 'local'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1 relative">
                          <button
                            onClick={() => setActionMenuId(actionMenuId === user._id ? null : user._id)}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                          >
                            <FiMoreVertical size={15} />
                          </button>

                          {actionMenuId === user._id && (
                            <div className="absolute right-0 top-9 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden py-1">

                              {/* Ban/Unban */}
                              <button
                                onClick={() => handleBan(user._id, user.isBanned)}
                                disabled={actionLoading}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                              >
                                {user.isBanned ? <FiUnlock size={13} /> : <FiLock size={13} />}
                                {user.isBanned ? 'Unban User' : 'Ban User'}
                              </button>

                              {/* Change Role */}
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => handleRoleChange(user._id, user.role === 'student' ? 'instructor' : 'student')}
                                  disabled={actionLoading}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                                >
                                  <FiShield size={13} />
                                  Make {user.role === 'student' ? 'Instructor' : 'Student'}
                                </button>
                              )}

                              {/* Verify Instructor */}
                              {user.role === 'instructor' && !user.isVerifiedInstructor && (
                                <button
                                  onClick={() => handleVerifyInstructor(user._id)}
                                  disabled={actionLoading}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                                >
                                  <FiUserCheck size={13} />
                                  Verify Instructor
                                </button>
                              )}

                              {/* Reset Password */}
                              {user.authProvider !== 'google' && (
                                <button
                                  onClick={() => {
                                    setResetPasswordModal(user);
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                                >
                                  <FiEdit2 size={13} />
                                  Reset Password
                                </button>
                              )}

                              {/* Delete */}
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  disabled={actionLoading}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                                >
                                  <FiTrash2 size={13} />
                                  Delete User
                                </button>
                              )}
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} — {total} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page - 1 })}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <FiChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span key={`dots-${p}`} className="text-gray-400 text-xs">...</span>
                      )}
                      <button
                        key={p}
                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: p })}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                          page === p
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    </>
                  ))
                }
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page + 1 })}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Reset Password</h2>
              <button
                onClick={() => { setResetPasswordModal(null); setNewPassword(''); }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
              >
                <FiX size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Reset password for <span className="font-medium text-gray-900">{resetPasswordModal.name}</span>
            </p>
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setResetPasswordModal(null); setNewPassword(''); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition"
              >
                {actionLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}