import { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { IoLocationOutline } from "react-icons/io5";
import {
	LuCornerDownRight,
	LuMessageCircle,
	LuTrash2,
} from "react-icons/lu";
import NestedReplyCard from "./NestedReplyCard";
import ReplyInput from "./ReplyInput";

export default function ReplyCard({
	reply,
	nestedReplies,
	onReplySubmit,
	formatTimestamp,
	isOwnedByCurrentUser,
}) {
	const [isReplying, setIsReplying] = useState(false);

	return (
		<article className="flex gap-3 text-[#4C383A]">
			<div className="pt-1 text-[28px] text-[#5C4548]">
				<LuCornerDownRight />
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-3">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4C383A] text-[#FBF3E5]">
								<CgProfile className="text-[20px]" />
							</div>
							<h3 className="font-poppins text-[18px] font-semibold leading-none text-[#4C383A] sm:text-[20px]">
								{reply.anonymous_name || "Anonymous"}
							</h3>
							<span className="inline-flex items-center gap-2 font-poppins text-[15px] font-medium text-[#5C4548] sm:text-[16px]">
								<IoLocationOutline className="text-[18px]" />
								location, country
							</span>
						</div>

						<div className="mt-2 flex items-center gap-2 font-poppins text-[13px] font-medium text-[#5C4548]">
							<LuMessageCircle className="text-[14px]" />
							<span>replies</span>
							<span className="text-[#866a6e]">{formatTimestamp(reply.created_at)}</span>
						</div>
					</div>

					{isOwnedByCurrentUser && (
						<div className="flex items-center gap-3 text-[#4C383A]">
							<span className="rounded-[8px] bg-[#EFB758] px-4 py-1 font-darumadropone text-[22px] leading-none text-[#4C383A] shadow-[0_6px_18px_rgba(239,183,88,0.28)]">
								edit
							</span>
							<LuTrash2 className="text-[24px] opacity-80" />
						</div>
					)}
				</div>

				<p className="mt-3 max-w-3xl whitespace-pre-wrap font-poppins text-[15px] leading-7 text-[#4C383A] sm:text-[16px]">
					{reply.content}
				</p>

				<div className="mt-3 flex flex-wrap items-center gap-4">
					<span className="inline-flex min-w-[125px] items-center justify-center rounded-[8px] bg-[#8C97BC] px-4 py-2 font-darumadropone text-[22px] leading-none text-[#4C383A] shadow-[0_6px_18px_rgba(140,151,188,0.35)]">
						translate
					</span>
					<button
						type="button"
						onClick={() => setIsReplying((current) => !current)}
						className="border-0 bg-transparent p-0 text-[#4C383A] transition hover:text-[#2f2325]"
					>
						<LuMessageCircle className="text-[22px]" />
					</button>
				</div>

			{isReplying && (
				<div className="mt-4 max-w-2xl rounded-[18px] bg-[#F6EDDC] p-4">
					<ReplyInput
						onSubmit={(content) => onReplySubmit(reply.id, content)}
						onCancel={() => setIsReplying(false)}
						placeholder="reply to this message..."
						submitLabel="reply"
						rows={3}
						autoFocus
					/>
				</div>
			)}

			{nestedReplies.length > 0 && (
				<div className="mt-4 space-y-4 border-l border-[#B79FA3] pl-4 sm:pl-5">
					{nestedReplies.map((nestedReply) => (
						<NestedReplyCard
							key={nestedReply.id}
							reply={nestedReply}
							formatTimestamp={formatTimestamp}
						/>
					))}
				</div>
			)}
			</div>
		</article>
	);
}
