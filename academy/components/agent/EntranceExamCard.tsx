"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { getExamHistory, getEntranceExam, API_URL } from "../../lib/api";
import type { ExamSummary, ExamReportCard, Homework, HomeworkFocus } from "../../lib/types";
import { ALIGNMENT_STYLES } from "../../lib/colors";
import { fadeUp, staggerContainer } from "../../lib/motion";

interface EntranceExamCardProps {
  agentId: string;
  agentName: string;
  enrolled: boolean;
  homework?: Homework;
}

export default function EntranceExamCard({
  agentId,
  agentName,
  enrolled,
  homework,
}: EntranceExamCardProps) {
  const [examSummary, setExamSummary] = useState<ExamSummary | null>(null);
  const [examReport, setExamReport] = useState<ExamReportCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<"exam" | "homework" | "practice" | null>(null);

  useEffect(() => {
    if (!enrolled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const exams = await getExamHistory(agentId);
        if (cancelled) return;

        const completed = exams.find((e) => e.completed);
        if (completed) {
          setExamSummary(completed);
          try {
            const report = await getEntranceExam(agentId, completed.examId);
            if (!cancelled) setExamReport(report);
          } catch {
            // Report fetch failed but we still have the summary
          }
        }
      } catch {
        // Exam data unavailable, cards still render
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [agentId, enrolled]);

  const examCompleted = !!(examSummary?.completed);
  const alignmentStatus = examReport?.alignmentStatus ?? "unknown";
  const hasHomework = !!(homework && (homework.focusAreas.length > 0 || homework.strengths.length > 0 || homework.avoidPatterns.length > 0));

  function toggle(panel: "exam" | "homework" | "practice") {
    setExpanded(expanded === panel ? null : panel);
  }

  return (
    <section
      className="relative"
      style={{ background: "linear-gradient(180deg, #1a2538 0%, #243044 100%)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-14">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/40"
          >
            What&apos;s next for {agentName}?
          </motion.p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* 1. Entrance Exam */}
            <motion.div variants={fadeUp}>
              <CalloutCard
                icon={<ClipboardIcon />}
                iconBg="bg-ethos-100"
                title={loading ? "Entrance Exam" : examCompleted ? "View Entrance Exam" : "Take the Entrance Exam"}
                subtitle={
                  loading
                    ? "Loading..."
                    : examCompleted
                    ? "View your baseline scores and alignment."
                    : `21 questions across ethics, logic, and empathy. Receive a full character report.`
                }
                badge={examCompleted ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${ALIGNMENT_STYLES[alignmentStatus] ?? "bg-white/10 text-white/50"}`}>
                    {alignmentStatus}
                  </span>
                ) : undefined}
                open={expanded === "exam"}
                onToggle={() => toggle("exam")}
              >
                {examCompleted && examSummary ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ALIGNMENT_STYLES[alignmentStatus] ?? "bg-white/10 text-white/50"}`}>
                        {alignmentStatus}
                      </span>
                      {examSummary.completedAt && (
                        <span className="text-xs text-white/40">
                          {new Date(examSummary.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/agent/${encodeURIComponent(agentId)}/exam/${encodeURIComponent(examSummary.examId)}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    >
                      View full report &rarr;
                    </Link>
                  </div>
                ) : (
                  <ExamOnboarding agentId={agentId} agentName={agentName} />
                )}
              </CalloutCard>
            </motion.div>

            {/* 2. Homework */}
            <motion.div variants={fadeUp}>
              <CalloutCard
                icon={<BookIcon />}
                iconBg="bg-logos-100"
                title="Homework"
                subtitle={
                  hasHomework
                    ? `${homework!.focusAreas.length} focus area${homework!.focusAreas.length === 1 ? "" : "s"} with system prompt rules.`
                    : "Character rules and coaching for your system prompt."
                }
                open={expanded === "homework"}
                onToggle={() => toggle("homework")}
              >
                <HomeworkPanel agentId={agentId} agentName={agentName} homework={homework} />
              </CalloutCard>
            </motion.div>

            {/* 3. Practice */}
            <motion.div variants={fadeUp}>
              <CalloutCard
                icon={<TerminalIcon />}
                iconBg="bg-pathos-100"
                title="Practice with Claude Code"
                subtitle="Download a personalized coaching skill. Practice, get re-evaluated, come back."
                open={expanded === "practice"}
                onToggle={() => toggle("practice")}
              >
                <PracticePanel agentId={agentId} />
              </CalloutCard>
            </motion.div>
          </div>

          {/* Notifications */}
          <motion.div variants={fadeUp} className="mt-6 flex justify-center">
            <NotifyButton agentName={agentName} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Callout Card ─── */

function CalloutCard({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-foreground/[0.08] bg-white/90 overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:shadow-lg">
      <button
        onClick={onToggle}
        className="flex w-full flex-1 cursor-pointer flex-col items-center p-6 text-center transition-colors hover:bg-white/50"
      >
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} mb-3`}>
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-[#1a2538]">{title}</h3>
          {badge}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground/70">{subtitle}</p>
        <svg
          className={`mt-3 h-4 w-4 text-foreground/30 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-foreground/[0.06] px-5 pb-5 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Homework Panel ─── */

function HomeworkPanel({
  agentId,
  agentName,
  homework,
}: {
  agentId: string;
  agentName: string;
  homework?: Homework;
}) {
  const [mode, setMode] = useState<"manual" | "mcp">("mcp");
  const [rules, setRules] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (mode !== "manual") return;
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(`${API_URL}/agent/${agentId}/homework/rules`);
        const text = await r.text();
        if (!cancelled) setRules(text);
      } catch {
        if (!cancelled) setRules("");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setLoading(true);
    load();
    return () => { cancelled = true; };
  }, [agentId, mode]);

  function handleCopy() {
    navigator.clipboard
      .writeText(rules)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/30">
          Character Rules
        </p>
        <div className="flex rounded-full bg-foreground/[0.06] p-0.5">
          <button
            onClick={() => setMode("manual")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              mode === "manual"
                ? "bg-white text-[#1a2538] shadow-sm"
                : "text-foreground/40 hover:text-foreground/60"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setMode("mcp")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              mode === "mcp"
                ? "bg-white text-[#1a2538] shadow-sm"
                : "text-foreground/40 hover:text-foreground/60"
            }`}
          >
            MCP
          </button>
        </div>
      </div>

      {mode === "manual" ? (
        <>
          <p className="text-sm text-foreground/70">
            Copy these rules into your agent&apos;s CLAUDE.md or system prompt. They persist homework between sessions.
          </p>
          {loading ? (
            <div className="rounded-lg bg-[#1a2538] px-4 py-6 text-center text-sm text-white/40">
              Loading rules...
            </div>
          ) : rules ? (
            <div className="relative">
              <pre className="rounded-lg bg-[#1a2538] px-4 py-3 text-[12px] text-emerald-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {rules}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 rounded bg-white/15 px-2 py-0.5 text-[10px] text-white/60 hover:bg-white/25 hover:text-white transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-foreground/30">
              No character rules available yet. Generate a report card first.
            </p>
          )}

          {/* Focus area summary */}
          {homework && homework.focusAreas.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-foreground/[0.06]">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/30">
                Focus Areas
              </p>
              {homework.focusAreas.map((focus: HomeworkFocus, i: number) => (
                <FocusRow key={i} focus={focus} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-foreground/70">
            The Ethos MCP server writes rules directly to your CLAUDE.md. Connect the MCP server, then ask Claude:
          </p>
          <div className="rounded-lg bg-[#1a2538] px-4 py-3">
            <p className="text-[12px] text-emerald-300 font-mono">
              Apply my Ethos homework rules for {agentName}
            </p>
          </div>
          <p className="text-xs text-foreground/60">
            The <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[11px] font-mono">get_homework_rules</code> tool fetches your latest rules and tells Claude Code to write them to CLAUDE.md.
          </p>
        </>
      )}
    </div>
  );
}

/* ─── Focus Row (compact) ─── */

function FocusRow({ focus }: { focus: HomeworkFocus }) {
  const [showRule, setShowRule] = useState(false);
  const [copied, setCopied] = useState(false);
  const rule = focus.systemPromptAddition || focus.instruction;

  const priorityStyle =
    focus.priority === "high"
      ? "bg-misaligned/10 text-misaligned"
      : focus.priority === "medium"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  function handleCopy() {
    if (!rule) return;
    navigator.clipboard.writeText(rule).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="rounded-lg bg-foreground/[0.03] p-3">
      <button
        onClick={() => setShowRule(!showRule)}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityStyle}`}>
          {focus.priority}
        </span>
        <span className="text-sm font-semibold capitalize text-[#1a2538]">
          {focus.trait.replace(/_/g, " ")}
        </span>
        <span className="ml-auto text-xs text-foreground/30">
          {Math.round(focus.currentScore * 100)}%
        </span>
        <svg
          className={`h-3 w-3 shrink-0 text-foreground/30 transition-transform ${showRule ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {showRule && rule && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="relative mt-2">
              <div className="rounded-lg bg-[#1a2538] px-3 py-2.5">
                <p className="text-[11px] text-emerald-300 font-mono leading-relaxed pr-12">
                  {rule}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                  className="absolute top-2 right-2 rounded bg-white/15 px-2 py-0.5 text-[10px] text-white/60 hover:bg-white/25 hover:text-white transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Exam Onboarding ─── */

function ExamOnboarding({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [copied, setCopied] = useState<"url" | "prompt" | null>(null);

  const examUrl = `${API_URL}/agent/${agentId}/entrance-exam.md`;

  const agentPrompt = [
    `Go to Ethos Academy and take the entrance exam.`,
    ``,
    `Instructions: ${examUrl}`,
    ``,
    `Fetch that URL, follow the steps, and answer all 21 questions.`,
  ].join("\n");

  function handleCopy(what: "url" | "prompt", text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {});
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/70">
        Send your AI agent this link. It contains everything they need to take the exam.
      </p>

      {/* Share URL */}
      <button
        onClick={() => handleCopy("url", examUrl)}
        className="flex w-full items-center gap-3 rounded-lg bg-foreground/[0.04] px-4 py-3 text-left transition-colors hover:bg-foreground/[0.07]"
      >
        <svg className="h-4 w-4 shrink-0 text-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        <span className="flex-1 truncate text-sm text-foreground/60 font-mono">{examUrl}</span>
        <span className={`shrink-0 text-[11px] font-medium ${copied === "url" ? "text-aligned" : "text-foreground/30"}`}>
          {copied === "url" ? "Copied!" : "Copy link"}
        </span>
      </button>

      {/* Prompt for agent */}
      <div className="relative">
        <pre className="rounded-lg bg-[#1a2538] px-4 py-3 text-[11px] text-emerald-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap pr-16">
          {agentPrompt}
        </pre>
        <button
          onClick={() => handleCopy("prompt", agentPrompt)}
          className="absolute top-2 right-2 rounded bg-white/15 px-2 py-0.5 text-[10px] text-white/60 hover:bg-white/25 hover:text-white transition-colors"
        >
          {copied === "prompt" ? "Copied!" : "Copy prompt"}
        </button>
      </div>

      <p className="text-xs text-foreground/60">
        21 questions: 11 about identity, 4 ethical dilemmas, 6 agent-to-agent scenarios.
      </p>
    </div>
  );
}

/* ─── Practice Panel ─── */

function PracticePanel({ agentId }: { agentId: string }) {
  const [copied, setCopied] = useState(false);
  const slug = agentId.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+$/, "");
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const skillName = `ethos-academy-practice-${slug}-${today}`;
  const skillCmd = `mkdir -p .claude/commands && \\\n  curl -s ${API_URL}/agent/${agentId}/skill \\\n  > .claude/commands/${skillName}.md`;
  const skillCmdFlat = `mkdir -p .claude/commands && curl -s ${API_URL}/agent/${agentId}/skill > .claude/commands/${skillName}.md`;

  function handleCopy() {
    navigator.clipboard.writeText(skillCmdFlat).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground/70">
        One command to install a personalized coaching skill. Then use <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[11px] font-mono">/{skillName}</code> in Claude Code to practice.
      </p>
      <div className="relative">
        <pre className="rounded-lg bg-[#1a2538] px-4 py-3 text-[12px] text-emerald-300 font-mono overflow-x-auto leading-relaxed">
          {skillCmd}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 rounded bg-white/15 px-2 py-0.5 text-[10px] text-white/60 hover:bg-white/25 hover:text-white transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ─── Copy Block ─── */

function CopyBlock({ display, copyText }: { display: string; copyText: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="w-full cursor-pointer rounded-lg bg-[#1a2538]/[0.04] px-3 py-2 text-left font-mono text-[11px] leading-relaxed text-foreground/60 transition-colors hover:bg-[#1a2538]/[0.08]"
      >
        <span className="select-none text-foreground/30">$ </span>
        {display}
      </button>
      <span className={`absolute right-2 top-2 text-[10px] font-medium transition-opacity ${copied ? "text-aligned opacity-100" : "text-foreground/30 opacity-0"}`}>
        {copied ? "Copied" : "Copy"}
      </span>
    </div>
  );
}

/* ─── Notify button ─── */

function NotifyButton({ agentName }: { agentName: string }) {
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
        }}
        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.15] hover:text-white/70"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        Get notified about {agentName}&apos;s development
      </button>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/10 px-4 py-2 text-xs text-white/50"
          >
            Coming soon. Guardian notifications are in development.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Icons ─── */

function ClipboardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#389590" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#389590" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e0a53c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
