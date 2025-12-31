import { type ReactElement, useState } from 'react';

import { Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteSubscription } from '@/lib/tauri';
import type { Subscription } from '@/lib/types';
import { cn } from '@/lib/utils';

import { EditSubscriptionDialog } from './EditSubscriptionDialog';

interface SubscriptionCardProps {
  subscription: Subscription;
  onSuccess?: () => void;
  testMode?: boolean;
}

const DECIMAL_PLACES = 2;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

export function SubscriptionCard({
  subscription,
  onSuccess,
  testMode = false,
}: SubscriptionCardProps): ReactElement {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!subscription.id) return;
    
    setIsDeleting(true);
    try {
      await deleteSubscription(subscription.id, testMode);
      toast({
        title: 'Deleted',
        description: 'Subscription removed successfully',
      });
      setIsDeleteDialogOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete subscription: ${String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const daysUntil = subscription.nextBillingDate 
    ? Math.ceil((new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / MS_IN_DAY)
    : null;

  return (
    <div className="group relative border-2 border-[#2a2a2a] bg-white p-6 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(42,42,42,1)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-[#2a2a2a]">
            {subscription.name}
          </h3>
          <p className="mt-1 font-mono text-2xl font-bold text-[#2d5f4f]">
            {subscription.currency} {subscription.cost.toFixed(DECIMAL_PLACES)}
            <span className="ml-1 text-sm font-medium text-[#6b6b6b]">
              / {subscription.billingCycle}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <EditSubscriptionDialog 
            subscription={subscription} 
            onSuccess={onSuccess}
            testMode={testMode}
          />
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#c45a5a] hover:bg-[#c45a5a]/10 hover:text-[#c45a5a]">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Subscription</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {subscription.name}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-[#6b6b6b]">
          <Calendar className="h-3.5 w-3.5" />
          <span>Next billing: {subscription.nextBillingDate || 'Not set'}</span>
          {daysUntil !== null && daysUntil >= 0 && (
            <span className={cn(
              "ml-auto rounded-full px-2 py-0.5 font-bold",
              daysUntil <= 3 ? "bg-[#fceaea] text-[#c45a5a]" : "bg-[#f0f7f4] text-[#2d5f4f]"
            )}>
              {daysUntil === 0 ? 'Today' : `In ${daysUntil} days`}
            </span>
          )}
        </div>

        {subscription.category && (
          <div className="flex items-center gap-2 font-mono text-xs text-[#6b6b6b]">
            <Tag className="h-3.5 w-3.5" />
            <span>{subscription.category}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider border",
            subscription.status === 'active' 
              ? "bg-[#f0f7f4] text-[#2d5f4f] border-[#2d5f4f]/20" 
              : subscription.status === 'paused'
              ? "bg-[#fff9e6] text-[#d4a574] border-[#d4a574]/20"
              : "bg-[#f5f5f5] text-[#6b6b6b] border-[#6b6b6b]/20"
          )}>
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              subscription.status === 'active' ? "bg-[#2d5f4f]" : subscription.status === 'paused' ? "bg-[#d4a574]" : "bg-[#6b6b6b]"
            )} />
            {subscription.status}
          </span>
        </div>
      </div>

      {subscription.notes && (
        <div className="mt-4 border-t border-dashed border-[#e5e5e5] pt-4">
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9b9b9b]" />
            <p className="font-mono text-xs italic text-[#9b9b9b] line-clamp-2">
              {subscription.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
