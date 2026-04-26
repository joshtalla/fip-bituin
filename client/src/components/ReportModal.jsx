import { useState, useEffect } from 'react';

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
  const [view, setView] = useState('confirm'); 
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setView('confirm');
      setReason('');
      setDescription('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => onClose();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setView('success');
      setTimeout(() => handleClose(), 2000);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exact thick 'X' from Figma, explicitly positioned
  const CloseButton = () => (
    <button
      onClick={handleClose}
      disabled={isSubmitting}
      className="absolute hover:opacity-70 disabled:opacity-50"
      style={{ top: '16px', left: '16px', zIndex: 10 }}
      aria-label="Close"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );

  // Exact outlined sparkles from Figma
  const Sparkles = () => (
    <svg className="absolute text-[#EFB758]" style={{ bottom: '16px', right: '20px', width: '50px', height: '50px' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 15 Q 35 35 55 40 Q 35 45 30 65 Q 25 45 5 40 Q 25 35 30 15 Z" fill="#FFFCEF" />
      <path d="M75 45 Q 77 55 87 57 Q 77 59 75 69 Q 73 59 63 57 Q 73 55 75 45 Z" fill="#FFFCEF" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Box is now BIGGER so things aren't squished! */}
      <div 
        className="relative rounded-[8px] bg-[#FFFCEF] shadow-xl transition-all duration-200 overflow-hidden"
        style={{ 
          width: '460px', 
          height: view === 'form' ? '360px' : '180px' 
        }}
      >
        <CloseButton />

        {/* STEP 1: YES/NO CONFIRMATION */}
        {view === 'confirm' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Title finally has room for a big bottom margin */}
            <h2 
              className="text-[#4C383A]"
              style={{ 
                fontFamily: "'Darumadrop One', cursive", 
                fontSize: '40px', 
                lineHeight: '1',
                marginBottom: '28px'
              }}
            >
              report {contentType}?
            </h2>
            <div className="flex gap-8">
              <button
                onClick={() => setView('form')}
                className="bg-[#8A8DAA] text-[#4C383A] rounded-[8px] flex items-center justify-center shadow-md hover:opacity-80 transition-all hover:-translate-y-[1px]"
                style={{ width: '85px', height: '40px', fontFamily: "'Darumadrop One', cursive", fontSize: '22px' }}
              >
                yes
              </button>
              <button
                onClick={handleClose}
                className="bg-[#EFB758] text-[#4C383A] rounded-[8px] flex items-center justify-center shadow-md hover:opacity-80 transition-all hover:-translate-y-[1px]"
                style={{ width: '85px', height: '40px', fontFamily: "'Darumadrop One', cursive", fontSize: '22px' }}
              >
                no
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REASONS FORM */}
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="w-full h-full flex flex-col px-8 pt-6 pb-4">
            <h2 
              className="text-center text-[#4C383A] mb-4"
              style={{ fontFamily: "'Darumadrop One', cursive", fontSize: '28px', lineHeight: '1' }}
            >
              reasons
            </h2>

            {/* Radio Group */}
            <div className="flex flex-col gap-3 mb-3">
              {REPORT_REASONS.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer text-[#4C383A]" style={{ fontFamily: "'Darumadrop One', cursive", fontSize: '16px' }}>
                  <input
                    type="radio"
                    name="report_reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 accent-[#EFB758]"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {/* Description Area */}
            <div className="flex flex-col mb-3 relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="optional description..."
                maxLength={MAX_CHARS}
                className="w-full bg-[#EDE8D8] rounded-[8px] p-2 text-[#4C383A] outline-none focus:ring-2 focus:ring-[#EFB758] resize-none"
                style={{ height: '60px', fontFamily: "'Poppins', sans-serif", fontSize: '13px' }}
              />
              <span className="absolute bottom-1 right-2 text-[#888]" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '10px' }}>
                {description.length} / {MAX_CHARS}
              </span>
            </div>

            {/* Error & Buttons */}
            <div className="mt-auto flex flex-col items-center">
              {error && (
                <div className="mb-2 text-red-500 font-semibold" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '12px' }}>
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!reason || isSubmitting}
                  className="bg-[#8A8DAA] text-[#4C383A] rounded-[8px] flex items-center justify-center shadow-md hover:opacity-80 disabled:opacity-50 disabled:shadow-none"
                  style={{ width: '90px', height: '38px', fontFamily: "'Darumadrop One', cursive", fontSize: '20px' }}
                >
                  {isSubmitting ? '...' : 'submit'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="bg-[#EFB758] text-[#4C383A] rounded-[8px] flex items-center justify-center shadow-md hover:opacity-80 disabled:opacity-50 disabled:shadow-none"
                  style={{ width: '90px', height: '38px', fontFamily: "'Darumadrop One', cursive", fontSize: '20px' }}
                >
                  cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {view === 'success' && (
          <div className="w-full h-full flex items-center justify-center relative">
            <h2 
              className="text-[#4C383A]"
              style={{ fontFamily: "'Darumadrop One', cursive", fontSize: '36px' }}
            >
              report submitted!
            </h2>
            <Sparkles />
          </div>
        )}

      </div>
    </div>
  );
}