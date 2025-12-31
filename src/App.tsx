import { type ReactElement, useState } from 'react';

import { DomainsView } from '@/components/domains/DomainsView';
import { AppShell } from '@/components/layout/AppShell';
import { PendingQueueView } from '@/components/pending/PendingQueueView';
import { SettingsView } from '@/components/settings/SettingsView';
import { SubscriptionsView } from '@/components/subscriptions/SubscriptionsView';
import { Toaster } from '@/components/ui/toaster';

type View = 'pending' | 'subscriptions' | 'domains' | 'settings';

function App(): ReactElement {
  const [currentView, setCurrentView] = useState<View>('pending');

  return (
    <>
      <AppShell currentView={currentView} onViewChange={setCurrentView}>
        {currentView === 'pending' && <PendingQueueView />}
        {currentView === 'subscriptions' && <SubscriptionsView />}
        {currentView === 'domains' && <DomainsView />}
        {currentView === 'settings' && <SettingsView />}
      </AppShell>

      <Toaster />
    </>
  );
}

export default App;
