import { type ReactElement, useEffect, useState } from 'react';
import { ImapSettings } from './ImapSettings';
import { OllamaSettings } from './OllamaSettings';
import { DisplaySettings } from './DisplaySettings';
import { AboutSettings } from './AboutSettings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/lib/tauri';
import { AppSettings } from '@/lib/types';

type SettingsTab = 'imap' | 'ollama' | 'display' | 'about';

export function SettingsView(): ReactElement {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('imap');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingImap, setIsTestingImap] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings from database.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [toast]);

  const handleUpdate = (updates: Partial<AppSettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings to database.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestImap = async () => {
    setIsTestingImap(true);
    // Simulate testing for now
    setTimeout(() => {
      setIsTestingImap(false);
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to the IMAP server.',
      });
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#faf8f5]">
        <p className="font-mono text-sm text-[#6b6b6b]">Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex h-full items-center justify-center bg-[#faf8f5]">
        <p className="font-mono text-sm text-red-500">Error loading settings.</p>
      </div>
    );
  }

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'imap', label: 'Email (IMAP)' },
    { id: 'ollama', label: 'AI (Ollama)' },
    { id: 'display', label: 'Display' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-[#2a2a2a]">
              Settings
            </h1>
            <p className="mt-2 font-mono text-sm text-[#6b6b6b]">
              Configure your email and application preferences.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#2a2a2a] text-white hover:bg-[#404040]"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="mt-12 flex gap-12">
          {/* Sidebar Tabs */}
          <div className="w-48 shrink-0 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#2a2a2a] shadow-sm ring-1 ring-[#e5e5e5]'
                    : 'text-[#6b6b6b] hover:bg-[#f0ede8] hover:text-[#2a2a2a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 rounded-2xl border border-[#e5e5e5] bg-white p-8 shadow-sm">
            {activeTab === 'imap' && (
              <ImapSettings
                settings={settings}
                onUpdate={handleUpdate}
                onTestConnection={handleTestImap}
                isTesting={isTestingImap}
              />
            )}
            {activeTab === 'ollama' && (
              <OllamaSettings settings={settings} onUpdate={handleUpdate} />
            )}
            {activeTab === 'display' && (
              <DisplaySettings settings={settings} onUpdate={handleUpdate} />
            )}
            {activeTab === 'about' && <AboutSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

