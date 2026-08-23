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
        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">Explore learning</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Find your next course</h1>
            <p className="mt-2 text-sm text-slate-500">Learn from expert instructors and build skills that move you forward.</p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:max-w-sm">
            <FiSearch className="text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses" className="w-full text-sm outline-none" />
          </label>
        </div>

        {loading ? <div className="py-20 text-center text-sm text-slate-500">Loading courses...</div> : courses.length === 0 ? (
          <div className="py-20 text-center"><FiBookOpen size={34} className="mx-auto text-slate-300" /><p className="mt-3 text-sm text-slate-500">No published courses found.</p></div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <article key={course._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                {course.thumbnail ? <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="h-40 w-full object-cover" /> : <div className="flex h-40 items-center justify-center bg-blue-50 text-blue-300"><FiBookOpen size={36} /></div>}
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{course.category}</p>
                  <h2 className="mt-1 line-clamp-2 font-bold text-slate-900">{course.title}</h2>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{course.difficulty}</span><span className="flex items-center gap-1"><FiStar className="text-amber-400" /> {course.ratingAvg?.toFixed(1) || 'New'}</span></div>
                  <div className="mt-4 flex items-center justify-between"><span className="font-bold text-slate-900">{course.price === 0 ? 'Free' : `$${course.price}`}</span><Link to={`/courses/${course._id}`} className="flex items-center gap-1 text-sm font-semibold text-blue-600">View <FiArrowRight size={14} /></Link></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
