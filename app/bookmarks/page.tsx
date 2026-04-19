"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookmarkIcon, Pill, ArrowRight, Trash2 } from "lucide-react";
import { api, DrugSummary } from "@/lib/api";
import StarRating from "@/components/StarRating";

export default function BookmarksPage() {
  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await api.bookmarks.getDrugs();
      setDrugs(data.drugs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookmarks(); }, []);

  const removeBookmark = async (id: number) => {
    await api.bookmarks.toggle(id);
    setDrugs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="container-medq py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0EE" }}>
            <BookmarkIcon className="h-6 w-6" style={{ color: "#DB3924" }} />
          </div>
          <h1 className="text-3xl font-bold text-navy">My Bookmarks</h1>
        </div>
        <p className="text-gray-600">Your saved medications for quick reference.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : drugs.length === 0 ? (
        <div className="text-center py-20">
          <BookmarkIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">No bookmarks yet</h2>
          <p className="text-gray-400 mb-6">Start saving medications you want to remember for quick access.</p>
          <Link href="/drugs" className="btn-primary">Browse Drug Directory</Link>
        </div>
      ) : (
        <>
          <p className="text-gray-500 mb-6">{drugs.length} saved medication{drugs.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drugs.map((drug) => (
              <div key={drug.id} className="card group relative">
                <button
                  onClick={() => removeBookmark(drug.id)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove bookmark"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link href={`/drugs/${drug.slug}`} className="block pr-8">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFF0EE" }}>
                      <Pill className="h-5 w-5" style={{ color: "#DB3924" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-navy group-hover:text-primary truncate">{drug.brandName}</div>
                      <div className="text-xs text-gray-500 truncate">{drug.genericName}</div>
                      <div className="text-xs text-gray-400 truncate">{drug.drugClass}</div>
                      {drug.averageRating && (
                        <div className="flex items-center gap-1 mt-1">
                          <StarRating rating={drug.averageRating} size="sm" />
                          <span className="text-xs text-gray-500">({drug.reviewCount})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: "#DB3924" }}>
                    View details <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
