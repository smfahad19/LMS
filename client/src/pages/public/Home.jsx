import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlay, FiAward, FiUsers, FiBookOpen, FiStar, FiCheck } from 'react-icons/fi';

const stats = [
  { value: '12,000+', label: 'Students Learning' },
  { value: '600+', label: 'Courses Available' },
  { value: '150+', label: 'Expert Instructors' },
  { value: '4.9/5', label: 'Average Rating' },
];

const features = [
  {
    icon: <FiPlay className="text-blue-600" size={20} />,
    title: 'HD Video Lessons',
    desc: 'Watch crystal clear video lessons anytime, on any device — at your own pace.',
  },
  {
    icon: <FiAward className="text-blue-600" size={20} />,
    title: 'Earn Certificates',
    desc: 'Complete a course and get a downloadable certificate to add to your portfolio.',
  },
  {
    icon: <FiUsers className="text-blue-600" size={20} />,
    title: 'Real Instructors',
    desc: 'Learn from working professionals who have actually shipped real products.',
  },
  {
    icon: <FiBookOpen className="text-blue-600" size={20} />,
    title: 'Quizzes & Progress',
    desc: 'Stay on track with quizzes, progress bars, and resume-where-you-left-off.',
  },
];

const categories = [
  { emoji: '💻', name: 'Web Development', count: '120 courses' },
  { emoji: '📱', name: 'Mobile Apps', count: '85 courses' },
  { emoji: '📊', name: 'Data Science', count: '95 courses' },
  { emoji: '🎨', name: 'UI/UX Design', count: '60 courses' },
  { emoji: '🔒', name: 'Cybersecurity', count: '45 courses' },
  { emoji: '☁️', name: 'Cloud & DevOps', count: '70 courses' },
];

const testimonials = [
  {
    name: 'Ali Hassan',
    role: 'Frontend Developer at Arbisoft',
    initials: 'AH',
    text: "I went from knowing nothing about React to landing my first dev job — all through Learnly. The quality of content here is genuinely world class.",
    rating: 5,
  },
  {
    name: 'Sara Nawaz',
    role: 'UI/UX Designer at 10Pearls',
    initials: 'SN',
    text: "Finally a platform that doesn't treat you like a complete beginner. The instructors are actual practitioners, not just teachers. Huge difference.",
    rating: 5,
  },
  {
    name: 'Usman Tariq',
    role: 'Data Analyst at Folio3',
    initials: 'UT',
    text: "Completed the Data Science track in 3 months. Got my certificate, updated my CV, and had 3 interview calls the same week. Learnly works.",
    rating: 5,
  },
];

export default function Home() {
  return (
    <div className="bg-white text-gray-900">

      {/* Hero */}
      <section className="py-20 md:py-28 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Rated #1 Learning Platform in Pakistan 🇵🇰
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            The skills you need.<br />
            <span className="text-blue-600">The career you want.</span>
          </h1>

          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Learnly is where Pakistan's best developers, designers, and creators come to learn — and where companies come to hire them. Join 12,000+ students already building their future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition flex items-center gap-2 text-sm"
            >
              Browse Courses <FiArrowRight size={16} />
            </Link>
            <Link
              to="/register"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-7 py-3.5 rounded-xl transition text-sm"
            >
              Start for Free
            </Link>
          </div>

          <p className="text-gray-400 text-xs mt-5">
            No credit card required · Cancel anytime · Free courses available
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Built differently — on purpose
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              We obsessed over every detail so you can focus on learning, not figuring out the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-gray-900 font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Whatever you want to learn — it's here
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              From your first line of code to deploying production apps — we have courses for every level.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center text-center hover:border-blue-200 hover:shadow-sm transition group"
              >
                <span className="text-3xl mb-3">{cat.emoji}</span>
                <p className="text-gray-900 text-sm font-semibold mb-1 group-hover:text-blue-600 transition">{cat.name}</p>
                <p className="text-gray-400 text-xs">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              From zero to hired — here's how
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create your free account',
                desc: 'Sign up in 30 seconds. No credit card, no commitment. Just start learning.',
                checks: ['Google sign-in supported', 'Free courses available', 'No hidden fees'],
              },
              {
                step: '2',
                title: 'Pick a course and enroll',
                desc: 'Browse by category, skill level, or instructor. Filter by price, rating, or duration.',
                checks: ['Beginner to advanced', 'HD video lessons', 'Downloadable resources'],
              },
              {
                step: '3',
                title: 'Complete and get certified',
                desc: 'Finish all lessons, pass the quiz, and download your certificate instantly.',
                checks: ['Auto-generated certificate', 'Share on LinkedIn', 'Add to your CV'],
              },
            ].map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-7">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold mb-5">
                  {item.step}
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{item.desc}</p>
                <ul className="space-y-2">
                  {item.checks.map((c, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCheck className="text-blue-600 min-w-3.5" size={14} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Real students. Real results.
            </h2>
            <p className="text-gray-500 text-base">
              Don't take our word for it — here's what people who actually used Learnly have to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 min-w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center border border-gray-200 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Start learning today.<br />It's free to begin.
          </h2>
          <p className="text-gray-500 text-base mb-8 max-w-lg mx-auto">
            Learnly was built by{' '}
            <a href="https://syedfahad22.vercel.app" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline">
              Syed Fahad
            </a>
            {' '}— a developer from Lahore who got tired of overpriced, outdated learning platforms. So he built a better one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition flex items-center gap-2 text-sm"
            >
              Create Free Account <FiArrowRight size={16} />
            </Link>
            <Link
              to="/courses"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-7 py-3.5 rounded-xl transition text-sm"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}