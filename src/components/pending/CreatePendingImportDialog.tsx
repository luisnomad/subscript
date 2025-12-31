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
import { createPendingImport } from "@/lib/tauri";
import type {
  BillingCycle,
  DomainExtraction,
  SubscriptionExtraction,
} from "@/lib/types";

import { DomainFormFields } from "@/components/shared/DomainFormFields";
import { EmailMetadataFields } from "./EmailMetadataFields";
import { SubscriptionFormFields } from "@/components/shared/SubscriptionFormFields";

interface CreatePendingImportDialogProps {
  onSuccess?: () => void;
  testMode?: boolean;
}

const DEFAULT_CONFIDENCE = 0.85;

export function CreatePendingImportDialog({
  onSuccess,
  testMode = false,
}: CreatePendingImportDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [emailDate, setEmailDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today ?? "";
  });
  const [classification, setClassification] = useState<string>("subscription");
  const [confidence, setConfidence] = useState(DEFAULT_CONFIDENCE);

  const [subName, setSubName] = useState("");
  const [subCost, setSubCost] = useState("");
  const [subCurrency, setSubCurrency] = useState("USD");
  const [subBillingCycle, setSubBillingCycle] =
    useState<BillingCycle>("monthly");
  const [subNextDate, setSubNextDate] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [domainName, setDomainName] = useState("");
  const [domainRegistrar, setDomainRegistrar] = useState("");
  const [domainCost, setDomainCost] = useState("");
  const [domainCurrency, setDomainCurrency] = useState("USD");
  const [domainExpiryDate, setDomainExpiryDate] = useState("");
  const [domainRegistrationDate, setDomainRegistrationDate] = useState("");
  const [isDomainAutoRenew, setIsDomainAutoRenew] = useState(true);

  function resetForm(): void {
    setEmailSubject("");
    setEmailFrom("");
    const today = new Date().toISOString().split("T")[0] ?? "";
    setEmailDate(today);
    setClassification("subscription");
    setConfidence(DEFAULT_CONFIDENCE);
    setSubName("");
    setSubCost("");
    setSubCurrency("USD");
    setSubBillingCycle("monthly");
    setSubNextDate("");
    setSubCategory("");
    setDomainName("");
    setDomainRegistrar("");
    setDomainCost("");
    setDomainCurrency("USD");
    setDomainExpiryDate("");
    setDomainRegistrationDate("");
    setIsDomainAutoRenew(true);
  }

  function buildSubscriptionData(): SubscriptionExtraction {
    return {
      name: subName,
      cost: parseFloat(subCost),
      currency: subCurrency,
      billingCycle: subBillingCycle,
      ...(subNextDate && { nextBillingDate: subNextDate }),
      ...(subCategory && { category: subCategory }),
    };
  }

  function buildDomainData(): DomainExtraction {
    return {
      domainName,
      registrar: domainRegistrar,
      cost: domainCost ? parseFloat(domainCost) : 0,
      currency: domainCurrency,
      expiryDate: domainExpiryDate,
      ...(domainRegistrationDate && { registrationDate: domainRegistrationDate }),
      autoRenew: isDomainAutoRenew,
    };
  }

  function validateSubscription(): boolean {
    if (!subName || !subCost) {
      toast({
        title: "Validation Error",
        description: "Please fill in subscription name and cost",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }

  function validateDomain(): boolean {
    if (!domainName || !domainExpiryDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in domain name and expiry date",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }

  function handleCancel(): void {
    setIsOpen(false);
  }

  async function submitImport(
    extractedData: SubscriptionExtraction | DomainExtraction
  ): Promise<void> {
    setIsLoading(true);

    try {
      const extractedDataJson = JSON.stringify(extractedData);
      await createPendingImport({
        emailSubject,
        emailFrom,
        emailDate: `${emailDate}T00:00:00Z`,
        classification,
        extractedData: extractedDataJson,
        confidence,
        testMode,
      });

      toast({
        title: "Success",
        description: "Test pending import created successfully",
      });

      resetForm();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create pending import: ${String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();

    if (!emailSubject || !emailFrom || !emailDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all email metadata fields",
        variant: "destructive",
      });
      return;
    }

    if (classification === "subscription") {
      if (!validateSubscription()) {
        return;
      }
      void submitImport(buildSubscriptionData());
    } else if (classification === "domain") {
      if (!validateDomain()) {
        return;
      }
      void submitImport(buildDomainData());
    } else {
      toast({
        title: "Invalid Classification",
        description: "Junk classification is not supported for manual creation",
        variant: "destructive",
      });
    }
  }

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <EmailMetadataFields
            emailSubject={emailSubject}
            emailFrom={emailFrom}
            emailDate={emailDate}
            classification={classification}
            confidence={confidence}
            onEmailSubjectChange={setEmailSubject}
            onEmailFromChange={setEmailFrom}
            onEmailDateChange={setEmailDate}
            onClassificationChange={setClassification}
            onConfidenceChange={setConfidence}
          />

          {classification === "subscription" && (
            <SubscriptionFormFields
              name={subName}
              cost={subCost}
              currency={subCurrency}
              billingCycle={subBillingCycle}
              nextDate={subNextDate}
              category={subCategory}
              onNameChange={setSubName}
              onCostChange={setSubCost}
              onCurrencyChange={setSubCurrency}
              onBillingCycleChange={setSubBillingCycle}
              onNextDateChange={setSubNextDate}
              onCategoryChange={setSubCategory}
            />
          )}

          {classification === "domain" && (
            <DomainFormFields
              domainName={domainName}
              registrar={domainRegistrar}
              cost={domainCost}
              currency={domainCurrency}
              expiryDate={domainExpiryDate}
              registrationDate={domainRegistrationDate}
              autoRenew={isDomainAutoRenew}
              onDomainNameChange={setDomainName}
              onRegistrarChange={setDomainRegistrar}
              onCostChange={setDomainCost}
              onCurrencyChange={setDomainCurrency}
              onExpiryDateChange={setDomainExpiryDate}
              onRegistrationDateChange={setDomainRegistrationDate}
              onAutoRenewChange={setIsDomainAutoRenew}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
