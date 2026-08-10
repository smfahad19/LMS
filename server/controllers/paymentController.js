import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT) || 20;

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (!course.isPublished) {
    res.status(400);
    throw new Error('Course is not available');
  }

  if (course.price === 0) {
    res.status(400);
    throw new Error('This is a free course — no payment needed');
  }

  const alreadyEnrolled = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  });

  if (alreadyEnrolled) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  const amountInCents = Math.round(course.price * 100);
  const platformFee = Math.round((amountInCents * PLATFORM_FEE_PERCENT) / 100);
  const instructorAmount = amountInCents - platformFee;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: {
      courseId: course._id.toString(),
      studentId: req.user._id.toString(),
      instructorId: course.instructor.toString(),
      instructorAmount: instructorAmount.toString(),
      platformFee: platformFee.toString(),
    },
  });

  await Payment.create({
    student: req.user._id,
    course: course._id,
    stripePaymentIntentId: paymentIntent.id,
    amount: amountInCents,
    instructorAmount,
    platformAmount: platformFee,
    status: 'pending',
  });

  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
    amount: amountInCents,
    currency: 'usd',
    course: {
      title: course.title,
      thumbnail: course.thumbnail,
      price: course.price,
    },
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    res.status(400);
    throw new Error('Payment Intent ID required');
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    res.status(400);
    throw new Error('Payment not completed');
  }

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntentId,
  });

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  if (payment.status === 'succeeded') {
    const enrollment = await Enrollment.findOne({
      student: payment.student,
      course: payment.course,
    });
    return res.status(200).json({ message: 'Already enrolled', enrollment });
  }

  payment.status = 'succeeded';
  await payment.save();

  const enrollment = await Enrollment.create({
    student: payment.student,
    course: payment.course,
  });

  await Course.findByIdAndUpdate(payment.course, {
    $inc: { enrolledCount: 1 },
  });

  res.status(200).json({
    message: 'Payment verified and enrolled successfully',
    enrollment,
  });
});

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    try {
      const payment = await Payment.findOne({
        stripePaymentIntentId: paymentIntent.id,
      });

      if (payment && payment.status !== 'succeeded') {
        payment.status = 'succeeded';
        await payment.save();

        const alreadyEnrolled = await Enrollment.findOne({
          student: payment.student,
          course: payment.course,
        });

        if (!alreadyEnrolled) {
          await Enrollment.create({
            student: payment.student,
            course: payment.course,
          });

          await Course.findByIdAndUpdate(payment.course, {
            $inc: { enrolledCount: 1 },
          });
        }
      }
    } catch (err) {
      console.error('Webhook processing error:', err.message);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;

    try {
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'failed' }
      );
    } catch (err) {
      console.error('Payment failed webhook error:', err.message);
    }
  }

  res.status(200).json({ received: true });
};

export const getMyPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const total = await Payment.countDocuments({
    student: req.user._id,
    status: 'succeeded',
  });

  const payments = await Payment.find({
    student: req.user._id,
    status: 'succeeded',
  })
    .populate('course', 'title thumbnail instructor')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    payments,
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (payment.status !== 'succeeded') {
    res.status(400);
    throw new Error('Only succeeded payments can be refunded');
  }

  if (payment.withdrawn) {
    res.status(400);
    throw new Error('Cannot refund — earnings already withdrawn by instructor');
  }

  const enrollment = await Enrollment.findOne({
    student: payment.student,
    course: payment.course,
  });

  if (enrollment && enrollment.completionPercentage > 30) {
    res.status(400);
    throw new Error('Cannot refund — more than 30% of course completed');
  }

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
  });

  payment.status = 'refunded';
  await payment.save();

  if (enrollment) {
    await Course.findByIdAndUpdate(payment.course, {
      $inc: { enrolledCount: -1 },
    });
    await enrollment.deleteOne();
  }

  res.status(200).json({
    message: 'Refund processed successfully',
    refundId: refund.id,
  });
});

export const getPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    student: req.user._id,
  })
    .populate('course', 'title thumbnail price instructor')
    .populate('student', 'name email');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.status(200).json(payment);
});