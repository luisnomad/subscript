import {
  type Dispatch,
  type FormEvent,
  type ReactElement,
  type SetStateAction,
  useState,
} from 'react';

import { Edit2 } from 'lucide-react';

import { NotesField } from '@/components/shared/FormSubComponents';
import { SubscriptionFormFields } from '@/components/shared/SubscriptionFormFields';
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
import { updateSubscription } from '@/lib/tauri';
import type { BillingCycle, Subscription, SubscriptionStatus } from '@/lib/types';

interface EditSubscriptionDialogProps {
  subscription: Subscription;
  onSuccess?: () => void;
  testMode?: boolean;
}

interface EditSubscriptionFormState {
  name: string;
  cost: string;
  currency: string;
  billingCycle: BillingCycle;
  nextDate: string;
  category: string;
  status: SubscriptionStatus;
  notes: string;
}

interface EditSubscriptionFormReturn {
  state: EditSubscriptionFormState;
  setState: Dispatch<SetStateAction<EditSubscriptionFormState>>;
  isLoading: boolean;
  handleSubmit: (
    e: FormEvent,
    setIsOpen: (open: boolean) => void
  ) => Promise<void>;
}

function useEditSubscriptionForm(
  subscription: Subscription,
  onSuccess?: () => void,
  testMode = false
): EditSubscriptionFormReturn {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<EditSubscriptionFormState>({
    name: subscription.name,
    cost: subscription.cost.toString(),
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    nextDate: subscription.nextBillingDate || '',
    category: subscription.category || '',
    status: subscription.status,
    notes: subscription.notes || '',
  });

  async function handleSubmit(
    e: FormEvent,
    setIsOpen: (open: boolean) => void
  ): Promise<void> {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateSubscription(
        {
          ...subscription,
          name: state.name,
          cost: parseFloat(state.cost),
          currency: state.currency,
          billingCycle: state.billingCycle,
          nextBillingDate: state.nextDate || null,
          category: state.category || null,
          status: state.status,
          notes: state.notes || null,
        },
        testMode
      );

      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update subscription: ${String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    state,
    setState,
    isLoading,
    handleSubmit,
  };
}

export function EditSubscriptionDialog({
  subscription,
  onSuccess,
  testMode = false,
}: EditSubscriptionDialogProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const { state, setState, isLoading, handleSubmit } = useEditSubscriptionForm(
    subscription,
    onSuccess,
    testMode
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={e => void handleSubmit(e, setIsOpen)}>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update the details for {subscription.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <SubscriptionFormFields
              name={state.name}
              cost={state.cost}
              currency={state.currency}
              billingCycle={state.billingCycle}
              nextDate={state.nextDate}
              category={state.category}
              onNameChange={value => setState(prev => ({ ...prev, name: value }))}
              onCostChange={value => setState(prev => ({ ...prev, cost: value }))}
              onCurrencyChange={value =>
                setState(prev => ({ ...prev, currency: value }))
              }
              onBillingCycleChange={value =>
                setState(prev => ({ ...prev, billingCycle: value }))
              }
              onNextDateChange={value =>
                setState(prev => ({ ...prev, nextDate: value }))
              }
              onCategoryChange={value =>
                setState(prev => ({ ...prev, category: value }))
              }
            />

            <NotesField
              notes={state.notes}
              onNotesChange={value => setState(prev => ({ ...prev, notes: value }))}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
