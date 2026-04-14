import { useSearchParams } from "react-router-dom";
import FeaturedPrompt from "../components/FeaturedPrompt";
import StarGrid from "../components/StarGrid";

export default function PromptBoard() {
  const [searchParams] = useSearchParams();
  const showSearchBar = searchParams.get("showSearch") === "1";

  return (
    <div className="min-h-screen w-full overflow-hidden pt-[144px] pb-[72px] px-[60px]">
      <FeaturedPrompt showSearchBar={showSearchBar} />
      <StarGrid />
    </div>
  );
}
