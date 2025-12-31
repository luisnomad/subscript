import { useState } from "react";

import { Plus } from "lucide-react";

import { NotesField } from "@/components/shared/FormSubComponents";
import { SubscriptionFormFields } from "@/components/shared/SubscriptionFormFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createSubscription } from "@/lib/tauri";
import type { BillingCycle, SubscriptionStatus } from "@/lib/types";

interface AddSubscriptionDialogProps {
  onSuccess?: () => void;
  testMode?: boolean;
}

interface AddSubscriptionFormState {
  name: string;
  cost: string;
  currency: string;
  billingCycle: BillingCycle;
  nextDate: string;
  category: string;
  status: SubscriptionStatus;
  notes: string;
}

interface AddSubscriptionFormReturn {
  state: AddSubscriptionFormState;
  setState: React.Dispatch<React.SetStateAction<AddSubscriptionFormState>>;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent, setIsOpen: (open: boolean) => void) => Promise<void>;
  resetForm: () => void;
}

const INITIAL_STATE: AddSubscriptionFormState = {
  name: "",
  cost: "",
  currency: "USD",
  billingCycle: "monthly",
  nextDate: "",
  category: "",
  status: "active",
  notes: "",
};

function useAddSubscriptionForm(onSuccess?: () => void, testMode = false): AddSubscriptionFormReturn {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<AddSubscriptionFormState>(INITIAL_STATE);

  function resetForm(): void {
    setState(INITIAL_STATE);
  }

  async function handleSubmit(
    e: React.FormEvent,
    setIsOpen: (open: boolean) => void
  ): Promise<void> {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createSubscription(
        {
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

      toast({ title: "Success", description: "Subscription added successfully." });
      setIsOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create subscription:", error);
      toast({ title: "Error", description: "Failed to add subscription.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return { state, setState, isLoading, handleSubmit, resetForm };
}

export function AddSubscriptionDialog({
  onSuccess,
  testMode = false,
}: AddSubscriptionDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { state, setState, isLoading, handleSubmit } = useAddSubscriptionForm(onSuccess, testMode);

  const updateField = <K extends keyof AddSubscriptionFormState>(key: K, value: AddSubscriptionFormState[K]): void => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={(e) => { void handleSubmit(e, setIsOpen); }}>
          <AddSubscriptionDialogContent state={state} updateField={updateField} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddSubscriptionDialogContentProps {
  state: AddSubscriptionFormState;
  updateField: <K extends keyof AddSubscriptionFormState>(key: K, value: AddSubscriptionFormState[K]) => void;
}

function AddSubscriptionDialogContent({ state, updateField }: AddSubscriptionDialogContentProps): JSX.Element {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Subscription</DialogTitle>
        <DialogDescription>Manually add a subscription to your tracking list.</DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <SubscriptionFormFields
          name={state.name}
          cost={state.cost}
          currency={state.currency}
          billingCycle={state.billingCycle}
          nextDate={state.nextDate}
          category={state.category}
          onNameChange={(v) => updateField("name", v)}
          onCostChange={(v) => updateField("cost", v)}
          onCurrencyChange={(v) => updateField("currency", v)}
          onBillingCycleChange={(v) => updateField("billingCycle", v)}
          onNextDateChange={(v) => updateField("nextDate", v)}
          onCategoryChange={(v) => updateField("category", v)}
        />
        <div className="mt-4">
          <NotesField notes={state.notes} onNotesChange={(v) => updateField("notes", v)} />
        </div>
      </div>
    </>
  );
}
