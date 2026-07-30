import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        isFeatured: { type: Boolean, default: false },
        rejectionReason: { type: String, default: null },
        thumbnail: { type: String, default: '' },
        price: { type: Number, default: 0 },
        duration: { type: String, default: '' },
        lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
        ratingAvg: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        enrolledCount: { type: Number, default: 0 },
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text', category: 'text' });

export default mongoose.model('Course', courseSchema);