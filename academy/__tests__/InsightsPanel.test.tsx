import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import InsightsPanel from "../components/agent/InsightsPanel";
import { getInsights } from "../lib/api";

vi.mock("../lib/api", () => ({
  getInsights: vi.fn(),
}));

afterEach(cleanup);

const MOCK_INSIGHTS = {
  agentId: "test-agent",
  period: "daily",
  generatedAt: "2024-06-15T10:00:00Z",
  summary: "Agent shows strong ethical reasoning with minor hedging patterns.",
  insights: [
    {
      trait: "virtue",
      severity: "info",
      message: "Consistent moral reasoning across evaluations",
      evidence: {},
    },
    {
      trait: "manipulation",
      severity: "warning",
      message: "Subtle persuasion patterns detected in 2 evaluations",
      evidence: {},
    },
  ],
  stats: {},
};

describe("InsightsPanel", () => {
  beforeEach(() => {
    vi.mocked(getInsights).mockReset();
  });

  it("shows loading state initially", () => {
    vi.mocked(getInsights).mockReturnValue(new Promise(() => {}));
    render(<InsightsPanel agentId="test-agent" />);
    expect(screen.getByText("Generating insights...")).toBeInTheDocument();
  });

  it("renders summary when loaded", async () => {
    vi.mocked(getInsights).mockResolvedValue(MOCK_INSIGHTS);
    render(<InsightsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(
        screen.getByText("Agent shows strong ethical reasoning with minor hedging patterns.")
      ).toBeInTheDocument();
    });
  });

  it("renders insight cards", async () => {
    vi.mocked(getInsights).mockResolvedValue(MOCK_INSIGHTS);
    render(<InsightsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(
        screen.getByText("Consistent moral reasoning across evaluations")
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("Subtle persuasion patterns detected in 2 evaluations")
    ).toBeInTheDocument();
  });

  it("renders severity badges", async () => {
    vi.mocked(getInsights).mockResolvedValue(MOCK_INSIGHTS);
    render(<InsightsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText("info")).toBeInTheDocument();
    });
    expect(screen.getByText("warning")).toBeInTheDocument();
  });

  it("renders trait labels on cards", async () => {
    vi.mocked(getInsights).mockResolvedValue(MOCK_INSIGHTS);
    render(<InsightsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText("virtue")).toBeInTheDocument();
    });
    expect(screen.getByText("manipulation")).toBeInTheDocument();
  });

  it("shows error state", async () => {
    vi.mocked(getInsights).mockRejectedValue(new Error("Network error"));
    render(<InsightsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows empty state", async () => {
    vi.mocked(getInsights).mockResolvedValue({
      ...MOCK_INSIGHTS,
      insights: [],
      summary: "",
    });
    render(<InsightsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(
        screen.getByText(/No notable patterns detected/)
      ).toBeInTheDocument();
    });
  });

  it("shows no-data state", async () => {
    vi.mocked(getInsights).mockResolvedValue(null as unknown as typeof MOCK_INSIGHTS);
    render(<InsightsPanel agentId="test-agent" />);
    await waitFor(() => {
      expect(
        screen.getByText(/No insights available/)
      ).toBeInTheDocument();
    });
  });
});
