import {
  type Dispatch,
  type FormEvent,
  type ReactElement,
  type SetStateAction,
  useState,
} from 'react';

import { Edit2 } from 'lucide-react';

import { DomainFormFields } from '@/components/shared/DomainFormFields';
import { NotesField } from '@/components/shared/FormSubComponents';
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
import { updateDomain } from '@/lib/tauri';
import type { Domain, DomainStatus } from '@/lib/types';

interface EditDomainDialogProps {
  domain: Domain;
  onSuccess?: () => void;
  testMode?: boolean;
}

interface EditDomainFormState {
  domainName: string;
  registrar: string;
  cost: string;
  currency: string;
  expiryDate: string;
  registrationDate: string;
  autoRenew: boolean;
  status: DomainStatus;
  notes: string;
}

interface EditDomainFormReturn {
  state: EditDomainFormState;
  setState: Dispatch<SetStateAction<EditDomainFormState>>;
  isLoading: boolean;
  handleSubmit: (
    e: FormEvent,
    setIsOpen: (open: boolean) => void
  ) => Promise<void>;
}

function useEditDomainForm(
  domain: Domain,
  onSuccess?: () => void,
  testMode = false
): EditDomainFormReturn {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<EditDomainFormState>({
    domainName: domain.domainName,
    registrar: domain.registrar || '',
    cost: domain.cost?.toString() || '',
    currency: domain.currency || 'USD',
    expiryDate: domain.expiryDate,
    registrationDate: domain.registrationDate || '',
    autoRenew: domain.autoRenew,
    status: domain.status,
    notes: domain.notes || '',
  });

  async function handleSubmit(
    e: FormEvent,
    setIsOpen: (open: boolean) => void
  ): Promise<void> {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateDomain(
        {
          ...domain,
          domainName: state.domainName,
          registrar: state.registrar || null,
          cost: state.cost ? parseFloat(state.cost) : null,
          currency: state.currency || null,
          expiryDate: state.expiryDate,
          registrationDate: state.registrationDate || null,
          autoRenew: state.autoRenew,
          status: state.status,
          notes: state.notes || null,
        },
        testMode
      );

      toast({
        title: 'Success',
        description: 'Domain updated successfully',
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update domain: ${String(error)}`,
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

export function EditDomainDialog({
  domain,
  onSuccess,
  testMode = false,
}: EditDomainDialogProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const { state, setState, isLoading, handleSubmit } = useEditDomainForm(
    domain,
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
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>
              Update the details for {domain.domainName}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <DomainFormFields
              domainName={state.domainName}
              registrar={state.registrar}
              cost={state.cost}
              currency={state.currency}
              expiryDate={state.expiryDate}
              registrationDate={state.registrationDate}
              autoRenew={state.autoRenew}
              onDomainNameChange={value =>
                setState(prev => ({ ...prev, domainName: value }))
              }
              onRegistrarChange={value =>
                setState(prev => ({ ...prev, registrar: value }))
              }
              onCostChange={value => setState(prev => ({ ...prev, cost: value }))}
              onCurrencyChange={value =>
                setState(prev => ({ ...prev, currency: value }))
              }
              onExpiryDateChange={value =>
                setState(prev => ({ ...prev, expiryDate: value }))
              }
              onRegistrationDateChange={value =>
                setState(prev => ({ ...prev, registrationDate: value }))
              }
              onAutoRenewChange={value =>
                setState(prev => ({ ...prev, autoRenew: value }))
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
