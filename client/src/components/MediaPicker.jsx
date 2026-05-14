import { useRef } from "react";
import { LuImagePlus, LuTrash2 } from "react-icons/lu";
import MediaAttachment from "./MediaAttachment";

export default function MediaPicker({
  media,
  error,
  onSelect,
  onRemove,
  disabled = false,
  buttonLabel = "add media",
}) {
  const inputRef = useRef(null);

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      await onSelect(file);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#5A4A5A] px-4 py-2 font-darumadropone text-[22px] leading-none text-[#FBF3E5] transition hover:border-transparent hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LuImagePlus className="text-[18px]" />
          <span>{media ? "replace media" : buttonLabel}</span>
        </button>

        {media && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#765C5F] px-4 py-2 font-darumadropone text-[20px] leading-none text-[#FBF3E5] transition hover:border-transparent hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LuTrash2 className="text-[16px]" />
            <span>remove media</span>
          </button>
        )}
      </div>

      <p className={`m-0 font-poppins text-sm ${error ? "text-[#8A3B2E]" : "text-[#765C5F]"}`}>
        {error || "JPG, PNG, WEBP, or GIF up to 10MB."}
      </p>

      {media && (
        <MediaAttachment
          mediaUrl={media.previewUrl}
          alt={media.fileName || "Selected media"}
          containerClassName="overflow-hidden rounded-[18px] border border-[#D9CBB2] bg-[#F6EDDC] p-3"
          imageClassName="max-h-[280px]"
        />
      )}
    </div>
  );
}