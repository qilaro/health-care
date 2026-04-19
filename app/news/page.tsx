"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Tag, Clock } from "lucide-react";
import { api, NewsArticle } from "@/lib/api";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.news.list({ page, category: selectedCategory || undefined }).then((data) => {
      setArticles(data.articles);
      setTotal(data.total);
      const cats = [...new Set(data.articles.map((a) => a.category))];
      if (cats.length > 0) setCategories((prev) => [...new Set([...prev, ...cats])]);
    }).finally(() => setLoading(false));
  }, [page, selectedCategory]);

  const categoryColors: Record<string, string> = {
    "Research": "badge-blue",
    "FDA": "badge-red",
    "Clinical Trials": "badge-green",
    "Safety": "badge-yellow",
    "Innovation": "badge-blue",
  };

  return (
    <div className="container-medq py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0EE" }}>
            <FileText className="h-6 w-6" style={{ color: "#DB3924" }} />
          </div>
          <h1 className="text-3xl font-bold text-navy">Health & Pharma News</h1>
        </div>
        <p className="text-gray-600">Stay updated with the latest pharmaceutical and health news.</p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => { setSelectedCategory(""); setPage(1); }} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} style={!selectedCategory ? { backgroundColor: "#DB3924" } : {}}>
            All
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setPage(1); }} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} style={selectedCategory === cat ? { backgroundColor: "#DB3924" } : {}}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-5 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/news/${article.id}`} className="card hover:border-primary group">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge text-xs ${categoryColors[article.category] || "badge-blue"}`}>
                    {article.category}
                  </span>
                </div>
                <h2 className="font-bold text-navy group-hover:text-primary mb-2 leading-snug">{article.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{article.summary}</p>
                <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span>By {article.author}</span>
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {articles.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No articles found.</p>
            </div>
          )}

          {total > 10 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">Previous</button>
              <span className="text-gray-600">Page {page} of {Math.ceil(total / 10)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)} className="btn-secondary disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
