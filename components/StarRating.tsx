"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, max = 5, size = "md", interactive = false, onRate }: StarRatingProps) {
  const sizeClass = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onRate?.(i + 1)}
          disabled={!interactive}
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
        >
          <Star
            className={sizeClass}
            fill={i < Math.round(rating) ? "#F59E0B" : "transparent"}
            stroke={i < Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
          />
        </button>
      ))}
    </div>
  );
}
