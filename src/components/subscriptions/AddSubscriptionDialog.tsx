import { useState } from "react";
import { Plus } from "lucide-react";
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
import { SubscriptionFormFields } from "@/components/shared/SubscriptionFormFields";

interface AddSubscriptionDialogProps {
  onSuccess?: () => void;
  testMode?: boolean;
}

export function AddSubscriptionDialog({
  onSuccess,
  testMode = false,
}: AddSubscriptionDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextDate, setNextDate] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [notes, setNotes] = useState("");

  function resetForm(): void {
    setName("");
    setCost("");
    setCurrency("USD");
    setBillingCycle("monthly");
    setNextDate("");
    setCategory("");
    setStatus("active");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createSubscription(
        {
          name,
          cost: parseFloat(cost),
          currency,
          billingCycle,
          nextBillingDate: nextDate || null,
          category: category || null,
          status,
          notes: notes || null,
        },
        testMode
      );

      toast({
        title: "Success",
        description: "Subscription added successfully.",
      });

      setIsOpen(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to create subscription:", error);
      toast({
        title: "Error",
        description: "Failed to add subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <DialogHeader>
            <DialogTitle>Add New Subscription</DialogTitle>
            <DialogDescription>
              Manually add a subscription to your tracking list.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <SubscriptionFormFields
              name={name}
              cost={cost}
              currency={currency}
              billingCycle={billingCycle}
              nextDate={nextDate}
              category={category}
              onNameChange={setName}
              onCostChange={setCost}
              onCurrencyChange={setCurrency}
              onBillingCycleChange={setBillingCycle}
              onNextDateChange={setNextDate}
              onCategoryChange={setCategory}
            />
            
            {/* Additional fields not in SubscriptionFormFields */}
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
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
