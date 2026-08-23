import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowLeft, FiBookOpen, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import { toast } from 'sonner';
import api from '../../services/api.js';
import { getMediaUrl } from '../../utils/media.js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ course }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (error) {
      toast.error(error.message || 'Payment failed');
      setSubmitting(false);
      return;
    }
    try {
      const response = await api.post('/payments/verify', { paymentIntentId: paymentIntent.id });
      toast.success(response.data.message || 'Payment successful');
      navigate(`/student/courses/${course._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment verification failed');
      setSubmitting(false);
    }
  };

  return <form onSubmit={handleSubmit} className="space-y-5"><PaymentElement /><button type="submit" disabled={!stripe || !elements || submitting} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300">{submitting ? 'Processing payment...' : `Pay $${Number(course.price).toFixed(2)}`}</button></form>;
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await api.get(`/student/courses/${id}`);
        setCourse(response.data.course);
        if (isAuthenticated) {
          const enrollmentResponse = await api.get('/student/my-courses');
          setIsEnrolled(enrollmentResponse.data.enrollments?.some(
            (enrollment) => enrollment.course?._id === id
          ));
        } else {
          setIsEnrolled(false);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load course');
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id, isAuthenticated]);

  const enroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      if (course.price === 0) {
        await api.post(`/student/courses/${course._id}/enroll`);
        toast.success('You are enrolled successfully');
        navigate(`/student/courses/${course._id}`);
        return;
      }
      const response = await api.post(`/payments/create-intent/${course._id}`);
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not start enrollment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 py-20 text-center text-sm text-slate-500">Loading course...</div>;
  if (!course) return <div className="min-h-screen bg-slate-50 py-20 text-center text-sm text-slate-500">Course not found.</div>;

  return <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><Link to="/courses" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"><FiArrowLeft size={15} /> Browse courses</Link><div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"><main><div className="overflow-hidden rounded-2xl bg-slate-950">{course.thumbnail ? <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="h-72 w-full object-cover opacity-90" /> : <div className="flex h-72 items-center justify-center text-blue-300"><FiBookOpen size={60} /></div>}</div><p className="mt-7 text-sm font-semibold uppercase tracking-wide text-blue-600">{course.category}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{course.title}</h1><p className="mt-4 leading-7 text-slate-600">{course.description}</p><div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500"><span>{course.difficulty}</span><span className="flex items-center gap-1"><FiClock /> {course.duration || 'Self-paced'}</span><span className="flex items-center gap-1"><FiStar className="text-amber-400" /> {course.ratingAvg?.toFixed(1) || 'New'} rating</span></div><div className="mt-8 border-t border-slate-200 pt-6"><h2 className="text-lg font-bold text-slate-900">What you will learn</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{(course.lessons || []).map((lesson) => <div key={lesson._id} className="flex items-start gap-2 text-sm text-slate-600"><FiCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />{lesson.title}</div>)}</div></div></main><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-3xl font-bold text-slate-950">{course.price === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}</p>{isEnrolled ? <Link to={`/student/courses/${course._id}`} className="mt-5 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white">Continue learning</Link> : clientSecret ? <div className="mt-5 border-t border-slate-100 pt-5"><Elements stripe={stripePromise} options={{ clientSecret }}><CheckoutForm course={course} /></Elements></div> : <button type="button" onClick={enroll} disabled={actionLoading} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300">{actionLoading ? 'Preparing checkout...' : course.price === 0 ? 'Enroll for free' : 'Buy this course'}</button>}<p className="mt-4 text-center text-xs text-slate-400">Secure enrollment with Stripe</p></aside></div></div></div>;
}
