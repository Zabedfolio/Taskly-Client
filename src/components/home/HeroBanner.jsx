"use client";

import { motion } from "framer-motion";
import { ArrowRight, Rocket, Briefcase } from "lucide-react";

import HeroLayers from "./home-components/HeroLayers";


const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const fadeIn = {
     hidden: { opacity: 0 },

  show: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.9, ease: "easeOut", delay },
  }),
};


function Orb({ className, delay = 0 }) {
  return (

    <motion.div
      className={className}
       animate={{ y: [0, -18, 0], opacity: [0.45, 0.7, 0.45] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}


function PlatformBadge() {
  return (
    <motion.div
      variants={fadeUp}
      custom={0}
      initial="hidden"
      animate="show"
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff4d00]/25 bg-[#ff4d00]/8 px-4 py-1.5"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d00] shadow-[0_0_6px_#ff4d00]" />
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff4d00]">
        Over 10k Tasks Completed

      </span>
    </motion.div>
  );
}


export default function HeroBanner() {
  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-black pt-40">

      
      <div
        className="pointer-events-none absolute inset-0"
          style={{

          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #1a0800 0%, #0d0400 35%, #000000 70%)",
        }}
      />

      
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[38vh] w-[90vw] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse at center, #ff4d0033 0%, #ff4d0008 55%, transparent 75%)",
          filter: "blur(40px)",
          }}

         />

      
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="iso-grid" x="0" y="0" width="60" height="34.64" patternUnits="userSpaceOnUse">
            <path d="M0 17.32 L30 0 L60 17.32 L30 34.64 Z" fill="none" stroke="#ff4d00" strokeWidth="0.6" />

          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#iso-grid)" />
      </svg>

      
      <Orb className="pointer-events-none absolute left-[8%] top-[22%] h-56 w-56 rounded-full bg-[#ff4d00] blur-[72px] opacity-[0.07]" delay={0} />
      <Orb className="pointer-events-none absolute right-[12%] top-[30%] h-40 w-40 rounded-full bg-[#ff8040] blur-[60px] opacity-[0.06]" delay={1.5} />
      <Orb className="pointer-events-none absolute bottom-[18%] left-[38%] h-32 w-32 rounded-full bg-[#ff4d00] blur-[50px] opacity-[0.05]" delay={3} />

      
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-0">

        

        <div>
          <PlatformBadge />

          
          <motion.h1
            variants={fadeUp}
            custom={0.15}
            initial="hidden"
            animate="show"
            className="mb-6 text-[clamp(2.6rem,5vw,4.6rem)] font-black leading-[1.04] tracking-tight text-white"
          >
               Get Your Tasks
            <br />
            Done{" "}
            <span className="relative inline-block">
              <span

                style={{
                  background: "linear-gradient(135deg, #ff4d00 0%, #ff8c42 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                By Skilled
              </span>

              <motion.span

                className="absolute -bottom-1 left-0 h-[3px] rounded-full"
                style={{

                   background: "linear-gradient(90deg, #ff4d00, #ff8c42)",
                  boxShadow: "0 0 10px #ff4d0080",
                }}
                  initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.7, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>{" "}
            Freelancers
             </motion.h1>

          
          <motion.p
            variants={fadeUp}
            custom={0.35}

               initial="hidden"
            animate="show"
            className="mb-10 max-w-[480px] text-[1.05rem] leading-[1.75] text-white/50"
             >
             Taskly connects clients with top-tier freelancers for fast, focused

             micro-tasks — from design sprints to code fixes. Post a task, receive
            proposals, and ship results without the overhead.
             </motion.p>

          
          <motion.div
              variants={fadeUp}
            custom={0.5}
               initial="hidden"
             animate="show"
            className="flex flex-wrap gap-4"
          >
              <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 28px #ff4d0066" }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-7 py-3.5 text-[0.95rem] font-semibold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)",
                boxShadow: "0 0 18px #ff4d0040",
              }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />
              <Briefcase size={16} strokeWidth={2.2} />
              Post a Task
              <ArrowRight size={15} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, borderColor: "#ff4d00", color: "#ff4d00" }}
                 whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-[0.95rem] font-semibold text-white/75 backdrop-blur-sm transition-all duration-200"
            >
              <Rocket size={16} strokeWidth={2.2} />
              Browse Tasks
              <ArrowRight size={15} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          
          <motion.div
            variants={fadeIn}
            custom={0.9}
            initial="hidden"
            animate="show"
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {[
              { value: "10k+", label: "Tasks Posted" },
               { value: "4.9★", label: "Avg. Rating" },
              { value: "$2M+", label: "Paid Out" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-white">{value}</span>
                <span className="text-xs text-white/35">{label}</span>
              </div>
               ))}
          </motion.div>

        </div>

        
        <div className="hidden lg:flex lg:items-center lg:justify-center">

          <HeroLayers />
        </div>

      </div>

      
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}