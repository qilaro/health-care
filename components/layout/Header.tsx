"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, Pill, BookmarkIcon, Bot, Zap, FileText, LayoutDashboard } from "lucide-react";
import { api, SearchResult } from "@/lib/api";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setDropdownOpen(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.search(q);
        setResults(data.results || []);
        setDropdownOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelect = (slug: string) => {
    setQuery("");
    setDropdownOpen(false);
    router.push(`/drugs/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/drugs?search=${encodeURIComponent(query.trim())}`);
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/drugs", label: "Drugs A-Z", icon: <Pill className="h-4 w-4" /> },
    { href: "/interaction-checker", label: "Interactions", icon: <Zap className="h-4 w-4" /> },
    { href: "/compare", label: "Compare", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/chatbot", label: "AI Assistant", icon: <Bot className="h-4 w-4" /> },
    { href: "/news", label: "News", icon: <FileText className="h-4 w-4" /> },
    { href: "/bookmarks", label: "Bookmarks", icon: <BookmarkIcon className="h-4 w-4" /> },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container-medq">
        <div className="flex items-center h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#DB3924" }}>
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-xl font-bold" style={{ color: "#DB3924" }}>MedQ</span>
              <div className="text-xs text-gray-500 hidden sm:block">Learn more. Live better.</div>
            </div>
          </Link>

          <div className="flex-1 relative" ref={searchRef}>
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search drugs, conditions, ingredients..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": "#DB3924" } as React.CSSProperties}
                />
              </div>
            </form>
            {dropdownOpen && results.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.slug)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFF0EE" }}>
                      <Pill className="h-4 w-4" style={{ color: "#DB3924" }} />
                    </div>
                    <div>
                      <div className="font-medium text-navy text-sm">{r.brandName}</div>
                      <div className="text-xs text-gray-500">{r.genericName} · {r.drugClass}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href="/admin" className="hidden lg:block text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded">
            Admin
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-primary hover:bg-red-50 rounded-lg"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-lg text-sm">
              Admin Panel
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
