import { type ReactElement, useState } from 'react';

import { DomainsView } from '@/components/domains/DomainsView';
import { PendingQueueView } from '@/components/pending/PendingQueueView';
import { SubscriptionsView } from '@/components/subscriptions/SubscriptionsView';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

type View = 'pending' | 'subscriptions' | 'domains';

function App(): ReactElement {
  const [currentView, setCurrentView] = useState<View>('pending');

  return (
    <>
      <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-[#2a2a2a] bg-white p-2 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]">
        <Button
          variant={currentView === 'pending' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('pending')}
          className="rounded-full font-mono text-xs"
        >
          Pending
        </Button>
        <Button
          variant={currentView === 'subscriptions' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('subscriptions')}
          className="rounded-full font-mono text-xs"
        >
          Subscriptions
        </Button>
        <Button
          variant={currentView === 'domains' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('domains')}
          className="rounded-full font-mono text-xs"
        >
          Domains
        </Button>
      </nav>

      {currentView === 'pending' && <PendingQueueView />}
      {currentView === 'subscriptions' && <SubscriptionsView />}
      {currentView === 'domains' && <DomainsView />}

      <Toaster />
    </>
  );
}

export default App;
