import { type ReactElement } from 'react';

import { CheckCircle2, Inbox } from 'lucide-react';

import { CreatePendingImportDialog } from './CreatePendingImportDialog';
import { GenerateMockDataButton } from './GenerateMockDataButton';

interface EmptyStateProps {
  onCreateTest?: () => void;
}

export function EmptyState({
  onCreateTest,
}: EmptyStateProps): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
      <div className="text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-full border-4 border-[#2d5f4f] bg-[#2d5f4f]/10 p-6">
          <CheckCircle2 className="h-16 w-16 text-[#2d5f4f]" />
        </div>
        <h2 className="mb-2 font-display text-3xl font-bold text-[#2a2a2a]">
          All Caught Up
        </h2>
        <p className="mb-6 font-mono text-sm text-[#6b6b6b]">
          No pending receipts to review
        </p>
        <div className="mb-6 inline-flex items-center gap-2 border-2 border-dashed border-[#e5e5e5] bg-white px-6 py-4">
          <Inbox className="h-5 w-5 text-[#6b6b6b]" />
          <p className="font-mono text-sm text-[#6b6b6b]">
            New receipts will appear here after email sync
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <GenerateMockDataButton onSuccess={onCreateTest} testMode={false} />
          <CreatePendingImportDialog
            onSuccess={onCreateTest}
            testMode={false}
          />
        </div>
      </div>
    </div>
  );
}
