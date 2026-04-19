"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Zap, GitCompare, Bot, FileText, BookmarkIcon, ArrowRight, Star, Pill } from "lucide-react";
import { api, DrugStats, NewsArticle } from "@/lib/api";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<DrugStats | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.drugs.stats().then(setStats).catch(() => {});
    api.news.list().then((d) => setNews(d.articles)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/drugs?search=${encodeURIComponent(query.trim())}`);
  };

  const features = [
    { icon: <Pill className="h-6 w-6" />, title: "Drug Directory", desc: "Browse 20,000+ prescription & OTC drugs with complete medical information.", href: "/drugs" },
    { icon: <Zap className="h-6 w-6" />, title: "Interaction Checker", desc: "Check for dangerous drug-drug and drug-food interactions instantly.", href: "/interaction-checker" },
    { icon: <GitCompare className="h-6 w-6" />, title: "Drug Comparison", desc: "Compare up to 4 medications side-by-side for informed decisions.", href: "/compare" },
    { icon: <Bot className="h-6 w-6" />, title: "AI Health Assistant", desc: "Get instant answers from our Gemini-powered medical chatbot.", href: "/chatbot" },
    { icon: <FileText className="h-6 w-6" />, title: "Health News", desc: "Stay updated with the latest pharmaceutical and health news.", href: "/news" },
    { icon: <BookmarkIcon className="h-6 w-6" />, title: "My Bookmarks", desc: "Save and organize your medications for quick reference.", href: "/bookmarks" },
  ];

  const drugCategories = [
    "Antibiotics", "Blood Pressure", "Cholesterol", "Diabetes",
    "Pain Relief", "Antidepressants", "Anticoagulants", "Respiratory",
  ];

  return (
    <div>
      <section className="py-20 px-4 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A2B4A 0%, #2C3E6B 50%, #DB3924 100%)" }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
            <Star className="h-4 w-4 text-yellow-400" />
            Trusted by millions of patients & caregivers
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Learn more.{" "}
            <span style={{ color: "#F4A460" }}>Live better.</span>
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Your comprehensive source for drug information, interaction checking, and personalized medication guidance.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search any drug name, ingredient, or condition..."
                  className="w-full pl-12 pr-4 py-3 text-gray-800 rounded-xl focus:outline-none text-lg"
                />
              </div>
              <button type="submit" className="px-8 py-3 rounded-xl font-semibold text-white text-lg" style={{ backgroundColor: "#DB3924" }}>
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {drugCategories.map((cat) => (
              <Link
                key={cat}
                href={`/drugs?drug_class=${encodeURIComponent(cat)}`}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-sm transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {stats && (
        <section className="py-10 border-b border-gray-100 bg-gray-50">
          <div className="container-medq">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Drugs Listed", value: stats.totalDrugs.toLocaleString() },
                { label: "Drug Classes", value: stats.totalClasses.toLocaleString() },
                { label: "Companies", value: stats.totalCompanies.toLocaleString() },
                { label: "Patient Reviews", value: stats.totalReviews.toLocaleString() },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold" style={{ color: "#DB3924" }}>{s.value}</div>
                  <div className="text-gray-600 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container-medq">
          <h2 className="section-title text-center">Everything You Need to Know About Your Medications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Link key={f.href} href={f.href} className="card group hover:border-primary transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: "#FFF0EE", color: "#DB3924" }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium" style={{ color: "#DB3924" }}>
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {news.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-medq">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title mb-0">Latest Health News</h2>
              <Link href="/news" className="text-sm font-medium flex items-center gap-1" style={{ color: "#DB3924" }}>
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((article) => (
                <Link key={article.id} href={`/news/${article.id}`} className="card hover:border-primary">
                  <span className="badge badge-red text-xs mb-3">{article.category}</span>
                  <h3 className="font-semibold text-navy mb-2 leading-snug">{article.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{article.summary}</p>
                  <div className="text-xs text-gray-400 mt-3">{article.author} · {new Date(article.publishedAt).toLocaleDateString()}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16" style={{ background: "linear-gradient(135deg, #DB3924 0%, #B52D1A 100%)" }}>
        <div className="container-medq text-center text-white">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Have a question about your medication?</h2>
          <p className="text-red-100 mb-8 max-w-xl mx-auto">
            Our AI assistant, powered by Google Gemini, can help answer your medication questions 24/7.
          </p>
          <Link href="/chatbot" className="inline-flex items-center gap-2 bg-white font-semibold px-8 py-4 rounded-xl transition-opacity hover:opacity-90 text-lg" style={{ color: "#DB3924" }}>
            Chat with MedQ AI <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
