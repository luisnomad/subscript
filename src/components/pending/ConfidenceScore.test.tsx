import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConfidenceScore } from "./ConfidenceScore";

describe("ConfidenceScore", () => {
  it("renders high confidence correctly", () => {
    render(<ConfidenceScore score={0.9} />);
    expect(screen.getByText("High Confidence")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("renders medium confidence correctly", () => {
    render(<ConfidenceScore score={0.6} />);
    expect(screen.getByText("Medium Confidence")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("renders low confidence correctly", () => {
    render(<ConfidenceScore score={0.3} />);
    expect(screen.getByText("Low Confidence")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
  });
});
