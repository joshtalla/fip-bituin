import ReplyCard from "./ReplyCard";

export default function ReplyThread({
	replies,
	onReplySubmit,
	formatTimestamp,
	currentUsername,
}) {
	const nestedRepliesByParentId = replies.reduce((replyMap, reply) => {
		if (!reply.parent_reply_id) {
			return replyMap;
		}

		const existingReplies = replyMap.get(reply.parent_reply_id) || [];
		existingReplies.push(reply);
		replyMap.set(reply.parent_reply_id, existingReplies);
		return replyMap;
	}, new Map());

	const topLevelReplies = replies.filter((reply) => !reply.parent_reply_id);

	if (topLevelReplies.length === 0) {
		return null;
	}

	return (
		<div className="mt-6 space-y-7">
			{topLevelReplies.map((reply) => (
				<ReplyCard
					key={reply.id}
					reply={reply}
					nestedReplies={nestedRepliesByParentId.get(reply.id) || []}
					onReplySubmit={onReplySubmit}
					formatTimestamp={formatTimestamp}
					isOwnedByCurrentUser={reply.anonymous_name === currentUsername}
				/>
			))}
		</div>
	);
}
