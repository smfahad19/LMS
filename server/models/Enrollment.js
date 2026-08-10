import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    content: { type: String, required: true },
    timestamp: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const bookmarkSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    timestamp: { type: Number, default: 0 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    lastWatchedLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    lastWatchedTime: { type: Number, default: 0 },
    quizAttempts: [quizAttemptSchema],
    completionPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    certificateIssued: { type: Boolean, default: false },
    notes: [noteSchema],
    bookmarks: [bookmarkSchema],
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);