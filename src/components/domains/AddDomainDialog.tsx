import { useState } from "react";

import { Plus } from "lucide-react";

import { DomainFormFields } from "@/components/shared/DomainFormFields";
import { NotesField } from "@/components/shared/FormSubComponents";
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

interface AddDomainDialogProps {
  onSuccess?: () => void;
  testMode?: boolean;
}

interface AddDomainFormState {
  domainName: string;
  registrar: string;
  cost: string;
  currency: string;
  expiryDate: string;
  registrationDate: string;
  isAutoRenew: boolean;
  status: DomainStatus;
  notes: string;
}

interface AddDomainFormReturn {
  state: AddDomainFormState;
  setState: React.Dispatch<React.SetStateAction<AddDomainFormState>>;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent, setIsOpen: (open: boolean) => void) => Promise<void>;
  resetForm: () => void;
}

const INITIAL_STATE: AddDomainFormState = {
  domainName: "",
  registrar: "",
  cost: "",
  currency: "USD",
  expiryDate: "",
  registrationDate: "",
  isAutoRenew: true,
  status: "active",
  notes: "",
};

function useAddDomainForm(onSuccess?: () => void, testMode = false): AddDomainFormReturn {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<AddDomainFormState>(INITIAL_STATE);

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
      await createDomain(
        {
          domainName: state.domainName,
          registrar: state.registrar || null,
          cost: state.cost ? parseFloat(state.cost) : null,
          currency: state.currency || null,
          expiryDate: state.expiryDate,
          registrationDate: state.registrationDate || null,
          autoRenew: state.isAutoRenew,
          status: state.status,
          notes: state.notes || null,
        },
        testMode
      );

      toast({ title: "Success", description: "Domain added successfully." });
      setIsOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create domain:", error);
      toast({ title: "Error", description: "Failed to add domain.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return { state, setState, isLoading, handleSubmit, resetForm };
}

export function AddDomainDialog({
  onSuccess,
  testMode = false,
}: AddDomainDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { state, setState, isLoading, handleSubmit } = useAddDomainForm(onSuccess, testMode);

  const updateField = <K extends keyof AddDomainFormState>(key: K, value: AddDomainFormState[K]): void => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={(e) => { void handleSubmit(e, setIsOpen); }}>
          <AddDomainDialogContent state={state} updateField={updateField} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
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

interface AddDomainDialogContentProps {
  state: AddDomainFormState;
  updateField: <K extends keyof AddDomainFormState>(key: K, value: AddDomainFormState[K]) => void;
}

function AddDomainDialogContent({ state, updateField }: AddDomainDialogContentProps): JSX.Element {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Domain</DialogTitle>
        <DialogDescription>Manually add a domain to your tracking list.</DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <DomainFormFields
          domainName={state.domainName}
          registrar={state.registrar}
          cost={state.cost}
          currency={state.currency}
          expiryDate={state.expiryDate}
          registrationDate={state.registrationDate}
          autoRenew={state.isAutoRenew}
          onDomainNameChange={(v) => updateField("domainName", v)}
          onRegistrarChange={(v) => updateField("registrar", v)}
          onCostChange={(v) => updateField("cost", v)}
          onCurrencyChange={(v) => updateField("currency", v)}
          onExpiryDateChange={(v) => updateField("expiryDate", v)}
          onRegistrationDateChange={(v) => updateField("registrationDate", v)}
          onAutoRenewChange={(v) => updateField("isAutoRenew", v)}
        />
        <div className="mt-4">
          <NotesField notes={state.notes} onNotesChange={(v) => updateField("notes", v)} />
        </div>
      </div>
    </>
  );
}
