import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DomainsView } from "./DomainsView";
import * as tauri from "@/lib/tauri";

// Mock the tauri module
vi.mock("@/lib/tauri", () => ({
  getDomains: vi.fn(),
}));

describe("DomainsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    vi.mocked(tauri.getDomains).mockReturnValue(new Promise(() => {}));
    render(<DomainsView />);
    expect(screen.getByText(/Loading domains.../i)).toBeInTheDocument();
  });

  it("renders empty state when no domains", async () => {
    vi.mocked(tauri.getDomains).mockResolvedValue([]);
    render(<DomainsView />);
    
    await waitFor(() => {
      expect(screen.getByText(/No domains found/i)).toBeInTheDocument();
    });
  });

  it("renders domains when data is loaded", async () => {
    const mockDomains = [
      {
        id: 1,
        domainName: "example.com",
        registrar: "Namecheap",
        cost: 12.99,
        currency: "USD",
        registrationDate: "2023-01-01",
        expiryDate: "2025-01-01",
        autoRenew: true,
        status: "active" as const,
        notes: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];
    vi.mocked(tauri.getDomains).mockResolvedValue(mockDomains);
    render(<DomainsView />);
    
    await waitFor(() => {
      expect(screen.getByText("example.com")).toBeInTheDocument();
      expect(screen.getByText("Namecheap")).toBeInTheDocument();
      expect(screen.getByText(/USD 12.99/i)).toBeInTheDocument();
      expect(screen.getByText(/Expires: 2025-01-01/i)).toBeInTheDocument();
    });
  });
});
