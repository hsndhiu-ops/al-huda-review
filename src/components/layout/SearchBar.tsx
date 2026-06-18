"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
}

function highlight(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-indigo-100 text-indigo-800 rounded px-0.5 font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function getSnippet(content: string, query: string, maxLen = 120): string {
  const idx = content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, maxLen) + (content.length > maxLen ? "…" : "");
  const start = Math.max(0, idx - 30);
  const end = Math.min(content.length, idx + query.length + 60);
  return (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");
}

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setActiveIdx(-1);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, summary, content")
      .eq("published", true)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(6);

    setResults((data as SearchResult[]) ?? []);
    setLoading(false);
    setActiveIdx(-1);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 280);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && results[activeIdx]) {
        navigate(results[activeIdx].slug);
      }
    }
  }

  function navigate(slug: string) {
    setOpen(false);
    router.push(`/articles/${slug}`);
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Search icon button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Search articles"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      )}

      {/* Expanded search input */}
      {open && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Search articles…"
              className="w-56 sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Results dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-[420px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
          {results.length === 0 && !loading ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">
              No articles found for <strong className="text-gray-600">"{query}"</strong>
            </div>
          ) : (
            <ul>
              {results.map((article, i) => {
                const snippet = article.summary
                  ? getSnippet(article.summary, query)
                  : getSnippet(article.content, query);
                return (
                  <li key={article.id}>
                    <button
                      onClick={() => navigate(article.slug)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`w-full text-left px-5 py-4 transition-colors border-b border-gray-100 last:border-0 ${
                        activeIdx === i ? "bg-indigo-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {highlight(article.title, query)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {highlight(snippet, query)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {results.length > 0 ? `${results.length} result${results.length !== 1 ? "s" : ""}` : ""}
            </span>
            <span className="text-xs text-gray-400">↑↓ navigate · Enter to open · Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
