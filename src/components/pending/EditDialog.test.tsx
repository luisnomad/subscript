import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import type { PendingImport } from '@/lib/types';
import { EditDialog } from './EditDialog';

const mockSubscriptionImport: PendingImport = {
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

const mockDomainImport: PendingImport = {
  id: 2,
  emailSubject: 'Domain Renewal',
  emailFrom: 'support@namecheap.com',
  emailDate: '2024-01-01',
  classification: 'domain',
  extractedData: JSON.stringify({
    domainName: 'example.com',
    registrar: 'Namecheap',
    cost: 12.99,
    currency: 'USD',
    expiryDate: '2025-01-01',
  }),
  confidence: 0.95,
  receiptId: null,
  status: 'pending',
  createdAt: '2024-01-01T10:00:00Z',
};

describe('EditDialog', () => {
  it('renders subscription form correctly', () => {
    render(
      <EditDialog
        importItem={mockSubscriptionImport}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Netflix');
    expect(screen.getByLabelText('Cost')).toHaveValue(15.99);
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');
  });

  it('renders domain form correctly', () => {
    render(
      <EditDialog
        importItem={mockDomainImport}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Edit Domain')).toBeInTheDocument();
    expect(screen.getByLabelText('Domain Name')).toHaveValue('example.com');
    expect(screen.getByLabelText('Registrar')).toHaveValue('Namecheap');
    expect(screen.getByLabelText('Expiry Date')).toHaveValue('2025-01-01');
  });

  it('calls onSave with updated data when save button is clicked', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditDialog
        importItem={mockSubscriptionImport}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Netflix Premium' } });
    fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '19.99' } });
    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'EUR' } });
    fireEvent.change(screen.getByLabelText('Category (optional)'), { target: { value: 'Entertainment' } });
    
    fireEvent.click(screen.getByText('Save & Approve'));

    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('Netflix Premium'));
    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('19.99'));
    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('EUR'));
    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('Entertainment'));
  });

  it('updates billing cycle via select', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditDialog
        importItem={mockSubscriptionImport}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    );

    // Open select
    fireEvent.click(screen.getByRole('combobox'));
    // Select yearly
    fireEvent.click(screen.getByText('Yearly'));
    
    fireEvent.click(screen.getByText('Save & Approve'));

    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('yearly'));
  });

  it('updates domain form fields', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditDialog
        importItem={mockDomainImport}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Domain Name'), { target: { value: 'new-example.com' } });
    fireEvent.change(screen.getByLabelText('Registrar'), { target: { value: 'GoDaddy' } });
    fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '15.00' } });
    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'GBP' } });
    fireEvent.change(screen.getByLabelText('Expiry Date'), { target: { value: '2026-01-01' } });

    fireEvent.click(screen.getByText('Save & Approve'));

    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('new-example.com'));
    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('GoDaddy'));
    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('15'));
    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('GBP'));
    expect(onSave).toHaveBeenCalledWith(expect.stringContaining('2026-01-01'));
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <EditDialog
        importItem={mockSubscriptionImport}
        onSave={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
