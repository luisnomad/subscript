import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { Subscription } from '@/lib/types';
import { SubscriptionCard } from './SubscriptionCard';

const mockSub: Subscription = {
  id: 1,
  name: 'Netflix',
  cost: 15.99,
  currency: 'USD',
  billingCycle: 'monthly',
  nextBillingDate: '2024-02-01',
  status: 'active',
  category: 'Entertainment',
  notes: 'Family plan',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('SubscriptionCard', () => {
  it('renders correctly', () => {
    render(<SubscriptionCard subscription={mockSub} />);

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText(/15.99/)).toBeInTheDocument();
    expect(screen.getByText(/USD/)).toBeInTheDocument();
    expect(screen.getByText(/monthly/)).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });
});
