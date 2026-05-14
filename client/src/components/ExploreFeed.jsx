import ExploreCard from "./ExploreCard";
import PostPreview from "./PostPreview";
import { useState, useEffect } from "react";
import { StarPost, SkeletonStarPost } from "./StarPost";
import { fetchJson } from "../services/api";
import { IoCloseOutline } from "react-icons/io5";

const PROMPTS_PAGE_SIZE = 4;
const DESKTOP_POSTS_PAGE_SIZE = 12;
const MOBILE_POSTS_PAGE_SIZE = 9;

function getPostsPageSize() {
  if (typeof window === "undefined") return DESKTOP_POSTS_PAGE_SIZE;

  return window.innerWidth < 1024
    ? MOBILE_POSTS_PAGE_SIZE
    : DESKTOP_POSTS_PAGE_SIZE;
}

async function fetchArchivedPrompts(page = 1) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PROMPTS_PAGE_SIZE),
  });

  return fetchJson(`/api/prompts/archive?${params}`);
}

async function fetchPromptBoard(
  promptId,
  page = 1,
  limit = DESKTOP_POSTS_PAGE_SIZE,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
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
        className="h-[44px] rounded-lg bg-[#EFB758] px-4 py-2 font-poppins text-[#4C383A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <p className="text-center font-poppins text-[#FBF3E5]">
        Page {postsPage} of {totalPostPages}
      </p>

      <button
        type="button"
        onClick={handleNextPostsPage}
        disabled={postsPage === totalPostPages || loadingPosts}
        className="h-[44px] rounded-lg bg-[#EFB758] px-4 py-2 font-poppins text-[#4C383A] disabled:cursor-not-allowed disabled:opacity-50"
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

function ExplorePosts({
  loadingPosts,
  postsError,
  posts,
  postsPageSize,
  hoveredStar,
  setHoveredStar,
}) {
  return (
    <div className="h-[420px] w-full sm:h-[608px] lg:h-[672px]">
      {loadingPosts ? (
        <div className="grid h-full grid-cols-3 content-start justify-items-center gap-x-10 gap-y-20 sm:gap-x-16 sm:gap-y-24 lg:gap-x-0">
          {Array.from({ length: postsPageSize }).map((_, index) => (
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
          No posts were found for this prompt.
        </p>
      ) : (
        <div className="grid h-full grid-cols-3 content-start justify-items-center gap-x-10 gap-y-20 sm:gap-x-16 sm:gap-y-24 lg:gap-x-0">
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
  );
}

function StarBoard({
  loadingPosts,
  postsError,
  posts,
  postsPageSize,
  hoveredStar,
  setHoveredStar,
  totalPostPages,
  postsPage,
  handlePreviousPostsPage,
  handleNextPostsPage,
}) {
  return (
    <div className="flex w-full flex-col">
      <ExplorePosts
        loadingPosts={loadingPosts}
        postsError={postsError}
        posts={posts}
        postsPageSize={postsPageSize}
        hoveredStar={hoveredStar}
        setHoveredStar={setHoveredStar}
      />

      {totalPostPages > 1 && (
        <div className="shrink-0 pt-8 lg:pt-16">
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
  );
}

function MobileStarBoardModal({ open, onClose, selectedPrompt, children }) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 lg:hidden">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close post board"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[651px] overflow-hidden rounded-3xl bg-[#4C383A] p-4 shadow-2xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-poppins text-sm text-[#FBF3E5]/70">posts for:</p>

            <h2 className="font-poppins text-lg font-semibold text-[#FBF3E5]">
              {selectedPrompt?.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-[#FBF3E5]/10 px-3 py-1 font-poppins text-sm text-[#FBF3E5]"
          >
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
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
  const [postsPageSize, setPostsPageSize] = useState(DESKTOP_POSTS_PAGE_SIZE);

  const [isMobileBoardOpen, setIsMobileBoardOpen] = useState(false);

  const loadPostsPage = async (prompt, page = 1) => {
    if (!prompt) return;

    const requestedPageSize = getPostsPageSize();

    setPostsPageSize(requestedPageSize);
    setLoadingPosts(true);
    setPostsError(null);
    setHoveredStar(null);

    try {
      const data = await fetchPromptBoard(prompt.id, page, requestedPageSize);
      const { items, total, page: boardPage, limit } = data.posts;
      const pageSize = limit ?? requestedPageSize;

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

    if (window.innerWidth < 1024) {
      setIsMobileBoardOpen(true);
    }

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
    <section id="explore-feed">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Header sits in the left grid column */}
        <div className="flex justify-center">
          <h1 className="w-full max-w-[651px] font-poppins text-[24px] font-semibold text-[#FBF3E5]">
            past prompts:
          </h1>
        </div>

        {/* Desktop-only empty right column keeps the grid structure aligned */}
        <div className="hidden lg:block" />

        {/* Prompt column */}
        <div className="flex flex-col items-center gap-6">
          {archivedPrompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className={`w-full max-w-[651px] cursor-pointer rounded-2xl text-left ring-offset-2 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EFB758] ${
                selectedPrompt?.id === prompt.id ? "ring-2 ring-[#EFB758]" : ""
              }`}
            >
              <ExploreCard prompt={prompt} />
            </button>
          ))}
        </div>

        {/* Desktop-only right column star board */}
        <div className="hidden w-full flex-col lg:flex">
          <StarBoard
            loadingPosts={loadingPosts}
            postsError={postsError}
            posts={posts}
            postsPageSize={postsPageSize}
            hoveredStar={hoveredStar}
            setHoveredStar={setHoveredStar}
            totalPostPages={totalPostPages}
            postsPage={postsPage}
            handlePreviousPostsPage={handlePreviousPostsPage}
            handleNextPostsPage={handleNextPostsPage}
          />
        </div>
      </div>

      {/* Mobile-only modal card star board */}
      <MobileStarBoardModal
        open={isMobileBoardOpen}
        onClose={() => setIsMobileBoardOpen(false)}
        selectedPrompt={selectedPrompt}
      >
        <StarBoard
          loadingPosts={loadingPosts}
          postsError={postsError}
          posts={posts}
          postsPageSize={postsPageSize}
          hoveredStar={hoveredStar}
          setHoveredStar={setHoveredStar}
          totalPostPages={totalPostPages}
          postsPage={postsPage}
          handlePreviousPostsPage={handlePreviousPostsPage}
          handleNextPostsPage={handleNextPostsPage}
        />
      </MobileStarBoardModal>
    </section>
  );
}
