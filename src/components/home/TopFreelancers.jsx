"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FreelancerCard from "./home-components/FreelancerCard";
import { getAllFreelancers } from "@/lib/api/home/getAllFreelancer";

// ─── Static fallback (shown while loading / on error) ─────────────────────────
const STATIC_FREELANCERS = [
  { _id: "f1", name: "Lena Müller",   image: "https://i.pravatar.cc/150?img=47", skills: ["Figma", "Motion", "Design Systems"], rating: 4.9, completedJobs: 214, emailVerified: true },
  { _id: "f2", name: "Arjun Sharma",  image: "https://i.pravatar.cc/150?img=12", skills: ["React", "Node.js", "PostgreSQL"],    rating: 4.8, completedJobs: 178, emailVerified: true },
  { _id: "f3", name: "Camille Dupont",image: "https://i.pravatar.cc/150?img=32", skills: ["SEO Copy", "Brand Voice", "B2B"],    rating: 5.0, completedJobs: 312, emailVerified: false },
  { _id: "f4", name: "Marcus Cole",   image: "https://i.pravatar.cc/150?img=68", skills: ["Meta Ads", "Google Ads"],            rating: 4.7, completedJobs: 93,  emailVerified: true },
  { _id: "f5", name: "Yuki Tanaka",   image: "https://i.pravatar.cc/150?img=55", skills: ["After Effects", "Premiere", "3D"],   rating: 4.9, completedJobs: 261, emailVerified: true },
  { _id: "f6", name: "Ivan Petrov",   image: "https://i.pravatar.cc/150?img=61", skills: ["AWS", "Docker", "Go", "Redis"],      rating: 4.8, completedJobs: 140, emailVerified: false },
];

export default function TopFreelancers() {
  const router = useRouter();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllFreelancers();
        if (Array.isArray(data) && data.length > 0) {
          setFreelancers(data.slice(0, 6));
        } else {
          setFreelancers(STATIC_FREELANCERS);
        }
      } catch {
        setFreelancers(STATIC_FREELANCERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayFreelancers = loading ? STATIC_FREELANCERS : freelancers;

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
              onClick={() => router.push("/freelancers")}
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

        {/* Freelancer grid — skeleton while loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 200,
                  borderRadius: 16,
                  background:
                    "linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayFreelancers.map((freelancer, i) => (
              <FreelancerCard
                key={freelancer._id ?? freelancer.id ?? i}
                freelancer={freelancer}
                index={i}
              />
            ))}
          </div>
        )}

      </div>

      {/* Shimmer keyframe */}
      <style>{`@keyframes shimmer { to { background-position: -200% 0; } }`}</style>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}