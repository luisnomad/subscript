import { useState } from "react";

import { Plus } from "lucide-react";

import { DomainFormFields } from "@/components/shared/DomainFormFields";
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
import { useCreatePendingImportForm } from "@/hooks/useCreatePendingImportForm";

import { EmailMetadataFields } from "./EmailMetadataFields";


interface CreatePendingImportDialogProps {
  onSuccess?: () => void;
  testMode?: boolean;
}

export function CreatePendingImportDialog({
  onSuccess,
  testMode = false,
}: CreatePendingImportDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const form = useCreatePendingImportForm(onSuccess, testMode);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Test Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Test Pending Import</DialogTitle>
          <DialogDescription>
            Manually create a pending import for testing the review workflow
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => form.handleSubmit(e, setIsOpen)} className="space-y-6">
          <EmailMetadataFields
            emailSubject={form.state.emailSubject}
            emailFrom={form.state.emailFrom}
            emailDate={form.state.emailDate}
            classification={form.state.classification}
            confidence={form.state.confidence}
            onEmailSubjectChange={(v) => form.updateField("emailSubject", v)}
            onEmailFromChange={(v) => form.updateField("emailFrom", v)}
            onEmailDateChange={(v) => form.updateField("emailDate", v)}
            onClassificationChange={(v) => form.updateField("classification", v)}
            onConfidenceChange={(v) => form.updateField("confidence", v)}
          />

          {form.state.classification === "subscription" && (
            <SubscriptionFormFields
              name={form.state.subName}
              cost={form.state.subCost}
              currency={form.state.subCurrency}
              billingCycle={form.state.subBillingCycle}
              nextDate={form.state.subNextDate}
              category={form.state.subCategory}
              onNameChange={(v) => form.updateField("subName", v)}
              onCostChange={(v) => form.updateField("subCost", v)}
              onCurrencyChange={(v) => form.updateField("subCurrency", v)}
              onBillingCycleChange={(v) => form.updateField("subBillingCycle", v)}
              onNextDateChange={(v) => form.updateField("subNextDate", v)}
              onCategoryChange={(v) => form.updateField("subCategory", v)}
            />
          )}

          {form.state.classification === "domain" && (
            <DomainFormFields
              domainName={form.state.domainName}
              registrar={form.state.domainRegistrar}
              cost={form.state.domainCost}
              currency={form.state.domainCurrency}
              expiryDate={form.state.domainExpiryDate}
              registrationDate={form.state.domainRegistrationDate}
              autoRenew={form.state.isDomainAutoRenew}
              onDomainNameChange={(v) => form.updateField("domainName", v)}
              onRegistrarChange={(v) => form.updateField("domainRegistrar", v)}
              onCostChange={(v) => form.updateField("domainCost", v)}
              onCurrencyChange={(v) => form.updateField("domainCurrency", v)}
              onExpiryDateChange={(v) => form.updateField("domainExpiryDate", v)}
              onRegistrationDateChange={(v) => form.updateField("domainRegistrationDate", v)}
              onAutoRenewChange={(v) => form.updateField("isDomainAutoRenew", v)}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.isLoading}>
              {form.isLoading ? "Creating..." : "Create Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
