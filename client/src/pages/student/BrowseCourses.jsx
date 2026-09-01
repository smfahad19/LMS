import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiSearch, FiStar, FiArrowRight } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';
import { getMediaUrl } from '../../utils/media.js';

export default function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/student/courses', { params: { search, limit: 50 } });
        setCourses(response.data.courses || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load courses');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadCourses, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Explore learning</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Browse courses</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Discover practical lessons and build your next skill with focused, real-world learning.
              </p>
            </div>

            <label className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-md">
              <FiSearch className="text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search courses"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center">
            <FiBookOpen size={34} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No published courses found.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {courses.map((course) => (
              <article
                key={course._id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="relative">
                  {course.thumbnail ? (
                    <img
                      src={getMediaUrl(course.thumbnail)}
                      alt={course.title}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-slate-100 text-slate-300">
                      <FiBookOpen size={34} />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700 shadow-sm">
                    {course.category || 'Course'}
                  </span>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{course.difficulty || 'All levels'}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-medium text-amber-600">
                        <FiStar size={12} className="fill-current" /> {course.ratingAvg?.toFixed(1) || 'New'}
                      </span>
                    </div>
                    <h2 className="line-clamp-2 text-lg font-bold text-slate-900">{course.title}</h2>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div>
                      <p className="text-[11px] text-slate-500">Certificate included</p>
                      <span className="text-lg font-bold text-slate-900">
                        {course.price === 0 ? 'Free' : `$${Number(course.price || 0).toFixed(2)}`}
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View <FiArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
