import React, { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { getPendingImports } from "@/lib/tauri";
import type { PendingImport } from "@/lib/types";

import { BatchActionsBar } from "./BatchActionsBar";
import { CreatePendingImportDialog } from "./CreatePendingImportDialog";
import { EmptyState } from "./EmptyState";
import { GenerateMockDataButton } from "./GenerateMockDataButton";
import { PendingImportCard } from "./PendingImportCard";

export function PendingQueueView(): React.ReactElement {
  const [imports, setImports] = useState<PendingImport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    void loadImports();
  }, []);

  async function loadImports(): Promise<void> {
    try {
      setIsLoading(true);
      const data = await getPendingImports(false);
      console.log("Received pending imports from Rust:", data);
      console.log("First import extractedData:", data[0]?.extractedData);
      setImports(data);
    } catch (error) {
      console.error("Failed to load pending imports:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(id: number, selected: boolean): void {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function handleSelectAll(): void {
    setSelectedIds(new Set(imports.map((imp) => imp.id)));
  }

  function handleDeselectAll(): void {
    setSelectedIds(new Set());
  }

  function handleRemoveImport(id: number): void {
    setImports((prev) => prev.filter((imp) => imp.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleBatchRemove(ids: number[]): void {
    setImports((prev) => prev.filter((imp) => !ids.includes(imp.id)));
    setSelectedIds(new Set());
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4a574]" />
          <p className="font-mono text-sm text-[#6b6b6b]">Loading receipts...</p>
        </div>
      </div>
    );
  }

  function handleCreateSuccess(): void {
    void loadImports();
  }

  if (imports.length === 0) {
    return <EmptyState onCreateTest={handleCreateSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b-2 border-[#2a2a2a] bg-[#faf8f5]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-[#2a2a2a]">
                Pending Review
              </h1>
              <p className="mt-1 font-mono text-sm text-[#6b6b6b]">
                {imports.length} {imports.length === 1 ? "receipt" : "receipts"} awaiting approval
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <div className="font-mono text-sm text-[#d4a574]">
                  {selectedIds.size} selected
                </div>
              )}
              <GenerateMockDataButton onSuccess={handleCreateSuccess} testMode={false} />
              <CreatePendingImportDialog onSuccess={handleCreateSuccess} testMode={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Batch Actions */}
      {selectedIds.size > 0 && (
        <BatchActionsBar
          selectedIds={Array.from(selectedIds)}
          onDeselectAll={handleDeselectAll}
          onBatchRemove={handleBatchRemove}
        />
      )}

      {/* Masonry Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imports.map((importItem, index) => (
            <div
              key={importItem.id}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              className="animate-slide-up"
            >
              <PendingImportCard
                importItem={importItem}
                isSelected={selectedIds.has(importItem.id)}
                onSelect={handleSelect}
                onRemove={handleRemoveImport}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Select All Button (floating) */}
      {imports.length > 0 && selectedIds.size === 0 && (
        <button
          onClick={handleSelectAll}
          className="fixed bottom-6 right-6 border-2 border-[#2a2a2a] bg-[#faf8f5] px-6 py-3 font-mono text-sm font-medium text-[#2a2a2a] shadow-lg transition-all hover:bg-[#2a2a2a] hover:text-[#faf8f5]"
        >
          Select All ({imports.length})
        </button>
      )}
    </div>
  );
}
