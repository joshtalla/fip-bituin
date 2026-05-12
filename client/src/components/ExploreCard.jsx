export default function ExploreCard({ prompt }) {
  const formattedDate = new Date(prompt.prompt_date).toLocaleDateString(
    "en-US",
    {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    },
  );

  return (
    <div className="h-[190px] w-[651px] rounded-2xl bg-[#FBF3E5] p-4 transition-colors">
      <span className="font-poppins text-[#4C383A]">
        {formattedDate} - {prompt.prompt_text}
      </span>
    </div>
  );
}
