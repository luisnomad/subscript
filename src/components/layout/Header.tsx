import { type ReactElement, useEffect, useState } from 'react';

import { RefreshCw, Clock, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { triggerEmailSync, getLastSyncTime } from '@/lib/tauri';

export function Header(): ReactElement {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    void loadLastSync();
  }, []);

  async function loadLastSync(): Promise<void> {
    try {
      const time = await getLastSyncTime(false);
      setLastSync(time);
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  }

  async function handleSync(): Promise<void> {
    setIsSyncing(true);
    try {
      await triggerEmailSync(false);
      toast({
        title: 'Sync Started',
        description: 'Checking for new receipts...',
      });
      await loadLastSync();
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-[#2a2a2a] bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a2a2a] text-white">
          <Mail className="h-5 w-5" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-[#2a2a2a]">
          SubScript
        </span>
      </div>

      <div className="flex items-center gap-6">
        {lastSync && (
          <div className="hidden items-center gap-2 font-mono text-xs text-[#6b6b6b] md:flex">
            <Clock className="h-3.5 w-3.5" />
            <span>Last sync: {new Date(lastSync).toLocaleString()}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleSync()}
          disabled={isSyncing}
          className="border-2 border-[#2a2a2a] font-mono text-xs font-bold"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>
    </header>
  );
}
