"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Grid, List, Filter, Pill } from "lucide-react";
import { api, DrugSummary, DrugAZGroup, DrugClass } from "@/lib/api";
import StarRating from "@/components/StarRating";

function DrugsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQ = searchParams.get("search") || "";
  const drugClassFilter = searchParams.get("drug_class") || "";

  const [view, setView] = useState<"az" | "grid" | "classes">("az");
  const [azGroups, setAzGroups] = useState<DrugAZGroup[]>([]);
  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [classes, setClasses] = useState<DrugClass[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [selectedClass, setSelectedClass] = useState(drugClassFilter);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (searchQ || drugClassFilter) {
      setView("grid");
      api.drugs.list({ limit: 50, drug_class: drugClassFilter || undefined })
        .then((d) => {
          let filtered = d.drugs;
          if (searchQ) {
            filtered = filtered.filter(
              (dr) =>
                dr.brandName.toLowerCase().includes(searchQ.toLowerCase()) ||
                dr.genericName.toLowerCase().includes(searchQ.toLowerCase())
            );
          }
          setDrugs(filtered);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        api.drugs.az(),
        api.drugs.classes(),
      ]).then(([az, cls]) => {
        setAzGroups(az.groups);
        setClasses(cls);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [searchQ, drugClassFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (selectedClass) params.set("drug_class", selectedClass);
    router.push(`/drugs?${params}`);
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const groupMap: Record<string, DrugAZGroup> = {};
  azGroups.forEach((g) => { groupMap[g.letter] = g; });

  return (
    <div className="container-medq py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Drug Directory</h1>
        <p className="text-gray-600">Browse our complete database of prescription and over-the-counter medications.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drugs..."
            className="input-field pl-9"
          />
        </div>
        <div className="relative min-w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input-field pl-9 appearance-none"
          >
            <option value="">All Drug Classes</option>
            {classes.map((c) => (
              <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">Search</button>
        {(searchQ || drugClassFilter) && (
          <Link href="/drugs" className="btn-secondary">Clear</Link>
        )}
      </form>

      {!searchQ && !drugClassFilter && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setView("az")} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === "az" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <List className="h-4 w-4 inline mr-1" /> A-Z Browse
            </button>
            <button onClick={() => setView("classes")} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === "classes" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <Grid className="h-4 w-4 inline mr-1" /> By Class
            </button>
          </div>

          {view === "az" && !loading && (
            <>
              <div className="flex flex-wrap gap-1 mb-6 bg-gray-50 p-3 rounded-xl">
                {alphabet.map((l) => (
                  <a key={l} href={`#letter-${l}`} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${groupMap[l] ? "text-primary hover:bg-red-50" : "text-gray-300 cursor-not-allowed"}`}>
                    {l}
                  </a>
                ))}
              </div>
              <div className="space-y-8">
                {azGroups.map((group) => (
                  <div key={group.letter} id={`letter-${group.letter}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "#DB3924" }}>
                        {group.letter}
                      </div>
                      <h2 className="text-xl font-bold text-navy">{group.letter}</h2>
                      <span className="text-gray-400 text-sm">({group.drugs.length} drugs)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {group.drugs.map((drug) => (
                        <DrugCard key={drug.id} drug={drug} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === "classes" && !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <Link key={cls.name} href={`/drugs?drug_class=${encodeURIComponent(cls.name)}`} className="card flex items-center justify-between group hover:border-primary">
                  <div>
                    <div className="font-semibold text-navy group-hover:text-primary">{cls.name}</div>
                    <div className="text-sm text-gray-500">{cls.count} drugs</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFF0EE", color: "#DB3924" }}>
                    <Pill className="h-5 w-5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {(searchQ || drugClassFilter) && !loading && (
        <div>
          <p className="text-gray-600 mb-4">{drugs.length} results found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {drugs.map((drug) => <DrugCard key={drug.id} drug={drug} />)}
          </div>
          {drugs.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Pill className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No drugs found. Try a different search term.</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-100 rounded mb-1 w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DrugCard({ drug }: { drug: DrugSummary }) {
  return (
    <Link href={`/drugs/${drug.slug}`} className="card group hover:border-primary hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFF0EE" }}>
          <Pill className="h-5 w-5" style={{ color: "#DB3924" }} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-navy group-hover:text-primary truncate">{drug.brandName}</div>
          <div className="text-xs text-gray-500 truncate">{drug.genericName}</div>
          <div className="text-xs text-gray-400 truncate mt-0.5">{drug.drugClass}</div>
          {drug.averageRating && (
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={drug.averageRating} size="sm" />
              <span className="text-xs text-gray-500">({drug.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function DrugsPage() {
  return (
    <Suspense fallback={<div className="container-medq py-10 text-gray-500">Loading...</div>}>
      <DrugsContent />
    </Suspense>
  );
}
