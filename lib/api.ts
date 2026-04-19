const API_BASE = "/api";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  drugs: {
    list: (params?: { page?: number; limit?: number; drug_class?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.drug_class) q.set("drug_class", params.drug_class);
      return apiFetch<DrugsResponse>(`/drugs?${q}`);
    },
    az: () => apiFetch<DrugAZResponse>("/drugs/az"),
    classes: () => apiFetch<DrugClass[]>("/drugs/classes"),
    stats: () => apiFetch<DrugStats>("/drugs/stats"),
    get: (slug: string) => apiFetch<DrugDetail>(`/drugs/${slug}`),
    reviews: (slug: string, page = 1) => apiFetch<ReviewsResponse>(`/drugs/${slug}/reviews?page=${page}`),
    addReview: (slug: string, body: CreateReviewBody) =>
      apiFetch<Review>(`/drugs/${slug}/reviews`, { method: "POST", body: JSON.stringify(body) }),
  },
  search: (q: string) => apiFetch<SearchResponse>(`/search?q=${encodeURIComponent(q)}`),
  interactions: {
    check: (drugIds: number[]) =>
      apiFetch<InteractionResult>("/interactions/check", {
        method: "POST",
        body: JSON.stringify({ drugIds }),
      }),
  },
  compare: (drugSlugs: string[]) =>
    apiFetch<CompareResult>("/compare", {
      method: "POST",
      body: JSON.stringify({ drugSlugs }),
    }),
  bookmarks: {
    get: () => apiFetch<{ bookmarks: number[] }>("/bookmarks"),
    toggle: (drugId: number) =>
      apiFetch<{ success: boolean; bookmarks: number[] }>("/bookmarks/toggle", {
        method: "POST",
        body: JSON.stringify({ drugId }),
      }),
    getDrugs: () => apiFetch<{ drugs: DrugSummary[] }>("/bookmarks/drugs"),
  },
  chatbot: (message: string, history: ChatHistoryItem[]) =>
    apiFetch<ChatResponse>("/chatbot/message", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
  news: {
    list: (params?: { page?: number; category?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.category) q.set("category", params.category);
      return apiFetch<NewsListResponse>(`/news?${q}`);
    },
    get: (id: number) => apiFetch<NewsArticle>(`/news/${id}`),
  },
  admin: {
    stats: () => apiFetch<AdminStats>("/admin/stats"),
    drugs: (page = 1) => apiFetch<DrugsResponse>(`/admin/drugs?page=${page}`),
    createDrug: (body: CreateDrugBody) =>
      apiFetch<DrugSummary>("/admin/drugs", { method: "POST", body: JSON.stringify(body) }),
    updateDrug: (id: number, body: Partial<CreateDrugBody>) =>
      apiFetch<DrugSummary>(`/admin/drugs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteDrug: (id: number) =>
      apiFetch<{ message: string }>(`/admin/drugs/${id}`, { method: "DELETE" }),
    reviews: (page = 1) => apiFetch<AdminReviewsResponse>(`/admin/reviews?page=${page}`),
    deleteReview: (id: number) =>
      apiFetch<{ message: string }>(`/admin/reviews/${id}`, { method: "DELETE" }),
  },
};

export interface DrugSummary {
  id: number;
  slug: string;
  brandName: string;
  genericName: string;
  drugClass: string;
  company?: string;
  price?: string;
  imageUrl?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface DrugDetail extends DrugSummary {
  imageBoxUrl?: string;
  imageStripUrl?: string;
  description?: string;
  indications?: string;
  warnings?: string;
  dosage?: string;
  sideEffects?: string;
  interactions?: string;
  faqs?: { question: string; answer: string }[];
  disclaimer?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DrugsResponse {
  drugs: DrugSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DrugAZGroup {
  letter: string;
  drugs: DrugSummary[];
}

export interface DrugAZResponse {
  groups: DrugAZGroup[];
}

export interface DrugClass {
  name: string;
  count: number;
}

export interface DrugStats {
  totalDrugs: number;
  totalClasses: number;
  totalCompanies: number;
  totalReviews: number;
}

export interface SearchResult {
  id: number;
  slug: string;
  brandName: string;
  genericName: string;
  drugClass: string;
  matchType: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export interface InteractionPair {
  drug1: string;
  drug2: string;
  severity: string;
  description: string;
  recommendation: string;
}

export interface InteractionResult {
  pairs: InteractionPair[];
  totalInteractions: number;
  hasSerious: boolean;
}

export interface CompareResult {
  drugs: DrugDetail[];
}

export interface Review {
  id: number;
  drugId: number;
  reviewerType: string;
  reviewerName: string;
  rating: number;
  title?: string;
  body: string;
  condition?: string;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  averageRating: number;
  ratingBreakdown: Record<string, number>;
}

export interface CreateReviewBody {
  reviewerType: string;
  reviewerName: string;
  rating: number;
  title?: string;
  body: string;
  condition?: string;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  sources: string[];
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body?: string;
  category: string;
  imageUrl?: string;
  author: string;
  tags?: string[];
  publishedAt: string;
}

export interface NewsListResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
}

export interface AdminStats {
  totalDrugs: number;
  totalReviews: number;
  totalBookmarks: number;
  reviewsToday: number;
  recentDrugs: DrugSummary[];
  topSearched: string[];
}

export interface CreateDrugBody {
  brandName: string;
  genericName: string;
  drugClass: string;
  company?: string;
  price?: string;
  description?: string;
  indications?: string;
  warnings?: string;
  dosage?: string;
  sideEffects?: string;
  interactions?: string;
  disclaimer?: string;
  imageBoxUrl?: string;
  imageStripUrl?: string;
}

export interface AdminReviewsResponse {
  reviews: {
    id: number;
    drugId: number;
    drugName: string;
    reviewerName: string;
    rating: number;
    body: string;
    createdAt: string;
  }[];
  total: number;
  page: number;
  limit: number;
}
