import FeaturedPrompt from "../components/FeaturedPrompt";
import StarGrid from "../components/StarGrid";

export default function PromptBoard() {
  return (
    <div className="min-h-screen w-full overflow-hidden px-4 sm:px-6">
      <FeaturedPrompt />
      <StarGrid />
    </div>
  );
}
