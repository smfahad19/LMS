import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi';

const socials = [
  { icon: <FiTwitter size={15} />, href: '#' },
  { icon: <FiLinkedin size={15} />, href: 'https://linkedin.com/in/smfahad19' },
  { icon: <FiGithub size={15} />, href: 'https://github.com/smfahad19' },
];

const sharedFooterLinks = {
  Explore: [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
  ],
  Account: [
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ],
};

const roleFooterLinks = {
  admin: {
    Admin: [
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Manage Users', to: '/admin/manage-users' },
      { label: 'Manage Courses', to: '/admin/manage-courses' },
      { label: 'Pending Courses', to: '/admin/pending-courses' },
      { label: 'Manage Payments', to: '/admin/manage-payments' },
      { label: 'Manage Reviews', to: '/admin/manage-reviews' },
      { label: 'Profile', to: '/admin/profile' },
    ],
  },
  instructor: {
    Teaching: [
      { label: 'Dashboard', to: '/instructor/dashboard' },
      { label: 'My Courses', to: '/instructor/courses' },
      { label: 'Create Course', to: '/instructor/create-course' },
      { label: 'Profile', to: '/instructor/profile' },
    ],
  },
  student: {
    Learning: [
      { label: 'Dashboard', to: '/student/dashboard' },
      { label: 'My Learning', to: '/student/my-courses' },
      { label: 'Browse Courses', to: '/courses' },
      { label: 'Profile', to: '/student/profile' },
    ],
  },
};

export default function Footer() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  const publicRoutes = ['/', '/about', '/blog', '/login', '/register'];
  const isPublicPage = publicRoutes.includes(pathname) || pathname.startsWith('/courses/') && !isAuthenticated;

  if (!isPublicPage) {
    return null;
  }

  const footerLinks = isAuthenticated
    ? { ...(roleFooterLinks[user?.role] || {}), ...sharedFooterLinks }
    : { ...sharedFooterLinks };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <span className="text-gray-900 font-bold text-lg">Learnly</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Pakistan's fastest growing learning platform. Built for developers, by developers.
            </p>
            <div className="flex items-center gap-2">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-gray-900 font-semibold text-sm mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-500 hover:text-blue-600 transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-sm">© 2026 Learnly. All rights reserved.</p>
          <p className="text-gray-400 text-sm">
            Built by{' '}
            <a
              href="https://syedfahad22.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Syed Fahad
            </a>
            {' · '}
            <a
              href="https://github.com/smfahad19"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              NexoraX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}