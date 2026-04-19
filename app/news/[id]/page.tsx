"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import { api, NewsArticle } from "@/lib/api";

export default function NewsArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.news.get(Number(id)).then(setArticle).catch(() => router.push("/news")).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-medq py-10 max-w-3xl mx-auto animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-full mb-4" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="container-medq py-10 max-w-3xl mx-auto">
      <Link href="/news" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to News
      </Link>

      <div className="mb-6">
        <span className="badge badge-red text-sm mb-3">{article.category}</span>
        <h1 className="text-3xl font-bold text-navy leading-tight mb-4">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><User className="h-4 w-4" /> {article.author}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
        <p className="text-gray-700 text-lg leading-relaxed italic">{article.summary}</p>
      </div>

      <div className="prose prose-gray max-w-none">
        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
          {article.body || article.summary}
        </div>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><Tag className="h-4 w-4" /> Tags:</span>
          {article.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{tag}</span>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100 bg-yellow-50 rounded-xl p-4">
        <p className="text-xs text-yellow-700">
          <strong>Medical Disclaimer:</strong> This article is for informational purposes only. Consult a healthcare professional for medical advice. Always verify drug information with your prescriber or pharmacist.
        </p>
      </div>
    </div>
  );
}
