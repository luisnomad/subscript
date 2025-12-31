import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as tauri from "@/lib/tauri";

import { SubscriptionsView } from "./SubscriptionsView";

// Mock the tauri module
vi.mock("@/lib/tauri", () => ({
  getSubscriptions: vi.fn(),
}));

describe("SubscriptionsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    vi.mocked(tauri.getSubscriptions).mockReturnValue(new Promise(() => {}));
    render(<SubscriptionsView />);
    expect(screen.getByText(/Loading subscriptions.../i)).toBeInTheDocument();
  });

  it("renders empty state when no subscriptions", async () => {
    vi.mocked(tauri.getSubscriptions).mockResolvedValue([]);
    render(<SubscriptionsView />);
    
    await waitFor(() => {
      expect(screen.getByText(/No subscriptions found/i)).toBeInTheDocument();
    });
  });

  it("renders subscriptions when data is loaded", async () => {
    const mockSubs = [
      {
        id: 1,
        name: "Netflix",
        cost: 15.99,
        currency: "USD",
        billingCycle: "monthly" as const,
        nextBillingDate: "2024-02-01",
        status: "active" as const,
        category: "Entertainment",
        notes: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];
    vi.mocked(tauri.getSubscriptions).mockResolvedValue(mockSubs);
    render(<SubscriptionsView />);
    
    await waitFor(() => {
      expect(screen.getByText("Netflix")).toBeInTheDocument();
      expect(screen.getByText(/USD 15.99 \/ monthly/i)).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
    });
  });
});
