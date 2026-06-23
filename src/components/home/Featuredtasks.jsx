"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TaskCard from "./home-components/Taskcard";
import { getAllTasks } from "@/lib/api/home/getAllTasks";

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
  },
];

// TODO: Replace STATIC_TASKS with real DB fetch — e.g. await getLatestOpenTasks({ limit: 6 })
// Expected shape per task:
//   { id, title, clientName, clientInitials, clientAvatarGradient,
//     clientAvatarText, category, budget (number), dueDate (ISO string) }

export default function FeaturedTasks({ tasks }) {
  const [dbTasks, setDbTasks] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllTasks();
        if (Array.isArray(data)) {
          const mapped = data.map(t => {
            const mapCategory = (cat) => {
              if (!cat) return "Development";
              if (cat.includes("UI") || cat.includes("Design")) return "UI Design";
              if (cat.includes("Development") || cat.includes("Web") || cat.includes("Mobile")) return "Development";
              if (cat.includes("Copy") || cat.includes("Content") || cat.includes("Writing")) return "Copywriting";
              if (cat.includes("Marketing") || cat.includes("SEO")) return "Marketing";
              if (cat.includes("Video") || cat.includes("Animation")) return "Video";
              return "Development";
            };

            const getInitials = (name) => {
              if (!name) return "??";
              return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            };

            const GRADIENTS = [
              "linear-gradient(135deg,#7c3aed,#4f46e5)",
              "linear-gradient(135deg,#0891b2,#0e7490)",
              "linear-gradient(135deg,#a78bfa,#7c3aed)",
              "linear-gradient(135deg,#059669,#047857)",
              "linear-gradient(135deg,#f43f5e,#e11d48)",
              "linear-gradient(135deg,#f59e0b,#d97706)"
            ];

            const getGradient = (name) => {
              if (!name) return GRADIENTS[0];
              let sum = 0;
              for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
              return GRADIENTS[sum % GRADIENTS.length];
            };

            return {
              id: t._id,
              title: t.title,
              clientName: t.clientName || "Client",
              clientInitials: getInitials(t.clientName),
              clientAvatarGradient: getGradient(t.clientName),
              clientAvatarText: "#ffffff",
              category: mapCategory(t.category),
              budget: t.budget || 0,
              dueDate: t.deadline || new Date().toISOString()
            };
          });
          setDbTasks(mapped.reverse().slice(0, 6));
        }
      } catch (err) {
        console.error("Error loading featured tasks:", err);
      }
    }
    load();
  }, []);

  const displayTasks = tasks ?? (dbTasks.length > 0 ? dbTasks : STATIC_TASKS);

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
          <pattern id="ft-iso-grid" x="0" y="0" width="60" height="34.64" patternUnits="userSpaceOnUse">
            <path d="M0 17.32 L30 0 L60 17.32 L30 34.64 Z" fill="none" stroke="#ff4d00" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ft-iso-grid)" />
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

        {/* Task grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayTasks.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} />
          ))}
        </div>

      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}