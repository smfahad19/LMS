import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { toast } from 'sonner';
import { getQuiz, submitQuiz } from '../../services/studentService.js';

export default function StudentQuiz() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await getQuiz(courseId, quizId);
        const normalizedQuiz = {
          ...data.quiz,
          questions: (data.quiz.questions || []).map((q) => ({
            ...q,
            type: q.type || 'mcq',
            options: Array.isArray(q.options) && q.options.length > 0
              ? q.options
              : q.type === 'true_false'
                ? ['True', 'False']
                : [],
          })),
        };

        setQuiz(normalizedQuiz);
        const initialAnswers = {};
        normalizedQuiz.questions.forEach((q, index) => {
          initialAnswers[getQuestionKey(q, index)] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load quiz');
        navigate(`/student/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [courseId, quizId, navigate]);

  const getQuestionKey = (question, index) => question?._id?.toString?.() || question?.id || `question-${index}`;

  const handleAnswerChange = (questionKey, answer) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [questionKey]: answer }));
    }
  };

  const handleSubmit = async () => {
    const allAnswered = quiz.questions.every((q, index) => {
      const questionKey = getQuestionKey(q, index);
      return String(answers[questionKey] ?? '').trim() !== '';
    });

    if (!allAnswered) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      const data = await submitQuiz(courseId, quizId, answers);
      setResult(data);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl py-20 text-center text-sm text-slate-500">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link to={`/student/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
          <FiArrowLeft size={16} /> Back to course
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          {!submitted ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-950">{quiz.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <FiClock size={16} /> {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                  </span>
                  <span>Passing score: <span className="font-semibold text-slate-900">{quiz.passingScore}%</span></span>
                </div>
              </div>

              <div className="space-y-6 border-t border-slate-200 pt-6">
                {quiz.questions.map((question, index) => {
                  const questionKey = getQuestionKey(question, index);
                  const options = question.type === 'true_false'
                    ? ['True', 'False']
                    : Array.isArray(question.options)
                      ? question.options
                      : [];

                  return (
                    <div key={questionKey} className="rounded-lg border border-slate-200 p-5">
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Question {index + 1}</p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{question.questionText}</h3>
                        <p className="mt-1 text-sm text-slate-500">Points: {question.points}</p>
                      </div>

                      <div className="space-y-2">
                        {options.map((option, optIndex) => {
                          const optionValue = String(option).toLowerCase();

                          return (
                            <label key={optIndex} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50">
                              <input
                                type="radio"
                                name={questionKey}
                                value={optionValue}
                                checked={String(answers[questionKey] || '').toLowerCase() === optionValue}
                                onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
                                disabled={submitted}
                                className="mt-1"
                              />
                              <span className="text-sm font-medium text-slate-700">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => navigate(`/student/courses/${courseId}`)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300">
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 rounded-xl border-2 p-6" style={{ borderColor: result.passed ? '#10b981' : '#ef4444', backgroundColor: result.passed ? '#ecfdf5' : '#fef2f2' }}>
                <div className="flex items-start gap-4">
                  {result.passed ? <FiCheckCircle size={32} className="text-emerald-600" /> : <FiXCircle size={32} className="text-red-600" />}
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: result.passed ? '#047857' : '#dc2626' }}>
                      {result.message}
                    </h2>
                    <div className="mt-2 space-y-1 text-sm font-semibold" style={{ color: result.passed ? '#059669' : '#b91c1c' }}>
                      <p>Your score: {result.score}%</p>
                      <p>Points earned: {result.earnedPoints} / {result.totalPoints}</p>
                      <p>Passing score: {result.passingScore}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-900">Quiz Review</h3>
                {result.results.map((res, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Question {index + 1}</p>
                        <h4 className="mt-2 font-bold text-slate-900">{res.questionText}</h4>
                      </div>
                      {res.isCorrect ? <FiCheckCircle size={20} className="text-emerald-600" /> : <FiXCircle size={20} className="text-red-600" />}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Your answer:</span>
                        <span className={res.isCorrect ? 'text-emerald-600' : 'text-red-600'}>{res.yourAnswer}</span>
                      </div>
                      {!res.isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">Correct answer:</span>
                          <span className="text-emerald-600">{res.correctAnswer}</span>
                        </div>
                      )}
                      <div className="text-slate-600">Points: {res.isCorrect ? res.points : 0} / {res.points}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => navigate(`/student/courses/${courseId}`)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Back to course
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
