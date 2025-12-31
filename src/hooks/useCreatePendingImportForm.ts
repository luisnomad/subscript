import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { createPendingImport } from "@/lib/tauri";
import type {
  BillingCycle,
  DomainExtraction,
  SubscriptionExtraction,
} from "@/lib/types";

const DEFAULT_CONFIDENCE = 0.85;

interface FormState {
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  classification: string;
  confidence: number;
  subName: string;
  subCost: string;
  subCurrency: string;
  subBillingCycle: BillingCycle;
  subNextDate: string;
  subCategory: string;
  domainName: string;
  domainRegistrar: string;
  domainCost: string;
  domainCurrency: string;
  domainExpiryDate: string;
  domainRegistrationDate: string;
  isDomainAutoRenew: boolean;
}

const INITIAL_STATE: FormState = {
  emailSubject: "",
  emailFrom: "",
  emailDate: new Date().toISOString().split("T")[0] ?? "",
  classification: "subscription",
  confidence: DEFAULT_CONFIDENCE,
  subName: "",
  subCost: "",
  subCurrency: "USD",
  subBillingCycle: "monthly",
  subNextDate: "",
  subCategory: "",
  domainName: "",
  domainRegistrar: "",
  domainCost: "",
  domainCurrency: "USD",
  domainExpiryDate: "",
  domainRegistrationDate: "",
  isDomainAutoRenew: true,
};

export interface CreatePendingImportFormReturn {
  state: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent, setIsOpen: (open: boolean) => void) => void;
}

function buildSubscriptionData(state: FormState): SubscriptionExtraction {
  return {
    name: state.subName,
    cost: parseFloat(state.subCost),
    currency: state.subCurrency,
    billingCycle: state.subBillingCycle,
    ...(state.subNextDate && { nextBillingDate: state.subNextDate }),
    ...(state.subCategory && { category: state.subCategory }),
  };
}

function buildDomainData(state: FormState): DomainExtraction {
  return {
    domainName: state.domainName,
    registrar: state.domainRegistrar,
    cost: state.domainCost ? parseFloat(state.domainCost) : 0,
    currency: state.domainCurrency,
    expiryDate: state.domainExpiryDate,
    ...(state.domainRegistrationDate && { registrationDate: state.domainRegistrationDate }),
    autoRenew: state.isDomainAutoRenew,
  };
}

interface SubmitImportParams {
  state: FormState;
  extractedData: SubscriptionExtraction | DomainExtraction;
  testMode: boolean;
  setIsLoading: (loading: boolean) => void;
  setIsOpen: (open: boolean) => void;
  toast: ReturnType<typeof useToast>["toast"];
  onSuccess?: () => void;
  resetState?: () => void;
}

async function performSubmitImport({
  state,
  extractedData,
  testMode,
  setIsLoading,
  setIsOpen,
  toast,
  onSuccess,
  resetState,
}: SubmitImportParams): Promise<void> {
  setIsLoading(true);
  try {
    await createPendingImport({
      emailSubject: state.emailSubject,
      emailFrom: state.emailFrom,
      emailDate: `${state.emailDate}T00:00:00Z`,
      classification: state.classification,
      extractedData: JSON.stringify(extractedData),
      confidence: state.confidence,
      testMode,
    });
    toast({ title: "Success", description: "Test pending import created successfully" });
    resetState?.();
    setIsOpen(false);
    onSuccess?.();
  } catch (error) {
    toast({ title: "Error", description: `Failed to create pending import: ${String(error)}`, variant: "destructive" });
  } finally {
    setIsLoading(false);
  }
}

function validateForm(state: FormState, toast: ReturnType<typeof useToast>["toast"]): boolean {
  if (!state.emailSubject || !state.emailFrom || !state.emailDate) {
    toast({ title: "Validation Error", description: "Please fill in all email metadata fields", variant: "destructive" });
    return false;
  }
  if (state.classification === "subscription" && (!state.subName || !state.subCost)) {
    toast({ title: "Validation Error", description: "Please fill in subscription name and cost", variant: "destructive" });
    return false;
  }
  if (state.classification === "domain" && (!state.domainName || !state.domainExpiryDate)) {
    toast({ title: "Validation Error", description: "Please fill in domain name and expiry date", variant: "destructive" });
    return false;
  }
  return true;
}

export function useCreatePendingImportForm(
  onSuccess?: () => void,
  testMode = false
): CreatePendingImportFormReturn {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<FormState>(INITIAL_STATE);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent, setIsOpen: (open: boolean) => void): void => {
    e.preventDefault();
    if (!validateForm(state, toast)) {
      return;
    }

    const extractedData = state.classification === "subscription"
      ? buildSubscriptionData(state)
      : buildDomainData(state);

    void performSubmitImport({
      state,
      extractedData,
      testMode,
      setIsLoading,
      setIsOpen,
      toast,
      onSuccess,
      resetState: () => setState(INITIAL_STATE),
    });
  };

  return { state, updateField, isLoading, handleSubmit };
}
