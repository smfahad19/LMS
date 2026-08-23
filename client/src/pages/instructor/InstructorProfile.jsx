import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff,
  FiCamera, FiEdit2, FiTrendingUp
} from 'react-icons/fi';
import { toast } from 'sonner';
import { setCredentials } from '../../redux/slices/authSlice.js';
import api from '../../services/api.js';

const tabs = ['Profile', 'Security'];

export default function InstructorProfile() {
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
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      setAvatarLoading(true);
      const res = await api.put('/instructor/profile/avatar', formData);
      dispatch(setCredentials({ ...user, avatar: res.data.avatar }));
      toast.success('Avatar updated');
    } catch { toast.error('Failed to update avatar'); }
    finally { setAvatarLoading(false); }
  };

  const onProfileSubmit = async (data) => {
    try {
      setProfileLoading(true);
      const res = await api.put('/instructor/profile', data);
      dispatch(setCredentials({ ...user, ...res.data }));
      toast.success('Profile updated successfully');
    } catch { toast.error('Failed to update profile'); }
    finally { setProfileLoading(false); }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setPasswordLoading(true);
      await api.put('/instructor/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setPasswordLoading(false); }
  };

  const isGoogleUser = user?.authProvider === 'google' || !user?.authProvider;

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiTrendingUp size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
              <p className="text-xs text-gray-500">Manage your instructor account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <div className="relative inline-block mb-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl object-cover mx-auto" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto">
                    <span className="text-white text-3xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <label className={`absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition ${avatarLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {avatarLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiCamera size={14} className="text-gray-600" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>

              <p className="text-base font-bold text-gray-900 mb-0.5">{user?.name}</p>
              <p className="text-sm text-gray-400 mb-3">{user?.email}</p>
              <span className="inline-block text-xs font-medium px-3 py-1 bg-violet-50 text-violet-600 rounded-full capitalize">
                {user?.role}
              </span>
              {user?.isVerifiedInstructor && (
                <span className="inline-block ml-2 text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                  Verified
                </span>
              )}

              <div className="border-t border-gray-100 mt-5 pt-5 text-left space-y-3">
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

          {/* Tabs */}
          <div className="lg:col-span-2">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                    activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Profile' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <FiEdit2 size={15} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Edit Profile</h2>
                </div>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        {...registerProfile('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                        className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none transition ${profileErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                      />
                    </div>
                    {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={user?.email} disabled className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                    <textarea
                      rows={4}
                      {...registerProfile('bio')}
                      placeholder="Tell students about yourself, your experience, and what you teach..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-none"
                    />
                  </div>

                  <button type="submit" disabled={profileLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <FiLock size={15} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Change Password</h2>
                </div>

                {isGoogleUser ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FiLock size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Google Account</p>
                    <p className="text-sm text-gray-400">You signed in with Google — password cannot be changed here.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    {[
                      { name: 'currentPassword', label: 'Current Password', show: showCurrent, setShow: setShowCurrent, placeholder: '••••••••', rules: { required: 'Current password is required' } },
                      { name: 'newPassword', label: 'New Password', show: showNew, setShow: setShowNew, placeholder: 'Minimum 6 characters', rules: { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } } },
                      { name: 'confirmPassword', label: 'Confirm Password', show: showConfirm, setShow: setShowConfirm, placeholder: 'Re-enter new password', rules: { required: 'Please confirm password', validate: (val) => val === watch('newPassword') || 'Passwords do not match' } },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                        <div className="relative">
                          <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type={field.show ? 'text' : 'password'}
                            placeholder={field.placeholder}
                            {...registerPassword(field.name, field.rules)}
                            className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm outline-none transition ${passwordErrors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                          />
                          <button type="button" onClick={() => field.setShow(!field.show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {field.show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                          </button>
                        </div>
                        {passwordErrors[field.name] && <p className="text-red-500 text-xs mt-1">{passwordErrors[field.name].message}</p>}
                      </div>
                    ))}
                    <button type="submit" disabled={passwordLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}