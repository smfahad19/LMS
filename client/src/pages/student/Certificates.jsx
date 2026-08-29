import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiClock, FiExternalLink, FiPrinter } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const [certificateResponse, enrollmentResponse] = await Promise.all([
          api.get('/student/certificates'),
          api.get('/student/my-courses'),
        ]);
        const issuedCertificates = certificateResponse.data || [];
        setCertificates(issuedCertificates);
        const issuedCourseIds = new Set(issuedCertificates.map((certificate) => certificate.course?._id));
        setPendingCourses((enrollmentResponse.data.enrollments || []).filter(
          (enrollment) => enrollment.isCompleted && !issuedCourseIds.has(enrollment.course?._id)
        ));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load certificates');
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-slate-200 pb-7"><p className="text-sm font-semibold text-blue-600">Your achievements</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Certificates</h1><p className="mt-2 text-sm text-slate-500">Celebrate the courses you completed and share your progress.</p></div>
        {loading ? <div className="py-20 text-center text-sm text-slate-500">Loading certificates...</div> : certificates.length === 0 && pendingCourses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"><FiAward size={42} className="mx-auto text-amber-400" /><h2 className="mt-4 font-bold text-slate-900">No certificates yet</h2><p className="mt-1 text-sm text-slate-500">Complete every lesson in a course to earn one.</p><Link to="/courses" className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Browse courses</Link></div>
        ) : <div className="mt-8 grid gap-7">{pendingCourses.length > 0 &&
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <FiClock className="mt-0.5 text-amber-600" />
              <div>
                <h2 className="font-bold text-amber-900">Certificates awaiting instructor issue</h2>
                <p className="mt-1 text-sm text-amber-800">You completed these courses. Your instructor must close the course and issue your certificate individually.</p>
                <div className="mt-3 space-y-1 text-sm font-semibold text-amber-900">
                  {pendingCourses.map((enrollment) => <p key={enrollment._id}>{enrollment.course?.title}</p>)}
                </div>
              </div>
            </div>
          </div>
        }{
            certificates.map((certificate) => <article key={certificate._id} className="overflow-hidden rounded-2xl border-2 border-amber-200 bg-[#fffdf7] shadow-lg">
              <div className="m-2 border border-amber-300 p-6 sm:p-10">

                <div className="flex items-center justify-between">
                  <div className="h-2 w-20 bg-blue-600" />
                  <FiAward size={42} className="text-amber-500" />
                  <div className="h-2 w-20 bg-blue-600" />
                </div>
                <div className="mt-7 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-700">Learnly Academy</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Certificate of Completion</h2>
                  <p className="mt-5 text-sm text-slate-500">This certificate is proudly presented for successfully completing</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{certificate.course?.title}</p>
                  <div className="mx-auto mt-7 h-px max-w-sm bg-amber-300" />
                  <p className="mt-4 text-xs text-slate-500">Issued on {new Date(certificate.issuedAt || certificate.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-amber-200 pt-5">
                  <div>
                    <p className="text-xs text-slate-400">Certificate ID</p>
                    <p className="mt-1 text-xs font-semibold text-slate-700">{certificate.certificateId}</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><FiPrinter /> Print</button>{certificate.shareToken &&
                      <a href={`/certificates/verify/${certificate.shareToken}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"><FiExternalLink /> Verify</a>}
                  </div>
                </div>
              </div>
            </article>
            )}
        </div>
        }
      </div>
    </div>
  );
}
