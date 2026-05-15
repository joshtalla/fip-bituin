import { useNavigate } from "react-router-dom";

function SearchResultCard({ post }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/prompts/${post.id}`)}
      className="cursor-pointer rounded-[20px] bg-[#FBF3E5] px-6 py-5 text-[#4C383A] shadow-[0_14px_36px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      <h3 className="font-poppins text-[22px] font-semibold">
        {post.anonymous_name || "anonymous"}
      </h3>

      <p className="mt-3 whitespace-pre-wrap font-poppins text-[16px] leading-[1.7]">
        {post.content}
      </p>

      <small className="mt-4 block font-poppins text-[13px] text-[#765C5F]">
        {new Date(post.created_at).toLocaleDateString()}
      </small>
    </div>
  );
}

export default SearchResultCard;