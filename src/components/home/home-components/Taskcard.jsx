"use client";

import { motion } from "framer-motion";
import ClientRatingBadge from "@/components/shared/ClientRatingBadge";
import { useSession } from "@/lib/auth-client";
import { useBookmarks } from "@/contexts/BookmarkContext";
import toast from "react-hot-toast";
import {
    Thunderbolt, Palette, PencilToLine, Megaphone, Video, Briefcase,
} from '@gravity-ui/icons';

const CATEGORY_ICON_MAP = {
    thunderbolt:  Thunderbolt,
    palette:      Palette,
    pencilToLine: PencilToLine,
    megaphone:    Megaphone,
    video:        Video,
    briefcase:    Briefcase,
};

function CategoryIcon({ iconKey, color, size = 9 }) {
    const Icon = CATEGORY_ICON_MAP[iconKey] || Briefcase;
    return <Icon width={size} height={size} style={{ color, flexShrink: 0 }} />;
}

const CATEGORY_STYLES = {
  "UI Design":   { textColor: "#ff9a50", bg: "#ff640020", border: "#ff640038", iconKey: "palette"      },
  "Development": { textColor: "#50d4ff", bg: "#00aaff1a", border: "#00aaff33", iconKey: "thunderbolt"  },
  "Copywriting": { textColor: "#a78bfa", bg: "#7850ff1a", border: "#7850ff33", iconKey: "pencilToLine" },
  "Marketing":   { textColor: "#34d399", bg: "#00c8781a", border: "#00c87833", iconKey: "megaphone"   },
  "Video":       { textColor: "#fb7185", bg: "#f032501a", border: "#f0325033", iconKey: "video"       },
};

function getDeadlineColor(dueDateStr) {
  const daysLeft = Math.ceil((new Date(dueDateStr) - new Date()) / 86400000);
  if (daysLeft <= 3) return "#fb7185";
  if (daysLeft <= 7) return "#fbbf24";
  return "#ffffffbf";
}

function formatDate(dueDateStr) {
  return new Date(dueDateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskCard({ task, index = 0, onClick }) {
  const cat     = CATEGORY_STYLES[task.category] ?? CATEGORY_STYLES["Development"];
  const dlColor = getDeadlineColor(task.dueDate);
  const { data: session } = useSession();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const user = session?.user;
  const taskId = task._id || task.id;
  const bookmarked = taskId ? isBookmarked(taskId) : false;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, boxShadow: "0 20px 60px rgba(255,77,0,0.13), 0 0 0 1px rgba(255,77,0,0.20)" }}
      className="relative rounded-2xl overflow-hidden cursor-pointer flex flex-col"
      onClick={onClick}
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

        {/* Bookmark */}
        {user && taskId && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(taskId);
              toast(bookmarked ? "🔖 Bookmark removed" : "🔖 Task bookmarked!", {
                duration: 2000,
                style: { background: "#1a1a1a", color: "#fff", border: "1px solid rgba(255,180,0,0.25)", fontSize: 12, borderRadius: 10 },
              });
            }}
            title={bookmarked ? "Remove bookmark" : "Bookmark this task"}
            className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              border: bookmarked ? "1px solid rgba(255,160,0,0.45)" : "1px solid rgba(255,255,255,0.08)",
              background: bookmarked ? "rgba(255,160,0,0.12)" : "rgba(255,255,255,0.03)",
              color: bookmarked ? "#ffb300" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        )}

        {/* Category pill */}
        <div className="mb-[14px]">
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
            <CategoryIcon iconKey={cat.iconKey} color={cat.textColor} size={9} />
            {task.category}
          </span>
        </div>

        {/* Title */}
        <p className="text-[15px] font-bold leading-[1.35] tracking-[-0.01em] text-white/90 mb-[16px]">
          {task.title}
        </p>

        {/* Divider */}
        <div
          className="h-px mb-[16px]"
          style={{ background: "linear-gradient(90deg,rgba(255,77,0,0.18),rgba(255,255,255,0.05),transparent)" }}
        />

        {/* Client */}
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
            <div className="mt-1">
              <ClientRatingBadge
                clientId={task.clientId}
                clientEmail={task.clientEmail}
                clientName={task.clientName}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Budget + Deadline */}
        <div className="flex items-stretch gap-[10px]">

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

        </div>

      </div>
    </motion.article>
  );
}