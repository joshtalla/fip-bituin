import { useState } from 'react';

// Maps the Figma UI labels to the exact API values required by the backend
const REPORT_REASONS = [
  { label: 'This post has inappropriate content', value: 'hate_speech' },
  { label: 'Misinformation and spam', value: 'misinformation' },
  { label: 'Harmful and abusive content', value: 'harassment' },
  { label: 'Illegal activity and fraud', value: 'spam' },
  { label: 'Other', value: 'other' }
];

const MAX_CHARS = 1000;

export default function ReportModal({ isOpen, onClose, contentType, contentId }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset state when closing
    setReason('');
    setDescription('');
    setError(null);
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // MOCK API CALL (To be replaced with real backend fetch later)
      console.log(`Submitting report for ${contentType} ${contentId}:`, { reason, description });
      
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Show success state
      setIsSuccess(true);
      
      // Close the modal automatically after a brief moment as requested in the ticket
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err) {
      // Do NOT close the modal on error, let the user retry
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[400px] rounded-[24px] bg-[#FBF3E5] p-8 shadow-2xl">
        
        {/* X Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-6 top-6 font-poppins text-2xl font-bold text-[#4C383A] hover:opacity-70 disabled:opacity-50"
          aria-label="Close"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10">
            <h2 className="font-poppins text-2xl font-bold text-[#4C383A]">report submitted!</h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h2 className="mb-6 font-poppins text-[22px] font-bold text-[#4C383A]">report {contentType}?</h2>

            {/* Reasons Radio Group */}
            <div className="mb-6 flex flex-col gap-3">
              {REPORT_REASONS.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-3 font-poppins text-[15px] font-medium text-[#4C383A]">
                  <input
                    type="radio"
                    name="report_reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-4 w-4 accent-[#EFB758]"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {/* Optional Description */}
            <div className="mb-2 flex flex-col">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="optional description..."
                maxLength={MAX_CHARS}
                rows={3}
                className="w-full resize-none rounded-xl bg-[#EDE8D8] p-3 font-poppins text-sm text-[#4C383A] outline-none focus:ring-2 focus:ring-[#EFB758]"
              />
              <div className={`mt-1 text-right font-poppins text-xs ${description.length >= MAX_CHARS ? 'text-red-500' : 'text-[#888]'}`}>
                {description.length} / {MAX_CHARS}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-center font-poppins text-sm font-semibold text-red-500">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-col items-center justify-center gap-3">
              <button
                type="submit"
                disabled={!reason || isSubmitting}
                className="w-[200px] rounded-xl bg-[#EFB758] py-3 font-darumadropone text-[22px] text-[#4C383A] transition-all hover:bg-[#e5aa49] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'submitting...' : 'submit'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="font-poppins text-[16px] font-semibold text-[#4C383A] hover:underline disabled:opacity-50"
              >
                cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}