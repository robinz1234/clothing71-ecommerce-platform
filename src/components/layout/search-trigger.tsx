"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { SearchDialog } from "@/components/layout/search-dialog";

export function SearchTrigger() {
  const [open, setOpen] = React.useState(false);

  // Keyboard shortcut Ctrl+K or Cmd+K to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center text-foreground transition-opacity hover:opacity-60"
        aria-label="Search catalog (Ctrl+K)"
        title="Search (Ctrl+K)"
      >
        <Search className="size-4 sm:size-5" />
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
