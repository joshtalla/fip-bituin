export default function PostPreview({ title, description }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[482px] h-[277px] rounded-lg bg-[#FBF3E5] text-white p-3 shadow-lg z-10">
      <h2 className="font-bold text-black text-[24px] font-semibold font-poppins mb-4">
        {title}
      </h2>
      <p className="text-sm text-[#4C383A] text-[12px] font-semibold font-poppins">
        {description}
      </p>
    </div>
  );
}
