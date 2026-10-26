"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider print:hidden">
      Print
    </button>
  );
}
