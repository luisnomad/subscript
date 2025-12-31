import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AutoRenewField,
  CostCurrencyFields,
  DateFields,
} from "./FormSubComponents";

interface DomainFormFieldsProps {
  domainName: string;
  registrar: string;
  cost: string;
  currency: string;
  expiryDate: string;
  registrationDate: string;
  autoRenew: boolean;
  onDomainNameChange: (value: string) => void;
  onRegistrarChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onRegistrationDateChange: (value: string) => void;
  onAutoRenewChange: (value: boolean) => void;
}

export function DomainFormFields({
  domainName,
  registrar,
  cost,
  currency,
  expiryDate,
  registrationDate,
  autoRenew,
  onDomainNameChange,
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

      <BasicInfoFields
        domainName={domainName}
        registrar={registrar}
        onDomainNameChange={onDomainNameChange}
        onRegistrarChange={onRegistrarChange}
      />

      <CostCurrencyFields
        cost={cost}
        currency={currency}
        onCostChange={onCostChange}
        onCurrencyChange={onCurrencyChange}
      />

      <DateFields
        expiryDate={expiryDate}
        registrationDate={registrationDate}
        onExpiryDateChange={onExpiryDateChange}
        onRegistrationDateChange={onRegistrationDateChange}
      />

      <AutoRenewField
        autoRenew={autoRenew}
        onAutoRenewChange={onAutoRenewChange}
      />
    </div>
  );
}

interface BasicInfoFieldsProps {
  domainName: string;
  registrar: string;
  onDomainNameChange: (value: string) => void;
  onRegistrarChange: (value: string) => void;
}

function BasicInfoFields({
  domainName,
  registrar,
  onDomainNameChange,
  onRegistrarChange,
}: BasicInfoFieldsProps): JSX.Element {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="domain-name">Domain Name *</Label>
        <Input
          id="domain-name"
          value={domainName}
          onChange={(e) => onDomainNameChange(e.target.value)}
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
    </>
  );
}
