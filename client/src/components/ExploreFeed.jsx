import ExploreCard from "./ExploreCard";
import PostPreview from "./PostPreview";
import { useState, useEffect } from "react";
import { StarPost, SkeletonStarPost } from "./StarPost";
import { fetchJson } from "../services/api";

const PROMPTS_PAGE_SIZE = 4;
const POSTS_PAGE_SIZE = 12;

async function fetchArchivedPrompts(page = 1) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PROMPTS_PAGE_SIZE),
  });
  return fetchJson(`/api/prompts/archive?${params}`);
}

async function fetchPromptBoard(promptId, page = 1) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(POSTS_PAGE_SIZE),
    sort: "newest",
  });
  return fetchJson(`/api/prompts/${promptId}/board?${params}`);
}

function LoadingAnimation() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="h-20 w-20 animate-spin rounded-full border-8 border-[#FBF3E5] border-t-[#EFB758]" />
    </div>
  );
}

function Pagination({
  postsPage,
  totalPostPages,
  loadingPosts,
  handlePreviousPostsPage,
  handleNextPostsPage,
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={handlePreviousPostsPage}
        disabled={postsPage === 1 || loadingPosts}
        className="rounded-lg bg-[#EFB758] px-4 py-2 font-poppins text-[#4C383A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <p className="font-poppins text-[#FBF3E5]">
        Page {postsPage} of {totalPostPages}
      </p>

      <button
        type="button"
        onClick={handleNextPostsPage}
        disabled={postsPage === totalPostPages || loadingPosts}
        className="rounded-lg bg-[#EFB758] px-4 py-2 font-poppins text-[#4C383A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
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

  const [postsPage, setPostsPage] = useState(1);
  const [totalPostPages, setTotalPostPages] = useState(1);

  const loadPostsPage = async (prompt, page = 1) => {
    if (!prompt) return;
    setLoadingPosts(true);
    setPostsError(null);
    setHoveredStar(null);
    try {
      const data = await fetchPromptBoard(prompt.id, page);
      const { items, total, page: boardPage, limit } = data.posts;
      const pageSize = limit ?? POSTS_PAGE_SIZE;
      setPosts(items ?? []);
      setPostsPage(boardPage ?? page);
      setTotalPostPages(Math.max(1, Math.ceil((total ?? 0) / pageSize)));
    } catch (e) {
      setPostsError(e.message ?? "Could not load posts");
      setPosts([]);
      setTotalPostPages(1);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePromptClick = async (prompt) => {
    setSelectedPrompt(prompt);
    setPosts([]);
    setPostsPage(1);
    setTotalPostPages(1);
    setPostsError(null);
    setHoveredStar(null);

    await loadPostsPage(prompt, 1);
  };

  const handleNextPostsPage = () => {
    if (!selectedPrompt) return;
    if (postsPage >= totalPostPages) return;

    loadPostsPage(selectedPrompt, postsPage + 1);
  };

  const handlePreviousPostsPage = () => {
    if (!selectedPrompt) return;
    if (postsPage <= 1) return;

    loadPostsPage(selectedPrompt, postsPage - 1);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingArchive(true);
      setError(null);
      try {
        const data = await fetchArchivedPrompts(1);
        if (cancelled) return;
        setArchivedPrompts(data.prompts);
        const firstPrompt = data.prompts[0] ?? null;
        setSelectedPrompt(firstPrompt);
        if (firstPrompt) {
          await loadPostsPage(firstPrompt, 1);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message ?? "Could not load archive");
          setArchivedPrompts([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingArchive(false);
        }
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
      <div className="hidden sm:block" />

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
      <div className="flex w-full flex-col">
        <div className="h-[608px] w-full sm:h-[672px]">
          {loadingPosts ? (
            <div className="grid h-full grid-cols-3 content-start justify-items-center gap-y-24">
              {Array.from({ length: POSTS_PAGE_SIZE }).map((_, index) => (
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
            <div className="grid h-full grid-cols-3 content-start justify-items-center gap-y-24">
              {posts.map((post, index) => {
                const columns = 3;
                const isFirstRow = index < columns;
                return (
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
                        verticalAlign={isFirstRow ? "below" : "above"}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {totalPostPages > 1 && (
          <div className="shrink-0 pt-16">
            <Pagination
              postsPage={postsPage}
              totalPostPages={totalPostPages}
              loadingPosts={loadingPosts}
              handlePreviousPostsPage={handlePreviousPostsPage}
              handleNextPostsPage={handleNextPostsPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
