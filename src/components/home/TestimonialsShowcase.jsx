"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    id: 1,
    variant: "graph-line",
    eyebrow: "From Startup Founders",
    headline: "Built Faster Than Ever",
    quote:
      "Taskly completely changed how we build products. Instead of hiring full teams, we just post tasks and get results instantly.",
    author: "Daniel Reeves",
    role: "Founder, FlowDash",
    highlight: "Cut build time by 70%",
    metric: "320+ Tasks Completed",
  },
  {
    id: 2,
    variant: "ui-card",
    eyebrow: "E-commerce Growth",
    headline: "Everything Started Working",
    quote:
      "We needed speed. Taskly gave us exactly that. Designers, devs, marketers — all in one place.",
    author: "Sadia Rahman",
    role: "Founder, GlowCart",
    highlight: "Launched 2x faster",
    metric: "$18k Saved",
  },
  {
    id: 3,
    variant: "bars",
    eyebrow: "Freelancer Success",
    headline: "Consistent High Quality Work",
    quote:
      "Taskly brings me serious clients daily. No chasing — just real work and real payments.",
    author: "Nabil Hasan",
    role: "Full-stack Dev",
    highlight: "Income doubled",
    metric: "47 Projects",
  },
  {
    id: 4,
    variant: "dashboard",
    eyebrow: "Agency Scaling",
    headline: "Like Having an Elastic Team",
    quote:
      "We offload overflow work to Taskly. It feels like having an on-demand team.",
    author: "Rafid Ahmed",
    role: "Agency Owner",
    highlight: "Scaled output 3x",
    metric: "120+ Tasks Outsourced",
  },
];

export default function TestimonialsShowcase() {
  const [index, setIndex] = useState(0);
  const t = TESTIMONIALS[index];

  return (
    <section className="relative bg-black py-32 overflow-hidden">

      {/* SECTION HEADER */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 mb-20 text-center">
        <p className="text-[#ff4d00] uppercase tracking-[0.2em] text-xs mb-3">
          Testimonials
        </p>

        <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight">
          Real Results From
          <br />
          <span
            style={{
              background: "linear-gradient(135deg,#ff4d00,#ff8c42)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Taskly Users
          </span>
        </h2>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        <AnimatePresence mode="wait">
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >

            {/* LEFT */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">

              <p className="text-[#ff4d00] text-xs tracking-[0.2em] mb-2 uppercase">
                {t.eyebrow}
              </p>

              <h3 className="text-2xl font-bold text-white mb-4">
                {t.headline}
              </h3>

              <p className="text-white/75 leading-[1.7] mb-6">
                {t.quote}
              </p>

              <p className="text-white font-semibold">
                — {t.author}
              </p>
              <p className="text-white/40 text-sm">
                {t.role}
              </p>
            </div>

            {/* RIGHT — UNIQUE VISUALS */}
            <div className="relative h-[420px]">

              {/* VARIANT 1 — LINE GRAPH */}
              {t.variant === "graph-line" && (
                <>
                  <svg className="absolute inset-0 w-full h-full">
                    <polyline
                      points="0,320 80,260 160,280 240,200 320,210 400,140"
                      fill="none"
                      stroke="#ff4d00"
                      strokeWidth="3"
                    />
                  </svg>

                  <div className="absolute top-10 left-10 bg-[#ff4d00] px-4 py-2 rounded-xl font-bold">
                    {t.metric}
                  </div>

                  <p className="absolute right-6 bottom-16 text-[#ff8c42] italic">
                    “{t.highlight}”
                  </p>
                </>
              )}

              {/* VARIANT 2 — UI CARD MOCK */}
              {t.variant === "ui-card" && (
                <>
                  <div className="absolute right-10 top-16 w-[220px] h-[140px] bg-white/10 rounded-xl border border-white/10" />
                  <div className="absolute right-6 top-8 bg-[#ff4d00] px-4 py-2 rounded-lg font-bold">
                    {t.metric}
                  </div>
                  <p className="absolute left-10 bottom-14 text-[#ff8c42] italic">
                    “{t.highlight}”
                  </p>
                </>
              )}

              {/* VARIANT 3 — BAR GRAPH */}
              {t.variant === "bars" && (
                <>
                  <div className="absolute bottom-0 left-0 flex gap-4 items-end h-full px-10">
                    {[120, 200, 260, 340].map((h, i) => (
                      <div
                        key={i}
                        className="w-10 bg-gradient-to-t from-[#ff4d00] to-[#ff8c42] rounded"
                        style={{ height: h }}
                      />
                    ))}
                  </div>

                  <div className="absolute top-10 left-10 bg-[#ff4d00] px-4 py-2 rounded-xl font-bold">
                    {t.metric}
                  </div>

                  <p className="absolute right-6 bottom-10 text-[#ff8c42] italic">
                    “{t.highlight}”
                  </p>
                </>
              )}

              {/* VARIANT 4 — DASHBOARD MOCK */}
              {t.variant === "dashboard" && (
                <>
                  <div className="absolute right-10 top-10 w-[260px] h-[180px] bg-white/10 rounded-xl border border-white/10" />
                  <div className="absolute right-6 top-6 bg-[#ff4d00] px-4 py-2 rounded-xl font-bold">
                    {t.metric}
                  </div>

                  <p className="absolute left-6 bottom-16 text-[#ff8c42] italic">
                    “{t.highlight}”
                  </p>
                </>
              )}

              {/* COMMON GLOW */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[260px] h-[260px] bg-[#ff4d00] opacity-10 blur-3xl" />

            </div>

          </motion.div>
        </AnimatePresence>

        {/* NAV */}
        <div className="flex justify-end gap-3 mt-10">
          <button onClick={() => setIndex((i) => (i - 1 + 4) % 4)}
            className="w-10 h-10 rounded-full bg-white/10 text-white">
            ←
          </button>
          <button onClick={() => setIndex((i) => (i + 1) % 4)}
            className="w-10 h-10 rounded-full bg-[#ff4d00] text-white">
            →
          </button>
        </div>

      </div>
    </section>
  );
}