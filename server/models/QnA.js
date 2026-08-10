import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isInstructor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const qnaSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    replies: [replySchema],
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('QnA', qnaSchema);