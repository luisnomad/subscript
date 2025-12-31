import { useState, type ReactElement } from 'react';

import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateMultipleMockImports } from '@/lib/mockDataGenerator';
import { createPendingImport } from '@/lib/tauri';

interface GenerateMockDataButtonProps {
  onSuccess?: () => void;
  testMode?: boolean;
}

const COUNT_THREE = 3;
const COUNT_FIVE = 5;
const COUNT_TEN = 10;
const MOCK_COUNTS = [1, COUNT_THREE, COUNT_FIVE, COUNT_TEN];

export function GenerateMockDataButton({
  onSuccess,
  testMode = false,
}: GenerateMockDataButtonProps): ReactElement {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState('5');

  async function handleGenerate(): Promise<void> {
    setIsLoading(true);

    try {
      const mockData = generateMultipleMockImports(parseInt(count, 10));

      for (const mock of mockData) {
        await createPendingImport({
          emailSubject: mock.emailSubject,
          emailFrom: mock.emailFrom,
          emailDate: `${mock.emailDate}T00:00:00Z`,
          classification: mock.classification,
          extractedData: mock.extractedData,
          confidence: mock.confidence,
          testMode,
        });
      }

      toast({
        title: 'Success',
        description: `Generated ${mockData.length} mock pending ${
          mockData.length === 1 ? 'import' : 'imports'
        }`,
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to generate mock data: ${String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel(): void {
    setIsOpen(false);
  }

  function handleGenerateClick(): void {
    void handleGenerate();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Mock Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Mock Data</DialogTitle>
          <DialogDescription>
            Quickly create test pending imports with realistic subscription and
            domain data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="count">Number of imports to generate</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger id="count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_COUNTS.map(num => (
                  <SelectItem key={num} value={String(num)}>
                    {num} {num === 1 ? 'import' : 'imports'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-[#e5e5e5] bg-[#faf8f5] p-3">
            <p className="font-mono text-xs text-[#6b6b6b]">
              Mock data includes popular services like Netflix, Spotify, GitHub,
              and realistic domain registrations with varied confidence scores.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleGenerateClick} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
