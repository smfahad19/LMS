import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    instructorAmount: { type: Number, required: true },
    platformAmount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    withdrawn: { type: Boolean, default: false },
    withdrawnAt: { type: Date, default: null },
    transferId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);