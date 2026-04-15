import { CgProfile } from "react-icons/cg";
import { LuMaximize2 } from "react-icons/lu";
import { Link } from "react-router-dom";

export default function PostPreview({ postId, title, description }) {
  return (
    <div className="absolute bottom-full left-1/2 z-10 mb-1 h-[277px] w-[482px] -translate-x-1/2 rounded-xl bg-[#FBF3E5] p-3 text-white shadow-xl">
      <div className="relative container mx-auto">
        <Link
          to={`/prompts/${postId}`}
          className="absolute top-0 right-0 cursor-pointer"
        >
          <LuMaximize2 className="text-[32px] text-black" />
        </Link>
        <div className="flex items-center gap-2 pr-10">
          <CgProfile className="text-[32px] text-black" />
          <h2 className="mb-4 pt-4 font-poppins text-[20px] font-bold font-semibold text-black">
            {title}
          </h2>
        </div>
      </div>
      <p className="font-poppins text-sm text-[12px] font-semibold text-[#4C383A]">
        {description}
      </p>
    </div>
  );
}
