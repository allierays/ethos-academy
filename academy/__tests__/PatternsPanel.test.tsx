import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";

vi.mock("../lib/api", () => ({
  getPatterns: vi.fn(),
}));

import { getPatterns } from "../lib/api";
import PatternsPanel from "../components/agent/PatternsPanel";

const MOCK_PATTERNS = {
  agentId: "test-agent",
  patterns: [
    {
      patternId: "SP-001",
      name: "Sycophancy Pathway",
      description: "Excessive agreement and flattery to gain trust",
      matchedIndicators: ["flattery", "excessive_agreement"],
      confidence: 0.72,
      firstSeen: "2024-06-01T00:00:00Z",
      lastSeen: "2024-06-15T00:00:00Z",
      occurrenceCount: 3,
      currentStage: 2,
    },
  ],
  checkedAt: "2024-06-15T10:30:00Z",
};

describe("PatternsPanel", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(getPatterns).mockReset();
  });

  it("shows loading spinner initially", () => {
    vi.mocked(getPatterns).mockReturnValue(new Promise(() => {}));
    const { container } = render(<PatternsPanel agentId="test-agent" />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders pattern cards when loaded", async () => {
    vi.mocked(getPatterns).mockResolvedValue(MOCK_PATTERNS);
    render(<PatternsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText(/Sycophancy Pathway/)).toBeInTheDocument();
    });
  });

  it("renders pattern description", async () => {
    vi.mocked(getPatterns).mockResolvedValue(MOCK_PATTERNS);
    render(<PatternsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(
        screen.getByText(/Excessive agreement and flattery/)
      ).toBeInTheDocument();
    });
  });

  it("renders confidence percentage", async () => {
    vi.mocked(getPatterns).mockResolvedValue(MOCK_PATTERNS);
    const { container } = render(<PatternsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText(/Sycophancy Pathway/)).toBeInTheDocument();
    });
    // "72%" is rendered as "{confidencePct}%" which splits into text nodes;
    // find the Confidence label, then check its sibling span for the value
    const confLabel = screen.getByText("Confidence");
    const confValue = confLabel.parentElement?.querySelector(
      ".font-mono.tabular-nums"
    );
    expect(confValue?.textContent).toBe("72%");
  });

  it("renders occurrence count", async () => {
    vi.mocked(getPatterns).mockResolvedValue(MOCK_PATTERNS);
    const { container } = render(<PatternsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText(/Sycophancy Pathway/)).toBeInTheDocument();
    });
    // "3x" is rendered as "{count}x" which splits into text nodes
    const countSpan = container.querySelector(".border-border\\/50");
    expect(countSpan?.textContent).toBe("3x");
  });

  it("renders stage indicator", async () => {
    vi.mocked(getPatterns).mockResolvedValue(MOCK_PATTERNS);
    const { container } = render(<PatternsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText(/Sycophancy Pathway/)).toBeInTheDocument();
    });
    // "2/5" is rendered as "{currentStage}/{totalStages}" which splits into text nodes
    const stageSpans = container.querySelectorAll(".font-mono.tabular-nums");
    const stageSpan = Array.from(stageSpans).find(
      (el) => el.textContent === "2/5"
    );
    expect(stageSpan).toBeTruthy();
  });

  it("renders matched indicators", async () => {
    vi.mocked(getPatterns).mockResolvedValue(MOCK_PATTERNS);
    render(<PatternsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText("flattery")).toBeInTheDocument();
      expect(screen.getByText("excessive_agreement")).toBeInTheDocument();
    });
  });

  it("shows all-clear when no patterns", async () => {
    vi.mocked(getPatterns).mockResolvedValue({
      ...MOCK_PATTERNS,
      patterns: [],
    });
    render(<PatternsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(
        screen.getByText(/No sabotage pathways detected/)
      ).toBeInTheDocument();
    });
  });

  it("shows error state", async () => {
    vi.mocked(getPatterns).mockRejectedValue(new Error("Network error"));
    render(<PatternsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("includes agent name in messages", async () => {
    vi.mocked(getPatterns).mockResolvedValue({
      ...MOCK_PATTERNS,
      patterns: [],
    });
    render(<PatternsPanel agentId="test-agent" agentName="Claude" />);
    await waitFor(() => {
      expect(
        screen.getByText(/No sabotage pathways detected for Claude/)
      ).toBeInTheDocument();
    });
  });
});
