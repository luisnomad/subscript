import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMPORT_CLASSIFICATIONS } from "@/lib/constants";

interface EmailMetadataFieldsProps {
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  classification: string;
  confidence: number;
  onEmailSubjectChange: (value: string) => void;
  onEmailFromChange: (value: string) => void;
  onEmailDateChange: (value: string) => void;
  onClassificationChange: (value: string) => void;
  onConfidenceChange: (value: number) => void;
}

export function EmailMetadataFields({
  emailSubject,
  emailFrom,
  emailDate,
  classification,
  confidence,
  onEmailSubjectChange,
  onEmailFromChange,
  onEmailDateChange,
  onClassificationChange,
  onConfidenceChange,
}: EmailMetadataFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Email Metadata</h3>

      <div className="space-y-2">
        <Label htmlFor="subject">Email Subject *</Label>
        <Input
          id="subject"
          value={emailSubject}
          onChange={(e) => onEmailSubjectChange(e.target.value)}
          placeholder="Your Netflix subscription receipt"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="from">From *</Label>
        <Input
          id="from"
          type="email"
          value={emailFrom}
          onChange={(e) => onEmailFromChange(e.target.value)}
          placeholder="billing@netflix.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={emailDate}
          onChange={(e) => onEmailDateChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classification">Classification *</Label>
        <Select value={classification} onValueChange={onClassificationChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {IMPORT_CLASSIFICATIONS.filter((c) => c !== "junk").map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confidence">
          Confidence Score: {confidence.toFixed(2)}
        </Label>
        <input
          id="confidence"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={confidence}
          onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
