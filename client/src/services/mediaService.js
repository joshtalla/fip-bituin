import { supabase } from "./supabaseClient";

const POST_MEDIA_BUCKET = "post-media";
const MAX_MEDIA_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const getObjectKey = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.round(Math.random() * 1_000_000_000)}`;
};

const getFileExtension = (file) => {
  const providedExtension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (providedExtension) {
    return providedExtension;
  }

  return file.type === "image/gif" ? "gif" : "jpg";
};

const getMediaType = (file) => (file.type === "image/gif" ? "gif" : "image");

const readMediaDimensions = (previewUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      reject(new Error("Unable to read the selected media."));
    };

    image.src = previewUrl;
  });

export const validateMediaFile = (file) => {
  if (!file) {
    return "Select an image or GIF.";
  }

  if (!ALLOWED_MEDIA_MIME_TYPES.has(file.type)) {
    return "Only JPG, PNG, WEBP, and GIF files are supported.";
  }

  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return "Media must be 10MB or smaller.";
  }

  return "";
};

export const createLocalMediaDraft = async (file) => {
  const validationError = validateMediaFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const previewUrl = URL.createObjectURL(file);

  try {
    const { width, height } = await readMediaDimensions(previewUrl);

    return {
      file,
      fileName: file.name,
      previewUrl,
      mediaType: getMediaType(file),
      width,
      height,
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
};

export const clearLocalMediaDraft = (mediaDraft) => {
  if (mediaDraft?.previewUrl) {
    URL.revokeObjectURL(mediaDraft.previewUrl);
  }
};

export const uploadMedia = async ({ media, authUserId }) => {
  if (!media?.file) {
    return null;
  }

  const extension = getFileExtension(media.file);
  const filePath = `${authUserId || "user"}/${Date.now()}-${getObjectKey()}.${extension}`;

  const { data, error } = await supabase.storage
    .from(POST_MEDIA_BUCKET)
    .upload(filePath, media.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: media.file.type,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from(POST_MEDIA_BUCKET).getPublicUrl(data.path);

  return {
    media_url: publicUrlData.publicUrl,
    media_type: media.mediaType,
    media_width: media.width,
    media_height: media.height,
  };
};