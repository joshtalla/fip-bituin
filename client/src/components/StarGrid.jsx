import headerStar from "../assets/header-star.svg";
import { useEffect, useState } from "react";
import { mockPosts } from "../mocks/mockData";
import PostPreview from "./PostPreview";
import { StarPost, SkeletonStarPost } from "./StarPost";

const PAGE_SIZE = 18;

// Load more button for the star grid pagination
function LoadMoreButton({ loadMore, isLoadingMore }) {
  return (
    <div className="mt-12 flex justify-center">
      <button
        type="button"
        onClick={loadMore}
        disabled={isLoadingMore}
        className="h-[50px] w-[220px] rounded-md bg-[#EFB758] px-4 py-2 font-darumadropone text-[16px] font-semibold text-[#4C383A] transition-all duration-300 hover:bg-[#FBF3E5] hover:text-[#4C383A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoadingMore ? "Loading..." : "Load more"}
      </button>
    </div>
  );
}

async function fetchPosts(promptId, page) {
  // TODO: replace with real API call once available.

  // const resp = await fetch(`/api/prompts/${promptId}/posts?page=${page}&limit=${PAGE_SIZE}`);
  // if (!resp.ok) throw new Error("Failed to fetch posts");
  // const data = await resp.json();
  // return data;

  // Development only: return the mock posts
  // Development only: wait 5 seconds before returning the mock posts
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockPosts.slice(start, end);
}

export default function StarGrid({ promptId }) {
  const [hoveredStar, setHoveredStar] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load more posts when the user scrolls to the bottom of the page
  // Fetches the next page of posts from the API and adds them to the posts state by adding the new posts to the end of the existing posts
  // If the next page of posts is empty, sets the has more state to false
  // If the next page of posts is not empty, sets the has more state to true
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const newPosts = await fetchPosts(promptId, page + 1);

      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      setPosts((prev) => [...prev, ...newPosts]);
      const newPage = page + 1;

      setPage(newPage);
      setHasMore(newPosts.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Loads the first page of posts by fetching them from the API with the correct prompt id.
  // If no prompt id, resets the posts, page, and has more state.
  // If the first page of posts is empty, sets the has more state to false.
  // If the second page of posts is not empty, sets the has more state to true.
  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      try {
        // Reset the loading state, the hovered star, and the has more state
        setIsLoading(true);
        setHasMore(false);
        setHoveredStar(null);

        // If no prompt id, reset the posts, page, and has more state
        if (!promptId) {
          setPosts([]);
          setPage(1);
          setHasMore(false);
          return;
        }

        // Fetch the first page of posts
        const firstPage = await fetchPosts(promptId, 1);
        if (cancelled) return;

        // Set the posts and page state so that the first page of posts is displayed
        setPosts(firstPage);
        setPage(1);

        // If the first page of posts is empty, set the has more state to false
        if (firstPage.length === 0) {
          setHasMore(false);
          return;
        }

        // Fetch the second page of posts
        const nextPage = await fetchPosts(promptId, 2);
        if (cancelled) return;

        // Set the has more state based on the length of the second page of posts
        // so that the load more button only appears if there are more posts to load
        setHasMore(nextPage.length > 0);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFirstPage();
    return () => {
      cancelled = true;
    };
  }, [promptId]);

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex shrink-0 items-center justify-center gap-3">
          <img src={headerStar} className="h-8 w-8 shrink-0" />
          {/* Desktop */}
          <h1 className="hidden font-poppins text-[24px] font-medium text-[#FBF3E5] sm:block sm:text-[30px]">
            Top Posts for Today's Prompt
          </h1>
          {/* Mobile */}
          <h1 className="block text-center font-poppins text-[20px] font-medium text-[#FBF3E5] sm:hidden sm:text-[30px]">
            Top Posts for Today
          </h1>
          <img src={headerStar} className="block h-8 w-8 shrink-0 sm:hidden" />
        </div>
        <div className="h-[2px] w-full rounded-full bg-[#FBF3E5]" />
      </div>
      {/* Star grid */}
      <div className="grid grid-cols-3 justify-items-center gap-24 sm:gap-3 md:grid-cols-4 md:gap-4 md:gap-y-[50px] lg:grid-cols-6 lg:gap-x-[152px] lg:gap-y-[100px]">
        {/* Loading state with skeleton posts that appear while the posts are fetched from the API */}
        {isLoading ? (
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div key={index} className="relative">
              <SkeletonStarPost />
            </div>
          ))
        ) : // No posts message that appears if there are no posts for the current prompt
        posts.length === 0 ? (
          <div className="col-span-full py-12 text-center font-poppins text-[18px] text-[#FBF3E5]">
            No posts yet for today’s prompt.
          </div>
        ) : (
          // Actual posts after loading
          posts.map((post) => (
            <div
              key={post.id}
              className="relative"
              onMouseEnter={() => setHoveredStar(post.id)}
              onMouseLeave={() => setHoveredStar(null)}
            >
              <StarPost post={post} />

              {/* Post preview that only appears when the user hovers over a star */}
              {hoveredStar === post.id && (
                <PostPreview
                  postId={post.id}
                  username={post.anonymous_name}
                  content={post.content}
                />
              )}
            </div>
          ))
        )}
      </div>
      {/* Load more button that only appears if there are more posts to load */}
      {hasMore && (
        <LoadMoreButton loadMore={loadMore} isLoadingMore={isLoadingMore} />
      )}
    </div>
  );
}
