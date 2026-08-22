import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  FiBookOpen, FiUpload, FiDollarSign, FiX
} from 'react-icons/fi';
import { toast } from 'sonner';
import { createCourse } from '../../services/instructorService.js';

const categories = [
  'Web Development', 'Mobile Development', 'Data Science',
  'UI/UX Design', 'Cybersecurity', 'Cloud & DevOps',
  'Machine Learning', 'Blockchain', 'Game Development', 'Other',
];

function CreateCourse() {
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { price: 0, difficulty: 'Beginner' } });

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    if (!thumbnail) {
      toast.error('Please upload a course thumbnail');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('difficulty', data.difficulty);
      formData.append('price', data.price);
      formData.append('duration', data.duration || '');
      formData.append('thumbnail', thumbnail);

      const course = await createCourse(formData);
      toast.success('Course created successfully');
      navigate(`/instructor/courses/${course._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiBookOpen size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Create New Course</h1>
              <p className="text-xs text-gray-500">Fill in the details to create your course</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left - Thumbnail */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Course Thumbnail</h2>
                <label className="block cursor-pointer">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img src={thumbnailPreview} alt="Thumbnail" className="w-full aspect-video object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setThumbnail(null); setThumbnailPreview(null); }}
                        className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
                      >
                        <FiX size={12} className="text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition">
                      <FiUpload size={24} className="text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 font-medium">Upload Thumbnail</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
                </label>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price ($)</label>
                    <div className="relative">
                      <FiDollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('price')}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Set 0 for free course</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 6h 30m"
                      {...register('duration')}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Course Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Complete MERN Stack Course"
                      {...register('title', {
                        required: 'Title is required',
                        minLength: { value: 5, message: 'Minimum 5 characters' },
                      })}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition ${
                        errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                      }`}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      rows={5}
                      placeholder="Describe what students will learn in this course..."
                      {...register('description', {
                        required: 'Description is required',
                        minLength: { value: 20, message: 'Minimum 20 characters' },
                      })}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition resize-none ${
                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                      }`}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <select
                        {...register('category', { required: 'Category is required' })}
                        className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition bg-white ${
                          errors.category ? 'border-red-300' : 'border-gray-200 focus:border-blue-400'
                        }`}
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
                      <select
                        {...register('difficulty', { required: 'Difficulty is required' })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition bg-white"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/instructor/courses')}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold transition"
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;