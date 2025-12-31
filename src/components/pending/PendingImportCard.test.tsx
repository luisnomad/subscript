import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import type { PendingImport } from '@/lib/types';
import { PendingImportCard } from './PendingImportCard';

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock tauri commands
vi.mock('@/lib/tauri', () => ({
  approvePendingImport: vi.fn(),
  rejectPendingImport: vi.fn(),
}));

const mockImport: PendingImport = {
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
};

describe('PendingImportCard', () => {
  it('renders correctly', () => {
    render(
      <PendingImportCard
        importItem={mockImport}
        isSelected={false}
        onSelect={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('Netflix Receipt')).toBeInTheDocument();
    expect(screen.getByText('info@netflix.com')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('15.99')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('calls onSelect when checkbox is clicked', () => {
    const onSelect = vi.fn();
    render(
      <PendingImportCard
        importItem={mockImport}
        isSelected={false}
        onSelect={onSelect}
        onRemove={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalledWith(1, true);
  });

  it('shows confidence score', () => {
    render(
      <PendingImportCard
        importItem={mockImport}
        isSelected={false}
        onSelect={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('99%')).toBeInTheDocument();
  });

  it('renders domain classification correctly', () => {
    const domainImport: PendingImport = {
      ...mockImport,
      id: 2,
      classification: 'domain',
      extractedData: JSON.stringify({
        domainName: 'example.com',
        registrar: 'Namecheap',
        cost: 12.99,
        currency: 'USD',
        expiryDate: '2025-01-01',
      }),
    };

    render(
      <PendingImportCard
        importItem={domainImport}
        isSelected={false}
        onSelect={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('Namecheap')).toBeInTheDocument();
    expect(screen.getByText('12.99')).toBeInTheDocument();
  });

  it('renders junk classification correctly', () => {
    const junkImport: PendingImport = {
      ...mockImport,
      id: 3,
      classification: 'junk',
      extractedData: '{}',
    };

    render(
      <PendingImportCard
        importItem={junkImport}
        isSelected={false}
        onSelect={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('junk')).toBeInTheDocument();
    expect(screen.getByText('No data extracted for junk mail')).toBeInTheDocument();
  });

  it('calls handleApprove when approve button is clicked', async () => {
    const onRemove = vi.fn();
    const tauri = await import('@/lib/tauri');
    
    render(
      <PendingImportCard
        importItem={mockImport}
        isSelected={false}
        onSelect={() => {}}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByText('Approve'));
    
    expect(tauri.approvePendingImport).toHaveBeenCalledWith(1, null, false);
    await vi.waitFor(() => expect(onRemove).toHaveBeenCalledWith(1));
  });

  it('calls handleReject when reject button is clicked', async () => {
    const onRemove = vi.fn();
    const tauri = await import('@/lib/tauri');
    
    render(
      <PendingImportCard
        importItem={mockImport}
        isSelected={false}
        onSelect={() => {}}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByText('Reject'));
    
    expect(tauri.rejectPendingImport).toHaveBeenCalledWith(1, false);
    await vi.waitFor(() => expect(onRemove).toHaveBeenCalledWith(1));
  });

  it('opens edit dialog when edit button is clicked', () => {
    render(
      <PendingImportCard
        importItem={mockImport}
        isSelected={false}
        onSelect={() => {}}
        onRemove={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    // The dialog is rendered by EditDialog which we might need to mock or just check for its content
    expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
  });
});
