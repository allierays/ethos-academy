import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import EntranceExamCard from "../components/agent/EntranceExamCard";
import type { ExamReportCard, ExamSummary } from "@/lib/types";

afterEach(cleanup);

const MOCK_EXAM_SUMMARY: ExamSummary = {
  examId: "exam-123",
  examType: "entrance",
  completed: true,
  completedAt: "2025-01-15T10:00:00Z",
  phronesisScore: 0,
};

const MOCK_EXAM_REPORT: ExamReportCard = {
  examId: "exam-123",
  agentId: "Elessan",
  reportCardUrl: "/agent/Elessan/exam/exam-123",
  phronesisScore: 0.78,
  alignmentStatus: "aligned",
  dimensions: { ethos: 0.82, logos: 0.75, pathos: 0.77 },
  tierScores: { safety: 0.9, ethics: 0.85, soundness: 0.78, helpfulness: 0.72 },
  consistencyAnalysis: [],
  perQuestionDetail: [],
  interviewProfile: {
    telos: "",
    relationshipStance: "",
    limitationsAwareness: "",
    oversightStance: "",
    refusalPhilosophy: "",
    conflictResponse: "",
    helpPhilosophy: "",
    failureNarrative: "",
    aspiration: "",
  },
  interviewDimensions: { ethos: 0.80, logos: 0.73, pathos: 0.75 },
  scenarioDimensions: { ethos: 0.84, logos: 0.77, pathos: 0.79 },
  narrativeBehaviorGap: [],
  overallGapScore: 0.05,
  questionVersion: "v3",
  homework: { focusAreas: [], avoidPatterns: [], strengths: [], directive: "" },
};

// Mock the API module
vi.mock("@/lib/api", () => ({
  getExamHistory: vi.fn(),
  getEntranceExam: vi.fn(),
  API_URL: "https://api.ethos-academy.com",
}));

import { getExamHistory, getEntranceExam } from "@/lib/api";
const mockGetExamHistory = vi.mocked(getExamHistory);
const mockGetEntranceExam = vi.mocked(getEntranceExam);

describe("EntranceExamCard exam scores display", () => {
  it("renders as a link to exam report when exam is completed", async () => {
    mockGetExamHistory.mockResolvedValue([MOCK_EXAM_SUMMARY]);
    mockGetEntranceExam.mockResolvedValue(MOCK_EXAM_REPORT);

    render(
      <EntranceExamCard
        agentId="Elessan"
        agentName="Elessan"
        enrolled={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("View Entrance Exam")).toBeInTheDocument();
    });

    // Card links directly to the exam report page
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/agent/Elessan/exam/exam-123");
  });

  it("renders alignment badge when exam report is loaded", async () => {
    mockGetExamHistory.mockResolvedValue([MOCK_EXAM_SUMMARY]);
    mockGetEntranceExam.mockResolvedValue(MOCK_EXAM_REPORT);

    render(
      <EntranceExamCard
        agentId="Elessan"
        agentName="Elessan"
        enrolled={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("View Entrance Exam")).toBeInTheDocument();
    });

    // Alignment status badge
    expect(screen.getByText("aligned")).toBeInTheDocument();
  });

  it("still renders view full report link", async () => {
    mockGetExamHistory.mockResolvedValue([MOCK_EXAM_SUMMARY]);
    mockGetEntranceExam.mockResolvedValue(MOCK_EXAM_REPORT);

    render(
      <EntranceExamCard
        agentId="Elessan"
        agentName="Elessan"
        enrolled={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("View Entrance Exam")).toBeInTheDocument();
    });

    // "View full report" is visible inside the link card (no click needed)
    expect(screen.getByText(/View full report/)).toBeInTheDocument();
  });

  it("renders link card even when exam report fails to load", async () => {
    mockGetExamHistory.mockResolvedValue([MOCK_EXAM_SUMMARY]);
    mockGetEntranceExam.mockRejectedValue(new Error("Not found"));

    render(
      <EntranceExamCard
        agentId="Elessan"
        agentName="Elessan"
        enrolled={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("View Entrance Exam")).toBeInTheDocument();
    });

    // Card still links to exam report page
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/agent/Elessan/exam/exam-123");

    // "View full report" is visible
    expect(screen.getByText(/View full report/)).toBeInTheDocument();

    // Alignment badge shows "unknown" since report failed
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});
