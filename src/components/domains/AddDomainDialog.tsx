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
import { createDomain } from "@/lib/tauri";
import type { DomainStatus } from "@/lib/types";
import { DomainFormFields } from "@/components/shared/DomainFormFields";

interface AddDomainDialogProps {
  onSuccess?: () => void;
  testMode?: boolean;
}

export function AddDomainDialog({
  onSuccess,
  testMode = false,
}: AddDomainDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [domainName, setDomainName] = useState("");
  const [registrar, setRegistrar] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [expiryDate, setExpiryDate] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [autoRenew, setAutoRenew] = useState(true);
  const [status, setStatus] = useState<DomainStatus>("active");
  const [notes, setNotes] = useState("");

  function resetForm(): void {
    setDomainName("");
    setRegistrar("");
    setCost("");
    setCurrency("USD");
    setExpiryDate("");
    setRegistrationDate("");
    setAutoRenew(true);
    setStatus("active");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createDomain(
        {
          domainName,
          registrar: registrar || null,
          cost: cost ? parseFloat(cost) : null,
          currency: currency || null,
          expiryDate,
          registrationDate: registrationDate || null,
          autoRenew,
          status,
          notes: notes || null,
        },
        testMode
      );

      toast({
        title: "Success",
        description: "Domain added successfully.",
      });

      setIsOpen(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to create domain:", error);
      toast({
        title: "Error",
        description: "Failed to add domain. Please try again.",
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
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <DialogHeader>
            <DialogTitle>Add New Domain</DialogTitle>
            <DialogDescription>
              Manually add a domain to your tracking list.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <DomainFormFields
              domainName={domainName}
              registrar={registrar}
              cost={cost}
              currency={currency}
              expiryDate={expiryDate}
              registrationDate={registrationDate}
              autoRenew={autoRenew}
              onDomainNameChange={setDomainName}
              onRegistrarChange={setRegistrar}
              onCostChange={setCost}
              onCurrencyChange={setCurrency}
              onExpiryDateChange={setExpiryDate}
              onRegistrationDateChange={setRegistrationDate}
              onAutoRenewChange={setAutoRenew}
            />
            
            {/* Additional fields not in DomainFormFields */}
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
              {isLoading ? "Adding..." : "Add Domain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
