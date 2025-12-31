import { type ReactElement, useEffect, useMemo, useState } from 'react';

import { Loader2, Search, Filter, ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSubscriptions } from '@/lib/tauri';
import type { BillingCycle, Subscription, SubscriptionStatus } from '@/lib/types';

import { AddSubscriptionDialog } from './AddSubscriptionDialog';
import { SubscriptionCard } from './SubscriptionCard';

type SortField = 'name' | 'cost' | 'nextBillingDate';
type SortOrder = 'asc' | 'desc';

export function SubscriptionsView(): ReactElement {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('nextBillingDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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

  const filteredAndSortedSubscriptions = useMemo(() => {
    return subscriptions
      .filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (sub.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        const matchesCycle = cycleFilter === 'all' || sub.billingCycle === cycleFilter;
        return matchesSearch && matchesStatus && matchesCycle;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'cost') {
          comparison = a.cost - b.cost;
        } else if (sortField === 'nextBillingDate') {
          const dateA = a.nextBillingDate ? new Date(a.nextBillingDate).getTime() : Infinity;
          const dateB = b.nextBillingDate ? new Date(b.nextBillingDate).getTime() : Infinity;
          comparison = dateA - dateB;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [subscriptions, searchQuery, statusFilter, cycleFilter, sortField, sortOrder]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24">
      <SubscriptionsHeader
        onLoadSubscriptions={() => {
          void loadSubscriptions();
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        cycleFilter={cycleFilter}
        onCycleChange={setCycleFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {filteredAndSortedSubscriptions.length === 0 ? (
          <EmptyState isFiltered={searchQuery !== '' || statusFilter !== 'all' || cycleFilter !== 'all'} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedSubscriptions.map(sub => (
              <SubscriptionCard 
                key={sub.id} 
                subscription={sub} 
                onSuccess={() => {
                  void loadSubscriptions();
                }}
              />
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

interface SubscriptionsHeaderProps {
  onLoadSubscriptions: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: SubscriptionStatus | 'all';
  onStatusChange: (value: SubscriptionStatus | 'all') => void;
  cycleFilter: BillingCycle | 'all';
  onCycleChange: (value: BillingCycle | 'all') => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

function SubscriptionsHeader({
  onLoadSubscriptions,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  cycleFilter,
  onCycleChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
}: SubscriptionsHeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-[#2a2a2a] bg-[#faf8f5]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col gap-6">
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

          <div className="flex flex-wrap items-center gap-4 border-t border-[#e5e5e5] pt-6">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-10 border-2 border-[#2a2a2a] focus-visible:ring-0 focus-visible:border-[#d4a574]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#6b6b6b]" />
              <Select value={statusFilter} onValueChange={onStatusChange as any}>
                <SelectTrigger className="w-[130px] border-2 border-[#2a2a2a]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cycleFilter} onValueChange={onCycleChange as any}>
                <SelectTrigger className="w-[130px] border-2 border-[#2a2a2a]">
                  <SelectValue placeholder="Cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="h-4 w-4 text-[#6b6b6b]" />
              <Select value={sortField} onValueChange={onSortFieldChange as any}>
                <SelectTrigger className="w-[160px] border-2 border-[#2a2a2a]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextBillingDate">Next Billing</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-[#2a2a2a]"
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <span className="font-mono text-xs font-bold uppercase">
                  {sortOrder}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function EmptyState({ isFiltered }: { isFiltered: boolean }): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-lg text-[#6b6b6b]">
        {isFiltered ? 'No subscriptions match your filters.' : 'No subscriptions found.'}
      </p>
      <p className="mt-2 text-sm text-[#9b9b9b]">
        {isFiltered ? 'Try adjusting your search or filters.' : 'Add one manually or approve from the pending queue.'}
      </p>
    </div>
  );
}
