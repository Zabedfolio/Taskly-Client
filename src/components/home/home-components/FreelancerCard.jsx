import { motion } from "framer-motion";




export default function FreelancerCard({ freelancer, index, skillStyle, StarRating, SKILL_PALETTE }) {
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

        {/* Avatar + name + title */}
        <div className="flex items-center gap-[12px] mb-[18px]">
          <img
            src={freelancer.avatarUrl}
            alt={freelancer.name}
            className="w-[52px] h-[52px] rounded-full object-cover shrink-0"
            style={{ border: "2px solid rgba(255,77,0,0.35)" }}
          />
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-white/90 leading-tight truncate">
              {freelancer.name}
            </div>
            <div
              className="text-[11px] font-medium mt-[3px] truncate"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              {freelancer.title}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-[6px] mb-[16px]">
          {freelancer.skills.map((skill, i) => {
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
            <StarRating rating={freelancer.rating} />
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
              {freelancer.jobsDone.toLocaleString()}
            </div>
          </div>
        </div>

      </div>
    </motion.article>
  );
}