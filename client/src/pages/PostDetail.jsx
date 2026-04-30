import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchJson } from "../services/api";

export default function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const loadedPost = await fetchJson(`/api/posts/${postId}`);
        if (cancelled) {
          return;
        }

        setPost(loadedPost);
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

  return (
    <div className="min-h-screen px-[24px] pb-[72px] pt-[32px] sm:px-[60px]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-[24px] bg-[#FBF3E5] p-6 text-[#4C383A] shadow-xl sm:p-10">
        <Link to="/prompts" className="font-poppins text-sm font-semibold text-[#8A3B2E] underline hover:no-underline">
          Back to prompts
        </Link>

        {loading && (
          <p className="font-poppins text-lg font-medium text-[#4C383A]">Loading post...</p>
        )}

        {!loading && error && (
          <p className="font-poppins text-lg font-medium text-[#8A3B2E]">{error}</p>
        )}

        {!loading && !error && post && (
          <>
            <div className="flex flex-col gap-2">
              <p className="font-poppins text-sm font-semibold uppercase tracking-[0.2em] text-[#8A3B2E]">
                Shared by {post.anonymous_name}
              </p>
              <h1 className="font-darumadropone text-4xl text-[#4C383A]">
                {post.prompt?.title || "Prompt response"}
              </h1>
              {post.prompt?.prompt_text && (
                <p className="font-poppins text-base font-medium text-[#765C5F]">
                  {post.prompt.prompt_text}
                </p>
              )}
            </div>

            <div className="rounded-[20px] bg-[#F0E6D1] p-6">
              <p className="whitespace-pre-wrap font-poppins text-lg leading-8 text-[#4C383A]">
                {post.content}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 font-poppins text-sm font-semibold text-[#765C5F]">
              <span>Likes: {post.likes_count ?? 0}</span>
              <span>Replies: {post.reply_count ?? 0}</span>
              {post.created_at && (
                <span>
                  Posted {new Date(post.created_at).toLocaleString()}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}