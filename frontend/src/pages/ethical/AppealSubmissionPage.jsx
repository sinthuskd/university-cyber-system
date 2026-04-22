import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { ethicalAPI } from '../../services/api';

const AppealSubmissionPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await ethicalAPI.submitAppeal(data);
      toast.success('Appeal submitted successfully!');
      navigate('/ethical');
    } catch {
      toast.error('Failed to submit appeal');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Scale size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Submit Appeal</h1>
          <p className="text-sm text-gray-500">Appeal a decision or report an ethical concern</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Appeal Title *</label>
            <input {...register('title', { required: 'Title is required' })}
              placeholder="Brief title for your appeal"
              className="form-input" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="form-label">Appeal Type *</label>
            <select {...register('type', { required: true })} className="form-input">
              <option value="">Select type</option>
              <option value="GRADE_APPEAL">Grade Appeal</option>
              <option value="DISCIPLINARY_APPEAL">Disciplinary Appeal</option>
              <option value="ETHICAL_CONCERN">Ethical Concern</option>
              <option value="ACADEMIC_MISCONDUCT">Academic Misconduct Dispute</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">Related Incident / Case ID (if any)</label>
            <input {...register('relatedCaseId')} placeholder="Leave blank if not applicable" className="form-input" />
          </div>

          <div>
            <label className="form-label">Description *</label>
            <textarea {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'Min 30 characters' } })}
              rows={5}
              placeholder="Explain the details of your appeal in full..."
              className="form-input resize-none" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="form-label">Supporting Evidence</label>
            <textarea {...register('evidence')}
              rows={3}
              placeholder="Any supporting documents or evidence..."
              className="form-input resize-none" />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            ℹ️ Appeals are reviewed by the Ethics Committee within 5-7 working days.
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
            </button>
            <button type="button" onClick={() => navigate('/ethical')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppealSubmissionPage;
