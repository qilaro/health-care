"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function EmergencyBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-red-600 text-white py-2 px-4 text-center text-sm relative">
      <AlertTriangle className="inline-block mr-2 h-4 w-4" />
      <strong>Medical Emergency?</strong> Call{" "}
      <a href="tel:911" className="underline font-bold">911</a> immediately.
      MedQ provides information only — not emergency medical advice.
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
