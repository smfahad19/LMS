import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'true_false', 'fill_blank'], required: true },
    options: [{ type: String }], // mcq / true_false ke liy
    correctAnswer: { type: String, required: true },
    points: { type: Number, default: 1 },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    title: { type: String, required: true },
    maxAttempts: { type: Number, default: 0 },
    questions: [questionSchema],
    passingScore: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);