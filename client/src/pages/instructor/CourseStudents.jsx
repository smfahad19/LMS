import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';
import { issueStudentCertificate } from '../../services/instructorService.js';

export default function CourseStudents() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const [courseResponse, studentsResponse] = await Promise.all([
        api.get(`/instructor/courses/${id}`),
        api.get(`/instructor/courses/${id}/students`, { params: { page: 1, limit: 100 } }),
      ]);
      setCourse(courseResponse.data.course);
      setStudents(studentsResponse.data.enrollments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load students');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // The loader synchronizes remote enrollment data into this page state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStudents();
  }, [loadStudents]);

  const handleIssueCertificate = async (studentId) => {
    try {
      setIssuing(studentId);
      const response = await issueStudentCertificate(id, studentId);
      toast.success(response.message || 'Certificate issued');
      loadStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not issue certificate');
    } finally {
      setIssuing(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to={`/instructor/courses/${id}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"><FiArrowLeft size={15} /> Back to course</Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-7">
          <div><p className="text-sm font-semibold text-blue-600">Course roster</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{course?.title || 'Enrolled students'}</h1><p className="mt-2 text-sm text-slate-500">Newest enrollments appear first.</p></div>
          <button type="button" onClick={loadStudents} disabled={loading} title="Refresh students" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"><FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
        </div>
        {!loading && course && !course.isClosed && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Close this course from the course management page before issuing certificates.</div>}
        {loading ? <div className="py-20 text-center text-sm text-slate-500">Loading students...</div> : students.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"><FiUsers size={40} className="mx-auto text-slate-300" /><h2 className="mt-4 font-bold text-slate-900">No students enrolled yet</h2><p className="mt-1 text-sm text-slate-500">Students will appear here after enrollment or payment.</p></div>
        ) : <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden grid-cols-[minmax(0,1fr)_180px_130px_150px] gap-4 border-b border-slate-100 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid"><span>Student</span><span>Progress</span><span>Status</span><span>Certificate</span></div>{students.map((enrollment) => <div key={enrollment._id} className="grid gap-4 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_180px_130px_150px] md:items-center md:px-6"> <div className="flex min-w-0 items-center gap-3">{enrollment.student?.avatar ? <img src={enrollment.student.avatar} alt={enrollment.student.name} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{enrollment.student?.name?.charAt(0).toUpperCase()}</div>}<div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{enrollment.student?.name || 'Unknown student'}</p><p className="truncate text-xs text-slate-400">{enrollment.student?.email}</p><p className="mt-1 text-xs text-slate-400">Joined {new Date(enrollment.createdAt).toLocaleDateString()}</p></div></div><div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>Course progress</span><span>{enrollment.completionPercentage || 0}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, enrollment.completionPercentage || 0)}%` }} /></div></div><span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${enrollment.isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{enrollment.isCompleted ? <FiCheckCircle /> : <FiClock />}{enrollment.isCompleted ? 'Completed' : 'In progress'}</span><div>{enrollment.certificateIssued ? <span className="text-xs font-semibold text-emerald-600">Issued</span> : <button type="button" onClick={() => handleIssueCertificate(enrollment.student?._id)} disabled={!course?.isClosed || !enrollment.isCompleted || issuing === enrollment.student?._id} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">{issuing === enrollment.student?._id ? 'Issuing...' : 'Issue certificate'}</button>}</div></div>)}</div>}
      </div>
    </div>
  );
}
