"use client";

import { useEffect } from "react";
import { FileDown } from "lucide-react";

/** "Download PDF" via the browser's print dialog (Save as PDF). */
export default function PrintButton({
  label,
  autoPrint,
  accent,
}: {
  label: string;
  autoPrint: boolean;
  accent: string;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    // Let fonts and images settle before opening the dialog.
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [autoPrint]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
      style={{ background: accent }}
    >
      <FileDown className="w-4 h-4" />
      {label}
    </button>
  );
}
