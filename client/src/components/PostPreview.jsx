import { CgProfile } from "react-icons/cg";
import { LuMaximize2 } from "react-icons/lu";
import { Link } from "react-router-dom";

export default function PostPreview({ postId, title, description }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[482px] h-[277px] rounded-xl bg-[#FBF3E5] text-white p-3 shadow-xl z-10">
      <div className="container mx-auto relative">
        <Link
          to={`/prompts/${postId}`}
          className="absolute top-0 right-0 cursor-pointer"
        >
          <LuMaximize2 className="text-[32px] text-black" />
        </Link>
        <div className="flex items-center gap-2 pr-10">
          <CgProfile className="text-black text-[32px]" />
          <h2 className="font-bold text-black text-[20px] font-semibold font-poppins pt-4 mb-4">
            {title}
          </h2>
        </div>
      </div>
      <p className="text-sm text-[#4C383A] text-[12px] font-semibold font-poppins">
        {description}
      </p>
    </div>
  );
}
