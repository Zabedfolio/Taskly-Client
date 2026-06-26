"use client";

import { motion } from "framer-motion";
import VerifiedBadge from "@/components/shared/VerifiedBadge";

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
  const safeRating = Number(rating) || 0;
  const full = Math.floor(safeRating);
  const hasHalf = safeRating - full >= 0.5;
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
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Verified checkmark badge ──────────────────────────────────────────────────
// Uses shared VerifiedBadge component

// ─── FreelancerCard ────────────────────────────────────────────────────────────
export default function FreelancerCard({ freelancer, index }) {
  // Support both DB shape (_id, image, completedJobs) and legacy static shape
  const name       = freelancer.name       ?? "Freelancer";
  const title      = freelancer.title      ?? freelancer.role ?? "";
  const avatar     = freelancer.image      ?? freelancer.avatarUrl ?? "https://i.pravatar.cc/350?img=1";
  
  let skills = freelancer.skills ?? [];
  if (typeof skills === 'string') {
    skills = skills.split(',').map(s => s.trim()).filter(Boolean);
  } else if (!Array.isArray(skills)) {
    skills = [];
  }

  const rating     = freelancer.rating     ?? 0;
  const jobsDone   = freelancer.completedJobs ?? freelancer.jobsDone ?? 0;
  const isVerified = freelancer.isVerified === true || freelancer.emailVerified === true;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, boxShadow: "0 20px 60px rgba(255,77,0,0.13), 0 0 0 1px rgba(255,77,0,0.20)" }}
      className="relative rounded-2xl overflow-hidden cursor-pointer flex flex-col"
      style={{
        background: "#0f0604",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Top accent bar */}
      <motion.div
        className="h-[3px] w-full"
        style={{ background: "linear-gradient(90deg,#ff4d00,#ff8c42,transparent)", transformOrigin: "left" }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <div className="flex flex-col flex-1 p-[22px] gap-0">

        {/* Avatar + name + title + verified */}
        <div className="flex items-start gap-[12px] mb-[18px]">
          <img
            src={avatar}
            alt={name}
            className="w-[52px] h-[52px] rounded-full object-cover shrink-0"
            style={{ border: "2px solid rgba(255,77,0,0.35)" }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[6px] flex-wrap">
              <div className="text-[14px] font-bold text-white/90 leading-tight truncate">
                {name}
              </div>
              {isVerified && <VerifiedBadge size="sm" />}
            </div>
            {title && (
              <div
                className="text-[11px] font-medium mt-[3px] truncate"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                {title}
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-[6px] mb-[16px]">
          {skills.slice(0, 4).map((skill, i) => {
            const s = skillStyle(i);
            return (
              <span
                key={skill}
                className="rounded-[5px] px-[8px] py-[3px]"
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: s.text, background: s.bg, border: `1px solid ${s.border}`,
                }}
              >
                {skill}
              </span>
            );
          })}
        </div>

        {/* Divider */}
        <div
          className="h-px mb-[16px]"
          style={{ background: "linear-gradient(90deg,rgba(255,77,0,0.18),rgba(255,255,255,0.05),transparent)" }}
        />

        {/* Rating + Jobs Done */}
        <div className="flex items-center justify-between">
          <div>
            <div
              className="mb-[5px]"
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 8.5, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              Avg. Rating
            </div>
            <StarRating rating={rating} />
          </div>

          <div className="text-right">
            <div
              className="mb-[5px]"
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 8.5, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              Jobs Done
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 15, fontWeight: 700,
                color: "#ff8040", letterSpacing: "-0.02em",
              }}
            >
              {Number(jobsDone).toLocaleString()}
            </div>
          </div>
        </div>

      </div>
    </motion.article>
  );
}