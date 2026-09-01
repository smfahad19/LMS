import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiAward, FiClock, FiPrinter } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';

export default function Certificates() {
  const location = useLocation();
  const [certificates, setCertificates] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCourseId = new URLSearchParams(location.search).get('courseId');

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const [certificateResponse, enrollmentResponse] = await Promise.all([
          api.get('/student/certificates'),
          api.get('/student/my-courses'),
        ]);
        const issuedCertificates = certificateResponse.data || [];
        const filteredCertificates = selectedCourseId
          ? issuedCertificates.filter((certificate) => certificate.course?._id === selectedCourseId)
          : issuedCertificates;

        setCertificates(filteredCertificates);
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
  }, [selectedCourseId]);

  return (
    <>
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          .certificate-print-area,
          .certificate-print-area * {
            visibility: visible;
          }
          .certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            box-shadow: none;
            border: none;
            background: white;
          }
          .certificate-print-actions,
          .certificate-page-header,
          .certificate-empty-state,
          .certificate-pending-box {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="certificate-page-header border-b border-slate-200 pb-7">
            <p className="text-sm font-semibold text-blue-600">Your achievements</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {selectedCourseId ? 'Course certificate' : 'Certificates'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {selectedCourseId
                ? 'This is the certificate for the selected course.'
                : 'Celebrate the courses you completed and share your progress.'}
            </p>
          </div>
          {loading ? <div className="py-20 text-center text-sm text-slate-500">Loading certificates...</div> : certificates.length === 0 && pendingCourses.length === 0 ? (
          <div className="certificate-empty-state mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"><FiAward size={42} className="mx-auto text-amber-400" /><h2 className="mt-4 font-bold text-slate-900">No certificates yet</h2><p className="mt-1 text-sm text-slate-500">Complete every lesson in a course to earn one.</p><Link to="/courses" className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Browse courses</Link></div>
        ) : <div className="mt-8 grid gap-7">{pendingCourses.length > 0 &&
          <div className="certificate-pending-box rounded-2xl border border-amber-200 bg-amber-50 p-5">
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
            certificates.map((certificate) => <article key={certificate._id} className="certificate-print-area mx-auto w-full max-w-4xl overflow-hidden rounded-[24px] border border-amber-200 bg-[#fffdf7] shadow-sm">
              <div className="p-5 sm:p-8 md:p-10">
                <div className="flex items-center justify-between">
                  <div className="h-2 w-14 bg-blue-600" />
                  <FiAward size={30} className="text-amber-500" />
                  <div className="h-2 w-14 bg-blue-600" />
                </div>

                <div className="mx-auto mt-7 max-w-3xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-blue-700">Learnly Academy</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">Certificate of Completion</h2>
                  <p className="mt-4 text-sm text-slate-500">This is to certify that</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{certificate.student?.name || 'Student Name'}</p>
                  <p className="mt-4 text-sm text-slate-500">has successfully completed the course</p>
                  <p className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">{certificate.course?.title}</p>
                  <p className="mt-4 text-sm text-slate-600">
                    under the guidance of <span className="font-semibold text-slate-900">{certificate.course?.instructor?.name || 'Course Instructor'}</span>
                  </p>
                  <div className="mx-auto mt-5 h-px max-w-sm bg-amber-300" />
                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    This certificate confirms the learner completed all required lessons, exercises, and assessments for this course and met the standards set by Learnly Academy.
                  </p>
                </div>

                <div className="mt-8 grid gap-4 border-y border-amber-200 bg-amber-50/30 px-4 py-5 text-left sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Course</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{certificate.course?.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Instructor</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{certificate.course?.instructor?.name || 'Course Instructor'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Issued</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{new Date(certificate.issuedAt || certificate.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="certificate-print-actions mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-amber-200 pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Certificate ID</p>
                    <p className="mt-1 text-xs font-semibold text-slate-700">{certificate.certificateId}</p>
                  </div>
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700">
                    <FiPrinter size={14} /> Print certificate
                  </button>
                </div>
              </div>
            </article>
            )}
        </div>
        }
      </div>
    </div>
    </>
  );
}
