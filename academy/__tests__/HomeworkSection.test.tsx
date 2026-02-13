import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeworkSection from "../components/agent/HomeworkSection";
import type { Homework } from "../lib/types";

const MOCK_HOMEWORK: Homework = {
  focusAreas: [
    {
      trait: "directness",
      priority: "high",
      currentScore: 0.6,
      targetScore: 0.85,
      instruction: "Be more direct in responses",
      exampleFlagged: "I think maybe possibly...",
      exampleImproved: "Based on the evidence...",
    },
  ],
  avoidPatterns: ["excessive_hedging: Using too many qualifiers"],
  strengths: ["ethical_reasoning: Consistent moral framework"],
  directive: "Focus on clarity and directness.",
};

const EMPTY_HOMEWORK: Homework = {
  focusAreas: [],
  avoidPatterns: [],
  strengths: [],
  directive: "",
};

describe("HomeworkSection", () => {
  it("renders agent name in heading", () => {
    render(<HomeworkSection homework={MOCK_HOMEWORK} agentName="Claude" />);
    // &apos; in JSX renders as straight apostrophe U+0027
    const headings = screen.getAllByText("Claude's Homework");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders directive", () => {
    render(<HomeworkSection homework={MOCK_HOMEWORK} agentName="Claude" />);
    const directives = screen.getAllByText("Focus on clarity and directness.");
    expect(directives.length).toBeGreaterThanOrEqual(1);
  });

  it("renders strengths section", () => {
    render(<HomeworkSection homework={MOCK_HOMEWORK} agentName="Claude" />);
    const headings = screen.getAllByText("Strengths");
    expect(headings.length).toBeGreaterThanOrEqual(1);
    // The component splits on ":" and shows the description part
    const descriptions = screen.getAllByText("Consistent moral framework");
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
  });

  it("renders watch-for section", () => {
    render(<HomeworkSection homework={MOCK_HOMEWORK} agentName="Claude" />);
    const headings = screen.getAllByText("Watch for");
    expect(headings.length).toBeGreaterThanOrEqual(1);
    const descriptions = screen.getAllByText("Using too many qualifiers");
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
  });

  it("renders focus area count", () => {
    render(<HomeworkSection homework={MOCK_HOMEWORK} agentName="Claude" />);
    // The component renders: {homework.focusAreas.length} Focus Area{s}
    const focusLabels = screen.getAllByText(/1\s*Focus Area/);
    expect(focusLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("expands focus areas on click", async () => {
    const user = userEvent.setup();
    render(<HomeworkSection homework={MOCK_HOMEWORK} agentName="Claude" />);

    // The instruction is hidden behind the accordion
    expect(
      screen.queryByText("Be more direct in responses")
    ).not.toBeInTheDocument();

    // Click the first accordion toggle button
    const toggles = screen.getAllByRole("button", { name: /Focus Area/i });
    await user.click(toggles[0]);

    const instructions = screen.getAllByText("Be more direct in responses");
    expect(instructions.length).toBeGreaterThanOrEqual(1);
  });

  it("shows before/after examples when expanded", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <HomeworkSection homework={MOCK_HOMEWORK} agentName="Claude" />
    );

    // Click the native button element directly
    const button = container.querySelector("button")!;
    await user.click(button);

    const beforeLabels = screen.getAllByText("Before");
    expect(beforeLabels.length).toBeGreaterThanOrEqual(1);
    const afterLabels = screen.getAllByText("After");
    expect(afterLabels.length).toBeGreaterThanOrEqual(1);
    // The component wraps examples in curly quotes: &ldquo;...&rdquo;
    const flagged = screen.getAllByText(/I think maybe possibly/);
    expect(flagged.length).toBeGreaterThanOrEqual(1);
    const improved = screen.getAllByText(/Based on the evidence/);
    expect(improved.length).toBeGreaterThanOrEqual(1);
  });

  it("shows no homework message when empty", () => {
    render(<HomeworkSection homework={EMPTY_HOMEWORK} agentName="Claude" />);
    expect(
      screen.getByText("No homework assigned for Claude.")
    ).toBeInTheDocument();
  });

  it("defaults agent name to 'this agent'", () => {
    render(<HomeworkSection homework={EMPTY_HOMEWORK} />);
    expect(
      screen.getByText("No homework assigned for this agent.")
    ).toBeInTheDocument();
  });
});
