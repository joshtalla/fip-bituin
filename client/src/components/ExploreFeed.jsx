import ExploreCard from "./ExploreCard";
import PostPreview from "./PostPreview";
import { useState, useEffect, useRef } from "react";
import { StarPost, SkeletonStarPost } from "./StarPost";
import { fetchJson } from "../services/api";
import { IoCloseOutline } from "react-icons/io5";

const PROMPTS_PAGE_SIZE = 3;
// const PROMPT_PAGE_HEIGHT =
//   PROMPTS_PAGE_SIZE * 190 + (PROMPTS_PAGE_SIZE - 1) * 24;
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

function Pagination({ page, totalPages, loading, onPrevious, onNext }) {
  return (
    <nav className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={page === 1 || loading}
        className="h-[44px] rounded-lg bg-[#EFB758] px-4 py-2 font-poppins text-[#4C383A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <p className="text-center font-poppins text-[#FBF3E5]">
        Page {page} of {totalPages}
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={page === totalPages || loading}
        className="h-[44px] rounded-lg bg-[#EFB758] px-4 py-2 font-poppins text-[#4C383A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </nav>
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

      <div className="shrink-0 max-lg:pt-10 lg:pt-16">
        {totalPostPages > 1 ? (
          <Pagination
            page={postsPage}
            totalPages={totalPostPages}
            loading={loadingPosts}
            onPrevious={handlePreviousPostsPage}
            onNext={handleNextPostsPage}
          />
        ) : (
          <div className="h-[44px]" aria-hidden="true" />
        )}
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close post board"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Modal card */}
      <div className="relative z-10 mx-auto flex max-h-[92dvh] w-full max-w-[651px] flex-col overflow-hidden rounded-3xl bg-[#4C383A] p-4 shadow-2xl sm:max-h-[86dvh] md:max-h-[84dvh]">
        <div className="mb-8 flex shrink-0 items-start justify-between gap-4">
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

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ExploreFeed() {
  const [archivedPrompts, setArchivedPrompts] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(true);
  const [loadingArchivePage, setLoadingArchivePage] = useState(false);
  const [error, setError] = useState(null);
  const [archivePageError, setArchivePageError] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const [archivePage, setArchivePage] = useState(1);
  const [totalArchivePages, setTotalArchivePages] = useState(1);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);

  const [postsPage, setPostsPage] = useState(1);
  const [totalPostPages, setTotalPostPages] = useState(1);
  const [postsPageSize, setPostsPageSize] = useState(DESKTOP_POSTS_PAGE_SIZE);

  const [isMobileBoardOpen, setIsMobileBoardOpen] = useState(false);

  const archiveLoadSeq = useRef(0);

  const loadPostsPage = async (
    prompt,
    page = 1,
    { shouldApply = () => true } = {},
  ) => {
    if (!prompt) return;

    const requestedPageSize = getPostsPageSize();

    setPostsPageSize(requestedPageSize);
    setLoadingPosts(true);
    setPostsError(null);
    setHoveredStar(null);

    try {
      const data = await fetchPromptBoard(prompt.id, page, requestedPageSize);
      if (!shouldApply()) return;

      const { items, total, page: boardPage, limit } = data.posts;
      const pageSize = limit ?? requestedPageSize;

      setPosts(items ?? []);
      setPostsPage(boardPage ?? page);
      setTotalPostPages(Math.max(1, Math.ceil((total ?? 0) / pageSize)));
    } catch (e) {
      if (!shouldApply()) return;

      setPostsError(e.message ?? "Could not load posts");
      setPosts([]);
      setTotalPostPages(1);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePromptClick = async (prompt) => {
    setArchivePageError(null);
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

  const loadArchivePage = async (page, { initial = false } = {}) => {
    const seq = ++archiveLoadSeq.current;

    if (initial) {
      setLoadingArchive(true);
    } else {
      setLoadingArchivePage(true);
    }
    setError(null);
    setArchivePageError(null);

    try {
      const data = await fetchArchivedPrompts(page);
      if (seq !== archiveLoadSeq.current) return;

      const prompts = data.prompts ?? [];
      const limit = data.limit ?? PROMPTS_PAGE_SIZE;
      const total = data.total ?? 0;
      const resolvedPage = data.page ?? page;

      setArchivedPrompts(prompts);
      setArchivePage(resolvedPage);
      setTotalArchivePages(Math.max(1, Math.ceil((total || 0) / limit)));

      const firstPrompt = prompts[0] ?? null;
      setSelectedPrompt(firstPrompt);
      setHoveredStar(null);
      setIsMobileBoardOpen(false);

      if (firstPrompt) {
        await loadPostsPage(firstPrompt, 1, {
          shouldApply: () => seq === archiveLoadSeq.current,
        });
      } else {
        setPosts([]);
        setPostsPage(1);
        setTotalPostPages(1);
        setPostsError(null);
      }
    } catch (e) {
      if (seq !== archiveLoadSeq.current) return;

      const message = e.message ?? "Could not load archive";
      if (initial) {
        setError(message);
        setArchivedPrompts([]);
      } else {
        setArchivePageError(message);
      }
    } finally {
      if (seq === archiveLoadSeq.current) {
        if (initial) {
          setLoadingArchive(false);
        } else {
          setLoadingArchivePage(false);
        }
      }
    }
  };

  const handleNextArchivePage = () => {
    if (archivePage >= totalArchivePages) return;
    loadArchivePage(archivePage + 1);
  };

  const handlePreviousArchivePage = () => {
    if (archivePage <= 1) return;
    loadArchivePage(archivePage - 1);
  };

  useEffect(() => {
    loadArchivePage(1, { initial: true });
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
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
        {/* Header sits in the left grid column */}
        <div className="flex justify-center">
          <h1 className="w-full max-w-[651px] font-poppins text-[24px] font-semibold text-[#FBF3E5]">
            past prompts:
          </h1>
        </div>

        {/* Desktop-only empty right column keeps the grid structure aligned */}
        <div className="hidden lg:block" aria-hidden="true" />

        <div className="flex h-full min-h-0 w-full flex-col items-center max-lg:min-h-[calc(100dvh-20rem)]">
          <div className="flex h-[540px] w-full max-w-[651px] flex-col gap-6 sm:h-[618px]">
            {archivedPrompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                className={`w-full cursor-pointer rounded-2xl text-left ring-offset-2 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EFB758] ${
                  selectedPrompt?.id === prompt.id
                    ? "ring-2 ring-[#EFB758]"
                    : ""
                }`}
              >
                <ExploreCard prompt={prompt} />
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 basis-0" aria-hidden="true" />

          <div className="flex w-full max-w-[651px] shrink-0 flex-col gap-2">
            {archivePageError && (
              <p className="font-poppins text-red-400" role="alert">
                {archivePageError}
              </p>
            )}

            {totalArchivePages > 1 && (
              <div className="max-lg:pt-16 lg:pt-16">
                <Pagination
                  page={archivePage}
                  totalPages={totalArchivePages}
                  loading={loadingArchivePage}
                  onPrevious={handlePreviousArchivePage}
                  onNext={handleNextArchivePage}
                />
              </div>
            )}
          </div>
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
