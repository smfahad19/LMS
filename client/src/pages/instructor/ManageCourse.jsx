import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  FiBookOpen, FiUpload, FiTrash2, FiPlus,
  FiPlay, FiSend, FiX, FiSave, FiUsers,
  FiStar, FiAlertCircle, FiCheck
} from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';
import {
  addLesson, deleteLesson,
  createQuiz, requestPublish, closeCourse
} from '../../services/instructorService.js';

const tabs = ['Overview', 'Lessons', 'Quiz', 'Students'];

function ManageCourse() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [lessonModal, setLessonModal] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(60);
  const [quizLoading, setQuizLoading] = useState(false);

  const {
    register: registerLesson,
    handleSubmit: handleLessonSubmit,
    reset: resetLesson,
    formState: { errors: lessonErrors },
  } = useForm();

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/instructor/courses/${id}`);
      setCourse(res.data.course);
      setLessons(res.data.course.lessons?.sort((a, b) => a.order - b.order) || []);
      setQuiz(res.data.quiz);
      setEnrolledCount(res.data.enrolledCount);
      if (res.data.quiz) {
        setQuizTitle(res.data.quiz.title);
        setQuizQuestions(res.data.quiz.questions);
        setPassingScore(res.data.quiz.passingScore);
      }
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get(`/instructor/courses/${id}/students`, { params: { page: 1, limit: 100 } });
      setStudents(res.data.enrollments);
    } catch {
      toast.error('Failed to load students');
    }
  }, [id]);

  useEffect(() => {
    const loadCourse = async () => {
      await fetchCourse();
    };

    loadCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (activeTab !== 'Students') return;

    const loadStudents = async () => {
      await fetchStudents();
    };

    loadStudents();
  }, [activeTab, fetchStudents]);

  const handleAddLesson = async (data) => {
    if (!videoFile) {
      toast.error('Please select a video');
      return;
    }
    try {
      setVideoLoading(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('order', lessons.length + 1);
      formData.append('isFreePreview', data.isFreePreview ? 'true' : 'false');
      formData.append('video', videoFile);
      await addLesson(id, formData);
      toast.success('Lesson added successfully');
      setLessonModal(false);
      setVideoFile(null);
      resetLesson();
      fetchCourse();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add lesson');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      setActionLoading(true);
      await deleteLesson(lessonId);
      toast.success('Lesson deleted');
      fetchCourse();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishRequest = async () => {
    try {
      setActionLoading(true);
      await requestPublish(id);
      toast.success('Publish request sent to admin');
      fetchCourse();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCourse = async () => {
    if (!window.confirm('Close this course and issue certificates to completed students?')) return;
    try {
      setActionLoading(true);
      const response = await closeCourse(id);
      toast.success(response.message || 'Course closed');
      fetchCourse();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to close course');
    } finally {
      setActionLoading(false);
    }
  };

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      questionText: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex] = value;
    setQuizQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle) { toast.error('Quiz title required'); return; }
    if (quizQuestions.length === 0) { toast.error('Add at least one question'); return; }
    try {
      setQuizLoading(true);
      await createQuiz(id, { title: quizTitle, questions: quizQuestions, passingScore });
      toast.success('Quiz saved successfully');
      fetchCourse();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FiBookOpen size={20} className="text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-base font-bold text-gray-900 max-w-md truncate">{course.title}</h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    course.isPublished ? 'bg-emerald-50 text-emerald-600' :
                    course.publishRequested ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {course.isPublished ? 'Published' : course.publishRequested ? 'In Review' : 'Draft'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FiUsers size={11} />
                    <span>{enrolledCount} students</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FiStar size={11} />
                    <span>{course.ratingAvg?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Link to={`/instructor/courses/${id}/students`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600"><FiUsers size={13} />View Students</Link>
              {!course.isPublished && !course.publishRequested && lessons.length > 0 && (
                <button onClick={handlePublishRequest} disabled={actionLoading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"><FiSend size={13} />Submit for Review</button>
              )}
              {!course.isClosed && course.isPublished && (
                <button onClick={handleCloseCourse} disabled={actionLoading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"><FiCheck size={13} />Close Course</button>
              )}
              {course.isClosed && <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">Course closed</span>}
            </div>
          </div>

          {course.rejectionReason && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mt-3">
              <FiAlertCircle size={14} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-700">Rejected by Admin</p>
                <p className="text-xs text-red-600 mt-0.5">{course.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-5">Course Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Category', value: course.category },
                { label: 'Difficulty', value: course.difficulty },
                { label: 'Price', value: course.price === 0 ? 'Free' : `$${course.price}` },
                { label: 'Duration', value: course.duration || 'N/A' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{course.description}</p>
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'Lessons' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">{lessons.length} Lessons</p>
              <button
                onClick={() => setLessonModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
              >
                <FiPlus size={14} />
                Add Lesson
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl text-center py-16">
                <FiPlay size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">No lessons yet</p>
                <p className="text-sm text-gray-400 mb-5">Add your first video lesson</p>
                <button
                  onClick={() => setLessonModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  <FiPlus size={14} />
                  Add Lesson
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div key={lesson._id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
                        {lesson.isFreePreview && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">
                            Free Preview
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {lesson.duration ? `${Math.floor(lesson.duration / 60)}m ${lesson.duration % 60}s` : 'Video uploaded'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={lesson.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                      >
                        <FiPlay size={13} />
                      </a>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        disabled={actionLoading}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'Quiz' && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Quiz Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Quiz Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Final Assessment"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Passing Score (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500">Question {qIndex + 1}</span>
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition"
                    >
                      <FiX size={13} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter your question"
                      value={q.questionText}
                      onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white"
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="true_false">True / False</option>
                          <option value="fill_blank">Fill in Blank</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                        <input
                          type="number"
                          min="1"
                          value={q.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    {q.type === 'mcq' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">Options</label>
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswer === opt && opt !== ''}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', opt)}
                              className="accent-blue-600"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${oIndex + 1}`}
                              value={opt}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
                      </div>
                    )}

                    {q.type === 'true_false' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Correct Answer</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white"
                        >
                          <option value="">Select</option>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    )}

                    {q.type === 'fill_blank' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Correct Answer</label>
                        <input
                          type="text"
                          placeholder="Enter correct answer"
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-5 py-2.5 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-medium transition"
              >
                <FiPlus size={14} />
                Add Question
              </button>
              <button
                onClick={handleSaveQuiz}
                disabled={quizLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
              >
                <FiSave size={14} />
                {quizLoading ? 'Saving...' : quiz ? 'Update Quiz' : 'Save Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'Students' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">{enrolledCount} Enrolled Students</h2>
            </div>
            {students.length === 0 ? (
              <div className="text-center py-16">
                <FiUsers size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No students enrolled yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {students.map((enrollment) => (
                  <div key={enrollment._id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
                    {enrollment.student?.avatar ? (
                      <img src={enrollment.student.avatar} alt={enrollment.student.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {enrollment.student?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{enrollment.student?.name}</p>
                      <p className="text-xs text-gray-400">{enrollment.student?.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${enrollment.completionPercentage || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{enrollment.completionPercentage || 0}%</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        enrollment.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {enrollment.isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Lesson Modal */}
      {lessonModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Add New Lesson</h2>
              <button
                onClick={() => { setLessonModal(false); setVideoFile(null); resetLesson(); }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleLessonSubmit(handleAddLesson)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to React Hooks"
                  {...registerLesson('title', { required: 'Title is required' })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition ${
                    lessonErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                />
                {lessonErrors.title && <p className="text-red-500 text-xs mt-1">{lessonErrors.title.message}</p>}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Video File</label>
                <label className="block cursor-pointer">
                  {videoFile ? (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <FiPlay size={16} className="text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-700 truncate">{videoFile.name}</p>
                        <p className="text-xs text-blue-500">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setVideoFile(null); }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50 transition">
                      <FiUpload size={24} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Click to upload video</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI up to 500MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freePreview"
                  {...registerLesson('isFreePreview')}
                  className="accent-blue-600"
                />
                <label htmlFor="freePreview" className="text-sm text-gray-600">
                  Mark as free preview (visible without enrollment)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setLessonModal(false); setVideoFile(null); resetLesson(); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={videoLoading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition"
                >
                  {videoLoading ? 'Uploading...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCourse;