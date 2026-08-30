import { FiBookOpen, FiTarget, FiUsers, FiAward } from 'react-icons/fi';

const pillars = [
  {
    icon: <FiTarget className="text-blue-600" size={20} />,
    title: 'Career-first learning',
    description: 'Every lesson is designed to help students build job-ready skills, not just collect theory.',
  },
  {
    icon: <FiUsers className="text-blue-600" size={20} />,
    title: 'Real mentors',
    description: 'Students learn from instructors who work in the industry and understand what employers expect.',
  },
  {
    icon: <FiBookOpen className="text-blue-600" size={20} />,
    title: 'Practical curriculum',
    description: 'Courses are built around projects, progress tracking, quizzes, and measurable outcomes.',
  },
  {
    icon: <FiAward className="text-blue-600" size={20} />,
    title: 'Visible results',
    description: 'Students earn certificates, track progress, and showcase real achievements as they complete each course.',
  },
];

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">About Learnly</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Learning should be practical, affordable, and human.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Learnly was created to make quality education more accessible for students and professionals in Pakistan.
            We believe people should learn in a way that is clear, focused, and actually useful for their careers.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                {item.icon}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Our mission</p>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">Built to help people upskill with confidence.</h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                We are focused on helping students transition from uncertainty to real progress. Whether someone is learning web development, design, data, or business skills, Learnly gives them a structured path to improve and grow.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white shadow-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Why students choose us</p>
              <ul className="mt-6 space-y-4 text-sm text-blue-50">
                <li>• Structured courses that are easy to follow</li>
                <li>• Practical lessons with project-based learning</li>
                <li>• Teacher support and clear progress tracking</li>
                <li>• Certificates that help showcase real achievement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
