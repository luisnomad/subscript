import React, { useState } from "react";

import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  PendingImport,
  SubscriptionExtraction,
  DomainExtraction,
  BillingCycle,
} from "@/lib/types";

interface EditDialogProps {
  importItem: PendingImport;
  onSave: (editedData: string) => Promise<void>;
  onCancel: () => void;
}

export function EditDialog({
  importItem,
  onSave,
  onCancel,
}: EditDialogProps): React.ReactElement {
  const extractedData = JSON.parse(
    importItem.extractedData
  ) as SubscriptionExtraction | DomainExtraction;

  const [formData, setFormData] = useState(extractedData);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(): Promise<void> {
    setIsSaving(true);
    await onSave(JSON.stringify(formData));
    setIsSaving(false);
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="border-2 border-[#2a2a2a] bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#2a2a2a]">
            Edit {importItem.classification === "subscription" ? "Subscription" : "Domain"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {importItem.classification === "subscription" ? (
            <SubscriptionForm
              data={formData as SubscriptionExtraction}
              onChange={setFormData}
            />
          ) : (
            <DomainForm
              data={formData as DomainExtraction}
              onChange={setFormData}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 border-2 border-[#e5e5e5] bg-white px-4 py-2 font-mono text-sm font-medium text-[#2a2a2a] transition-all hover:border-[#2a2a2a] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={() => {void handleSave();}}
            disabled={isSaving}
            className="border-2 border-[#2d5f4f] bg-[#2d5f4f] px-4 py-2 font-mono text-sm font-medium text-white transition-all hover:bg-[#2d5f4f]/90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save & Approve"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionForm({
  data,
  onChange,
}: {
  data: SubscriptionExtraction;
  onChange: (data: SubscriptionExtraction) => void;
}): React.ReactElement {
  return (
    <>
      <div>
        <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
          Name
        </label>
        <Input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="border-2 border-[#e5e5e5] font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
            Cost
          </label>
          <Input
            type="number"
            step="0.01"
            value={data.cost}
            onChange={(e) =>
              onChange({ ...data, cost: parseFloat(e.target.value) })
            }
            className="border-2 border-[#e5e5e5] font-mono"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
            Currency
          </label>
          <Input
            value={data.currency}
            onChange={(e) => onChange({ ...data, currency: e.target.value })}
            className="border-2 border-[#e5e5e5] font-mono"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
          Billing Cycle
        </label>
        <Select
          value={data.billingCycle}
          onValueChange={(value) =>
            onChange({ ...data, billingCycle: value as BillingCycle })
          }
        >
          <SelectTrigger className="border-2 border-[#e5e5e5] font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="one-time">One-time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
          Category (optional)
        </label>
        <Input
          value={data.category ?? ""}
          onChange={(e) => onChange({ ...data, category: e.target.value || undefined })}
          className="border-2 border-[#e5e5e5] font-mono"
        />
      </div>
    </>
  );
}

function DomainForm({
  data,
  onChange,
}: {
  data: DomainExtraction;
  onChange: (data: DomainExtraction) => void;
}): React.ReactElement {
  return (
    <>
      <div>
        <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
          Domain Name
        </label>
        <Input
          value={data.domainName}
          onChange={(e) => onChange({ ...data, domainName: e.target.value })}
          className="border-2 border-[#e5e5e5] font-mono"
        />
      </div>
      <div>
        <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
          Registrar
        </label>
        <Input
          value={data.registrar}
          onChange={(e) => onChange({ ...data, registrar: e.target.value })}
          className="border-2 border-[#e5e5e5] font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
            Cost
          </label>
          <Input
            type="number"
            step="0.01"
            value={data.cost}
            onChange={(e) =>
              onChange({ ...data, cost: parseFloat(e.target.value) })
            }
            className="border-2 border-[#e5e5e5] font-mono"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
            Currency
          </label>
          <Input
            value={data.currency}
            onChange={(e) => onChange({ ...data, currency: e.target.value })}
            className="border-2 border-[#e5e5e5] font-mono"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block font-mono text-sm font-medium text-[#2a2a2a]">
          Expiry Date
        </label>
        <Input
          type="date"
          value={data.expiryDate}
          onChange={(e) => onChange({ ...data, expiryDate: e.target.value })}
          className="border-2 border-[#e5e5e5] font-mono"
        />
      </div>
    </>
  );
}
