"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


const TESTIMONIALS = [
  {
    id: 1,
    company: "Launchpad Studio",
    quote:
      "I posted a task at 9am and had three qualified proposals by noon. The freelancer we hired shipped the entire landing page in 48 hours — that kind of speed just doesn't exist on other platforms.",
    boldPart: "The kind of speed that just doesn't exist elsewhere.",
    author: "Aryan Kapoor",
    role: "Founder, Launchpad Studio",
    variant: "line-graph",
    highlight: '"Saved 3 weeks of hiring"',
    metric1: { label: "Tasks Completed", value: "12" },
    metric2: { label: "Avg. Turnaround", value: "38h" },

    avatarAccent: "#ff4d00",
    avatarBg: "#1a0800",
    graphPoints: "0,200 60,170 120,145 180,100 240,85 300,50 360,30",
  },

  {
    id: 2,
    company: "GlowCart",
    quote:
      "We had a critical Stripe bug two days before our product launch. Found a dev on Taskly, fixed and deployed in under six hours. I honestly can't imagine what would've happened without this platform.",
    boldPart: "Fixed and deployed in under six hours.",
    author: "Sadia Rahman",
    role: "Co-founder, GlowCart",
    variant: "dashboard",
    highlight: '"Cut our dev cost by 60%"',
    metric1: { label: "Bug Fix Time", value: "6h" },
    metric2: { label: "Revenue Saved", value: "$14k" },
    avatarAccent: "#ff8040",
    avatarBg: "#120800",
    statsRow: [
      { label: "Revenue", value: "+340%", color: "#ff4d00" },
      { label: "Users", value: "2.1k", color: "#ff8040" },
      { label: "Uptime", value: "99.9%", color: "#34d399" },
    ],

  },

  {

    id: 3,
    company: "Freelancer (Full-stack Dev)",

     quote:
      "Taskly replaced three other platforms for me overnight. The clients are serious, the briefs are clear, and the escrow system means I actually get paid — every single time. My monthly income doubled within 90 days.",
    boldPart: "My monthly income doubled within 90 days.",
    author: "Nabil Hasan",
    role: "Full-stack Developer",
    variant: "bar-graph",
    highlight: '"Income doubled in 90 days"',
    metric1: { label: "Projects Done", value: "47" },
    metric2: { label: "Rating", value: "4.98★" },
    avatarAccent: "#ff6020",
    avatarBg: "#150a00",
    bars: [60, 95, 130, 185, 240, 300, 360],
  },
  {
    id: 4,
    company: "Orbit Agency",
       quote:
      "We white-label Taskly workflows for our overflow client work. It lets our 8-person agency punch like a 40-person one. Our clients never even know — they just see results delivered on time.",
    boldPart: "An 8-person agency punching like a 40-person one.",
    author: "Rafid Ahmed",
    role: "Founder, Orbit Agency",
    variant: "task-board",
    highlight: '"Scaled output 3x"',
    metric1: { label: "Tasks Outsourced", value: "120+" },

    metric2: { label: "Client Retention", value: "94%" },
       avatarAccent: "#ff5510",
    avatarBg: "#180a00",
    taskCols: [
      { title: "In Progress", count: 5, color: "#ff4d00" },
      { title: "In Review", count: 3, color: "#fbbf24" },
      { title: "Delivered", count: 18, color: "#34d399" },

    ],
  },
  {
    id: 5,
    company: "NovaSEO",
    quote:
      "I needed 10 SEO articles in a week for a product push. On Taskly I posted the task, vetted three writers in an afternoon, and had all 10 drafts in my inbox by Friday. The quality was genuinely impressive.",
    boldPart: "All 10 drafts in my inbox by Friday.",
    author: "Priya Mehta",
    role: "Head of Marketing, NovaSEO",
    variant: "line-graph",
    highlight: '"Organic traffic up 2.4x"',
    metric1: { label: "Articles Delivered", value: "10" },
    metric2: { label: "Time Saved", value: "4 days" },
    avatarAccent: "#ff7030",
    avatarBg: "#100600",

    graphPoints: "0,220 60,205 120,180 180,145 240,110 300,70 360,38",
  },
  {
      id: 6,
    company: "Freelancer (UI Designer)",
    quote:
      "Before Taskly I spent half my day chasing leads. Now I open the app in the morning, pick the tasks that match my stack, and bill out by evening. The platform does the pipeline work so I can focus on actual design.",
    boldPart: "The platform does the pipeline work.",
    author: "Zeynep Arslan",
    role: "UI/UX Designer",
      variant: "bar-graph",
    highlight: '"Zero lead-gen overhead"',
    metric1: { label: "Designs Shipped", value: "63" },
    metric2: { label: "Repeat Clients", value: "78%" },
    avatarAccent: "#ff4d00",
      avatarBg: "#130700",
    bars: [40, 70, 110, 155, 200, 265, 330],
  },
  {
    id: 7,
    company: "DropShip Pro",
    quote:
      "We ran a full brand refresh — logo, social kit, email templates — through Taskly in 11 days. Every single deliverable came back better than the brief. The escrow system kept everything professional.",
    boldPart: "Every deliverable came back better than the brief.",
    author: "Omar Rashid",
    role: "CEO, DropShip Pro",
      variant: "dashboard",

    highlight: '"Brand refresh in 11 days"',
      metric1: { label: "Assets Created", value: "34" },

    metric2: { label: "Budget Used", value: "$1,800" },
    avatarAccent: "#ff6830",
      avatarBg: "#160800",

    statsRow: [
      { label: "Brand Score", value: "+88%", color: "#ff4d00" },
      { label: "Assets", value: "34", color: "#ff8040" },
       { label: "On Time", value: "100%", color: "#34d399" },
    ],
  },
  {
    id: 8,
    company: "Freelancer (Video Editor)",
    quote:
      "Taskly clients know what they want and actually provide the assets. I spend zero time on misaligned revisions. I've done 31 projects this quarter with a 5-star rate — that's never happened on any other platform.",
    boldPart: "31 projects this quarter with a 5-star rate.",
    author: "Sofia Petrov",
    role: "Motion Designer & Video Editor",
    variant: "task-board",
    highlight: '"5★ on every project"',
    metric1: { label: "Videos Edited", value: "31" },
    metric2: { label: "Avg. Rating", value: "5.0★" },
    avatarAccent: "#ff3d00",
    avatarBg: "#1a0600",
    taskCols: [
      { title: "Editing", count: 4, color: "#ff4d00" },
      { title: "Revisions", count: 1, color: "#fbbf24" },
      { title: "Approved", count: 31, color: "#34d399" },
    ],
  },
];





function LineGraphVisual({ t }) {
  return (
    <div className="relative w-full h-full">
      
         <div
        className="absolute top-6 left-0 right-0 mx-auto w-[88%] h-[220px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#0d0400,#1a0800)",
           border: "1px solid rgba(255,77,0,0.18)",
        }}
      >
        
        {[100, 75, 50, 25, 0].map((v, i) => (
          <div
            key={v}
              className="absolute left-3 text-[9px]"
               style={{ top: 18 + i * 36, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace" }}
          >
            {v}
          </div>
        ))}
        
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {[0, 1, 2, 3, 4].map((i) => (
             <line key={i} x1="28" y1={26 + i * 36} x2="100%" y2={26 + i * 36}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}
          
          <defs>
            <linearGradient id={`lg-${t.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff4d00" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polyline
            points={t.graphPoints}

            fill="none"
            stroke="#ff4d00"
            strokeWidth="2.5"
            strokeLinecap="round"
              strokeLinejoin="round"
            transform="translate(32, 18)"
          />
          <polygon
            points={`32,218 ${t.graphPoints.split(" ").map(p => { const [x,y] = p.split(","); return `${Number(x)+32},${Number(y)+18}`; }).join(" ")} ${360+32},218`}
            fill={`url(#lg-${t.id})`}
          />
        </svg>

      </div>

      
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[120px] left-2 rounded-xl px-4 py-3 flex flex-col gap-1"
        style={{
          background: "#ff4d00",
          boxShadow: "0 8px 32px rgba(255,77,0,0.4)",
          minWidth: 120,
        }}
      >
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/70"

          style={{ fontFamily: "JetBrains Mono,monospace" }}>
          {t.metric1.label}
        </span>
        <span className="text-2xl font-black text-white">{t.metric1.value}</span>

        <span className="text-[10px] text-white/80">↑ 80%</span>
      </motion.div>

        <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-[100px] right-2 rounded-xl px-4 py-3 flex flex-col gap-1"
        style={{
          background: "rgba(18,6,0,0.92)",
          border: "1px solid rgba(255,77,0,0.28)",
          minWidth: 115,
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "JetBrains Mono,monospace" }}>
          {t.metric2.label}
         </span>

        <span className="text-xl font-black" style={{ color: "#ff8040" }}>{t.metric2.value}</span>
      </motion.div>

      
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[13px] italic"
        style={{ color: "#ff8040", fontFamily: "Georgia,serif", whiteSpace: "nowrap" }}
      >
        {t.highlight}
        <svg className="mx-auto mt-1" width="80" height="14" viewBox="0 0 80 14">
          <path d="M4 8 Q20 2 40 8 Q60 14 76 6" fill="none" stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function  DashboardVisual({ t }) {
  return (
    <div className="relative w-full h-full">
      
      <div
        className="absolute top-4 right-0 w-[72%] h-[200px] rounded-2xl overflow-hidden"
        style={{
           background: "linear-gradient(160deg,#0d0400,#1a0800)",
          border: "1px solid rgba(255,77,0,0.18)",
        }}
      >
        
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-[#ff4d00]" />
          <span className="text-[10px] font-bold text-white/50"
              style={{ fontFamily: "JetBrains Mono,monospace" }}>
            TASKLY DASHBOARD
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 p-3">
          {t.statsRow.map((s) => (
            <div key={s.label} className="rounded-lg p-2 text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-[8px] text-white/30 mb-1"
                style={{ fontFamily: "JetBrains Mono,monospace" }}>

                {s.label}
              </div>
              <div className="text-sm font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        
        <div className="flex items-end gap-1.5 px-4 pb-3 h-[68px]">
          {[30, 55, 45, 80, 65, 95, 70].map((h, i) => (
            <div

              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background: i === 5
                  ? "linear-gradient(180deg,#ff4d00,#cc3d00)"
                  : "rgba(255,77,0,0.22)",
              }}
            />

          ))}
        </div>
      </div>

      
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[110px] right-4 rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background: "rgba(18,6,0,0.94)",
          border: "1px solid rgba(255,77,0,0.3)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"

          style={{ background: "linear-gradient(135deg,#ff4d00,#cc3d00)", color: "#fff" }}>
          {t.author[0]}
        </div>
        <div>
          <div className="text-[11px] font-semibold text-white">{t.author}</div>
          <div className="text-[9px] text-white/35">{t.role.split(",")[1] || t.company}</div>

        </div>
      </motion.div>

      

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[170px] left-2 rounded-full px-4 py-2 text-[11px] font-bold italic"
        style={{
          background: "rgba(255,77,0,0.12)",
          border: "1px solid rgba(255,77,0,0.3)",
          color: "#ff8040",
          fontFamily: "Georgia,serif",

        }}
      >
        {t.highlight}
      </motion.div>

      
      <motion.div
        animate={{ y: [0, -6, 0] }}

        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute top-[80px] left-0 rounded-xl px-4 py-3"
        style={{
          background: "#ff4d00",
          boxShadow: "0 8px 28px rgba(255,77,0,0.4)",
        }}
      >
        <div className="text-[9px] font-bold uppercase tracking-widest text-white/70"
          style={{ fontFamily: "JetBrains Mono,monospace" }}>
             {t.metric1.label}
        </div>
        <div className="text-2xl font-black text-white">{t.metric1.value}</div>

      </motion.div>
    </div>
  );
}

function BarGraphVisual({ t }) {
  return   (

    <div className="relative w-full h-full">
      
      <div
        className="absolute top-6 left-0 right-0 mx-auto w-[88%] h-[220px] rounded-2xl overflow-hidden flex items-end px-5 pb-5 gap-3"

        style={{
          background: "linear-gradient(160deg,#0d0400,#1a0800)",
          border: "1px solid rgba(255,77,0,0.18)",
        }}
      >
        
        <div className="absolute left-2 top-4 bottom-5 flex flex-col justify-between">
          {[400, 300, 200, 100, 0].map((v) => (
            <span key={v} className="text-[8px]"
              style={{ color: "rgba(255,255,255,0.18)", fontFamily: "JetBrains Mono,monospace" }}>
              {v}
              </span>
          ))}
        </div>

        {t.bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-md"
            initial={{ height: 0 }}
            whileInView={{ height: h }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: i === t.bars.length - 1
                ? "linear-gradient(180deg,#ff4d00,#cc3d00)"
                : i >= t.bars.length - 3
                ? "linear-gradient(180deg,rgba(255,77,0,0.6),rgba(204,61,0,0.4))"
                : "rgba(255,77,0,0.18)",
              boxShadow: i === t.bars.length - 1 ? "0 0 20px rgba(255,77,0,0.4)" : "none",
            }}
          />
        ))}
      </div>

      
      <motion.div
           animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[100px] left-0 rounded-xl px-4 py-3"
        style={{
          background: "#ff4d00",

             boxShadow: "0 8px 32px rgba(255,77,0,0.4)",
        }}
      >
        <div className="text-[9px] font-bold uppercase tracking-widest text-white/70"
          style={{ fontFamily: "JetBrains Mono,monospace" }}>
          {t.metric1.label}
        </div>
           <div className="text-2xl font-black text-white">{t.metric1.value}</div>
      </motion.div>

      
       <motion.div
         animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}

        className="absolute bottom-[90px] right-0 rounded-xl px-4 py-3"
        style={{
          background: "rgba(18,6,0,0.94)",
          border: "1px solid rgba(255,77,0,0.28)",

          backdropFilter: "blur(8px)",
        }}
      >
        <div className="text-[9px] font-bold uppercase tracking-widest"

          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace" }}>
          {t.metric2.label}
        </div>
        <div className="text-xl font-black" style={{ color: "#ff8040" }}>{t.metric2.value}</div>
      </motion.div>

      
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 italic text-[12px] whitespace-nowrap"
        style={{ color: "#ff8040", fontFamily: "Georgia,serif" }}
       >
        {t.highlight}
      </div>
    </div>
  );

}


function TaskBoardVisual({ t }) {
  return (
    <div className="relative w-full h-full">
      
      <div
        className="absolute top-4 left-0 right-0 mx-auto w-full h-[230px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#0d0400,#1a0800)",
          border: "1px solid rgba(255,77,0,0.18)",

        }}
      >

        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-[#ff4d00]" />
          <span className="text-[10px] font-bold text-white/50"

            style={{ fontFamily: "JetBrains Mono,monospace" }}>
            TASK BOARD
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 p-3 h-full">
          {t.taskCols.map((col) => (
              <div key={col.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-[8px] font-bold text-white/40"
                  style={{ fontFamily: "JetBrains Mono,monospace" }}>
                  {col.title}
                </span>
              </div>
              
              {Array.from({ length: Math.min(col.count, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-md h-[22px] w-full"

                  style={{
                    background: i === 0
                      ? `${col.color}22`
                      : "rgba(255,255,255,0.04)",
                    border: i === 0
                      ? `1px solid ${col.color}44`
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                />
              ))}

              {col.count > 3 && (
                 <div className="text-[8px] text-white/25 pl-1"
                  style={{ fontFamily: "JetBrains Mono,monospace" }}>

                  +{col.count - 3} more
                </div>
              )}
            </div>

          ))}
        </div>
      </div>

      
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}

        className="absolute bottom-[100px] left-0 rounded-xl px-4 py-3"
        style={{
           background: "#ff4d00",
           boxShadow: "0 8px 32px rgba(255,77,0,0.4)",
         }}
      >
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/70"
          style={{ fontFamily: "JetBrains Mono,monospace" }}>
          {t.metric1.label}
        </div>
          <div className="text-2xl font-black text-white">{t.metric1.value}</div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -4, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-[90px] right-0 rounded-xl px-4 py-3"
        style={{
          background: "rgba(18,6,0,0.94)",
          border: "1px solid rgba(255,77,0,0.28)",
          backdropFilter: "blur(8px)",

        }}
      >
        <div className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace" }}>
          {t.metric2.label}
          </div>
        <div className="text-xl font-black" style={{ color: "#ff8040" }}>{t.metric2.value}</div>

      </motion.div>

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 italic text-[12px] whitespace-nowrap"
        style={{ color: "#ff8040", fontFamily: "Georgia,serif" }}
      >
        {t.highlight}
      </div>
       </div>
  );
}


function RightVisual({ t }) {

  const  map = {
    "line-graph": LineGraphVisual,
    "dashboard": DashboardVisual,
    "bar-graph": BarGraphVisual,
    "task-board": TaskBoardVisual,
  };
  const Component = map[t.variant] || LineGraphVisual;
  return <Component t={t} />;
}


function  Dots({ total, current, onSelect }) {
  return (
      <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => (
         <button
          key={i}
          onClick={() => onSelect(i)}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
             background: i === current ? "#ff4d00" : "rgba(255,255,255,0.15)",
            border: "none",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );

}


export default function TestimonialsShowcase() {
  const [index, setIndex] = useState(0);

     const  [dir, setDir] = useState(1);
  const t = TESTIMONIALS[index];
     const total = TESTIMONIALS.length;

  function go(next) {
    setDir(next > index ? 1 : -1);
    setIndex(next);
  }
  function prev() { go((index - 1 + total) % total); }
  function next() { go((index + 1) % total); }

  

  useEffect(() => {
    const id = setInterval(() => { setDir(1); setIndex((i) => (i + 1) % total); }, 7000);

    return () => clearInterval(id);
  }, [index]);

  const  variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
     center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return   (
    <section className="relative bg-black py-28 overflow-hidden">

      
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, #120600 0%, #000 60%)",
        }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.028]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="ts-iso" x="0" y="0" width="60" height="34.64" patternUnits="userSpaceOnUse">
            <path d="M0 17.32 L30 0 L60 17.32 L30 34.64 Z" fill="none" stroke="#ff4d00" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ts-iso)" />
      </svg>

      
      <div className="relative z-10 max-w-6xl mx-auto px-6 mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3"
            style={{
              fontFamily: "JetBrains Mono,monospace",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#ff4d00",
            }}

          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
             whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-[clamp(2rem,4.5vw,3.4rem)] font-black tracking-[-0.03em] leading-[1.04] text-white"
          >
            Real Results From{" "}

            <span
              style={{
                background: "linear-gradient(135deg,#ff4d00,#ff8c42)",

                WebkitBackgroundClip: "text",

                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
                 Taskly Users
            </span>
          </motion.h2>
        </div>

        
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <button
            onClick={next}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg,#ff4d00,#cc3d00)",
                 boxShadow: "0 0 18px rgba(255,77,0,0.4)",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              border: "none",
            }}
          >
            →
          </button>
        </div>
         </div>

      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={t.id}
             custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-[1fr_1.15fr] gap-6 items-stretch"
          >
            
            <div
              className="rounded-3xl overflow-hidden flex flex-col justify-between"
              style={{
                background: "linear-gradient(160deg,#f9f7f5 0%,#f2ede8 100%)",
                minHeight: 420,
              }}
            >
              
              <div

                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg,#ff4d00,#ff8c42,transparent)" }}
              />

               <div className="flex flex-col flex-1 p-8 gap-5">
                
                <p
                  className="text-[17px] font-black tracking-[-0.02em]"
                  style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#111" }}
                >
                  {t.company}
                </p>

                
                 <p className="text-[15px] leading-[1.75] text-[#444] flex-1">
                  {t.quote.replace(t.boldPart, "").trim().split("—")[0]}
                  {t.quote.includes("—") && <span> — </span>}
                   <strong className="font-black text-[#111]">{t.boldPart}</strong>
                  {t.quote.includes(t.boldPart) && t.quote.split(t.boldPart)[1]

                    ? <span>{t.quote.split(t.boldPart)[1]}</span>
                    : null}
                </p>

                
                <div className="h-px bg-black/8 w-full" />

                
                <div className="flex items-center gap-3">
                   <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#ff4d00,#cc3d00)",
                      color: "#fff",
                    }}
                  >
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#111]">— {t.author}</div>
                    <div className="text-[11px] text-[#888]">{t.role}</div>
                    </div>
                </div>
              </div>
            </div>

            
            <div
              className="relative rounded-3xl overflow-hidden"

              style={{

                background: "linear-gradient(160deg,#0a0300,#1a0800)",
                border: "1px solid rgba(255,77,0,0.14)",
                minHeight: 420,
                }}
            >
              
              <div
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[40%]"
                style={{
                  background: "radial-gradient(ellipse at center,rgba(255,77,0,0.12),transparent 70%)",
                  filter: "blur(20px)",
                }}
              />

              
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{ zIndex: 2, opacity: 0.92 }}
              >
                
              </div>

              
              <div
                className="absolute inset-0 p-6"
                style={{ zIndex: 3 }}
              >
                <RightVisual t={t} />
              </div>

              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 right-4 rounded-xl flex items-center gap-2.5 px-4 py-2.5"

                style={{
                  background: "rgba(8,2,0,0.88)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(12px)",
                  zIndex: 10,
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                  style={{ background: "linear-gradient(135deg,#ff4d00,#cc3d00)", color: "#fff" }}
                >
                  {t.author[0]}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white">{t.author}</div>
                  <div
                    className="text-[9px] flex items-center gap-1"
                    style={{ color: "rgba(255,255,255,0.35)" }}

                  >
                    <span style={{ color: "#ff4d00" }}>◆</span>
                    {t.company}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        
          <div className="mt-8 flex items-center justify-between">

          <Dots total={total} current={index} onSelect={go} />
          <span
            className="text-[11px]"
            style={{
              fontFamily: "JetBrains Mono,monospace",
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.14em",
            }}
          >

            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        </div>

      
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}