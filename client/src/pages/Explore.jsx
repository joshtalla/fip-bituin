import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ExploreFeed from "../components/ExploreFeed";
import SearchBar from "../components/SearchBar";
import SearchResultCard from "../components/SearchResultCard";
import { fetchJson } from "../services/api";

const RESULT_LIMIT = 10;

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryFromUrl);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuery(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    let cancelled = false;

    const loadResults = async () => {
      if (!queryFromUrl.trim()) {
        setResults([]);
        setError("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          q: queryFromUrl,
          page: "1",
          limit: String(RESULT_LIMIT),
        });

        const data = await fetchJson(`/api/search/posts?${params}`);

        if (!cancelled) {
          setResults(data.results || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Failed to search posts.");
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [queryFromUrl]);

  const handleSearch = (submittedQuery) => {
    setSearchParams({ q: submittedQuery });
  };

  const isSearching = Boolean(queryFromUrl.trim());

  return (
    <div className="min-h-screen w-full overflow-hidden px-[24px] pt-[4px] md:px-[60px] md:pt-[24px] lg:pt-[32px]">
      {isSearching ? (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="font-poppins text-[30px] font-semibold text-[#FFFCEF] sm:text-[40px]">
              Explore Results
            </h1>
            <SearchBar
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onSearch={handleSearch}
              placeholder="enter a word or phrase!"
              formClassName="flex min-h-[52px] w-full items-center rounded-full border border-[#D9D9D9] bg-[#FBF3E5] px-5"
              inputClassName="flex-1 bg-transparent font-poppins text-[16px] font-semibold text-[#765C5F] outline-none"
              buttonClassName="text-[24px] text-[#765C5F]"
            />
            <p className="font-poppins text-[16px] text-[#FBF3E5]">
              Showing results for "{queryFromUrl}".
            </p>
          </div>

          {loading && (
            <p className="font-poppins text-[18px] text-[#FBF3E5]">
              Loading results...
            </p>
          )}

          {!loading && error && (
            <p className="font-poppins text-[18px] text-[#F8B4B4]" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && results.length === 0 && (
            <p className="font-poppins text-[18px] text-[#FBF3E5]">
              No posts matched "{queryFromUrl}".
            </p>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="flex flex-col gap-4">
              {results.map((post) => (
                <SearchResultCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <ExploreFeed />
      )}
    </div>
  );
};

export default Explore;
