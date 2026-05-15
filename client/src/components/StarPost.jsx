import { memo } from "react";
import { Link } from "react-router-dom";
import starIcon from "../assets/Star.svg";

export function PromptStarIcon({
  alt = "",
  className = "h-20 w-20 sm:h-24 sm:w-24",
  ariaHidden = false,
}) {
  return (
    <img
      src={starIcon}
      alt={alt}
      aria-hidden={ariaHidden}
      className={className}
    />
  );
}

// Skeleton star post for loading state when the page is fetching posts
export function SkeletonStarPost() {
  return (
    <div className="pointer-events-none relative animate-pulse">
      <PromptStarIcon
        alt=""
        ariaHidden
        className="h-20 w-20 opacity-40 grayscale sm:h-24 sm:w-24"
      />
    </div>
  );
}

// Star post for the actual star posts that link to each post's page
function StarPostComponent({ post }) {
  return (
    <div>
      <Link to={`/prompt/${post.id}`}>
        <PromptStarIcon
          alt="Open post"
          className="h-20 w-20 cursor-pointer sm:h-24 sm:w-24"
        />
      </Link>
    </div>
  );
}

export const StarPost = memo(StarPostComponent);
