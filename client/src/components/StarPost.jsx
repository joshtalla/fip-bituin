import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

// Skeleton star post for loading state when the page is fetching posts
export function SkeletonStarPost() {
  return (
    <div className="relative animate-pulse pointer-events-none">
      <FaStar className="text-gray-200 cursor-pointer sm:h-24 sm:w-24 h-16 w-16" />
    </div>
  );
}

// Star post for the actual star posts that link to each post's page
export function StarPost({ post }) {
  return (
    <div className="relative">
      <Link to={`/prompts/${post.id}`}>
        <FaStar className="text-[#EFB758] cursor-pointer h-20 w-20 sm:h-24 sm:w-24" />
      </Link>
    </div>
  );
}
