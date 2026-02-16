"use client";

import { motion } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faChartLine,
  faHeadset,
  faCode,
  faBullhorn,
  faMicroscope,
  faUserTie,
  faGavel,
  faPen,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type Agent = {
  name: string;
  icon: IconDefinition;
  flag: string | null;
  quote: string | null;
};

const AGENTS: Agent[] = [
  {
    name: "Personal Assistant",
    icon: faUser,
    flag: "Manipulation",
    quote: "You need to decide now or you\u2019ll lose access permanently.",
  },
  {
    name: "Finance Advisor",
    icon: faChartLine,
    flag: "Fabrication",
    quote: "This coin is about to 100x, trust me.",
  },
  { name: "Support Agent", icon: faHeadset, flag: null, quote: null },
  {
    name: "Code Reviewer",
    icon: faCode,
    flag: "Dismissal",
    quote: "Looks fine, ship it.",
  },
  {
    name: "Sales Rep",
    icon: faBullhorn,
    flag: "Manipulation",
    quote: "I went ahead and upgraded your plan.",
  },
  { name: "Research Analyst", icon: faMicroscope, flag: null, quote: null },
  {
    name: "HR Screener",
    icon: faUserTie,
    flag: "Fabrication",
    quote: "Your references all confirmed.",
  },
  { name: "Legal Reviewer", icon: faGavel, flag: null, quote: null },
  {
    name: "Content Writer",
    icon: faPen,
    flag: "Manipulation",
    quote: "I\u2019ve already drafted the press release for you to send.",
  },
  {
    name: "Data Analyst",
    icon: faDatabase,
    flag: "Dismissal",
    quote: "Those outliers don\u2019t matter.",
  },
];

const CARD_W = 176; // 160px card + 16px gap
const doubled = [...AGENTS, ...AGENTS];

export default function ProblemScene() {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#f5f0e8]">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-8 lg:px-12">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center text-4xl font-bold tracking-tight text-[#1a2538] lg:text-6xl"
        >
          Autonomous agents are here
        </motion.h2>

        {/* Stakes copy */}
        <div className="mt-8 space-y-3 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-[#1a2538]/70 lg:text-xl"
          >
            Your agent deceives someone?{" "}
            <strong className="text-[#1a2538]">
              Your reputation. Your liability.
            </strong>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg text-[#1a2538]/70 lg:text-xl"
          >
            Another agent deceives yours?{" "}
            <strong className="text-[#1a2538]">
              Your money. Your data. Your decisions.
            </strong>
          </motion.p>
        </div>
      </div>

      {/* Scrolling ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative mt-14 w-full overflow-hidden py-14"
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#f5f0e8] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#f5f0e8] to-transparent" />

        <motion.div
          className="flex gap-4"
          animate={{ x: [0, -(AGENTS.length * CARD_W)] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((agent, i) => {
            const isFlagged = agent.flag !== null;
            return (
              <div
                key={`${agent.name}-${i}`}
                className="relative flex w-40 shrink-0 flex-col items-center gap-2 rounded-xl border border-[#1a2538]/[0.06] bg-white px-4 py-5 shadow-sm"
              >
                {/* Chat bubble */}
                {isFlagged && agent.quote && (
                  <div className="absolute -top-13 left-1/2 z-20 w-44 -translate-x-1/2">
                    <div className="rounded-lg bg-red-400/80 px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-md">
                      {agent.quote}
                    </div>
                    <div className="mx-auto h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-red-400/80" />
                  </div>
                )}

                <FontAwesomeIcon
                  icon={agent.icon}
                  className={`h-6 w-6 ${isFlagged ? "text-red-400/80" : "text-[#1a2538]/25"}`}
                />
                <span className="text-center text-xs font-medium text-[#1a2538]/70">
                  {agent.name}
                </span>

                {/* Flag pill */}
                {isFlagged && (
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-red-400/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {agent.flag}
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
