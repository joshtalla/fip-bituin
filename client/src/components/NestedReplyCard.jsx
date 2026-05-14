import { CgProfile } from "react-icons/cg";
import { IoLocationOutline } from "react-icons/io5";
import { LuCornerDownRight, LuMessageCircle } from "react-icons/lu";
import MediaAttachment from "./MediaAttachment";

export default function NestedReplyCard({ reply, formatTimestamp }) {
	return (
		<article className="flex gap-3 text-[#4C383A]">
			<div className="pt-1 text-[22px] text-[#6B575A]">
				<LuCornerDownRight />
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-3 text-[#4C383A]">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4C383A] text-[#FBF3E5]">
						<CgProfile className="text-[18px]" />
					</div>
					<p className="font-poppins text-[15px] font-semibold leading-none sm:text-[17px]">
						{reply.anonymous_name || "Anonymous"}
					</p>
					<span className="inline-flex items-center gap-2 font-poppins text-[14px] font-medium text-[#5C4548]">
						<IoLocationOutline className="text-[16px]" />
						location, country
					</span>
				</div>

				<div className="mt-2 flex items-center gap-2 font-poppins text-[13px] font-medium text-[#5C4548]">
					<LuMessageCircle className="text-[14px]" />
					<span>replies</span>
					<span className="text-[#866a6e]">{formatTimestamp(reply.created_at)}</span>
				</div>

				{reply.content && (
					<p className="mt-3 max-w-2xl whitespace-pre-wrap font-poppins text-[14px] leading-7 text-[#4C383A] sm:text-[15px]">
						{reply.content}
					</p>
				)}

				{reply.media_url && (
					<MediaAttachment
						mediaUrl={reply.media_url}
						alt={`${reply.anonymous_name || "Anonymous"} nested reply attachment`}
						containerClassName="mt-4 max-w-xl overflow-hidden rounded-[16px] bg-[#F4E8D5] p-3"
						imageClassName="max-h-[260px]"
					/>
				)}
			</div>
		</article>
	);
}
