import { useState } from 'react';
// Assuming you use react-icons. If not, swap this for an SVG or whatever icon library the project uses!
import { FaFlag } from 'react-icons/fa'; 
import ReportModal from './ReportModal';

// TODO: Import your actual AuthContext once Sean finishes it
// import { useAuth } from '../context/AuthContext'; 

export default function ReportButton({ contentId, contentType, authorName }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // MOCK AUTH STATE: 
  // Swap this out for your actual auth hook later. 
  // Set to `null` to test logged-out state, or match `authorName` to test hiding the button.
  const currentUser = { anonymous_name: "TestUser123" }; 

  // RULE 1: Hide the trigger if the authenticated user is the content author
  if (currentUser && currentUser.anonymous_name === authorName) {
    return null;
  }

  const handleClick = () => {
    // RULE 2: Unauthenticated users see a log-in prompt
    if (!currentUser) {
      // TODO: Replace with your app's actual login modal trigger or redirect
      alert("Please log in to report content."); 
      return;
    }

    // Opens the modal for authenticated non-authors
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 text-sm text-[#888] hover:text-[#4C383A] transition-colors"
        aria-label={`report ${contentType}`}
      >
        <FaFlag size={12} />
        <span>report</span>
      </button>

      {/* The modal is perfectly separated from the button logic */}
      <ReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentType={contentType}
        contentId={contentId}
      />
    </>
  );
}