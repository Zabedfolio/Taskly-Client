"use client";

import { motion } from "framer-motion";
import TaskCard from "./home-components/Taskcard";

// ─── Static seed data ─────────────────────────────────────────────────────────
// TODO: Replace with real DB fetch — e.g. await getLatestOpenTasks({ limit: 6 })
// Expected shape per task:
//   { id, title, clientName, clientInitials, clientAvatarGradient,
//     clientAvatarText, category, budget (number), dueDate (ISO string),
//     proposalCount (number), featured (bool) }
const STATIC_TASKS = [
  {
    id: "t1",
    title: "Redesign the onboarding flow for a SaaS dashboard — mobile-first, 4 screens",
    clientName: "Aryan Kapoor",
    clientInitials: "AK",
    clientAvatarGradient: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    clientAvatarText: "#e9d5ff",
    category: "UI Design",
    budget: 480,
    dueDate: "2026-06-28",
    proposalCount: 9,
    featured: true,
  },
  {
    id: "t2",
    title: "Fix critical checkout bug + integrate Stripe webhooks in Next.js app",
    clientName: "TechStack Inc.",
    clientInitials: "TS",
    clientAvatarGradient: "linear-gradient(135deg,#0891b2,#0e7490)",
    clientAvatarText: "#cffafe",
    category: "Development",
    budget: 320,
    dueDate: "2026-06-24",
    proposalCount: 4,
    featured: false,
  },
  {
    id: "t3",
    title: "Write 5 long-form SEO blog posts for a fintech brand — 1200 words each",
    clientName: "Nova Labs",
    clientInitials: "NL",
    clientAvatarGradient: "linear-gradient(135deg,#a78bfa,#7c3aed)",
    clientAvatarText: "#ffffff",
    category: "Copywriting",
    budget: 750,
    dueDate: "2026-07-10",
    proposalCount: 12,
    featured: false,
  },
  {
    id: "t4",
    title: "Set up Meta + Google Ads campaigns for an e-commerce store launch",
    clientName: "Omar Rashid",
    clientInitials: "OR",
    clientAvatarGradient: "linear-gradient(135deg,#059669,#047857)",
    clientAvatarText: "#d1fae5",
    category: "Marketing",
    budget: 600,
    dueDate: "2026-07-05",
    proposalCount: 6,
    featured: false,
  },
  {
    id: "t5",
    title: "Edit a 90-second product demo reel — motion graphics, captions, brand kit provided",
    clientName: "Sofiya Petrov",
    clientInitials: "SP",
    clientAvatarGradient: "linear-gradient(135deg,#f43f5e,#e11d48)",
    clientAvatarText: "#ffffff",
    category: "Video",
    budget: 950,
    dueDate: "2026-06-30",
    proposalCount: 16,
    featured: true,
  },
  {
    id: "t6",
    title: "Build a REST API with auth, rate limiting, and Swagger docs in Node.js",
    clientName: "Mehmet Han",
    clientInitials: "MH",
    clientAvatarGradient: "linear-gradient(135deg,#f59e0b,#d97706)",
    clientAvatarText: "#ffffff",
    category: "Development",
    budget: 1200,
    dueDate: "2026-07-15",
    proposalCount: 2,
    featured: false,
  },
];

// ─── FeaturedTasks Section ────────────────────────────────────────────────────
/**
 * Usage — static (now):       <FeaturedTasks />
 * Usage — with DB (future):   <FeaturedTasks tasks={serverFetchedTasks} totalOpen={127} />
 */
export default function FeaturedTasks({ tasks, totalOpen }) {
  const displayTasks = tasks ?? STATIC_TASKS;
  // TODO: replace 127 with real count from DB
  const openCount = totalOpen ?? 127;

  return (
    <section className="relative w-full overflow-hidden py-24 bg-black">

      {/* ── Top ambient glow ── */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[35vh]"
        style={{
          background: "radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.07) 0%,transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Section background iso grid (matches HeroBanner) ── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="ft-iso-grid" x="0" y="0" width="60" height="34.64" patternUnits="userSpaceOnUse">
            <path d="M0 17.32 L30 0 L60 17.32 L30 34.64 Z" fill="none" stroke="#ff4d00" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ft-iso-grid)" />
      </svg>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 pb-6"
          style={{ borderBottom: "1px solid rgba(255,77,0,0.12)" }}
        >
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-3"
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "#ff4d00",
              }}
            >
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.3, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="inline-block w-[6px] h-[6px] rounded-full"
                style={{ background: "#ff4d00", boxShadow: "0 0 8px #ff4d00" }}
              />
              Live Board
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-[clamp(1.9rem,3.5vw,2.8rem)] font-black tracking-[-0.03em] leading-[1.04] text-white"
            >
              Latest{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#ff4d00,#ff8c42)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Open
              </span>{" "}
              Tasks
            </motion.h2>
          </div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-3 pb-1"
          >
            {/* TODO: swap hardcoded number with `openCount` from DB */}
            <span
              className="text-white/35 font-bold"
              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.08em" }}
            >
              {openCount} OPEN
            </span>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 rounded-[8px] px-[14px] py-[7px] text-[13px] font-semibold cursor-pointer border-0"
              style={{
                color: "rgba(255,77,0,0.88)",
                background: "rgba(255,77,0,0.06)",
                border: "1px solid rgba(255,77,0,0.26)",
              }}
            >
              Browse All →
            </motion.button>
          </motion.div>
        </div>

        {/* ── Task grid — responsive 1 / 2 / 3 cols ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayTasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} />
          ))}
        </div>

        {/* ── Load more strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2.5 rounded-xl px-8 py-[14px] text-[14px] font-semibold text-white/65 cursor-pointer border-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Load more tasks
            {/* TODO: wire onClick to paginated DB fetch */}
            <span style={{ color: "#ff4d00" }}>↓</span>
          </motion.button>
        </motion.div>

      </div>

      {/* ── Bottom fade ── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}