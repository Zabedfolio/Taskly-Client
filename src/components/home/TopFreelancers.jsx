"use client";

import { motion } from "framer-motion";
import FreelancerCard from "./home-components/FreelancerCard";

// ─── Static seed data ──────────────────────────────────────────────────────────
// TODO: Replace with real DB fetch — e.g. await getTopFreelancers({ limit: 6 })
// Expected shape per freelancer:
//   { id, name, avatarUrl, skills (string[]), rating (number), jobsDone (number) }
const STATIC_FREELANCERS = [
  {
    id: "f1",
    name: "Lena Müller",
    title: "Senior UI/UX Designer",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    skills: ["Figma", "Motion", "Design Systems"],
    rating: 4.9,
    jobsDone: 214,
  },
  {
    id: "f2",
    name: "Arjun Sharma",
    title: "Full-Stack Engineer",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    skills: ["React", "Node.js", "PostgreSQL"],
    rating: 4.8,
    jobsDone: 178,
  },
  {
    id: "f3",
    name: "Camille Dupont",
    title: "Brand & Copywriter",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    skills: ["SEO Copy", "Brand Voice", "B2B SaaS"],
    rating: 5.0,
    jobsDone: 312,
  },
  {
    id: "f4",
    name: "Marcus Cole",
    title: "Performance Marketer",
    avatarUrl: "https://i.pravatar.cc/150?img=68",
    skills: ["Meta Ads", "Google Ads", "Analytics"],
    rating: 4.7,
    jobsDone: 93,
  },
  {
    id: "f5",
    name: "Yuki Tanaka",
    title: "Motion & Video Editor",
    avatarUrl: "https://i.pravatar.cc/150?img=55",
    skills: ["After Effects", "Premiere", "3D"],
    rating: 4.9,
    jobsDone: 261,
  },
  {
    id: "f6",
    name: "Ivan Petrov",
    title: "Backend & DevOps Engineer",
    avatarUrl: "https://i.pravatar.cc/150?img=61",
    skills: ["AWS", "Docker", "Go", "Redis"],
    rating: 4.8,
    jobsDone: 140,
  },
];

// ─── Skill tag palette ─────────────────────────────────────────────────────────
const SKILL_PALETTE = [
  { text: "#ff9a50", bg: "#ff640018", border: "#ff640030" },
  { text: "#50d4ff", bg: "#00aaff14", border: "#00aaff28" },
  { text: "#a78bfa", bg: "#7850ff14", border: "#7850ff28" },
  { text: "#34d399", bg: "#00c87814", border: "#00c87828" },
  { text: "#fb7185", bg: "#f0325014", border: "#f0325028" },
  { text: "#f59e0b", bg: "#d9770614", border: "#d9770628" },
];

function skillStyle(index) {
  return SKILL_PALETTE[index % SKILL_PALETTE.length];
}

// ─── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const half = !filled && hasHalf && i === full;
        return (
          <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="none">
            <defs>
              <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#ff8040" />
                <stop offset="50%" stopColor="#ffffff20" />
              </linearGradient>
            </defs>
            <polygon
              points="6,1 7.5,4.5 11,4.8 8.5,7.2 9.2,11 6,9.2 2.8,11 3.5,7.2 1,4.8 4.5,4.5"
              fill={filled ? "#ff8040" : half ? `url(#half-${i})` : "rgba(255,255,255,0.12)"}
            />
          </svg>
        );
      })}
      <span
        style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10, fontWeight: 700,
          color: "#ff8040", letterSpacing: "-0.01em",
          marginLeft: 3,
        }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── FreelancerCard ────────────────────────────────────────────────────────────


// ─── TopFreelancers Section ────────────────────────────────────────────────────
export default function TopFreelancers({ freelancers }) {
  const displayFreelancers = freelancers ?? STATIC_FREELANCERS;

  return (
    <section className="relative w-full overflow-hidden py-24 bg-black">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[35vh]"
        style={{
          background: "radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.07) 0%,transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Iso grid background */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="tf-iso-grid" x="0" y="0" width="60" height="34.64" patternUnits="userSpaceOnUse">
            <path d="M0 17.32 L30 0 L60 17.32 L30 34.64 Z" fill="none" stroke="#ff4d00" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tf-iso-grid)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 pb-6"
          style={{ borderBottom: "1px solid rgba(255,77,0,0.12)" }}
        >
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
              Verified Talent
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-[clamp(1.9rem,3.5vw,2.8rem)] font-black tracking-[-0.03em] leading-[1.04] text-white"
            >
              Top{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#ff4d00,#ff8c42)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Freelancers
              </span>{" "}
              This Month
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="pb-1"
          >
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

        {/* Freelancer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayFreelancers.map((freelancer, i) => (
            <FreelancerCard key={freelancer.id} freelancer={freelancer} index={i} skillStyle={skillStyle} StarRating={StarRating} SKILL_PALETTE={SKILL_PALETTE}/>
          ))}
        </div>

      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}