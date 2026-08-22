import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMenu, FiX, FiLogOut, FiLayout, FiUser, FiChevronDown } from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice.js';
import { toast } from 'sonner';
import { logoutUser } from '../../services/authService.js';
import { getMediaUrl } from '../../utils/media.js';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/');
      setDropdownOpen(false);
      setMenuOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const guestNavLinks = [
    { label: 'Home', to: '/' },
    { label: 'Instructors', to: '/instructors' },
    { label: 'Pricing', to: '/pricing' },
  ];

  const roleNavLinks = {
    admin: [
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Manage Users', to: '/admin/manage-users' },
      { label: 'Profile', to: '/admin/profile' },
    ],
    instructor: [
      { label: 'Dashboard', to: '/instructor/dashboard' },
      { label: 'Profile', to: '/instructor/profile' },
    ],
    student: [
      { label: 'Dashboard', to: '/student/dashboard' },
      { label: 'Profile', to: '/student/profile' },
    ],
  };

  const navLinks = isAuthenticated
    ? roleNavLinks[user?.role] || []
    : guestNavLinks;

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — logged in ho to dashboard pe, guest ho to home pe */}
          <Link
            to={isAuthenticated ? getDashboardLink() : '/'}
            onClick={() => {
              setMenuOpen(false);
              setDropdownOpen(false);
            }}
            className="flex items-center gap-2 group"
          >
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-blue-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-base tracking-tighter">Ly</span>
              </div>
            </div>
            <span className="text-gray-900 font-bold text-xl tracking-tight">
              Learn<span className="text-blue-600">ly</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive(link.to)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {!isLoading && isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  {user?.avatar ? (
                    <img
                      src={getMediaUrl(user.avatar)}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 font-medium max-w-24 truncate">
                    {user?.name}
                  </span>
                  <FiChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${
                    dropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0'
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <FiLayout size={14} className="text-blue-500" />
                      Dashboard
                    </Link>
                    <Link
                      to={`/${user?.role}/profile`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <FiUser size={14} className="text-blue-500" />
                      Profile
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : !isLoading ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors duration-200 shadow-sm shadow-blue-200"
                >
                  Get Started →
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Button */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`transition-all duration-200 ${menuOpen ? 'rotate-90' : 'rotate-0'}`}>
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`text-sm py-2.5 px-3 rounded-xl transition-colors ${
                isActive(link.to)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 pt-2 mt-1 flex flex-col gap-1">
            {!isLoading && isAuthenticated ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  {user?.avatar ? (
                    <img
                      src={getMediaUrl(user.avatar)}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-gray-600 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <FiLayout size={14} className="text-blue-500" /> Dashboard
                </Link>
                <Link
                  to={`/${user?.role}/profile`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-gray-600 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <FiUser size={14} className="text-blue-500" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-red-500 py-2.5 px-3 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </>
            ) : !isLoading ? (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-blue-600 text-white py-2.5 px-3 rounded-xl text-center hover:bg-blue-700 transition-colors"
                >
                  Get Started →
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}