import { FaFlag } from 'react-icons/fa';

export default function ReportButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        // Prevent the click from bubbling up (e.g., if the button is inside a Link)
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-2 text-sm text-[#4C383A] opacity-60 hover:opacity-100 transition-opacity ${className}`}
      aria-label="Report this content"
      title="Report"
    >
      <FaFlag size={14} />
      <span className="hidden sm:inline font-poppins font-medium">report</span>
    </button>
  );
}