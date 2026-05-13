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

  // Reset form whenever the modal opens
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

    // --- REAL API CALL (Ready for when Backend is live) ---
    /*
    try {
      // 1. Get auth token 
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) throw new Error("Not authenticated");

      // 2. Determine correct endpoint based on what we are reporting
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const endpoint = contentType === 'post' 
        ? `/api/posts/${contentId}/report` 
        : `/api/replies/${contentId}/report`;

      // 3. Fire the request
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason: reason,
          description: description
        })
      });

      if (!response.ok) {
        if (response.status === 400) throw new Error("Invalid report reason.");
        if (response.status === 401) throw new Error("Please log in again.");
        throw new Error("Failed to submit report. Please try again later.");
      }

      // Success!
      setView('success');
      setTimeout(() => handleClose(), 2000);

    } catch (err) {
      // Shows error but DOES NOT close modal or clear input
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
    */

    // --- CURRENT MOCK CALL (Delete this when uncommenting the real one) ---
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // TEST ERROR BEHAVIOR: Uncomment the line below to test what happens when it fails!
      // throw new Error("Test 500 Error: Server disconnected");
      
      setView('success');
      setTimeout(() => handleClose(), 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CloseButton = () => (
    <button
      onClick={handleClose}
      disabled={isSubmitting}
      className="absolute hover:opacity-70 disabled:opacity-50"
      style={{ top: '20px', left: '20px', zIndex: 10 }}
      aria-label="Close"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Container uses pure padding to naturally size the box */}
      <div 
        className="relative rounded-[8px] bg-[#FFFCEF] shadow-xl transition-all duration-200 flex flex-col"
        style={{ width: '480px', padding: '48px 40px 40px 40px' }}
      >
        <CloseButton />

        {/* STEP 1: CONFIRMATION */}
        {view === 'confirm' && (
          <div className="w-full flex flex-col items-center justify-center">
            <h2 
              className="text-[#4C383A]"
              style={{ 
                fontFamily: "'Darumadrop One', cursive", 
                fontSize: '40px', 
                lineHeight: '1',
                marginTop: '10px',
                marginBottom: '36px'
              }}
            >
              report {contentType}?
            </h2>
            <div className="flex justify-center" style={{ gap: '32px' }}>
              <button
                onClick={() => setView('form')}
                className="bg-[#8A8DAA] text-[#4C383A] rounded-[8px] flex items-center justify-center shadow-md hover:opacity-80 transition-all hover:-translate-y-[1px]"
                style={{ width: '90px', height: '44px', fontFamily: "'Darumadrop One', cursive", fontSize: '24px' }}
              >
                yes
              </button>
              <button
                onClick={handleClose}
                className="bg-[#EFB758] text-[#4C383A] rounded-[8px] flex items-center justify-center shadow-md hover:opacity-80 transition-all hover:-translate-y-[1px]"
                style={{ width: '90px', height: '44px', fontFamily: "'Darumadrop One', cursive", fontSize: '24px' }}
              >
                no
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FORM */}
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            <h2 
              className="text-center text-[#4C383A]"
              style={{ 
                fontFamily: "'Darumadrop One', cursive", 
                fontSize: '36px', 
                lineHeight: '1',
                marginTop: '10px', 
                marginBottom: '32px' 
              }}
            >
              reasons
            </h2>

            <div className="flex flex-col" style={{ gap: '16px', marginBottom: '32px' }}>
              {REPORT_REASONS.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer text-[#4C383A]" style={{ gap: '12px', fontFamily: "'Darumadrop One', cursive", fontSize: '20px', lineHeight: '1' }}>
                  <input
                    type="radio"
                    name="report_reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-5 h-5 accent-[#EFB758] shrink-0"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <div className="relative flex flex-col" style={{ marginBottom: '40px' }}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="optional description..."
                maxLength={MAX_CHARS}
                className="w-full bg-[#EDE8D8] rounded-[8px] p-3 text-[#4C383A] outline-none focus:ring-2 focus:ring-[#EFB758] resize-none"
                style={{ height: '70px', fontFamily: "'Poppins', sans-serif", fontSize: '14px' }}
              />
              <span className="absolute text-[#888]" style={{ bottom: '8px', right: '12px', fontFamily: "'Poppins', sans-serif", fontSize: '11px' }}>
                {description.length} / {MAX_CHARS}
              </span>
            </div>

            <div className="flex flex-col items-center">
              {error && (
                <div className="text-red-500 font-semibold text-center w-full" style={{ marginBottom: '12px', fontFamily: "'Poppins', sans-serif", fontSize: '12px' }}>
                  {error}
                </div>
              )}
              <div className="flex justify-center" style={{ gap: '32px' }}>
                <button
                  type="submit"
                  disabled={!reason || isSubmitting}
                  className="bg-[#8A8DAA] text-[#4C383A] rounded-[8px] flex items-center justify-center shadow-md hover:opacity-80 transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
                  style={{ width: '100px', height: '44px', fontFamily: "'Darumadrop One', cursive", fontSize: '22px' }}
                >
                  {isSubmitting ? '...' : 'submit'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="bg-[#EFB758] text-[#4C383A] rounded-[8px] flex items-center justify-center shadow-md hover:opacity-80 transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:-translate-y-0"
                  style={{ width: '100px', height: '44px', fontFamily: "'Darumadrop One', cursive", fontSize: '22px' }}
                >
                  cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {view === 'success' && (
          <div className="w-full flex items-center justify-center">
            <h2 
              className="text-[#4C383A]"
              style={{ 
                fontFamily: "'Darumadrop One', cursive", 
                fontSize: '44px',
                lineHeight: '1',
                marginTop: '10px' 
              }}
            >
              report submitted!
            </h2>
          </div>
        )}

        {/* Sparkles rendered AT THE ROOT of the modal, so they pin perfectly to the bottom-right corner */}
        {view === 'success' && (
          <svg className="absolute text-[#EFB758]" style={{ bottom: '16px', right: '16px', width: '70px', height: '70px' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Small Bottom-Left Star */}
            <path d="M 20 80 Q 30 80 30 70 Q 30 80 40 80 Q 30 80 30 90 Q 30 80 20 80 Z" fill="#FFFCEF" />
            {/* Large Top-Right Star */}
            <path d="M 50 40 Q 70 40 70 20 Q 70 40 90 40 Q 70 40 70 60 Q 70 40 50 40 Z" fill="#FFFCEF" />
            {/* Connecting curve */}
            <path d="M 37 73 Q 50 60 63 47" />
          </svg>
        )}

      </div>
    </div>
  );
}