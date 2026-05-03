import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FeaturedPrompt from "../components/FeaturedPrompt";
import Navbar from "../components/Navbar";
import StarGrid from "../components/StarGrid";
import { mockPrompt } from "../mocks/mockData";

export default function PromptBoard() {
  const [searchParams] = useSearchParams();
  const showSearchBar = searchParams.get("showSearch") === "1";
  const [dailyPrompt, setDailyPrompt] = useState(null);
  const [isLoadingDailyPrompt, setIsLoadingDailyPrompt] = useState(true);

  // Fetch the daily prompt from the API endpoint
  const fetchDailyPrompt = async () => {
    // TODO: swap out with real API call once available.
    // const resp = await fetch("api/prompts/today");
    // const data = await resp.json();
    // return data;

    // Development only: wait 5 seconds before returning the mock prompt
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return mockPrompt;
  };

  // Loads the daily prompt from the API endpoint when the component mounts
  // May need to cache the daily prompt in session storage to avoid unnecessary API calls
  useEffect(() => {
    const loadDailyPrompt = async () => {
      try {
        const prompt = await fetchDailyPrompt();
        setDailyPrompt(prompt);
      } catch (error) {
        console.error("Error fetching daily prompt:", error);
      } finally {
        setIsLoadingDailyPrompt(false);
      }
    };

    loadDailyPrompt();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden px-[60px] pt-[144px] pb-[72px]">
      <Navbar />
      {/* Featured prompt section that appears at the top of the page */}
      <FeaturedPrompt
        showSearchBar={showSearchBar}
        dailyPrompt={dailyPrompt}
        isLoadingDailyPrompt={isLoadingDailyPrompt}
      />
      {/* Star grid section that appears below the featured prompt section corresponding to the daily prompt */}
      {/* Passes the daily prompt id to the star grid component so that the star grid can fetch the posts for the daily prompt */}
      <StarGrid promptId={dailyPrompt?.id} />
    </div>
  );
}
