import headerStar from "../assets/header-star.svg";
import { useEffect, useState } from "react";
import { mockPosts } from "../mocks/mockData";
import PostPreview from "./PostPreview";
import StarPost from "./StarPost";

const PAGE_SIZE = 18;

function LoadMoreButton({ loadMore, isLoadingMore }) {
  return (
    <div className="flex justify-center mt-12">
      <button
        type="button"
        onClick={loadMore}
        disabled={isLoadingMore}
        className="h-[50px] w-[220px] rounded-md bg-[#EFB758] px-4 py-2 font-darumadropone text-[16px] font-semibold text-[#4C383A] transition-all duration-300 hover:bg-[#FBF3E5] hover:text-[#4C383A] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
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
  // return await resp.json();

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  return mockPosts.slice(start, end);
}

export default function StarGrid({ promptId }) {
  const [hoveredStar, setHoveredStar] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      if (!promptId) {
        setPosts([]);
        setPage(1);
        setHasMore(false);
        return;
      }

      setHasMore(false);

      const firstPage = await fetchPosts(promptId, 1);
      if (cancelled) return;
      setPosts(firstPage);
      setPage(1);
      if (firstPage.length === 0) {
        setHasMore(false);
        return;
      }

      const nextPage = await fetchPosts(promptId, 2);
      if (cancelled) return;
      setHasMore(nextPage.length > 0);
    }

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [promptId]);

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

      const nextPage = await fetchPosts(promptId, newPage + 1);
      setHasMore(nextPage.length > 0);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-[0.75rem] mb-6">
        <img src={headerStar} alt="" className="w-8 h-8" />
        <h1 className="text-[#FBF3E5] text-[30px] font-medium font-poppins">
          Top Posts for Today's Prompt
        </h1>
        <div className="flex-1 h-[2px] bg-[#FBF3E5] rounded-full" />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-[152px] gap-y-[100px]">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative"
            onMouseEnter={() => setHoveredStar(post.id)}
            onMouseLeave={() => setHoveredStar(null)}
          >
            <StarPost post={post} />

            {hoveredStar === post.id && (
              <PostPreview
                title={post.anonymous_name}
                description={post.content}
              />
            )}
          </div>
        ))}
      </div>
      {hasMore && (
        <LoadMoreButton loadMore={loadMore} isLoadingMore={isLoadingMore} />
      )}
    </div>
  );
}
