export default function MediaAttachment({
  mediaUrl,
  alt = "Attached media",
  containerClassName = "",
  imageClassName = "",
}) {
  if (!mediaUrl) {
    return null;
  }

  return (
    <div className={containerClassName}>
      <img
        src={mediaUrl}
        alt={alt}
        loading="lazy"
        className={`block w-full rounded-[18px] bg-[#E8DFCE] object-contain ${imageClassName}`.trim()}
      />
    </div>
  );
}