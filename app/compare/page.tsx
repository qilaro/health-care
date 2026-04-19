"use client";

import { useState, useEffect } from "react";
import { GitCompare, Plus, X, CheckCircle, XCircle } from "lucide-react";
import { api, DrugDetail, SearchResult } from "@/lib/api";
import StarRating from "@/components/StarRating";

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [drugs, setDrugs] = useState<DrugDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    if (query.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const data = await api.search(query);
      setSearchResults(data.results.filter(r => !selectedSlugs.includes(r.slug)));
    }, 300);
    debounceRef[1](t);
  }, [query, selectedSlugs]);

  const addDrug = (result: SearchResult) => {
    if (selectedSlugs.length >= 4) return;
    setSelectedSlugs(prev => [...prev, result.slug]);
    setQuery("");
    setSearchResults([]);
  };

  const removeDrug = (slug: string) => {
    setSelectedSlugs(prev => prev.filter(s => s !== slug));
  };

  const compare = async () => {
    if (selectedSlugs.length < 2) return;
    setLoading(true);
    try {
      const data = await api.compare(selectedSlugs);
      setDrugs(data.drugs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSlugs.length >= 2) compare();
    else setDrugs([]);
  }, [selectedSlugs]);

  const fields: { label: string; key: keyof DrugDetail }[] = [
    { label: "Generic Name", key: "genericName" },
    { label: "Drug Class", key: "drugClass" },
    { label: "Company", key: "company" },
    { label: "Price", key: "price" },
    { label: "Description", key: "description" },
    { label: "Indications", key: "indications" },
    { label: "Dosage", key: "dosage" },
    { label: "Side Effects", key: "sideEffects" },
    { label: "Warnings", key: "warnings" },
  ];

  return (
    <div className="container-medq py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0EE" }}>
            <GitCompare className="h-6 w-6" style={{ color: "#DB3924" }} />
          </div>
          <h1 className="text-3xl font-bold text-navy">Drug Comparison</h1>
        </div>
        <p className="text-gray-600">Compare up to 4 medications side-by-side to make informed decisions.</p>
      </div>

      <div className="card mb-8">
        <div className="flex flex-wrap gap-3 mb-4">
          {selectedSlugs.map((slug) => (
            <div key={slug} className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
              <span className="font-medium text-sm">{slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
              <button onClick={() => removeDrug(slug)} className="hover:text-red-900"><X className="h-4 w-4" /></button>
            </div>
          ))}
          {selectedSlugs.length < 4 && (
            <div className="relative flex-1 min-w-64">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search and add a drug to compare..."
                className="input-field"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                  {searchResults.slice(0, 6).map((r) => (
                    <button key={r.id} onClick={() => addDrug(r)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center gap-2">
                      <Plus className="h-4 w-4" style={{ color: "#DB3924" }} />
                      <div>
                        <div className="font-medium text-navy text-sm">{r.brandName}</div>
                        <div className="text-xs text-gray-500">{r.genericName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {selectedSlugs.length === 0 && (
          <p className="text-gray-500 text-sm">Search for at least 2 drugs to compare them.</p>
        )}
        {selectedSlugs.length === 1 && (
          <p className="text-gray-500 text-sm">Add one more drug to start comparison.</p>
        )}
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-500">Loading comparison data...</div>
      )}

      {drugs.length >= 2 && !loading && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-50 border border-gray-100 w-40 font-semibold text-navy">Feature</th>
                {drugs.map((drug) => (
                  <th key={drug.id} className="p-4 bg-gray-50 border border-gray-100 text-center">
                    <div className="font-bold text-navy">{drug.brandName}</div>
                    {drug.averageRating && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <StarRating rating={drug.averageRating} size="sm" />
                        <span className="text-xs text-gray-500">{drug.averageRating}</span>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.key} className="hover:bg-gray-50">
                  <td className="p-4 border border-gray-100 font-medium text-gray-700 bg-gray-50 text-sm">{field.label}</td>
                  {drugs.map((drug) => {
                    const value = drug[field.key];
                    return (
                      <td key={drug.id} className="p-4 border border-gray-100 text-sm text-gray-700 align-top max-w-xs">
                        {value ? (
                          <div className="max-h-32 overflow-y-auto text-sm leading-relaxed">{String(value)}</div>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="p-4 border border-gray-100 font-medium text-gray-700 bg-gray-50 text-sm">Average Rating</td>
                {drugs.map((drug) => (
                  <td key={drug.id} className="p-4 border border-gray-100 text-center">
                    {drug.averageRating ? (
                      <div>
                        <StarRating rating={drug.averageRating} />
                        <span className="text-sm">{drug.averageRating} / 5</span>
                      </div>
                    ) : <span className="text-gray-400 italic text-sm">No reviews</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
