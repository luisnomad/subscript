import { type ReactElement } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AppSettings } from '@/lib/types';

interface ImapSettingsProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
  onTestConnection: () => void;
  isTesting: boolean;
}

export function ImapSettings({
  settings,
  onUpdate,
  onTestConnection,
  isTesting,
}: ImapSettingsProps): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg font-semibold text-[#2a2a2a]">
          IMAP Configuration
        </h3>
        <p className="text-sm text-[#6b6b6b]">
          Configure the email account where you receive your receipts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="imapServer">IMAP Server</Label>
          <Input
            id="imapServer"
            placeholder="imap.gmail.com"
            value={settings.imapServer}
            onChange={(e) => onUpdate({ imapServer: e.target.value })}
            className="border-[#e5e5e5] bg-white focus:border-[#2a2a2a] focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imapPort">Port</Label>
          <Input
            id="imapPort"
            type="number"
            placeholder="993"
            value={settings.imapPort}
            onChange={(e) => onUpdate({ imapPort: parseInt(e.target.value) || 0 })}
            className="border-[#e5e5e5] bg-white focus:border-[#2a2a2a] focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imapUsername">Email Address</Label>
          <Input
            id="imapUsername"
            type="email"
            placeholder="your@email.com"
            value={settings.imapUsername}
            onChange={(e) => onUpdate({ imapUsername: e.target.value })}
            className="border-[#e5e5e5] bg-white focus:border-[#2a2a2a] focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imapPassword">App Password</Label>
          <Input
            id="imapPassword"
            type="password"
            placeholder="••••••••••••••••"
            className="border-[#e5e5e5] bg-white focus:border-[#2a2a2a] focus:ring-0"
            // Note: Password is not stored in AppSettings for security, 
            // it should be handled separately or via a secure vault.
            // For now, we'll just show the field.
          />
          <p className="text-[10px] text-[#9b9b9b]">
            Use an App Password if you have 2FA enabled.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="imapUseSsl"
          checked={settings.imapUseSsl}
          onCheckedChange={(checked) =>
            onUpdate({ imapUseSsl: checked === true })
          }
        />
        <Label
          htmlFor="imapUseSsl"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Use SSL/TLS
        </Label>
      </div>

      <div className="pt-4">
        <Button
          variant="outline"
          onClick={onTestConnection}
          disabled={isTesting}
          className="border-[#2a2a2a] text-[#2a2a2a] hover:bg-[#2a2a2a] hover:text-white"
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
      </div>
    </div>
  );
}
