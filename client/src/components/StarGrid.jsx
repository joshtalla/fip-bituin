import { FaStar } from "react-icons/fa";
import headerStar from "../assets/header-star.svg";
import { useState } from "react";
import { mockPosts } from "../mocks/mockData";
import PostPreview from "./PostPreview";

export default function StarGrid() {
  const [hoveredStar, setHoveredStar] = useState(null);

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
        {mockPosts.map((post) => (
          <div
            key={post.id}
            className="relative"
            onMouseEnter={() => setHoveredStar(post.id)}
            onMouseLeave={() => setHoveredStar(null)}
          >
            <FaStar className="text-[#EFB758] cursor-pointer" size={92} />

            {hoveredStar === post.id && (
              <PostPreview
                title={post.anonymous_name}
                description={post.content}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
