import { useContext, useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { IoCloseOutline } from "react-icons/io5";
import {
  LuBookmark,
  LuEllipsis,
  LuHeart,
  LuMessageCircle,
} from "react-icons/lu";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import ReplyInput from "../components/ReplyInput";
import ReplyThread from "../components/ReplyThread";
import { fetchJson, translatePost } from "../services/api";
import MediaAttachment from "../components/MediaAttachment";
import { uploadMedia } from "../services/mediaService";
import { isPostLiked, likePost, unlikePost } from "../services/postLikeService";
import { supabase } from "../services/supabaseClient";
import { savePost, unsavePost } from "../services/savedPostService";

const REPLY_PAGE_SIZE = 100;
const getTranslatedText = (result) => result?.translated_text || result?.translatedText || result?.text || "";

function formatTimestamp(value) {
  if (!value) {
    return "Unknown time";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReplyComposerOpen, setIsReplyComposerOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedPostContent, setTranslatedPostContent] = useState("");
  const [translatedReplies, setTranslatedReplies] = useState({});
  const [translatingReplyIds, setTranslatingReplyIds] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handles translation of the post content
  const handleTranslate = async () => {
    if (!post?.content || translating) return;
    setTranslating(true);
    try {
      const result = await translatePost({
        text: post.content,
        sourceLanguage: post.language,
      });
      setTranslatedPostContent(getTranslatedText(result) || post.content);
    } catch (err) {
      alert(err.message || "Failed to translate post.");
    } finally {
      setTranslating(false);
    }
  };

  const handleReplyTranslate = async (reply) => {
    if (!reply?.id || !reply.content || translatingReplyIds[reply.id]) {
      return;
    }

    setTranslatingReplyIds((current) => ({
      ...current,
      [reply.id]: true,
    }));

    try {
      const result = await translatePost({
        text: reply.content,
        sourceLanguage: reply.language,
      });

      setTranslatedReplies((current) => ({
        ...current,
        [reply.id]: getTranslatedText(result) || reply.content,
      }));
    } catch (err) {
      alert(err.message || "Failed to translate reply.");
    } finally {
      setTranslatingReplyIds((current) => {
        const nextState = { ...current };
        delete nextState[reply.id];
        return nextState;
      });
    }
  };

  const handleSaveToggle = async () => {
    if (!post || isSaving) return;
    const previousSavedState = isSaved;
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);
    setIsSaving(true);
    try {
      if (nextSavedState) {
        await savePost(post.id);
      } else {
        await unsavePost(post.id);
      }
    } catch (err) {
      setIsSaved(previousSavedState);
      alert("Failed to update saved post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!post || isLiking) return;

    const previousLikedState = isLiked;
    const previousLikesCount = post.likes_count ?? 0;
    const nextLikedState = !isLiked;
    const nextLikesCount = nextLikedState
      ? previousLikesCount + 1
      : Math.max(previousLikesCount - 1, 0);

    setIsLiked(nextLikedState);
    setIsLiking(true);
    setPost((currentPost) => {
      if (!currentPost) {
        return currentPost;
      }

      return {
        ...currentPost,
        likes_count: nextLikesCount,
      };
    });

    try {
      const result = nextLikedState
        ? await likePost(post.id)
        : await unlikePost(post.id);

      setPost((currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        return {
          ...currentPost,
          likes_count: result.likes_count ?? nextLikesCount,
        };
      });
    } catch (err) {
      setIsLiked(previousLikedState);
      setPost((currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        return {
          ...currentPost,
          likes_count: previousLikesCount,
        };
      });
      alert("Failed to update like. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    setIsLiked(isPostLiked(postId));
  }, [postId]);

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const loadedPost = await fetchJson(`/api/posts/${postId}`);
        const loadedReplies = await fetchJson(
          `/api/posts/${postId}/replies?page=1&limit=${REPLY_PAGE_SIZE}`,
        );

        if (cancelled) {
          return;
        }

        setPost(loadedPost);
        setReplies(loadedReplies.replies || []);
        setTranslatedPostContent("");
        setTranslatedReplies({});
        setTranslatingReplyIds({});
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.status === 404 ? "Post not found." : "Failed to load post.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleReplySubmit = async (parentReplyId, payload) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Your session expired. Please sign in again.");
    }

    const endpoint = parentReplyId
      ? `/api/replies/${parentReplyId}/replies`
      : `/api/posts/${postId}/replies`;

    const mediaPayload = payload.media
      ? await uploadMedia({ media: payload.media, authUserId: session.user.id })
      : {};

    const createdReply = await fetchJson(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        content: payload.content,
        ...mediaPayload,
      }),
    });

    setReplies((currentReplies) => [...currentReplies, createdReply]);
    setPost((currentPost) => {
      if (!currentPost) {
        return currentPost;
      }

      return {
        ...currentPost,
        reply_count: (currentPost.reply_count ?? 0) + 1,
      };
    });
  };

  return (
    <div className="min-h-screen px-4 pb-20 pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[980px]">

        {loading && (
          <div className="mt-6 rounded-[30px] bg-[#FBF3E5] px-6 py-12 text-center font-poppins text-lg font-medium text-[#4C383A] shadow-[0_20px_45px_rgba(12,7,25,0.18)]">
            Loading post...
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-[30px] bg-[#FBF3E5] px-6 py-12 text-center font-poppins text-lg font-medium text-[#8A3B2E] shadow-[0_20px_45px_rgba(12,7,25,0.18)]">
            {error}
          </div>
        )}

        {!loading && !error && post && (
          <section className="mt-6 rounded-[28px] bg-[#FBF3E5] px-6 py-7 text-[#4C383A] shadow-[0_26px_60px_rgba(10,8,24,0.24)] sm:px-10 sm:py-8 lg:px-12 lg:py-9">
            <div className="flex items-start justify-between gap-4">
              <Link
                to="/prompts"
                aria-label="Back to prompt board"
                className="border-0 bg-transparent p-0 text-[#4C383A] transition hover:text-[#2f2325]"
              >
                <IoCloseOutline className="text-[30px]" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-[#4C383A] sm:gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4C383A] text-[#FBF3E5]">
                <CgProfile className="text-[25px]" />
              </div>
              <p className="font-poppins text-[24px] font-semibold leading-none sm:text-[28px]">
                {post.anonymous_name || "username"}
              </p>
            </div>
            {(translatedPostContent || post.content) && (
              <div className="mt-7 max-w-4xl">
                <p className="whitespace-pre-wrap font-poppins text-[18px] leading-[1.55] text-[#4C383A] sm:text-[20px] lg:text-[22px]">
                  {translatedPostContent || post.content}
                </p>
              </div>
            )}

            {post.media_url && (
              <MediaAttachment
                mediaUrl={post.media_url}
                alt={`${post.anonymous_name || "Anonymous"} attachment`}
                containerClassName="mt-6 max-w-3xl overflow-hidden rounded-[24px] bg-[#F4E8D5] p-4 shadow-[0_10px_28px_rgba(76,56,58,0.12)]"
                imageClassName="max-h-[520px]"
              />
            )}

            <div className="mt-8 flex flex-wrap items-center gap-5 text-[#4C383A]">
              <button
                type="button"
                onClick={handleTranslate}
                className="inline-flex min-w-[150px] items-center justify-center rounded-[8px] bg-[#8C97BC] px-6 py-3 font-darumadropone text-[26px] leading-none text-[#4C383A] shadow-[0_8px_20px_rgba(140,151,188,0.35)] disabled:opacity-60"
                disabled={translating}
                aria-label="Translate post"
              >
                {translating ? "Translating..." : "translate"}
              </button>
              <button
                type="button"
                onClick={() => setIsReplyComposerOpen((current) => !current)}
                className="border-0 bg-transparent p-0 text-[#4C383A] transition hover:text-[#2f2325]"
                aria-label="Reply to post"
              >
                <LuMessageCircle className="text-[28px]" />
              </button>
              <button
                type="button"
                onClick={handleLikeToggle}
                disabled={isLiking}
                className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[#4C383A] transition hover:text-[#2f2325] disabled:opacity-60"
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <LuHeart
                  className="text-[28px]"
                  fill={isLiked ? "currentColor" : "none"}
                />
                <span className="font-poppins text-[16px] font-medium sm:text-[18px]">
                  {post.likes_count ?? 0}
                </span>
              </button>
              <button
                type="button"
                onClick={handleSaveToggle}
                disabled={isSaving}
                className="border-0 bg-transparent p-0 text-[#4C383A] transition hover:text-[#2f2325] disabled:opacity-60"
                aria-label={isSaved ? "Unsave post" : "Save post"}
              >
                <LuBookmark
                  className="text-[28px]"
                  fill={isSaved ? "currentColor" : "none"}
                />
              </button>
              <span className="text-[28px]">
                <LuEllipsis />
              </span>
            </div>

            {isReplyComposerOpen && (
              <div className="mt-6 max-w-3xl rounded-[18px] bg-[#F4E8D5] p-4">
                <ReplyInput
                  onSubmit={async (payload) => {
                    await handleReplySubmit(null, payload);
                    setIsReplyComposerOpen(false);
                  }}
                  onCancel={() => setIsReplyComposerOpen(false)}
                  placeholder="reply!"
                  submitLabel="publish"
                  rows={3}
                  autoFocus
                />
              </div>
            )}

            <ReplyThread
              replies={replies}
              onReplySubmit={handleReplySubmit}
              onTranslateReply={handleReplyTranslate}
              formatTimestamp={formatTimestamp}
              currentUsername={user?.username}
              translatedReplies={translatedReplies}
              translatingReplyIds={translatingReplyIds}
            />
          </section>
        )}
      </div>
    </div>
  );
}