import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as tauri from '@/lib/tauri';
import type { PendingImport } from '@/lib/types';

import { PendingQueueView } from './PendingQueueView';

// Mock the tauri module
vi.mock('@/lib/tauri', () => ({
  getPendingImports: vi.fn(),
}));

const mockImports: PendingImport[] = [
  {
    id: 1,
    emailSubject: 'Netflix Receipt',
    emailFrom: 'info@netflix.com',
    emailDate: '2024-01-01',
    classification: 'subscription',
    extractedData: JSON.stringify({
      name: 'Netflix',
      cost: 15.99,
      currency: 'USD',
      billingCycle: 'monthly',
    }),
    confidence: 0.99,
    receiptId: null,
    status: 'pending',
    createdAt: '2024-01-01T10:00:00Z',
  },
];

describe('PendingQueueView', () => {
  it('renders loading state initially', () => {
    vi.mocked(tauri.getPendingImports).mockReturnValue(new Promise(() => {}));
    render(<PendingQueueView />);
    expect(screen.getByText(/Loading receipts/i)).toBeInTheDocument();
  });

  it('renders empty state when no imports', async () => {
    vi.mocked(tauri.getPendingImports).mockResolvedValue([]);
    render(<PendingQueueView />);

    await waitFor(() => {
      expect(
        screen.getByText(/No pending receipts to review/i)
      ).toBeInTheDocument();
    });
  });

  it('renders imports when data is loaded', async () => {
    vi.mocked(tauri.getPendingImports).mockResolvedValue(mockImports);
    render(<PendingQueueView />);

    await waitFor(() => {
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
      expect(screen.getByText('Netflix Receipt')).toBeInTheDocument();
      expect(
        screen.getByText('1 receipt awaiting approval')
      ).toBeInTheDocument();
    });
  });

  it('handles error during loading', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(tauri.getPendingImports).mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(<PendingQueueView />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load pending imports:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
