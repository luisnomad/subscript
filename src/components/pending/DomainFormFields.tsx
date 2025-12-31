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
import { CURRENCIES } from "@/lib/constants";

interface DomainFormFieldsProps {
  name: string;
  registrar: string;
  cost: string;
  currency: string;
  expiryDate: string;
  registrationDate: string;
  isAutoRenew: boolean;
  onNameChange: (value: string) => void;
  onRegistrarChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onRegistrationDateChange: (value: string) => void;
  onAutoRenewChange: (value: boolean) => void;
}

export function DomainFormFields({
  name,
  registrar,
  cost,
  currency,
  expiryDate,
  registrationDate,
  isAutoRenew,
  onNameChange,
  onRegistrarChange,
  onCostChange,
  onCurrencyChange,
  onExpiryDateChange,
  onRegistrationDateChange,
  onAutoRenewChange,
}: DomainFormFieldsProps): JSX.Element {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Domain Data</h3>

      <div className="space-y-2">
        <Label htmlFor="domain-name">Domain Name *</Label>
        <Input
          id="domain-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registrar">Registrar</Label>
        <Input
          id="registrar"
          value={registrar}
          onChange={(e) => onRegistrarChange(e.target.value)}
          placeholder="Namecheap"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="domain-cost">Cost</Label>
          <Input
            id="domain-cost"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => onCostChange(e.target.value)}
            placeholder="12.99"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain-currency">Currency</Label>
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
        <Label htmlFor="expiry-date">Expiry Date *</Label>
        <Input
          id="expiry-date"
          type="date"
          value={expiryDate}
          onChange={(e) => onExpiryDateChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registration-date">Registration Date</Label>
        <Input
          id="registration-date"
          type="date"
          value={registrationDate}
          onChange={(e) => onRegistrationDateChange(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="auto-renew"
          type="checkbox"
          checked={isAutoRenew}
          onChange={(e) => onAutoRenewChange(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="auto-renew">Auto-renew enabled</Label>
      </div>
    </div>
  );
}
