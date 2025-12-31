import { type ReactElement, type ReactNode } from 'react';

import { LayoutGrid, CreditCard, Globe, Settings, Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Header } from './Header';

interface AppShellProps {
  children: ReactNode;
  currentView: 'pending' | 'subscriptions' | 'domains' | 'settings';
  onViewChange: (view: 'pending' | 'subscriptions' | 'domains' | 'settings') => void;
}

export function AppShell({
  children,
  currentView,
  onViewChange,
}: AppShellProps): ReactElement {
  const navItems = [
    { id: 'pending', label: 'Pending', icon: Inbox },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8f5]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r-2 border-[#2a2a2a] bg-white md:flex">
        <div className="flex h-16 items-center border-b-2 border-[#2a2a2a] px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a2a2a] text-white">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[#2a2a2a]">
              SubScript
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 font-mono text-sm font-bold transition-all",
                currentView === item.id
                  ? "bg-[#2a2a2a] text-white shadow-[4px_4px_0px_0px_rgba(212,165,116,1)]"
                  : "text-[#6b6b6b] hover:bg-[#faf8f5] hover:text-[#2a2a2a]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t-2 border-[#2a2a2a] p-4">
          <div className="rounded-lg bg-[#faf8f5] p-3 border border-[#e5e5e5]">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9b9b9b]">
              Local-First
            </p>
            <p className="mt-1 text-xs text-[#6b6b6b]">
              Your data stays on this machine.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Navigation */}
        <nav className="flex h-16 items-center justify-around border-t-2 border-[#2a2a2a] bg-white md:hidden">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1",
                currentView === item.id ? "text-[#2a2a2a]" : "text-[#9b9b9b]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-mono text-[10px] font-bold uppercase">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
