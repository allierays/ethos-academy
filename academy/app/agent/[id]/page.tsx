"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { getAgent, getHistory, getCharacterReport } from "../../../lib/api";
import type {
  AgentProfile,
  EvaluationHistoryItem,
  DailyReportCard,
} from "../../../lib/types";
import RadarChart from "../../../components/shared/RadarChart";
import DimensionBalance from "../../../components/shared/DimensionBalance";
import AlumniComparison from "../../../components/alumni/AlumniComparison";
import GradeHero from "../../../components/agent/GradeHero";
import RiskIndicators from "../../../components/agent/RiskIndicators";
import HomeworkSection from "../../../components/agent/HomeworkSection";
import PatternsPanel from "../../../components/agent/PatternsPanel";
import TranscriptChart from "../../../components/agent/TranscriptChart";

import EvaluationDepth from "../../../components/agent/EvaluationDepth";
import GoldenMean from "../../../components/agent/GoldenMean";
import VirtueHabits from "../../../components/agent/VirtueHabits";
import BalanceThesis from "../../../components/agent/BalanceThesis";
import { fadeUp, staggerContainer } from "../../../lib/motion";

/* ─── Timeline data point ─── */

interface TimelineDataPoint {
  index: number;
  createdAt: string;
  ethos: number;
  logos: number;
  pathos: number;
  flags: string[];
  alignmentStatus: string;
}

/* ─── Page ─── */

export default function AgentReportCard() {
  const params = useParams();
  const agentId = params.id as string;

  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [timeline, setTimeline] = useState<TimelineDataPoint[]>([]);
  const [history, setHistory] = useState<EvaluationHistoryItem[]>([]);
  const [report, setReport] = useState<DailyReportCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [profileResult, historyResult, reportResult] =
          await Promise.allSettled([
            getAgent(agentId),
            getHistory(agentId),
            getCharacterReport(agentId),
          ]);

        if (cancelled) return;

        if (profileResult.status === "rejected") {
          throw profileResult.reason;
        }
        setProfile(profileResult.value);

        if (historyResult.status === "fulfilled") {
          setHistory(historyResult.value);
          const points: TimelineDataPoint[] = historyResult.value
            .slice()
            .reverse()
            .map((item: EvaluationHistoryItem, i: number) => ({
              index: i + 1,
              createdAt: item.createdAt,
              ethos: item.ethos,
              logos: item.logos,
              pathos: item.pathos,
              flags: item.flags,
              alignmentStatus: item.alignmentStatus,
            }));
          setTimeline(points);
        }

        if (reportResult.status === "fulfilled") {
          setReport(reportResult.value);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load agent");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-action border-t-transparent" />
            <p className="mt-3 text-sm text-muted">Loading agent profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex h-96 items-center justify-center">
          <p className="text-sm text-misaligned">{error}</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex h-96 items-center justify-center">
          <p className="text-sm text-muted">Agent not found.</p>
        </div>
      </main>
    );
  }

  const agentName = profile.agentName || profile.agentId;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Decorative gradient mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-ethos-200/25 blur-[100px]" />
        <div className="absolute top-1/4 -left-40 h-[500px] w-[500px] rounded-full bg-logos-200/20 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-pathos-200/25 blur-[100px]" />
      </div>

      <motion.div
        className="relative z-10 space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* 1. Grade Hero (includes phronesis narrative) */}
        <motion.section variants={fadeUp}>
          <GradeHero profile={profile} report={report} timeline={timeline} />
        </motion.section>

        {/* 2. The Aristotelian Thesis (balance) */}
        <motion.section variants={fadeUp}>
          <BalanceThesis
            dimensionAverages={profile.dimensionAverages}
            evaluationCount={profile.evaluationCount}
            agentName={agentName}
          />
        </motion.section>

        {/* 4. Character Health + Dimension Balance */}
        <motion.section variants={fadeUp}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl glass-strong p-6">
              <h2 className="text-base font-semibold uppercase tracking-wider text-[#1a2538]">
                Character Health
              </h2>
              <p className="mt-0.5 text-sm text-foreground/60">
                {agentName}&apos;s 12 traits across three dimensions.
              </p>
              {Object.keys(profile.traitAverages).length > 0 ? (
                <RadarChart
                  traits={Object.fromEntries(
                    Object.entries(profile.traitAverages).map(([name, score]) => [
                      name,
                      { name, score, dimension: "", polarity: "", indicators: [] },
                    ])
                  )}
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-muted">
                  Not enough data for radar chart.
                </div>
              )}
            </div>

            <DimensionBalance
              dimensionAverages={profile.dimensionAverages}
              title={`${agentName}'s Balance`}
            />
          </div>
        </motion.section>

        {/* 5. Golden Mean (Aristotelian trait spectrums) */}
        <motion.section variants={fadeUp}>
          <GoldenMean traitAverages={profile.traitAverages} agentName={agentName} />
        </motion.section>

        {/* 6. Virtue Through Habit (habit formation) */}
        {history.length > 0 && (
          <motion.section variants={fadeUp}>
            <VirtueHabits history={history} agentName={agentName} />
          </motion.section>
        )}

        {/* 7. Transcript */}
        <motion.section variants={fadeUp}>
          <TranscriptChart timeline={timeline} agentName={agentName} />
        </motion.section>

        {/* 8. Risk Indicators */}
        {report && (
          <motion.section variants={fadeUp}>
            <RiskIndicators report={report} agentName={agentName} />
          </motion.section>
        )}

        {/* 9. Homework and Reflection */}
        {report?.homework && (
          <motion.section variants={fadeUp}>
            <HomeworkSection homework={report.homework} agentName={agentName} />
          </motion.section>
        )}

        {/* 10. Sabotage Pathways */}
        <motion.section variants={fadeUp}>
          <PatternsPanel agentId={agentId} agentName={agentName} />
        </motion.section>

        {/* 11. Alumni Comparison */}
        <motion.section variants={fadeUp}>
          <AlumniComparison agentTraitAverages={profile.traitAverages} agentName={agentName} />
        </motion.section>

        {/* 12. Appendix (methodology) */}
        <motion.section variants={fadeUp}>
          <EvaluationDepth />
        </motion.section>
      </motion.div>
    </main>
  );
}
