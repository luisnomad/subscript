import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getDomains } from "@/lib/tauri";
import type { Domain } from "@/lib/types";
import { AddDomainDialog } from "./AddDomainDialog";

export function DomainsView(): React.ReactElement {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadDomains();
  }, []);

  async function loadDomains(): Promise<void> {
    try {
      setIsLoading(true);
      const data = await getDomains(false);
      setDomains(data);
    } catch (error) {
      console.error("Failed to load domains:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4a574]" />
          <p className="font-mono text-sm text-[#6b6b6b]">Loading domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24">
      <header className="sticky top-0 z-10 border-b-2 border-[#2a2a2a] bg-[#faf8f5]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-[#2a2a2a]">
                Domains
              </h1>
              <p className="mt-1 font-mono text-sm text-[#6b6b6b]">
                Manage your domain registrations and renewals.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <AddDomainDialog onSuccess={loadDomains} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {domains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-mono text-lg text-[#6b6b6b]">No domains found.</p>
            <p className="mt-2 text-sm text-[#9b9b9b]">Add one manually or approve from the pending queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => (
              <div key={domain.id} className="border-2 border-[#2a2a2a] bg-white p-6 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]">
                <h3 className="font-display text-xl font-bold text-[#2a2a2a]">{domain.domainName}</h3>
                <p className="font-mono text-sm text-[#6b6b6b]">{domain.registrar}</p>
                {domain.cost && (
                  <p className="mt-2 font-mono text-lg font-bold text-[#2d5f4f]">
                    {domain.currency} {domain.cost.toFixed(2)}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="bg-[#e5e5e5] px-2 py-1 font-mono text-xs font-medium text-[#2a2a2a]">
                    {domain.status}
                  </span>
                  <span className="bg-[#f9e79f] px-2 py-1 font-mono text-xs font-medium text-[#2a2a2a]">
                    Expires: {domain.expiryDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
