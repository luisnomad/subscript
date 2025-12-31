import { type ReactElement } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BILLING_CYCLES } from '@/lib/constants';
import type { BillingCycle } from '@/lib/types';

import { CostCurrencyFields } from './FormSubComponents';

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
}: SubscriptionFormFieldsProps): ReactElement {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Subscription Data</h3>

      <div className="space-y-2">
        <Label htmlFor="sub-name">Service Name *</Label>
        <Input
          id="sub-name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Netflix"
          required
        />
      </div>

      <CostCurrencyFields
        cost={cost}
        currency={currency}
        onCostChange={onCostChange}
        onCurrencyChange={onCurrencyChange}
      />

      <BillingCycleField
        billingCycle={billingCycle}
        onBillingCycleChange={onBillingCycleChange}
      />

      <DateAndCategoryFields
        nextDate={nextDate}
        category={category}
        onNextDateChange={onNextDateChange}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
}

interface DateAndCategoryFieldsProps {
  nextDate: string;
  category: string;
  onNextDateChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

function DateAndCategoryFields({
  nextDate,
  category,
  onNextDateChange,
  onCategoryChange,
}: DateAndCategoryFieldsProps): ReactElement {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="next-date">Next Billing Date</Label>
        <Input
          id="next-date"
          type="date"
          value={nextDate}
          onChange={e => onNextDateChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={category}
          onChange={e => onCategoryChange(e.target.value)}
          placeholder="Entertainment"
        />
      </div>
    </>
  );
}

interface BillingCycleFieldProps {
  billingCycle: BillingCycle;
  onBillingCycleChange: (value: BillingCycle) => void;
}

function BillingCycleField({
  billingCycle,
  onBillingCycleChange,
}: BillingCycleFieldProps): ReactElement {
  return (
    <div className="space-y-2">
      <Label htmlFor="billing-cycle">Billing Cycle</Label>
      <Select value={billingCycle} onValueChange={onBillingCycleChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BILLING_CYCLES.map(cycle => (
            <SelectItem key={cycle} value={cycle}>
              {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
