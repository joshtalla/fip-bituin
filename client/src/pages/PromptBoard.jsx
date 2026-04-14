import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FeaturedPrompt from "../components/FeaturedPrompt";
import StarGrid from "../components/StarGrid";
import { mockPrompt } from "../mocks/mockData";

export default function PromptBoard() {
  const [searchParams] = useSearchParams();
  const showSearchBar = searchParams.get("showSearch") === "1";
  const [dailyPrompt, setDailyPrompt] = useState(null);

  const fetchDailyPrompt = async () => {
    // const resp = await fetch("api/prompts/today");
    // const data = await resp.json();
    // return data;
    return mockPrompt;
  };

  useEffect(() => {
    fetchDailyPrompt().then(setDailyPrompt);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden pt-[144px] pb-[72px] px-[60px]">
      <FeaturedPrompt showSearchBar={showSearchBar} dailyPrompt={dailyPrompt} />
      <StarGrid promptId={dailyPrompt?.id} />
    </div>
  );
}
