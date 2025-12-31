import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { Domain } from '@/lib/types';
import { DomainCard } from './DomainCard';

const mockDomain: Domain = {
  id: 1,
  domainName: 'example.com',
  registrar: 'Namecheap',
  cost: 12.99,
  currency: 'USD',
  registrationDate: '2023-01-01',
  expiryDate: '2025-01-01',
  autoRenew: true,
  status: 'active',
  notes: 'Personal blog',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('DomainCard', () => {
  it('renders correctly', () => {
    render(<DomainCard domain={mockDomain} />);

    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('Namecheap')).toBeInTheDocument();
    expect(screen.getByText(/12.99/)).toBeInTheDocument();
    expect(screen.getByText(/USD/)).toBeInTheDocument();
    expect(screen.getByText(/Expires: 2025-01-01/i)).toBeInTheDocument();
  });
});
