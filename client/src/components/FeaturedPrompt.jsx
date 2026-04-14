import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  return (
    <div className="flex items-center w-[442px] h-[42px] bg-[#FBF3E5] border border-[#D9D9D9] rounded-full px-4">
      <input
        type="text"
        placeholder="enter a word or phrase to search!"
        className="flex-1 outline-none text-[#765C5F] text-[16px] font-semibold font-poppins"
      />
      <CiSearch className="text-[#765C5F] text-[24px]" />
    </div>
  );
}

function HintCard({ visible }) {
  return (
    <div
      className={`bg-transparent pointer-events-none border border-[#FBF3E5] rounded-md px-4 py-2 max-w-[399px] max-h-[48px] transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <h1 className="font-darumadropone text-[#FFFCEF] text-[20px]">
        hover over any star to view a post!
      </h1>
    </div>
  );
}

function CTAButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[50px] w-[338px] rounded-md bg-[#EFB758] px-4 py-2 font-poppins text-[16px] font-semibold text-[#765C5F] transition-all duration-300 hover:bg-[#FBF3E5] hover:text-[#EFB758] hover:shadow-md"
    >
      <span className="text-center text-[24px] text-[#4C383A] font-darumadropone">
        ilagay ang iyong bituin
      </span>
    </button>
  );
}

export default function FeaturedPrompt({ showSearchBar, dailyPrompt }) {
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(true);

  const handleCTAClick = () => {
    if (!dailyPrompt) return;
    navigate("/prompts/create", {
      state: {
        promptId: dailyPrompt?.id,
        promptText: dailyPrompt?.prompt_text,
      },
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-[228px]">
      <div className="flex justify-between">
        <h1 className="text-left text-[#FFFCEF] text-[34px] font-semibold font-poppins mb-4">
          Today's Prompt!
        </h1>
        {showSearchBar && <SearchBar />}
      </div>
      <span className="text-left text-[#FBF3E5] text-[24px] font-semibold font-poppins mb-8">
        {dailyPrompt?.prompt_text}
      </span>
      <div className="flex items-center justify-between mb-4">
        <HintCard visible={showHint} />
        <CTAButton onClick={handleCTAClick} />
      </div>
    </div>
  );
}
