"use client";

import { Search, X, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
];

export default function ProductsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Newest First";

  // Close the sort menu on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [sortOpen]);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("newest");
    startTransition(() => {
      router.push("/products");
    });
  };

  const hasActiveFilters = search || sortBy !== "newest";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-full focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-gray-400 text-gray-900"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div ref={sortRef} className="relative lg:w-64">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            onClick={() => setSortOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSortOpen(false);
              if (e.key === "ArrowDown" && !sortOpen) {
                e.preventDefault();
                setSortOpen(true);
              }
            }}
            className="w-full flex items-center gap-3 pl-4 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-full focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all cursor-pointer text-gray-900 text-left"
          >
            <ArrowUpDown className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="flex-1 truncate">{currentSortLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                sortOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {sortOpen && (
            <ul
              role="listbox"
              aria-label="Sort products"
              className="absolute right-0 left-0 top-full mt-2 z-30 p-1.5 bg-white rounded-2xl border border-stone-200 shadow-[0_16px_40px_rgba(23,18,13,0.18)]"
            >
              {SORT_OPTIONS.map((opt) => {
                const active = opt.value === sortBy;
                return (
                  <li key={opt.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        setSortOpen(false);
                        if (!active) handleSort(opt.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm text-left transition-colors ${
                        active
                          ? "bg-[#b87333]/10 text-[#9e5b24] font-semibold"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {active && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="lg:w-auto px-6 py-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-green-100">Active filters:</span>
          {search && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
              Search: {search}
              <button
                onClick={() => handleSearch("")}
                className="hover:text-green-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {sortBy !== "newest" && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
              Sort:{" "}
              {sortBy === "oldest"
                ? "Oldest First"
                : sortBy === "name-asc"
                ? "A-Z"
                : "Z-A"}
            </span>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-green-100">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Updating...</span>
        </div>
      )}
    </div>
  );
}
