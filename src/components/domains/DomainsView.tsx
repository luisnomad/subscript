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
import { getDomains } from '@/lib/tauri';
import type { Domain, DomainStatus } from '@/lib/types';

import { AddDomainDialog } from './AddDomainDialog';
import { DomainCard } from './DomainCard';

type SortField = 'domainName' | 'expiryDate' | 'registrar' | 'cost';
type SortOrder = 'asc' | 'desc';

export function DomainsView(): ReactElement {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DomainStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('expiryDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    void loadDomains();
  }, []);

  async function loadDomains(): Promise<void> {
    try {
      setIsLoading(true);
      const data = await getDomains(false);
      setDomains(data);
    } catch (error) {
      console.error('Failed to load domains:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredAndSortedDomains = useMemo(() => {
    return domains
      .filter(domain => {
        const matchesSearch = domain.domainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (domain.registrar?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesStatus = statusFilter === 'all' || domain.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'domainName') {
          comparison = a.domainName.localeCompare(b.domainName);
        } else if (sortField === 'registrar') {
          comparison = (a.registrar || '').localeCompare(b.registrar || '');
        } else if (sortField === 'cost') {
          comparison = (a.cost || 0) - (b.cost || 0);
        } else if (sortField === 'expiryDate') {
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [domains, searchQuery, statusFilter, sortField, sortOrder]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24">
      <DomainsHeader
        onLoadDomains={() => {
          void loadDomains();
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {filteredAndSortedDomains.length === 0 ? (
          <EmptyState isFiltered={searchQuery !== '' || statusFilter !== 'all'} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedDomains.map(domain => (
              <DomainCard 
                key={domain.id} 
                domain={domain} 
                onSuccess={() => {
                  void loadDomains();
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
        <p className="font-mono text-sm text-[#6b6b6b]">Loading domains...</p>
      </div>
    </div>
  );
}

interface DomainsHeaderProps {
  onLoadDomains: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: DomainStatus | 'all';
  onStatusChange: (value: DomainStatus | 'all') => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

function DomainsHeader({
  onLoadDomains,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
}: DomainsHeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-[#2a2a2a] bg-[#faf8f5]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col gap-6">
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
              <AddDomainDialog onSuccess={onLoadDomains} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-[#e5e5e5] pt-6">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
              <Input
                placeholder="Search domains..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-10 border-2 border-[#2a2a2a] focus-visible:ring-0 focus-visible:border-[#d4a574]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#6b6b6b]" />
              <Select value={statusFilter} onValueChange={onStatusChange as any}>
                <SelectTrigger className="w-[150px] border-2 border-[#2a2a2a]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending-renewal">Pending Renewal</SelectItem>
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
                  <SelectItem value="expiryDate">Expiry Date</SelectItem>
                  <SelectItem value="domainName">Name</SelectItem>
                  <SelectItem value="registrar">Registrar</SelectItem>
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
        {isFiltered ? 'No domains match your filters.' : 'No domains found.'}
      </p>
      <p className="mt-2 text-sm text-[#9b9b9b]">
        {isFiltered ? 'Try adjusting your search or filters.' : 'Add one manually or approve from the pending queue.'}
      </p>
    </div>
  );
}
