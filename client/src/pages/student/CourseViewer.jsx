import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiClock, FiDownload, FiPlayCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';
import { getMediaUrl } from '../../utils/media.js';

export default function CourseViewer() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lastWatchedTime, setLastWatchedTime] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const [courseResponse, enrollmentResponse] = await Promise.all([
          api.get(`/student/courses/${courseId}`),
          api.get('/student/my-courses'),
        ]);
        const enrolledCourse = enrollmentResponse.data.enrollments.find(
          (enrollment) => enrollment.course?._id === courseId
        );

        if (!enrolledCourse) {
          throw new Error('You are not enrolled in this course');
        }

        const courseData = courseResponse.data.course;
        const lessons = [...(courseData.lessons || [])].sort((a, b) => a.order - b.order);
        const initialLesson = lessons.find(
          (lesson) => lesson._id === String(enrolledCourse.lastWatchedLesson)
        ) || lessons[0];

        let lessonWithVideo = initialLesson;
        if (initialLesson) {
          const lessonResponse = await api.get(
            `/student/courses/${courseId}/lessons/${initialLesson._id}`
          );
          lessonWithVideo = lessonResponse.data.lesson;
        }

        setCourse(courseData);
        setCompletedLessons((enrolledCourse.completedLessons || []).map((lessonId) => String(lessonId)));
        setSelectedLesson(lessonWithVideo || null);
        setLastWatchedTime(enrolledCourse.lastWatchedTime || 0);
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Could not load course');
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId]);

  const selectLesson = async (lesson) => {
    try {
      const response = await api.get(`/student/courses/${courseId}/lessons/${lesson._id}`);
      setSelectedLesson(response.data.lesson);
      setLastWatchedTime(response.data.lastWatchedTime || 0);
      setVideoDuration(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open lesson');
    }
  };

  const saveProgress = async (event) => {
    const currentTime = event.currentTarget.currentTime;
    setLastWatchedTime(currentTime);
    if (!selectedLesson) return;
    try {
      await api.put(`/student/courses/${courseId}/lessons/${selectedLesson._id}/progress`, {
        lastWatchedTime: currentTime,
      });
    } catch {
      // Progress saving is retried on the next video time update.
    }
  };

  const markComplete = async (currentTime, duration) => {
    if (!selectedLesson) return;
    try {
      setSaving(true);
      await api.post(`/student/courses/${courseId}/lessons/${selectedLesson._id}/complete`, {
        currentTime,
        videoDuration: duration,
      });
      setCompletedLessons((previous) => (
        previous.includes(String(selectedLesson._id))
          ? previous
          : [...previous, String(selectedLesson._id)]
      ));
      toast.success('Lesson marked complete');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not mark lesson complete');
    } finally {
      setSaving(false);
    }
  };

  const handleTimeUpdate = (event) => {
    const video = event.currentTarget;
    saveProgress(event);

    const completionThreshold = video.duration > 20
      ? video.duration - 20
      : Math.max(0, video.duration - 1);
    const lessonId = String(selectedLesson?._id);

    if (
      video.duration > 0 &&
      video.currentTime >= completionThreshold &&
      !completedLessons.includes(lessonId) &&
      !saving
    ) {
      markComplete(video.currentTime, video.duration);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-gray-50 px-4 py-16 text-center"><p className="text-gray-600">Course could not be opened.</p><Link className="mt-4 inline-block text-sm text-blue-600" to="/student/my-courses">Back to My Courses</Link></div>;
  }

  const lessons = [...(course.lessons || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link to="/student/my-courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"><FiArrowLeft size={15} /> Back to My Courses</Link>
          <h1 className="mt-3 text-xl font-bold text-gray-900">{course.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{lessons.length} lesson{lessons.length === 1 ? '' : 's'} in this course</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="rounded-2xl border border-gray-200 bg-white p-5">
          {selectedLesson ? (
            <>
              <div className="overflow-hidden rounded-xl bg-black">
                <video
                  key={selectedLesson._id}
                  controls
                  className="aspect-video w-full"
                  src={getMediaUrl(selectedLesson.videoUrl)}
                  onLoadedMetadata={(event) => {
                    setVideoDuration(event.currentTarget.duration);
                    event.currentTarget.currentTime = Math.min(lastWatchedTime, event.currentTarget.duration);
                  }}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Lesson {selectedLesson.order}</p>
                  <h2 className="mt-1 text-lg font-bold text-gray-900">{selectedLesson.title}</h2>
                </div>
                <button type="button" disabled className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-blue-300">
                  <FiCheckCircle size={15} /> {saving ? 'Saving...' : completedLessons.includes(String(selectedLesson._id)) ? 'Completed' : videoDuration > 0 && lastWatchedTime >= (videoDuration > 20 ? videoDuration - 20 : Math.max(0, videoDuration - 1)) ? 'Completing...' : 'Watch until last 20 seconds'}
                </button>
              </div>
              {selectedLesson.resources?.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-bold text-gray-900">Lesson resources</h3>
                  <div className="mt-3 space-y-2">
                    {selectedLesson.resources.map((resource) => (
                      <a key={resource.fileUrl} href={getMediaUrl(resource.fileUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline"><FiDownload size={14} /> {resource.title}</a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <div className="py-20 text-center text-sm text-gray-500">No lessons are available yet.</div>}
        </main>

        <aside className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="px-2 text-sm font-bold text-gray-900">Course lessons</h2>
          <div className="mt-3 space-y-1">
            {lessons.map((lesson) => (
              <button key={lesson._id} type="button" onClick={() => selectLesson(lesson)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${selectedLesson?._id === lesson._id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FiPlayCircle size={16} />
                <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-medium">{lesson.title}</span><span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400"><FiClock size={11} /> {lesson.duration || 0} min</span></span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
