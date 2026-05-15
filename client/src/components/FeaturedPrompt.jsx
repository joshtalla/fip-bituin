import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

// Card that appears and disappears to hint the user to hover over a star to view a post
function HintCard({ visible }) {
  return (
    <div
      className={`pointer-events-none hidden max-h-[48px] max-w-[399px] rounded-md border border-[#FBF3E5] bg-transparent px-4 py-2 transition-opacity duration-700 sm:block ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <h1 className="font-darumadropone text-[20px] text-[#FFFCEF]">
        hover over any star to view a post!
      </h1>
    </div>
  );
}

// Button that leads to the create post page
function CTAButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[60px] max-w-[399px] rounded-xl bg-[#EFB758] px-4 py-2 font-poppins text-[16px] font-semibold text-[#765C5F] transition-all duration-300 hover:bg-[#FBF3E5] hover:text-[#EFB758] hover:shadow-md sm:h-[50px] sm:w-[338px] sm:rounded-md"
    >
      <span className="text-center font-darumadropone text-[24px] text-[#4C383A]">
        ilagay ang iyong bituin
      </span>
    </button>
  );
}

export default function FeaturedPrompt({
  showSearchBar,
  dailyPrompt,
  isLoadingDailyPrompt,
}) {
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(true);
  const [query, setQuery] = useState("");

  // Navigate to the create post page by passing the prompt id and prompt text to the create post page
  const handleCTAClick = () => {
    if (!dailyPrompt) return;
    navigate("/prompts/create", {
      state: {
        promptId: dailyPrompt?.id,
        promptText: dailyPrompt?.prompt_text,
      },
    });
  };

  const handleSearch = (submittedQuery) => {
    navigate(`/explore?q=${encodeURIComponent(submittedQuery)}`);
  };

  // Hide the hint card after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-[228px] flex-col">
      {/* Title and search bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="order-2 sm:order-1">
          <h1 className="mb-4 text-center font-poppins text-[34px] font-semibold text-[#FFFCEF] sm:text-left">
            Today's Prompt!
          </h1>
        </div>
        {showSearchBar && (
          <div className="order-1 mb-4 w-full sm:order-2 sm:mb-0 sm:w-auto">
            <SearchBar
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onSearch={handleSearch}
              placeholder="enter a word or phrase!"
              autoFocus
              formClassName="flex h-[42px] w-full items-center rounded-full border border-[#D9D9D9] bg-[#FBF3E5] px-4 sm:w-[442px]"
              inputClassName="flex-1 bg-transparent font-poppins text-[16px] font-semibold text-[#765C5F] outline-none"
              buttonClassName="text-[24px] text-[#765C5F]"
            />
          </div>
        )}
      </div>
      {/* Prompt text */}
      <span className="mb-8 text-center font-poppins text-[20px] font-semibold text-[#FBF3E5] sm:mb-12 sm:text-left sm:text-[24px]">
        {isLoadingDailyPrompt ? "Loading..." : dailyPrompt?.prompt_text}
      </span>
      {/* Hint card and CTA button */}
      <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:mb-4 sm:flex-row sm:justify-between sm:gap-0">
        <HintCard visible={showHint} />
        <CTAButton onClick={handleCTAClick} />
      </div>
    </div>
  );
}
