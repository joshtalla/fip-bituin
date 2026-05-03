import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

// Skeleton star post for loading state when the page is fetching posts
export function SkeletonStarPost() {
  return (
    <div className="pointer-events-none relative animate-pulse">
      <FaStar className="h-20 w-20 cursor-pointer text-gray-200 sm:h-24 sm:w-24" />
    </div>
  );
}

// Star post for the actual star posts that link to each post's page
export function StarPost({ post }) {
  return (
    <div className="relative">
      <Link to={`/prompts/${post.id}`}>
        <FaStar className="h-20 w-20 cursor-pointer text-[#EFB758] sm:h-24 sm:w-24" />
      </Link>
    </div>
  );
}
