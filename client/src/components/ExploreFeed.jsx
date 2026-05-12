import ExploreCard from "./ExploreCard";
import PostPreview from "./PostPreview";
import { useState, useEffect } from "react";
import { StarPost, SkeletonStarPost } from "./StarPost";
import { fetchJson } from "../services/api";

const PAGE_SIZE = 12;

async function fetchArchivedPrompts(page = 1) {
  return fetchJson(`/api/prompts/archive?page=${page}&limit=${PAGE_SIZE}`);
}

async function fetchPostsForPrompt(promptId, page = 1) {
  return fetchJson(
    `/api/prompts/${promptId}/posts?page=${page}&limit=${PAGE_SIZE}`,
  );
}

function LoadingAnimation() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="h-20 w-20 animate-spin rounded-full border-8 border-[#FBF3E5] border-t-[#EFB758]" />
    </div>
  );
}

function getPreviewPlacement(event) {
  const starBounds = event.currentTarget.getBoundingClientRect();
  const previewWidth = 482;
  const gutter = 24;
  const centeredLeft =
    starBounds.left + starBounds.width / 2 - previewWidth / 2;

  if (centeredLeft < gutter) {
    return "left";
  }

  if (centeredLeft + previewWidth > window.innerWidth - gutter) {
    return "right";
  }

  return "center";
}

export default function ExploreFeed() {
  const [archivedPrompts, setArchivedPrompts] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);

  const handlePromptClick = async (prompt) => {
    setSelectedPrompt(prompt);
    setPosts([]);
    setLoadingPosts(true);
    setPostsError(null);
    setHoveredStar(null);
    try {
      const { posts: list } = await fetchPostsForPrompt(prompt.id, 1);
      setPosts(list);
    } catch (e) {
      setPostsError(e.message ?? "Could not load posts");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingArchive(true);
      setError(null);
      try {
        const data = await fetchArchivedPrompts(1);
        if (!cancelled) {
          setArchivedPrompts(data.prompts);
          setSelectedPrompt(data.prompts[0]);
          handlePromptClick(data.prompts[0]);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message ?? "Could not load archive");
          setArchivedPrompts([]);
        }
      } finally {
        if (!cancelled) setLoadingArchive(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadingArchive) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <p className="font-poppins text-red-700" role="alert">
        {error}
      </p>
    );
  }

  if (archivedPrompts.length === 0) {
    return (
      <p className="font-poppins text-[#4C383A]">No archived prompts yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Header sits in the left grid column */}
      <div className="flex justify-center">
        <h1 className="w-full max-w-[651px] font-poppins text-[24px] font-semibold text-[#FBF3E5]">
          past prompts:
        </h1>
      </div>

      {/* Empty right column keeps the grid structure aligned */}
      <div />

      {/* Prompt column */}
      <div className="flex flex-col items-center gap-6">
        {archivedPrompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => handlePromptClick(prompt)}
            className={`rounded-2xl text-left ring-offset-2 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EFB758] ${
              selectedPrompt?.id === prompt.id ? "ring-2 ring-[#EFB758]" : ""
            }`}
          >
            <ExploreCard prompt={prompt} />
          </button>
        ))}
      </div>
      <div className="min-h-[200px] w-full">
        {!selectedPrompt ? (
          <p className="font-poppins text-[#4C383A]" aria-live="polite">
            Choose a prompt on the left to see its stars here.
          </p>
        ) : loadingPosts ? (
          <div className="grid grid-cols-3 justify-items-center gap-y-24">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="relative">
                <SkeletonStarPost />
              </div>
            ))}
          </div>
        ) : postsError ? (
          <p className="font-poppins text-red-700" role="alert">
            {postsError}
          </p>
        ) : posts.length === 0 ? (
          <p className="font-poppins text-[#FBF3E5]">
            No posts for this prompt yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 justify-items-center gap-y-24">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative"
                onMouseEnter={(event) =>
                  setHoveredStar({
                    id: post.id,
                    placement: getPreviewPlacement(event),
                  })
                }
                onMouseLeave={() => setHoveredStar(null)}
              >
                <StarPost post={post} />
                {hoveredStar?.id === post.id && (
                  <PostPreview
                    postId={post.id}
                    username={post.anonymous_name}
                    country={post.country}
                    content={post.content}
                    placement={hoveredStar.placement}
                    verticalAlign="below"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
