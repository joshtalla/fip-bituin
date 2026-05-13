import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FeaturedPrompt from "../components/FeaturedPrompt";
import StarGrid from "../components/StarGrid";
import { fetchJson } from "../services/api";

const DAILY_PROMPT_CACHE_KEY = "daily-prompt-cache";

const getTodayCacheKey = () => new Date().toISOString().split("T")[0];

export default function PromptBoard() {
  const [searchParams] = useSearchParams();
  const showSearchBar = searchParams.get("showSearch") === "1";
  const [dailyPrompt, setDailyPrompt] = useState(null);
  const [isLoadingDailyPrompt, setIsLoadingDailyPrompt] = useState(true);

  // Fetch the daily prompt from the API endpoint
  const fetchDailyPrompt = async () => {
    const cacheKey = getTodayCacheKey();
    const cachedPrompt = sessionStorage.getItem(DAILY_PROMPT_CACHE_KEY);

    if (cachedPrompt) {
      try {
        const parsedPrompt = JSON.parse(cachedPrompt);
        if (parsedPrompt.cacheKey === cacheKey && parsedPrompt.prompt) {
          return parsedPrompt.prompt;
        }
      } catch {
        sessionStorage.removeItem(DAILY_PROMPT_CACHE_KEY);
      }
    }

    const prompt = await fetchJson("/api/prompts/today");
    sessionStorage.setItem(
      DAILY_PROMPT_CACHE_KEY,
      JSON.stringify({ cacheKey, prompt }),
    );

    return prompt;
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
    <div className="prompt-board-page">
      <div className="prompt-board-content">
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
    </div>
  );
}
