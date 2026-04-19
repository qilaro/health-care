"use client";

import { useState, useEffect } from "react";
import { Zap, Plus, X, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { api, DrugSummary, InteractionResult, SearchResult } from "@/lib/api";

export default function InteractionCheckerPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<DrugSummary[]>([]);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    if (query.length < 2) { setSearchResults([]); setSearched(false); return; }
    const t = setTimeout(async () => {
      const data = await api.search(query);
      setSearchResults(data.results.filter(r => !selectedDrugs.find(d => d.id === r.id)));
      setSearched(true);
    }, 300);
    debounceRef[1](t);
  }, [query, selectedDrugs]);

  const addDrug = async (result: SearchResult) => {
    if (selectedDrugs.find(d => d.id === result.id)) return;
    const drug = await api.drugs.get(result.slug);
    setSelectedDrugs(prev => [...prev, drug]);
    setQuery("");
    setSearchResults([]);
    setResult(null);
  };

  const removeDrug = (id: number) => {
    setSelectedDrugs(prev => prev.filter(d => d.id !== id));
    setResult(null);
  };

  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return;
    setChecking(true);
    try {
      const data = await api.interactions.check(selectedDrugs.map(d => d.id));
      setResult(data);
    } finally {
      setChecking(false);
    }
  };

  const severityConfig = {
    contraindicated: { color: "bg-red-50 border-red-200 text-red-800", icon: <ShieldAlert className="h-5 w-5 text-red-600" />, label: "Contraindicated" },
    major: { color: "bg-red-50 border-red-200 text-red-800", icon: <AlertTriangle className="h-5 w-5 text-red-600" />, label: "Major" },
    moderate: { color: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />, label: "Moderate" },
    minor: { color: "bg-blue-50 border-blue-200 text-blue-800", icon: <CheckCircle className="h-5 w-5 text-blue-600" />, label: "Minor" },
  };

  return (
    <div className="container-medq py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0EE" }}>
              <Zap className="h-6 w-6" style={{ color: "#DB3924" }} />
            </div>
            <h1 className="text-3xl font-bold text-navy">Drug Interaction Checker</h1>
          </div>
          <p className="text-gray-600">Check for potentially dangerous interactions between medications.</p>
        </div>

        <div className="card mb-6">
          <h2 className="font-semibold text-navy mb-4">Add Medications to Check</h2>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search and add a drug..."
              className="input-field"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                {searchResults.map((r) => (
                  <button key={r.id} onClick={() => addDrug(r)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                    <div className="font-medium text-navy text-sm">{r.brandName}</div>
                    <div className="text-xs text-gray-500">{r.genericName} · {r.drugClass}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedDrugs.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {selectedDrugs.map((drug) => (
                <div key={drug.id} className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
                  <span className="font-medium text-sm">{drug.brandName}</span>
                  <button onClick={() => removeDrug(drug.id)} className="hover:text-red-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              {selectedDrugs.length < 2
                ? `Add ${2 - selectedDrugs.length} more drug${selectedDrugs.length === 1 ? "" : "s"} to check`
                : `${selectedDrugs.length} drugs selected`}
            </p>
            <button
              onClick={checkInteractions}
              disabled={selectedDrugs.length < 2 || checking}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? "Checking..." : "Check Interactions"}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${result.hasSerious ? "bg-red-50 border-red-300" : result.totalInteractions === 0 ? "bg-green-50 border-green-300" : "bg-yellow-50 border-yellow-300"}`}>
              {result.totalInteractions === 0 ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">No Known Interactions Found</p>
                    <p className="text-green-700 text-sm">No interactions were detected between the selected drugs. However, always consult your healthcare provider.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" style={{ color: result.hasSerious ? "#DC2626" : "#D97706" }} />
                  <div>
                    <p className="font-semibold" style={{ color: result.hasSerious ? "#991B1B" : "#92400E" }}>
                      {result.totalInteractions} Interaction{result.totalInteractions > 1 ? "s" : ""} Found
                      {result.hasSerious && " — Including Serious Interactions"}
                    </p>
                    <p className="text-sm" style={{ color: result.hasSerious ? "#B91C1C" : "#B45309" }}>
                      Review the interactions below and consult your doctor or pharmacist.
                    </p>
                  </div>
                </>
              )}
            </div>

            {result.pairs.map((pair, i) => {
              const cfg = severityConfig[pair.severity as keyof typeof severityConfig] || severityConfig.minor;
              return (
                <div key={i} className={`border rounded-xl p-5 ${cfg.color}`}>
                  <div className="flex items-start gap-3">
                    {cfg.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-bold">{pair.drug1}</span>
                        <span>+</span>
                        <span className="font-bold">{pair.drug2}</span>
                        <span className={`badge text-xs font-semibold ${pair.severity === "contraindicated" || pair.severity === "major" ? "bg-red-200 text-red-900" : pair.severity === "moderate" ? "bg-yellow-200 text-yellow-900" : "bg-blue-200 text-blue-900"}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{pair.description}</p>
                      <div className="bg-white/60 rounded-lg p-3 text-sm">
                        <strong>Recommendation:</strong> {pair.recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!result && (
          <div className="card bg-blue-50 border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">How to use the Interaction Checker</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
              <li>Search for the first drug in the search box above</li>
              <li>Add more drugs (at least 2 total)</li>
              <li>Click "Check Interactions" to see potential interactions</li>
              <li>Review results and consult your healthcare provider</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
