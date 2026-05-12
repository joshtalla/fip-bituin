import { memo } from "react";
import { CgProfile } from "react-icons/cg";
import { IoLocationOutline } from "react-icons/io5";
import { LuMaximize2 } from "react-icons/lu";
import { Link } from "react-router-dom";

const placementClasses = {
  left: "left-0 translate-x-0",
  center: "left-1/2 -translate-x-1/2",
  right: "right-0 translate-x-0",
};

/** "above" = preview opens upward from the star; "below" = preview sits under the star */
const verticalClasses = {
  above: "bottom-full mb-3",
  below: "top-full mt-3",
};

function PostPreview({
  postId,
  username,
  country,
  content,
  placement = "center",
  verticalAlign = "above",
}) {
  const locationLabel = country || "location, country";
  const vertical =
    verticalClasses[verticalAlign] ?? verticalClasses.above;

  return (
    <div
      className={`absolute ${vertical} z-10 hidden h-[277px] w-[482px] overflow-hidden rounded-[20px] border border-[#77D1F6] bg-[#FBF3E5] text-[#4C383A] shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:block ${placementClasses[placement] ?? placementClasses.center}`}
    >
      <div className="flex h-full flex-col gap-6 px-8 py-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4C383A] text-[#FBF3E5]">
                <CgProfile className="text-[28px]" />
              </div>
              <h2 className="m-0 truncate font-poppins text-[22px] font-semibold leading-none text-[#332528]">
                {username}
              </h2>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-[#4C383A]">
              <IoLocationOutline className="shrink-0 text-[30px]" />
              <p className="m-0 truncate font-poppins text-[18px] font-medium leading-none text-[#4C383A]">
                {locationLabel}
              </p>
            </div>
          </div>

          <Link
            to={`/prompt/${postId}`}
            aria-label="Open post"
            className="shrink-0 pt-1 text-[#4C383A] transition-transform duration-200 hover:scale-105"
          >
            <LuMaximize2 className="text-[28px]" />
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden pr-1">
          <p className="m-0 font-poppins text-[15px] font-medium leading-[1.8] text-[#4C383A]">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(PostPreview);
