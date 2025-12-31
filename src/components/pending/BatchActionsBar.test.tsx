import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as tauri from '@/lib/tauri';
import { BatchActionsBar } from './BatchActionsBar';

// Mock the tauri module
vi.mock('@/lib/tauri', () => ({
  batchApprovePendingImports: vi.fn(),
  batchRejectPendingImports: vi.fn(),
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('BatchActionsBar', () => {
  const mockOnDeselectAll = vi.fn();
  const mockOnBatchRemove = vi.fn();
  const selectedIds = [1, 2, 3];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with selected items', () => {
    render(
      <BatchActionsBar
        selectedIds={selectedIds}
        onDeselectAll={mockOnDeselectAll}
        onBatchRemove={mockOnBatchRemove}
      />
    );

    expect(screen.getByText('3 items selected')).toBeInTheDocument();
    expect(screen.getByText('Approve All')).toBeInTheDocument();
    expect(screen.getByText('Reject All')).toBeInTheDocument();
  });

  it('calls onDeselectAll when Clear Selection is clicked', () => {
    render(
      <BatchActionsBar
        selectedIds={selectedIds}
        onDeselectAll={mockOnDeselectAll}
        onBatchRemove={mockOnBatchRemove}
      />
    );

    fireEvent.click(screen.getByText('Clear Selection'));
    expect(mockOnDeselectAll).toHaveBeenCalled();
  });

  it('handles batch approve successfully', async () => {
    vi.mocked(tauri.batchApprovePendingImports).mockResolvedValue(undefined);
    
    render(
      <BatchActionsBar
        selectedIds={selectedIds}
        onDeselectAll={mockOnDeselectAll}
        onBatchRemove={mockOnBatchRemove}
      />
    );

    fireEvent.click(screen.getByText('Approve All'));

    await waitFor(() => {
      expect(tauri.batchApprovePendingImports).toHaveBeenCalledWith(selectedIds, false);
      expect(mockOnBatchRemove).toHaveBeenCalledWith(selectedIds);
    });
  });

  it('handles batch reject successfully', async () => {
    vi.mocked(tauri.batchRejectPendingImports).mockResolvedValue(undefined);
    
    render(
      <BatchActionsBar
        selectedIds={selectedIds}
        onDeselectAll={mockOnDeselectAll}
        onBatchRemove={mockOnBatchRemove}
      />
    );

    fireEvent.click(screen.getByText('Reject All'));

    await waitFor(() => {
      expect(tauri.batchRejectPendingImports).toHaveBeenCalledWith(selectedIds, false);
      expect(mockOnBatchRemove).toHaveBeenCalledWith(selectedIds);
    });
  });
});
