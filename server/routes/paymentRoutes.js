import express from 'express';
import {
  createPaymentIntent,
  verifyPayment,
  handleWebhook,
  getMyPayments,
  refundPayment,
  getPaymentDetails,
} from '../controllers/paymentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

router.use(protect);

router.post('/create-intent/:courseId', authorizeRoles('student'), createPaymentIntent);
router.post('/verify', authorizeRoles('student'), verifyPayment);
router.get('/my-payments', authorizeRoles('student'), getMyPayments);
router.post('/refund/:paymentId', authorizeRoles('student'), refundPayment);
router.get('/:paymentId', authorizeRoles('student'), getPaymentDetails);

export default router;