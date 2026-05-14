import { useEffect, useState } from "react";
import { LuSend } from "react-icons/lu";
import MediaPicker from "./MediaPicker";
import { clearLocalMediaDraft, createLocalMediaDraft } from "../services/mediaService";

export default function ReplyInput({
	onSubmit,
	onCancel,
	placeholder = "reply!",
	submitLabel = "publish",
	rows = 4,
	autoFocus = false,
}) {
	const [value, setValue] = useState("");
	const [error, setError] = useState("");
	const [mediaError, setMediaError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedMedia, setSelectedMedia] = useState(null);

	useEffect(() => () => {
		clearLocalMediaDraft(selectedMedia);
	}, [selectedMedia]);

	const handleMediaSelect = async (file) => {
		try {
			const mediaDraft = await createLocalMediaDraft(file);
			setMediaError("");
			setError("");
			setSelectedMedia(mediaDraft);
		} catch (selectionError) {
			setMediaError(selectionError.message || "Unable to attach media.");
		}
	};

	const clearSelectedMedia = () => {
		setMediaError("");
		setSelectedMedia(null);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const trimmedValue = value.trim();

		if (!trimmedValue && !selectedMedia) {
			setError("Reply text or media is required.");
			return;
		}

		try {
			setIsSubmitting(true);
			setError("");
			await onSubmit({ content: trimmedValue, media: selectedMedia });
			setValue("");
			setSelectedMedia(null);
			setMediaError("");
			onCancel?.();
		} catch (submitError) {
			setError(submitError.message || "Failed to publish reply.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setValue("");
		setError("");
		setMediaError("");
		setSelectedMedia(null);
		onCancel?.();
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<textarea
				value={value}
				onChange={(event) => {
					setValue(event.target.value);
					if (error) {
						setError("");
					}
				}}
				placeholder={placeholder}
				rows={rows}
				autoFocus={autoFocus}
				disabled={isSubmitting}
				className="w-full resize-none rounded-[22px] border border-[#D9CBB2] bg-[#E8DFCE] px-4 py-3 font-poppins text-[15px] leading-7 text-[#4C383A] outline-none transition focus:border-[#8C97BC]"
			/>

			<MediaPicker
				media={selectedMedia}
				error={mediaError}
				onSelect={handleMediaSelect}
				onRemove={clearSelectedMedia}
				disabled={isSubmitting}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-h-6 font-poppins text-sm font-medium text-[#8A3B2E]">
					{error}
				</div>

				<div className="flex items-center justify-end gap-3">
					{onCancel && (
						<button
							type="button"
							onClick={handleCancel}
							disabled={isSubmitting}
							className="rounded-[10px] bg-[#765C5F] px-5 py-2 font-darumadropone text-[20px] text-[#FBF3E5] transition hover:border-transparent hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
						>
							cancel
						</button>
					)}

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center gap-2 rounded-[10px] bg-[#EFB758] px-5 py-2 font-darumadropone text-[20px] text-[#4C383A] transition hover:border-transparent hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<LuSend className="text-[18px]" />
						<span>{isSubmitting ? "sending..." : submitLabel}</span>
					</button>
				</div>
			</div>
		</form>
	);
}
