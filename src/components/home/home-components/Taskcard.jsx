"use client";

import { motion } from "framer-motion";

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  "UI Design":   { textColor: "#ff9a50", bg: "#ff640020", border: "#ff640038", icon: "🎨" },
  "Development": { textColor: "#50d4ff", bg: "#00aaff1a", border: "#00aaff33", icon: "⚡" },
  "Copywriting": { textColor: "#a78bfa", bg: "#7850ff1a", border: "#7850ff33", icon: "✍️" },
  "Marketing":   { textColor: "#34d399", bg: "#00c8781a", border: "#00c87833", icon: "📈" },
  "Video":       { textColor: "#fb7185", bg: "#f032501a", border: "#f0325033", icon: "🎬" },
};

// ─── Deadline urgency ─────────────────────────────────────────────────────────
function getDeadlineColor(dueDateStr) {
  const daysLeft = Math.ceil((new Date(dueDateStr) - new Date()) / 86400000);
  if (daysLeft <= 3) return "#fb7185";
  if (daysLeft <= 7) return "#fbbf24";
  return "#ffffffbf";
}

function formatDate(dueDateStr) {
  return new Date(dueDateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Proposal avatars ─────────────────────────────────────────────────────────
const AV_COLORS = ["#7c3aed","#0891b2","#b45309","#059669","#f43f5e","#8b5cf6"];
const AV_TEXT   = ["#e9d5ff","#cffafe","#fef3c7","#d1fae5","#ffffff","#ede9fe"];

function ProposalAvatars({ count }) {
  const shown = Math.min(count, 3);
  const label = count <= 2 ? `${count} proposal · new` : count >= 10 ? `${count} proposals · hot` : `${count} proposals`;
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-extrabold border-[1.5px] border-black"
            style={{ background: AV_COLORS[i], color: AV_TEXT[i], marginLeft: i === 0 ? 0 : -5, zIndex: shown - i }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <span className="text-[10px] font-medium text-white/30">{label}</span>
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────
export default function TaskCard({ task, index = 0 }) {
  const cat     = CATEGORY_STYLES[task.category] ?? CATEGORY_STYLES["Development"];
  const dlColor = getDeadlineColor(task.dueDate);

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
      {/* Hover gradient overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: "linear-gradient(135deg,rgba(255,77,0,0.07) 0%,transparent 60%)" }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Top accent bar — slides in on hover */}
      <motion.div
        className="h-[3px] w-full"
        style={{ background: "linear-gradient(90deg,#ff4d00,#ff8c42,transparent)", transformOrigin: "left" }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Featured badge */}
      {task.featured && (
        <div
          className="absolute top-[14px] right-[14px] text-[#ff4d00] rounded-[5px] px-[7px] py-[3px]"
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 8, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase",
            background: "rgba(255,77,0,0.10)",
            border: "1px solid rgba(255,77,0,0.30)",
          }}
        >
          ★ Featured
        </div>
      )}

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-[22px] gap-0">

        {/* Row 1: Category pill + live dot */}
        <div className="flex items-start justify-between gap-3 mb-[14px]">
          <span
            className="inline-flex items-center gap-[5px] rounded-[6px] px-[9px] py-[4px] whitespace-nowrap"
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: cat.textColor,
              background: cat.bg,
              border: `1px solid ${cat.border}`,
            }}
          >
            {cat.icon} {task.category}
          </span>
          <motion.span
            className="w-[7px] h-[7px] rounded-full mt-[3px] shrink-0"
            style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e88" }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.25, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
        </div>

        {/* Row 2: Title */}
        <p className="text-[15px] font-bold leading-[1.35] tracking-[-0.01em] text-white/90 mb-[16px]">
          {task.title}
        </p>

        {/* Divider */}
        <div
          className="h-px mb-[16px]"
          style={{ background: "linear-gradient(90deg,rgba(255,77,0,0.18),rgba(255,255,255,0.05),transparent)" }}
        />

        {/* Row 3: Client info */}
        <div className="flex items-center gap-[9px] mb-[16px]">
          <div
            className="w-[30px] h-[30px] rounded-full shrink-0 flex items-center justify-center text-[11px] font-extrabold"
            style={{
              background: task.clientAvatarGradient,
              color: task.clientAvatarText ?? "#fff",
              border: "1.5px solid rgba(255,255,255,0.10)",
            }}
          >
            {task.clientInitials}
          </div>
          <div>
            <div className="text-[10px] font-medium leading-none mb-[3px] text-white/35">Posted by</div>
            <div className="text-[12px] font-semibold text-white/72">{task.clientName}</div>
          </div>
        </div>

        {/* Row 4: Budget + Deadline + Bid — three columns */}
        <div className="flex items-stretch gap-[10px]">

          {/* Budget block */}
          <div
            className="flex-1 min-w-0 rounded-[10px] px-[12px] py-[10px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="mb-[5px]"
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
              }}
            >
              Budget
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 15, fontWeight: 700,
                color: "#ff8040", letterSpacing: "-0.02em",
              }}
            >
              ${task.budget.toLocaleString()}
            </div>
          </div>

          {/* Deadline block */}
          <div
            className="flex-1 min-w-0 rounded-[10px] px-[12px] py-[10px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="mb-[5px]"
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
              }}
            >
              Deadline
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 13, fontWeight: 700,
                color: dlColor, letterSpacing: "-0.01em",
              }}
            >
              {formatDate(task.dueDate)}
            </div>
          </div>

          {/* Bid button */}
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 0 24px rgba(255,77,0,0.50)" }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 flex items-center justify-center gap-[5px] rounded-[10px] px-[18px] text-white text-[12px] font-bold tracking-[0.02em] cursor-pointer border-0"
            style={{
              background: "linear-gradient(135deg,#ff4d00,#cc3d00)",
              boxShadow: "0 0 16px rgba(255,77,0,0.28)",
              minHeight: "100%",
            }}
          >
            Bid ↗
          </motion.button>
        </div>

        {/* Row 5: Proposal strip */}
        <div
          className="flex items-center justify-between mt-[14px] pt-[10px]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <ProposalAvatars count={task.proposalCount} />
        </div>

      </div>
    </motion.article>
  );
}