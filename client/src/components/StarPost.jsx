import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

export default function StarPost({ post }) {
  return (
    <div className="relative">
      <Link
        to={`/prompts/${post.id}`}
        className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EFB758] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] rounded-sm"
        aria-label={`Open post ${post.id}`}
      >
        {/* <FaStar className="text-[#EFB758] cursor-pointer" size={92} /> */}
        <img src="../src/assets/Star.svg" alt="star" className="w-24 h-24" />
      </Link>
    </div>
  );
}
