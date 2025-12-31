import { type ReactElement, useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getOllamaModels } from '@/lib/tauri';
import type { AppSettings } from '@/lib/types';

interface OllamaSettingsProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

function OllamaStatus({ isReachable }: { isReachable: boolean }): ReactElement {
  return (
    <div className="rounded-lg bg-[#fdfcfb] p-4 border border-[#e5e5e5]">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[#9b9b9b]">
        Status
      </h4>
      <div className="mt-2 flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${isReachable ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-mono text-[#2a2a2a]">
          {isReachable ? 'Ollama is reachable' : 'Ollama is unreachable'}
        </span>
      </div>
    </div>
  );
}

interface UseOllamaModelsResult {
  models: string[];
  isLoading: boolean;
  error: string | null;
  fetchModels: () => Promise<void>;
}

function useOllamaModels(
  endpoint: string,
  currentModel: string,
  onUpdate: (updates: Partial<AppSettings>) => void
): UseOllamaModelsResult {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!endpoint) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const availableModels = await getOllamaModels(endpoint);
      setModels(availableModels);

      if (availableModels.length > 0) {
        if (!currentModel || !availableModels.includes(currentModel)) {
          const defaultModel = availableModels.find(m => m.toLowerCase().includes('llama')) ?? availableModels[0];
          onUpdate({ ollamaModel: defaultModel });
        }
      }
    } catch (err) {
      console.error('Failed to fetch Ollama models:', err);
      setError('Could not connect to Ollama. Make sure it is running.');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, currentModel, onUpdate]);

  useEffect(() => {
    void fetchModels();
  }, [fetchModels]);

  return { models, isLoading, error, fetchModels };
}

export function OllamaSettings({
  settings,
  onUpdate,
}: OllamaSettingsProps): ReactElement {
  const { models, isLoading, error, fetchModels } = useOllamaModels(
    settings.ollamaEndpoint,
    settings.ollamaModel,
    onUpdate
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg font-semibold text-[#2a2a2a]">
          Ollama Configuration
        </h3>
        <p className="text-sm text-[#6b6b6b]">
          Configure your local LLM for receipt extraction.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="ollamaEndpoint">API Endpoint</Label>
          <div className="flex gap-2">
            <Input
              id="ollamaEndpoint"
              placeholder="http://localhost:11434"
              value={settings.ollamaEndpoint}
              onChange={(e) => onUpdate({ ollamaEndpoint: e.target.value })}
              className="border-[#e5e5e5] bg-white focus:border-[#2a2a2a] focus:ring-0"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => { void fetchModels(); }}
              disabled={isLoading}
              title="Refresh models"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-[#9b9b9b]">
            The URL where your Ollama instance is running.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ollamaModel">Model Name</Label>
          <Select
            value={settings.ollamaModel}
            onValueChange={(value) => onUpdate({ ollamaModel: value })}
            disabled={isLoading || models.length === 0}
          >
            <SelectTrigger id="ollamaModel" className="border-[#e5e5e5] bg-white focus:border-[#2a2a2a] focus:ring-0">
              <SelectValue placeholder={isLoading ? "Loading models..." : "Select a model"} />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-[10px] text-red-500">{error}</p>}
          <p className="text-[10px] text-[#9b9b9b]">
            Recommended: llama3, mistral, or phi3.
          </p>
        </div>
      </div>

      <OllamaStatus isReachable={models.length > 0} />
    </div>
  );
}
