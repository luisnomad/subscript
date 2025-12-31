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
import { CURRENCIES } from '@/lib/constants';

interface CostCurrencyFieldsProps {
  cost: string;
  currency: string;
  onCostChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
}

export function CostCurrencyFields({
  cost,
  currency,
  onCostChange,
  onCurrencyChange,
}: CostCurrencyFieldsProps): ReactElement {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="cost">Cost *</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          value={cost}
          onChange={e => onCostChange(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger id="currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map(curr => (
              <SelectItem key={curr} value={curr}>
                {curr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface NotesFieldProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function NotesField({
  notes,
  onNotesChange,
}: NotesFieldProps): ReactElement {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <textarea
        id="notes"
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={notes}
        onChange={e => onNotesChange(e.target.value)}
        placeholder="Any additional details..."
      />
    </div>
  );
}

interface DateFieldsProps {
  expiryDate: string;
  registrationDate: string;
  onExpiryDateChange: (value: string) => void;
  onRegistrationDateChange: (value: string) => void;
}

export function DateFields({
  expiryDate,
  registrationDate,
  onExpiryDateChange,
  onRegistrationDateChange,
}: DateFieldsProps): ReactElement {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="expiry-date">Expiry Date *</Label>
        <Input
          id="expiry-date"
          type="date"
          value={expiryDate}
          onChange={e => onExpiryDateChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registration-date">Registration Date</Label>
        <Input
          id="registration-date"
          type="date"
          value={registrationDate}
          onChange={e => onRegistrationDateChange(e.target.value)}
        />
      </div>
    </>
  );
}

interface AutoRenewFieldProps {
  autoRenew: boolean;
  onAutoRenewChange: (value: boolean) => void;
}

export function AutoRenewField({
  autoRenew,
  onAutoRenewChange,
}: AutoRenewFieldProps): ReactElement {
  return (
    <div className="flex items-center space-x-2">
      <input
        id="auto-renew"
        type="checkbox"
        checked={autoRenew}
        onChange={e => onAutoRenewChange(e.target.checked)}
        className="h-4 w-4"
      />
      <Label htmlFor="auto-renew">Auto-renew enabled</Label>
    </div>
  );
}
