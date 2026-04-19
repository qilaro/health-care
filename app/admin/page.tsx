"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Pill, Star, Bookmark, TrendingUp,
  Plus, Trash2, Edit, ChevronDown, ChevronUp, Search
} from "lucide-react";
import { api, AdminStats, DrugSummary, CreateDrugBody } from "@/lib/api";
import StarRating from "@/components/StarRating";

type Tab = "overview" | "drugs" | "reviews";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [drugTotal, setDrugTotal] = useState(0);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [drugPage, setDrugPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateDrugBody>({
    brandName: "", genericName: "", drugClass: "", company: "", price: "",
    description: "", indications: "", warnings: "", dosage: "", sideEffects: "",
    interactions: "", disclaimer: "",
  });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "drugs") {
      api.admin.drugs(drugPage).then((data) => {
        setDrugs(data.drugs);
        setDrugTotal(data.total);
      });
    }
    if (activeTab === "reviews") {
      api.admin.reviews(1).then((data) => {
        setReviews(data.reviews);
        setReviewTotal(data.total);
      });
    }
  }, [activeTab, drugPage]);

  const handleCreateDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.admin.createDrug(createForm);
      setShowCreateForm(false);
      setCreateForm({ brandName: "", genericName: "", drugClass: "", company: "", price: "", description: "", indications: "", warnings: "", dosage: "", sideEffects: "", interactions: "", disclaimer: "" });
      api.admin.drugs(drugPage).then((data) => { setDrugs(data.drugs); setDrugTotal(data.total); });
      api.admin.stats().then(setStats);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDrug = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    await api.admin.deleteDrug(id);
    setDrugs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    await api.admin.deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "drugs" as Tab, label: "Drugs", icon: <Pill className="h-4 w-4" /> },
    { key: "reviews" as Tab, label: "Reviews", icon: <Star className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container-medq py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0EE" }}>
              <LayoutDashboard className="h-6 w-6" style={{ color: "#DB3924" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">Admin Panel</h1>
              <p className="text-gray-500 text-sm">Manage MedQ platform content</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-medq py-6">
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium flex-1 justify-center transition-colors ${activeTab === tab.key ? "text-white" : "text-gray-600 hover:bg-gray-100"}`}
              style={activeTab === tab.key ? { backgroundColor: "#DB3924" } : {}}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Drugs", value: stats.totalDrugs, icon: <Pill className="h-5 w-5" />, color: "#DB3924" },
                { label: "Total Reviews", value: stats.totalReviews, icon: <Star className="h-5 w-5" />, color: "#2563EB" },
                { label: "Bookmarks", value: stats.totalBookmarks, icon: <Bookmark className="h-5 w-5" />, color: "#16A34A" },
                { label: "Reviews Today", value: stats.reviewsToday, icon: <TrendingUp className="h-5 w-5" />, color: "#D97706" },
              ].map((s) => (
                <div key={s.label} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-500 text-sm">{s.label}</span>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>{s.icon}</div>
                  </div>
                  <div className="text-3xl font-bold text-navy">{s.value.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="font-semibold text-navy mb-4">Recently Added Drugs</h2>
              <div className="space-y-3">
                {stats.recentDrugs.map((drug) => (
                  <Link key={drug.id} href={`/drugs/${drug.slug}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg -mx-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFF0EE" }}>
                      <Pill className="h-4 w-4" style={{ color: "#DB3924" }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-navy text-sm">{drug.brandName}</div>
                      <div className="text-xs text-gray-400">{drug.drugClass}</div>
                    </div>
                    {drug.reviewCount && drug.reviewCount > 0 && (
                      <div className="flex items-center gap-1">
                        <StarRating rating={drug.averageRating || 0} size="sm" />
                        <span className="text-xs text-gray-400">({drug.reviewCount})</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-navy mb-4">Top Searched Terms</h2>
              <div className="flex flex-wrap gap-2">
                {stats.topSearched.map((term) => (
                  <span key={term} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1">
                    <Search className="h-3 w-3" /> {term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "drugs" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 text-sm">{drugTotal} total drugs</p>
              <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary flex items-center gap-2 text-sm py-2">
                <Plus className="h-4 w-4" /> Add Drug
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateDrug} className="card mb-6 border-primary border-2">
                <h3 className="font-semibold text-navy mb-4">Add New Drug</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                    <input required value={createForm.brandName} onChange={(e) => setCreateForm(f => ({ ...f, brandName: e.target.value }))} className="input-field" placeholder="Lipitor" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name *</label>
                    <input required value={createForm.genericName} onChange={(e) => setCreateForm(f => ({ ...f, genericName: e.target.value }))} className="input-field" placeholder="Atorvastatin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drug Class *</label>
                    <input required value={createForm.drugClass} onChange={(e) => setCreateForm(f => ({ ...f, drugClass: e.target.value }))} className="input-field" placeholder="Statin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input value={createForm.company} onChange={(e) => setCreateForm(f => ({ ...f, company: e.target.value }))} className="input-field" placeholder="Pfizer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input value={createForm.price} onChange={(e) => setCreateForm(f => ({ ...f, price: e.target.value }))} className="input-field" placeholder="$15-45/month" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "description", label: "Description" },
                    { key: "indications", label: "Indications" },
                    { key: "warnings", label: "Warnings" },
                    { key: "dosage", label: "Dosage" },
                    { key: "sideEffects", label: "Side Effects" },
                    { key: "interactions", label: "Interactions" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <textarea rows={2} value={createForm[key as keyof CreateDrugBody] || ""} onChange={(e) => setCreateForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" placeholder={`${label} text...`} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={creating} className="btn-primary">{creating ? "Adding..." : "Add Drug"}</button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Drug</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Class</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">Rating</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drugs.map((drug) => (
                    <tr key={drug.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-navy">{drug.brandName}</div>
                        <div className="text-xs text-gray-400">{drug.genericName}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="badge badge-blue text-xs">{drug.drugClass}</span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {drug.averageRating ? (
                          <div className="flex items-center gap-1">
                            <StarRating rating={drug.averageRating} size="sm" />
                            <span className="text-xs text-gray-500">({drug.reviewCount})</span>
                          </div>
                        ) : <span className="text-gray-400 text-xs">No reviews</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/drugs/${drug.slug}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button onClick={() => handleDeleteDrug(drug.id, drug.brandName)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {drugTotal > 20 && (
              <div className="flex justify-center gap-4 mt-6">
                <button onClick={() => setDrugPage(p => Math.max(1, p - 1))} disabled={drugPage === 1} className="btn-secondary disabled:opacity-50">Previous</button>
                <span className="text-gray-600">Page {drugPage} of {Math.ceil(drugTotal / 20)}</span>
                <button onClick={() => setDrugPage(p => p + 1)} disabled={drugPage >= Math.ceil(drugTotal / 20)} className="btn-secondary disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <p className="text-gray-500 text-sm mb-4">{reviewTotal} total reviews</p>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Reviewer</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Drug</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Rating</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">Comment</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-navy text-sm">{review.reviewerName}</div>
                        <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-gray-700">{review.drugName}</span>
                      </td>
                      <td className="p-4">
                        <StarRating rating={review.rating} size="sm" />
                      </td>
                      <td className="p-4 hidden lg:table-cell max-w-xs">
                        <p className="text-xs text-gray-600 truncate">{review.body}</p>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteReview(review.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
