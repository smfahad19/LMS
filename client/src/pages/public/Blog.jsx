import { Link } from 'react-router-dom';

const posts = [
  {
    title: 'How to choose the right course for your career goals',
    excerpt: 'A simple framework to pick a course that matches your skills, budget, and long-term goals.',
    readTime: '4 min read',
  },
  {
    title: 'The beginner roadmap for front-end development in 2026',
    excerpt: 'Learn the core tools and skills that matter most before you start building production projects.',
    readTime: '6 min read',
  },
  {
    title: 'Why certificates still matter in a skills-first market',
    excerpt: 'Certificates help communicate progress, but real outcomes still come from applied work and portfolio projects.',
    readTime: '5 min read',
  },
  {
    title: '3 habits that help students finish courses consistently',
    excerpt: 'Small daily routines often outperform motivation. Here are the routines that actually keep momentum alive.',
    readTime: '3 min read',
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Blog</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Learn smarter. Grow faster.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Insights, roadmaps, and practical advice for students who want to build skills that lead to real opportunities.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-600">Learning</p>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">{post.title}</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">{post.excerpt}</p>
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs font-medium text-gray-500">{post.readTime}</span>
                <Link to="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Read article</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
