import { type ReactElement, useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { getSubscriptions } from '@/lib/tauri';
import type { Subscription } from '@/lib/types';

import { AddSubscriptionDialog } from './AddSubscriptionDialog';

const DECIMAL_PLACES = 2;

export function SubscriptionsView(): ReactElement {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadSubscriptions();
  }, []);

  async function loadSubscriptions(): Promise<void> {
    try {
      setIsLoading(true);
      const data = await getSubscriptions(false);
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24">
      <SubscriptionsHeader
        onLoadSubscriptions={() => {
          void loadSubscriptions();
        }}
      />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {subscriptions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map(sub => (
              <SubscriptionCard key={sub.id} sub={sub} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function LoadingState(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4a574]" />
        <p className="font-mono text-sm text-[#6b6b6b]">
          Loading subscriptions...
        </p>
      </div>
    </div>
  );
}

function SubscriptionsHeader({
  onLoadSubscriptions,
}: {
  onLoadSubscriptions: () => void;
}): ReactElement {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-[#2a2a2a] bg-[#faf8f5]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-[#2a2a2a]">
              Subscriptions
            </h1>
            <p className="mt-1 font-mono text-sm text-[#6b6b6b]">
              Manage your active and past subscriptions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AddSubscriptionDialog onSuccess={onLoadSubscriptions} />
          </div>
        </div>
      </div>
    </header>
  );
}

function EmptyState(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-lg text-[#6b6b6b]">
        No subscriptions found.
      </p>
      <p className="mt-2 text-sm text-[#9b9b9b]">
        Add one manually or approve from the pending queue.
      </p>
    </div>
  );
}

function SubscriptionCard({ sub }: { sub: Subscription }): ReactElement {
  return (
    <div className="border-2 border-[#2a2a2a] bg-white p-6 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]">
      <h3 className="font-display text-xl font-bold text-[#2a2a2a]">
        {sub.name}
      </h3>
      <p className="font-mono text-lg font-bold text-[#2d5f4f]">
        {sub.currency} {sub.cost.toFixed(DECIMAL_PLACES)} / {sub.billingCycle}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="bg-[#e5e5e5] px-2 py-1 font-mono text-xs font-medium text-[#2a2a2a]">
          {sub.status}
        </span>
        {sub.category && (
          <span className="bg-[#d4e6f1] px-2 py-1 font-mono text-xs font-medium text-[#2a2a2a]">
            {sub.category}
          </span>
        )}
      </div>
    </div>
  );
}
