import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BILLING_CYCLES, CURRENCIES } from "@/lib/constants";
import type { BillingCycle } from "@/lib/types";

interface SubscriptionFormFieldsProps {
  name: string;
  cost: string;
  currency: string;
  billingCycle: BillingCycle;
  nextDate: string;
  category: string;
  onNameChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onBillingCycleChange: (value: BillingCycle) => void;
  onNextDateChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function SubscriptionFormFields({
  name,
  cost,
  currency,
  billingCycle,
  nextDate,
  category,
  onNameChange,
  onCostChange,
  onCurrencyChange,
  onBillingCycleChange,
  onNextDateChange,
  onCategoryChange,
}: SubscriptionFormFieldsProps): JSX.Element {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Subscription Data</h3>

      <div className="space-y-2">
        <Label htmlFor="sub-name">Service Name *</Label>
        <Input
          id="sub-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Netflix"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sub-cost">Cost *</Label>
          <Input
            id="sub-cost"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => onCostChange(e.target.value)}
            placeholder="15.99"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub-currency">Currency</Label>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="billing-cycle">Billing Cycle</Label>
        <Select value={billingCycle} onValueChange={onBillingCycleChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BILLING_CYCLES.map((cycle) => (
              <SelectItem key={cycle} value={cycle}>
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="next-date">Next Billing Date</Label>
        <Input
          id="next-date"
          type="date"
          value={nextDate}
          onChange={(e) => onNextDateChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="Entertainment"
        />
      </div>
    </div>
  );
}
