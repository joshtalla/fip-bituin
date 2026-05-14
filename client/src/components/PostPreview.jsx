import { memo } from "react";
import { CgProfile } from "react-icons/cg";
import { IoLocationOutline } from "react-icons/io5";
import { LuMaximize2 } from "react-icons/lu";
import { Link } from "react-router-dom";
import MediaAttachment from "./MediaAttachment";

const placementClasses = {
  left: "left-0 translate-x-0",
  center: "left-1/2 -translate-x-1/2",
  right: "right-0 translate-x-0",
};

function PostPreview({
  postId,
  username,
  country,
  content,
  mediaUrl,
  mediaWidth,
  mediaHeight,
  placement = "center",
}) {
  const locationLabel = country || "location, country";
  const trimmedContent = content?.trim() || "";
  const shouldShowPreviewMedia = Boolean(mediaUrl) && (
    !trimmedContent ||
    trimmedContent.length <= 180 ||
    (!mediaWidth || !mediaHeight || (mediaWidth <= 1200 && mediaHeight <= 1200))
  );
  const previewText = trimmedContent || (mediaUrl ? "Shared media" : "");

  return (
    <div
      className={`absolute bottom-full z-10 mb-3 hidden w-[482px] overflow-hidden rounded-[20px] border border-[#77D1F6] bg-[#FBF3E5] text-[#4C383A] shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:block ${placementClasses[placement] ?? placementClasses.center}`}
    >
      <div className="flex max-h-[360px] flex-col gap-5 px-8 py-7">
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

        {shouldShowPreviewMedia && (
          <MediaAttachment
            mediaUrl={mediaUrl}
            alt={`${username || "Anonymous"} attachment preview`}
            containerClassName="overflow-hidden rounded-[16px] bg-[#F6EDDC] p-2"
            imageClassName="max-h-[160px]"
          />
        )}

        <div className="min-h-0 flex-1 overflow-hidden pr-1">
          <p
            className="m-0 font-poppins text-[15px] font-medium leading-[1.8] text-[#4C383A]"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: shouldShowPreviewMedia ? 4 : 8,
              overflow: "hidden",
            }}
          >
            {previewText || "Open post to view more."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(PostPreview);
