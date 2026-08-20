import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { setCredentials } from '../../redux/slices/authSlice.js';
import { loginUser, googleAuth } from '../../services/authService.js';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const getDashboard = (role) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const user = await loginUser(data);
      dispatch(setCredentials(user));
      toast.success(`Welcome back, ${user.name}!`);
      navigate(getDashboard(user.role));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const user = await googleAuth(credentialResponse.credential);
      dispatch(setCredentials(user));
      toast.success(`Welcome, ${user.name}!`);
      navigate(getDashboard(user.role));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">Learnly</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">Log in to continue your learning journey</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          {/* Google Login */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              width="100%"
              text="signin_with"
              shape="rectangular"
              logo_alignment="center"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  placeholder="learnly@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none transition ${
                    errors.email
                      ? 'border-red-300 focus:border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-blue-400 bg-white'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                  className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm outline-none transition ${
                    errors.password
                      ? 'border-red-300 focus:border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-blue-400 bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition text-sm mt-2"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}