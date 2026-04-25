import { CgProfile } from "react-icons/cg";
import { LuMaximize2 } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useState } from "react";
import ReportButton from "./ReportButton";
import ReportModal from "./ReportModal";

// Post preview that only appears when the user hovers over a star
export default function PostPreview({ postId, username, content }) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="absolute bottom-full left-1/2 z-10 mb-1 h-[277px] w-[482px] -translate-x-1/2 rounded-xl bg-[#FBF3E5] p-3 text-white shadow-xl">
      <div className="relative container mx-auto">
        {/* Link to the post page */}
        <Link
          to={`/prompts/${postId}`}
          className="absolute top-0 right-0 cursor-pointer"
        >
          {/* Maximize icon that leads to the post page */}
          <LuMaximize2 className="text-[32px] text-black" />
        </Link>
        
        {/* Profile picture, username, and Report Button */}
        <div className="flex items-center justify-between pr-10">
          <div className="flex items-center gap-2">
            <CgProfile className="text-[32px] text-black" />
            <h2 className="mb-4 pt-4 font-poppins text-[20px] font-bold font-semibold text-black">
              {username}
            </h2>
          </div>
          
          {/* THE NEW REPORT BUTTON */}
          <div className="pt-2">
            <ReportButton onClick={() => setIsReportModalOpen(true)} />
          </div>
        </div>
      </div>
      
      {/* Post content */}
      <p className="font-poppins text-sm text-[12px] font-semibold text-[#4C383A]">
        {content}
      </p>

      {/* THE REPORT MODAL (Fixed to viewport so it safely pops out of this container) */}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        contentType="post"
        contentId={postId}
      />
    </div>
  );
}