import { type ReactElement } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AppSettings } from '@/lib/types';

interface DisplaySettingsProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

export function DisplaySettings({
  settings,
  onUpdate,
}: DisplaySettingsProps): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg font-semibold text-[#2a2a2a]">
          Display & Preferences
        </h3>
        <p className="text-sm text-[#6b6b6b]">
          Customize how SubScript looks and behaves.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="defaultCurrency">Default Currency</Label>
          <Select
            value={settings.defaultCurrency}
            onValueChange={(value) => onUpdate({ defaultCurrency: value })}
          >
            <SelectTrigger id="defaultCurrency" className="border-[#e5e5e5] bg-white focus:ring-0">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
              <SelectItem value="CAD">CAD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={settings.theme}
            onValueChange={(value) => onUpdate({ theme: value })}
          >
            <SelectTrigger id="theme" className="border-[#e5e5e5] bg-white focus:ring-0">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light (Cream)</SelectItem>
              <SelectItem value="dark">Dark (Ink)</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
          <Input
            id="syncInterval"
            type="number"
            min="5"
            max="1440"
            value={settings.syncIntervalMinutes}
            onChange={(e) => onUpdate({ syncIntervalMinutes: parseInt(e.target.value) || 30 })}
            className="border-[#e5e5e5] bg-white focus:border-[#2a2a2a] focus:ring-0"
          />
          <p className="text-[10px] text-[#9b9b9b]">
            How often to check for new emails.
          </p>
        </div>
      </div>
    </div>
  );
}
