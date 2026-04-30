import { memo } from "react";
import { Link } from "react-router-dom";
import starIcon from "../assets/Star.svg";

// Skeleton star post for loading state when the page is fetching posts
export function SkeletonStarPost() {
  return (
    <div className="pointer-events-none relative animate-pulse">
      <img
        src={starIcon}
        alt=""
        aria-hidden="true"
        className="h-20 w-20 opacity-40 grayscale sm:h-24 sm:w-24"
      />
    </div>
  );
}

// Star post for the actual star posts that link to each post's page
function StarPostComponent({ post }) {
  return (
    <div className="relative">
      <Link to={`/prompts/${post.id}`}>
        <img
          src={starIcon}
          alt="Open post"
          className="h-20 w-20 cursor-pointer sm:h-24 sm:w-24"
        />
      </Link>
    </div>
  );
}

export const StarPost = memo(StarPostComponent);
