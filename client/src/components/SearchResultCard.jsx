import { useNavigate } from "react-router-dom";

function SearchResultCard({ post }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/prompts/${post.id}`)}
      style={{ cursor: "pointer" }}
    >
      <h3>{post.anonymous_name}</h3>

      <p>{post.content}</p>

      <small>
        {new Date(post.created_at).toLocaleDateString()}
      </small>
    </div>
  );
}

export default SearchResultCard;