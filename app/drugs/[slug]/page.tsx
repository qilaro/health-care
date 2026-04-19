"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pill, Star, AlertTriangle, Info, Activity, Zap, BookmarkIcon,
  ChevronDown, ChevronUp, ArrowLeft, ThumbsUp
} from "lucide-react";
import { api, DrugDetail, Review, ReviewsResponse } from "@/lib/api";
import StarRating from "@/components/StarRating";

export default function DrugDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [drug, setDrug] = useState<DrugDetail | null>(null);
  const [reviewData, setReviewData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "dosage" | "sideEffects" | "interactions" | "reviews" | "faq">("overview");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewerName: "", reviewerType: "Patient", body: "", condition: "", title: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      api.drugs.get(slug),
      api.drugs.reviews(slug),
      api.bookmarks.get(),
    ]).then(([d, r, b]) => {
      setDrug(d);
      setReviewData(r);
      setBookmarked(b.bookmarks.includes(d.id));
    }).catch(() => {
      router.push("/drugs");
    }).finally(() => setLoading(false));
  }, [slug]);

  const toggleBookmark = async () => {
    if (!drug) return;
    const result = await api.bookmarks.toggle(drug.id);
    setBookmarked(result.bookmarks.includes(drug.id));
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setSubmitting(true);
    try {
      await api.drugs.addReview(slug, {
        reviewerType: reviewForm.reviewerType,
        reviewerName: reviewForm.reviewerName,
        rating: reviewForm.rating,
        title: reviewForm.title,
        body: reviewForm.body,
        condition: reviewForm.condition,
      });
      const r = await api.drugs.reviews(slug);
      setReviewData(r);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, reviewerName: "", reviewerType: "Patient", body: "", condition: "", title: "" });
      setActiveTab("reviews");
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-medq py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!drug) return null;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "dosage", label: "Dosage" },
    { key: "sideEffects", label: "Side Effects" },
    { key: "interactions", label: "Interactions" },
    { key: "reviews", label: `Reviews (${reviewData?.total || 0})` },
    { key: "faq", label: "FAQ" },
  ] as const;

  const severityColor = { major: "text-red-600 bg-red-50", moderate: "text-yellow-600 bg-yellow-50", minor: "text-blue-600 bg-blue-50" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container-medq py-6">
          <Link href="/drugs" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Drug Directory
          </Link>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFF0EE" }}>
              <Pill className="h-10 w-10" style={{ color: "#DB3924" }} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-navy">{drug.brandName}</h1>
                <button onClick={toggleBookmark} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${bookmarked ? "bg-red-50 border-red-200 text-red-600" : "border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500"}`}>
                  <BookmarkIcon className="h-4 w-4" fill={bookmarked ? "currentColor" : "none"} />
                  {bookmarked ? "Saved" : "Save"}
                </button>
              </div>
              <p className="text-gray-600 mb-3">{drug.genericName}</p>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-blue">{drug.drugClass}</span>
                {drug.company && <span className="badge" style={{ backgroundColor: "#FFF0EE", color: "#DB3924" }}>{drug.company}</span>}
                {drug.price && <span className="badge badge-green">💰 {drug.price}</span>}
              </div>
              {drug.averageRating && (
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={drug.averageRating} />
                  <span className="font-semibold">{drug.averageRating}</span>
                  <span className="text-gray-500 text-sm">({drug.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-medq py-6">
        <div className="flex gap-1 overflow-x-auto bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? "text-white" : "text-gray-600 hover:bg-gray-100"}`}
              style={activeTab === tab.key ? { backgroundColor: "#DB3924" } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-navy flex items-center gap-2"><Info className="h-5 w-5" style={{ color: "#DB3924" }} /> About {drug.brandName}</h2>
              <p className="text-gray-700 leading-relaxed">{drug.description || "No description available."}</p>
              {drug.indications && (
                <>
                  <h3 className="font-semibold text-navy mt-4">What is it used for?</h3>
                  <p className="text-gray-700 leading-relaxed">{drug.indications}</p>
                </>
              )}
              {drug.warnings && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                  <h3 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5" /> Important Warnings
                  </h3>
                  <p className="text-yellow-700 text-sm leading-relaxed">{drug.warnings}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "dosage" && (
            <div>
              <h2 className="text-xl font-bold text-navy flex items-center gap-2 mb-4"><Activity className="h-5 w-5" style={{ color: "#DB3924" }} /> Dosage Information</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <p className="text-blue-800 text-sm font-medium">⚠️ Always follow your doctor's dosage instructions. Never adjust without medical guidance.</p>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{drug.dosage || "Dosage information not available. Please consult your prescriber."}</p>
            </div>
          )}

          {activeTab === "sideEffects" && (
            <div>
              <h2 className="text-xl font-bold text-navy flex items-center gap-2 mb-4"><AlertTriangle className="h-5 w-5" style={{ color: "#DB3924" }} /> Side Effects</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{drug.sideEffects || "Side effects information not available."}</p>
            </div>
          )}

          {activeTab === "interactions" && (
            <div>
              <h2 className="text-xl font-bold text-navy flex items-center gap-2 mb-4"><Zap className="h-5 w-5" style={{ color: "#DB3924" }} /> Drug Interactions</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">{drug.interactions || "Interaction information not available."}</p>
              <Link href={`/interaction-checker?drug=${drug.id}`} className="btn-primary inline-flex items-center gap-2">
                <Zap className="h-4 w-4" /> Check Interactions with Other Drugs
              </Link>
            </div>
          )}

          {activeTab === "reviews" && reviewData && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">Patient Reviews</h2>
                <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-primary text-sm py-2">
                  Write a Review
                </button>
              </div>

              {showReviewForm && (
                <form onSubmit={submitReview} className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                  <h3 className="font-semibold text-navy mb-4">Share Your Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                      <input type="text" required value={reviewForm.reviewerName} onChange={(e) => setReviewForm(f => ({ ...f, reviewerName: e.target.value }))} className="input-field" placeholder="John D." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                      <select value={reviewForm.reviewerType} onChange={(e) => setReviewForm(f => ({ ...f, reviewerType: e.target.value }))} className="input-field">
                        <option>Patient</option>
                        <option>Caregiver</option>
                        <option>Healthcare Professional</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition Treated</label>
                      <input type="text" value={reviewForm.condition} onChange={(e) => setReviewForm(f => ({ ...f, condition: e.target.value }))} className="input-field" placeholder="Type 2 Diabetes" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
                      <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="My experience with..." />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                    <StarRating rating={reviewForm.rating} size="lg" interactive onRate={(r) => setReviewForm(f => ({ ...f, rating: r }))} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Review *</label>
                    <textarea required rows={4} value={reviewForm.body} onChange={(e) => setReviewForm(f => ({ ...f, body: e.target.value }))} className="input-field" placeholder="Describe your experience..." />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Submitting..." : "Submit Review"}</button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}

              {reviewData.total > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <div className="text-5xl font-bold text-navy">{reviewData.averageRating.toFixed(1)}</div>
                    <StarRating rating={reviewData.averageRating} size="lg" />
                    <div className="text-gray-500 text-sm mt-1">{reviewData.total} reviews</div>
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const cnt = reviewData.ratingBreakdown[String(n)] || 0;
                      const pct = reviewData.total > 0 ? (cnt / reviewData.total) * 100 : 0;
                      return (
                        <div key={n} className="flex items-center gap-3">
                          <span className="text-sm w-4">{n}</span>
                          <Star className="h-4 w-4" fill="#F59E0B" stroke="#F59E0B" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: "#DB3924" }} />
                          </div>
                          <span className="text-sm text-gray-500 w-8">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                {reviewData.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              {reviewData.reviews.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <ThumbsUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "faq" && (
            <div>
              <h2 className="text-xl font-bold text-navy mb-4">Frequently Asked Questions</h2>
              {drug.faqs && drug.faqs.length > 0 ? (
                <div className="space-y-3">
                  {drug.faqs.map((faq, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between font-medium text-navy hover:bg-gray-50"
                      >
                        {faq.question}
                        {expandedFaq === i ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
                      </button>
                      {expandedFaq === i && (
                        <div className="px-5 pb-4 text-gray-700 text-sm leading-relaxed border-t border-gray-100 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No FAQs available for this drug.</p>
              )}
            </div>
          )}

          {drug.disclaimer && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
              <strong>Disclaimer:</strong> {drug.disclaimer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-navy">{review.reviewerName}</div>
          <div className="text-xs text-gray-400">{review.reviewerType} · {review.condition}</div>
        </div>
        <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
      </div>
      <StarRating rating={review.rating} size="sm" />
      {review.title && <h4 className="font-medium text-navy mt-2">{review.title}</h4>}
      <p className="text-gray-700 text-sm mt-1 leading-relaxed">{review.body}</p>
    </div>
  );
}
