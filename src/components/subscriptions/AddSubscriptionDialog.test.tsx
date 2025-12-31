import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import * as tauri from "@/lib/tauri";

import { AddSubscriptionDialog } from "./AddSubscriptionDialog";

// Mock the tauri module
vi.mock("@/lib/tauri", () => ({
  createSubscription: vi.fn(),
}));

describe("AddSubscriptionDialog", () => {
  it("renders the trigger button", () => {
    render(<AddSubscriptionDialog />);
    expect(screen.getByText("Add Subscription")).toBeInTheDocument();
  });

  it("opens the dialog when clicked", () => {
    render(<AddSubscriptionDialog />);
    fireEvent.click(screen.getByText("Add Subscription"));
    expect(screen.getByText("Add New Subscription")).toBeInTheDocument();
  });

  it("submits the form with correct data", async () => {
    const mockCreateSubscription = vi.mocked(tauri.createSubscription);
    mockCreateSubscription.mockResolvedValue(1);

    render(<AddSubscriptionDialog onSuccess={vi.fn()} />);
    
    // Open dialog
    fireEvent.click(screen.getByText("Add Subscription"));

    // Fill form
    fireEvent.change(screen.getByLabelText(/Service Name/i), {
      target: { value: "Netflix" },
    });
    fireEvent.change(screen.getByLabelText(/Cost/i), {
      target: { value: "15.99" },
    });

    // Submit - find the form and submit it
    const form = screen.getByRole("dialog").querySelector("form");
    if (!form) {throw new Error("Form not found");}
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Netflix",
          cost: 15.99,
        }),
        false
      );
    });
  });
});
