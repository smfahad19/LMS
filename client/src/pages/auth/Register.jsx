import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { setCredentials } from '../../redux/slices/authSlice.js';
import { registerUser, googleAuth } from '../../services/authService.js';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
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
      const { ...rest } = data;
      const user = await registerUser(rest);
      dispatch(setCredentials(user));
      toast.success(`Welcome to Learnly, ${user.name}!`);
      navigate(getDashboard(user.role));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const user = await googleAuth(credentialResponse.credential);
      dispatch(setCredentials(user));
      toast.success(`Welcome to Learnly, ${user.name}!`);
      navigate(getDashboard(user.role));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Google signup failed');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Join 12,000+ learners on Learnly</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          {/* Google Signup */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google signup failed')}
              width="100%"
              text="signup_with"
              shape="rectangular"
              logo_alignment="center"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Syed Fahad"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none transition ${
                    errors.name
                      ? 'border-red-300 focus:border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-blue-400 bg-white'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  placeholder="fahad@example.com"
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

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                I want to
              </label>
              <select
                {...register('role', { required: 'Please select a role' })}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition bg-white ${
                  errors.role
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-blue-400'
                }`}
              >
                <option value="">Select your role</option>
                <option value="student">Learn — I'm a Student</option>
                <option value="instructor">Teach — I'm an Instructor</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) =>
                      val === watch('password') || 'Passwords do not match',
                  })}
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none transition ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-blue-400 bg-white'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                {...register('terms', { required: 'Please accept terms' })}
                className="mt-0.5 accent-blue-600"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-xs -mt-2">{errors.terms.message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Protected by Learnly · Your data is safe with us 🔒
        </p>
      </div>
    </div>
  );
}