import React from "react";

import {
  Calendar,
  DollarSign,
  RefreshCw,
  Globe,
} from "lucide-react";

import type { SubscriptionExtraction, DomainExtraction } from "@/lib/types";

interface SubscriptionFieldsProps {
  data: SubscriptionExtraction;
}

export function SubscriptionFields({
  data,
}: SubscriptionFieldsProps): React.ReactElement {
  return (
    <>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg font-bold text-[#2a2a2a]">
          {data.name}
        </p>
        <div className="flex items-baseline gap-1">
          <DollarSign className="h-4 w-4 text-[#d4a574]" />
          <p className="font-mono text-xl font-bold text-[#2a2a2a]">
            {data.cost.toFixed(2)}
          </p>
          <p className="font-mono text-sm text-[#6b6b6b]">{data.currency}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <RefreshCw className="h-3.5 w-3.5 text-[#6b6b6b]" />
        <p className="font-mono text-[#6b6b6b]">
          Billed {data.billingCycle}
        </p>
      </div>
      {data.nextBillingDate && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-3.5 w-3.5 text-[#6b6b6b]" />
          <p className="font-mono text-[#6b6b6b]">
            Next: {new Date(data.nextBillingDate).toLocaleDateString()}
          </p>
        </div>
      )}
      {data.category && (
        <p className="font-mono text-xs text-[#6b6b6b]">
          Category: {data.category}
        </p>
      )}
    </>
  );
}

interface DomainFieldsProps {
  data: DomainExtraction;
}

export function DomainFields({
  data,
}: DomainFieldsProps): React.ReactElement {
  return (
    <>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-[#2d5f4f]" />
        <p className="font-mono text-lg font-bold text-[#2a2a2a]">
          {data.domainName}
        </p>
      </div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-sm text-[#6b6b6b]">{data.registrar}</p>
        <div className="flex items-baseline gap-1">
          <DollarSign className="h-4 w-4 text-[#2d5f4f]" />
          <p className="font-mono text-xl font-bold text-[#2a2a2a]">
            {data.cost.toFixed(2)}
          </p>
          <p className="font-mono text-sm text-[#6b6b6b]">{data.currency}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-3.5 w-3.5 text-[#6b6b6b]" />
        <p className="font-mono text-[#6b6b6b]">
          Expires: {new Date(data.expiryDate).toLocaleDateString()}
        </p>
      </div>
      {data.autoRenew !== undefined && (
        <p className="font-mono text-xs text-[#6b6b6b]">
          Auto-renew: {data.autoRenew ? "Yes" : "No"}
        </p>
      )}
    </>
  );
}
