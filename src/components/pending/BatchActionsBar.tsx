import { type ReactElement, useState } from 'react';

import { Check, X, XCircle } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import {
  batchApprovePendingImports,
  batchRejectPendingImports,
} from '@/lib/tauri';

interface BatchActionsBarProps {
  selectedIds: number[];
  onDeselectAll: () => void;
  onBatchRemove: (ids: number[]) => void;
}

export function BatchActionsBar({
  selectedIds,
  onDeselectAll,
  onBatchRemove,
}: BatchActionsBarProps): ReactElement {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();

  async function handleBatchApprove(): Promise<void> {
    try {
      setIsApproving(true);
      await batchApprovePendingImports(selectedIds, false);
      toast({
        title: 'Batch Approved',
        description: `${selectedIds.length} items approved successfully`,
      });
      onBatchRemove(selectedIds);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve items',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  }

  async function handleBatchReject(): Promise<void> {
    try {
      setIsRejecting(true);
      await batchRejectPendingImports(selectedIds, false);
      toast({
        title: 'Batch Rejected',
        description: `${selectedIds.length} items removed from queue`,
      });
      onBatchRemove(selectedIds);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject items',
        variant: 'destructive',
      });
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <div className="sticky top-[89px] z-10 border-b-2 border-[#d4a574] bg-[#d4a574]/5 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="font-mono text-sm font-medium text-[#2a2a2a]">
              {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''}{' '}
              selected
            </p>
            <button
              onClick={onDeselectAll}
              className="flex items-center gap-2 font-mono text-sm text-[#6b6b6b] transition-colors hover:text-[#2a2a2a]"
            >
              <XCircle className="h-4 w-4" />
              Clear Selection
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                void handleBatchApprove();
              }}
              disabled={isApproving || isRejecting}
              className="flex items-center gap-2 border-2 border-[#2d5f4f] bg-[#2d5f4f] px-4 py-2 font-mono text-sm font-medium text-white transition-all hover:bg-[#2d5f4f]/90 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Approve All
            </button>
            <button
              onClick={() => {
                void handleBatchReject();
              }}
              disabled={isApproving || isRejecting}
              className="flex items-center gap-2 border-2 border-[#c45a5a] bg-white px-4 py-2 font-mono text-sm font-medium text-[#c45a5a] transition-all hover:bg-[#c45a5a] hover:text-white disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Reject All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
