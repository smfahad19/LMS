import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiEdit2,
  FiShield,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { setCredentials } from '../../redux/slices/authSlice.js';
import api from '../../services/api.js';

const tabs = ['Profile', 'Security'];

export default function StudentProfile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch,
  } = useForm();

  const password = watch('newPassword', '');

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setAvatarLoading(true);
      const res = await api.put('/student/profile/avatar', formData);
      dispatch(setCredentials({ ...user, avatar: res.data.avatar }));
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to update avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      setProfileLoading(true);
      const res = await api.put('/student/profile', data);
      dispatch(setCredentials({ ...user, ...res.data }));
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setPasswordLoading(true);
      await api.put('/student/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const isGoogleUser = user?.authProvider === 'google' || !user?.authProvider;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiShield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
              <p className="text-xs text-gray-500">Manage your student account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <div className="relative inline-block mb-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="mx-auto h-24 w-24 rounded-2xl object-cover" />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <label
                  className={`absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-50 ${
                    avatarLoading ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  {avatarLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  ) : (
                    <FiCamera size={14} className="text-gray-600" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>

              <p className="mb-0.5 text-base font-bold text-gray-900">{user?.name}</p>
              <p className="mb-3 text-sm text-gray-400">{user?.email}</p>
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 capitalize">
                {user?.role}
              </span>

              <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-left">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUser size={14} className="text-gray-400" />
                  <span className="truncate">{user?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail size={14} className="text-gray-400" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-5 flex gap-1 rounded-xl bg-gray-100 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                    activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Profile' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                  <FiEdit2 size={15} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Edit Profile</h2>
                </div>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        {...registerProfile('name', {
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Minimum 2 characters' },
                        })}
                        className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition ${
                          profileErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                        }`}
                      />
                    </div>
                    {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-400"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      rows={4}
                      {...registerProfile('bio')}
                      placeholder="Tell us about your learning goals and interests..."
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                  <FiLock size={15} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Security</h2>
                </div>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Current Password</label>
                    <div className="relative">
                      <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        {...registerPassword('currentPassword', { required: !isGoogleUser ? 'Current password is required' : false })}
                        className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-10 text-sm outline-none transition ${
                          passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                        }`}
                        disabled={isGoogleUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showCurrent ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        {...registerPassword('newPassword', {
                          required: !isGoogleUser ? 'New password is required' : false,
                          minLength: { value: 6, message: 'Minimum 6 characters' },
                        })}
                        className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-10 text-sm outline-none transition ${
                          passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                        }`}
                        disabled={isGoogleUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showNew ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <div className="relative">
                      <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        {...registerPassword('confirmPassword', {
                          validate: (value) => value === password || 'Passwords do not match',
                        })}
                        className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-10 text-sm outline-none transition ${
                          passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                        }`}
                        disabled={isGoogleUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  {isGoogleUser && (
                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      This account uses Google sign-in, so password changes are disabled here.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading || isGoogleUser}
                    className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
