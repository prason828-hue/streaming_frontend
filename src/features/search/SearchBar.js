import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchAll } from "./searchApi";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults(null); setOpen(false); return; }
    setLoading(true);
    searchAll(debouncedQuery.trim())
      .then((data) => { setResults(data); setOpen(true); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleResultClick(result) {
    setOpen(false);
    setQuery("");
    if (result.type === "VIDEO") navigate(`/videos/${result.id}`);
    else if (result.type === "CREATOR") navigate(`/u/${result.username}`);
    else if (result.type === "CATEGORY") navigate(`/search?q=${encodeURIComponent(result.category)}&type=videos`);
  }

  const hasResults = results && (
    results.videos?.length || results.creators?.length || results.categories?.length
  );

  return (
    <div className="search-bar" ref={wrapperRef}>
      <form className="search-bar__form" onSubmit={handleSubmit}>
        <input
          className="search-bar__input"
          type="text"
          placeholder="Search videos, creators, categories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          autoComplete="off"
        />
        <button className="search-bar__btn" type="submit">
          {loading ? "…" : "🔍"}
        </button>
      </form>

      {open && hasResults && (
        <div className="search-dropdown">
          {results.videos?.length > 0 && (
            <div className="search-dropdown__group">
              <p className="search-dropdown__label">Videos</p>
              {results.videos.slice(0, 4).map((r) => (
                <div key={r.id} className="search-dropdown__item" onClick={() => handleResultClick(r)}>
                  <span className="search-dropdown__icon">🎬</span>
                  <span className="search-dropdown__text">{r.title}</span>
                  <span className="search-dropdown__sub">{r.views?.toLocaleString()} views</span>
                </div>
              ))}
            </div>
          )}

          {results.creators?.length > 0 && (
            <div className="search-dropdown__group">
              <p className="search-dropdown__label">Creators</p>
              {results.creators.slice(0, 3).map((r) => (
                <div key={r.id} className="search-dropdown__item" onClick={() => handleResultClick(r)}>
                  <span className="search-dropdown__icon">👤</span>
                  <span className="search-dropdown__text">@{r.username}</span>
                  <span className="search-dropdown__sub">{r.subscribers} subscribers</span>
                </div>
              ))}
            </div>
          )}

          {results.categories?.length > 0 && (
            <div className="search-dropdown__group">
              <p className="search-dropdown__label">Categories</p>
              {results.categories.slice(0, 3).map((r) => (
                <div key={r.id} className="search-dropdown__item" onClick={() => handleResultClick(r)}>
                  <span className="search-dropdown__icon">🏷️</span>
                  <span className="search-dropdown__text">{r.category}</span>
                  <span className="search-dropdown__sub">{r.videoCount} videos</span>
                </div>
              ))}
            </div>
          )}

          <div
            className="search-dropdown__see-all"
            onClick={() => { setOpen(false); navigate(`/search?q=${encodeURIComponent(query)}`); }}
          >
            See all results for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
