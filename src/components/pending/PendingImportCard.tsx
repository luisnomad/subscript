import { type ReactElement, useState } from 'react';

import { Check, X, Edit2, Mail, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { approvePendingImport, rejectPendingImport } from '@/lib/tauri';
import type {
  PendingImport,
  SubscriptionExtraction,
  DomainExtraction,
} from '@/lib/types';

import { ConfidenceScore } from './ConfidenceScore';
import { EditDialog } from './EditDialog';
import { SubscriptionFields, DomainFields } from './ImportDataFields';

interface PendingImportCardProps {
  importItem: PendingImport;
  isSelected: boolean;
  onSelect: (id: number, selected: boolean) => void;
  onRemove: (id: number) => void;
}

export function PendingImportCard({
  importItem,
  isSelected,
  onSelect,
  onRemove,
}: PendingImportCardProps): ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();

  // Debug log and safety check
  if (!importItem.extractedData) {
    console.error('Missing extractedData for import:', importItem);
    console.error('Import item keys:', Object.keys(importItem));
    console.error('Import item values:', Object.values(importItem));
    return (
      <Card className="p-4">
        <p className="text-red-500">Error: Missing data for this import</p>
      </Card>
    );
  }

  const extractedData = JSON.parse(importItem.extractedData) as
    | SubscriptionExtraction
    | DomainExtraction;

  async function handleApprove(): Promise<void> {
    try {
      setIsApproving(true);
      await approvePendingImport(importItem.id, null, false);
      toast({
        title: 'Approved',
        description: `${importItem.classification === 'subscription' ? 'Subscription' : 'Domain'} added successfully`,
      });
      onRemove(importItem.id);
    } catch (error) {
      console.error('Approve failed:', error);
      toast({
        title: 'Error',
        description: `Failed to approve import: ${String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject(): Promise<void> {
    try {
      setIsRejecting(true);
      await rejectPendingImport(importItem.id, false);
      toast({
        title: 'Rejected',
        description: 'Import removed from queue',
      });
      onRemove(importItem.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject import',
        variant: 'destructive',
      });
    } finally {
      setIsRejecting(false);
    }
  }

  async function handleSaveEdit(editedData: string): Promise<void> {
    try {
      await approvePendingImport(importItem.id, editedData, false);
      toast({
        title: 'Saved',
        description: 'Changes approved and saved',
      });
      onRemove(importItem.id);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <Card
        className={`receipt-card group relative overflow-hidden border-2 bg-white transition-all ${
          isSelected
            ? 'border-[#d4a574] shadow-xl'
            : 'border-[#e5e5e5] hover:border-[#2a2a2a] hover:shadow-lg'
        }`}
      >
        {/* Selection Checkbox */}
        <div className="absolute left-4 top-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={checked =>
              onSelect(importItem.id, checked as boolean)
            }
            className="border-2 border-[#2a2a2a]"
          />
        </div>

        {/* Classification Badge */}
        <div className="absolute right-4 top-4">
          <Badge
            className={`receipt-stamp border-2 font-mono text-xs font-bold uppercase tracking-wider ${
              importItem.classification === 'subscription'
                ? 'border-[#d4a574] bg-[#d4a574]/10 text-[#d4a574]'
                : 'border-[#2d5f4f] bg-[#2d5f4f]/10 text-[#2d5f4f]'
            }`}
          >
            {importItem.classification}
          </Badge>
        </div>

        <div className="p-6 pt-14">
          {/* Email Metadata */}
          <div className="mb-4 space-y-2 border-b-2 border-dashed border-[#e5e5e5] pb-4">
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6b6b6b]" />
              <p className="font-mono text-xs text-[#6b6b6b] line-clamp-1">
                {importItem.emailFrom}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6b6b6b]" />
              <p className="font-mono text-xs text-[#6b6b6b]">
                {new Date(importItem.emailDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <p className="font-display text-sm font-medium text-[#2a2a2a] line-clamp-2">
              {importItem.emailSubject}
            </p>
          </div>

          {/* Extracted Data */}
          <div className="mb-4 space-y-3">
            {importItem.classification === 'subscription' ? (
              <SubscriptionFields
                data={extractedData as SubscriptionExtraction}
              />
            ) : importItem.classification === 'domain' ? (
              <DomainFields data={extractedData as DomainExtraction} />
            ) : (
              <div className="rounded-md border-2 border-dashed border-[#e5e5e5] p-4 text-center">
                <p className="font-mono text-xs text-[#6b6b6b]">
                  No data extracted for junk mail
                </p>
              </div>
            )}
          </div>

          {/* Confidence Score */}
          <div className="mb-4">
            <ConfidenceScore score={importItem.confidence} />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                void handleApprove();
              }}
              disabled={isApproving || isRejecting}
              className="flex items-center justify-center gap-2 border-2 border-[#2d5f4f] bg-[#2d5f4f] px-3 py-2 font-mono text-sm font-medium text-white transition-all hover:bg-[#2d5f4f]/90 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Approve</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isApproving || isRejecting}
              className="flex items-center justify-center gap-2 border-2 border-[#2a2a2a] bg-white px-3 py-2 font-mono text-sm font-medium text-[#2a2a2a] transition-all hover:bg-[#2a2a2a] hover:text-white disabled:opacity-50"
            >
              <Edit2 className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => {
                void handleReject();
              }}
              disabled={isApproving || isRejecting}
              className="flex items-center justify-center gap-2 border-2 border-[#c45a5a] bg-white px-3 py-2 font-mono text-sm font-medium text-[#c45a5a] transition-all hover:bg-[#c45a5a] hover:text-white disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Reject</span>
            </button>
          </div>
        </div>
      </Card>

      {isEditing && (
        <EditDialog
          importItem={importItem}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
