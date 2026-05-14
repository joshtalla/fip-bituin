import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import SearchResultCard from "../components/SearchResultCard";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryFromUrl = searchParams.get("q") || "";
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [query, setQuery] = useState(queryFromUrl);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const LIMIT = 10;

  useEffect(() => {
    if (!queryFromUrl.trim()) return;

    async function fetchResults() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/search/posts?q=${encodeURIComponent(
            queryFromUrl
          )}&page=${pageFromUrl}&limit=${LIMIT}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();

        setResults(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [queryFromUrl, pageFromUrl]);

  function handleSubmit(e) {
    e.preventDefault();

    const trimmed = query.trim();

    // block empty searches
    if (!trimmed) return;

    setSearchParams({
      q: trimmed,
      page: 1,
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SearchBar
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onSubmit={handleSubmit}
      />

      {/* Empty state */}
      {!queryFromUrl && (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold">
            Search posts
          </h2>

          <p className="text-gray-500 mt-2">
            Search for stories, replies, and discussions.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-12 text-center">
          <p>Loading...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-12 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading &&
        !error &&
        queryFromUrl &&
        results.length > 0 && (
          <div className="mt-8 space-y-4">
            {results.map((post) => (
              <div
                key={post.id}
                className="cursor-pointer"
                onClick={() => navigate(`/prompts/${post.id}`)}
              >
                <SearchResultCard post={post} />
              </div>
            ))}
          </div>
        )}

      {/* No results */}
      {!loading &&
        !error &&
        queryFromUrl &&
        results.length === 0 && (
          <div className="text-center mt-16">
            <h2 className="text-2xl font-semibold">
              No results found
            </h2>

            <p className="text-gray-500 mt-2">
              No posts matched "{queryFromUrl}".
            </p>
          </div>
        )}
    </div>
  );
}