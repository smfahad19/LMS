import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import api from '../../services/api.js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ course }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/payments/verify', { paymentIntentId: paymentIntent.id });
      toast.success('Test payment succeeded and course enrollment is complete');
    } catch (verificationError) {
      toast.error(verificationError.response?.data?.message || 'Payment verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {submitting ? 'Processing...' : `Pay $${Number(course.price).toFixed(2)}`}
      </button>
    </form>
  );
}

export default function PaymentTest() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingIntent, setCreatingIntent] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get('/student/courses', { params: { minPrice: 0.01, limit: 50 } });
        setCourses(response.data.courses || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load courses');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const selectedCourse = courses.find((course) => course._id === courseId);

  const createIntent = async () => {
    if (!courseId) return;
    setCreatingIntent(true);
    setClientSecret('');
    try {
      const response = await api.post(`/payments/create-intent/${courseId}`);
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not start payment');
    } finally {
      setCreatingIntent(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Test Course Payment</h1>
        <p className="mt-1 text-sm text-gray-500">Use Stripe Test Mode for this payment.</p>

        <label className="mt-6 block text-sm font-medium text-gray-700" htmlFor="course">
          Select a paid course
        </label>
        <select
          id="course"
          value={courseId}
          onChange={(event) => {
            setCourseId(event.target.value);
            setClientSecret('');
          }}
          disabled={loading || creatingIntent}
          className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="">{loading ? 'Loading courses...' : 'Choose a course'}</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title} - ${Number(course.price).toFixed(2)}
            </option>
          ))}
        </select>

        {courses.length === 0 && !loading && (
          <p className="mt-3 text-sm text-amber-600">No published paid courses are available.</p>
        )}

        {courseId && !clientSecret && (
          <button
            type="button"
            onClick={createIntent}
            disabled={creatingIntent}
            className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-400"
          >
            {creatingIntent ? 'Starting payment...' : 'Continue to payment'}
          </button>
        )}

        {clientSecret && selectedCourse && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm course={selectedCourse} />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}
