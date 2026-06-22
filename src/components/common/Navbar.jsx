"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tasks", href: "/tasks" },
  { label: "Browse Freelancers", href: "/freelancers" },
];

const privateLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
];

const isLoggedIn = false;

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="group relative px-4 py-2">
      <span
        className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
          isActive ? "text-white" : "text-white/60 group-hover:text-white"
        }`}
      >
        {children}
      </span>

      <span className="absolute inset-0 z-0 scale-75 rounded-lg bg-white/5 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100" />

      {isActive && (
        <motion.span
          layoutId="activeNavLine"
          className="absolute -bottom-[1px] left-4 right-4 h-[2px] rounded-t-full bg-gradient-to-r from-transparent via-[#ff4d00] to-transparent shadow-[0_0_8px_#ff4d0080]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </Link>
  );
}

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      /* * CHANGED:
       * 1. bg-[#0d0400]/80 — matches the hero's radial gradient base color
       *    instead of plain black, so the navbar reads as part of the page
       *    rather than a mismatched grey glass bar.
       * 2. Raised opacity to 80% so backdrop-blur doesn't expose whatever
       *    sits behind it (e.g. browser default white before paint/scroll).
       * 3. Softened border to /15 so it doesn't fight with the new bg.
       */
      className="fixed left-0 right-0 top-0 z-50 border-b border-[#ff4d00]/15 bg-[#0d0400] shadow-[0_8px_32px_rgba(255,77,0,0.06)] backdrop-blur-2xl"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        
        <Link href="/" className="group flex items-center gap-1.5">
          <span className="text-2xl font-black tracking-tight text-white">
            Task
            <span
              style={{
                background: "linear-gradient(135deg, #ff4d00 0%, #ff8c42 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ly
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {publicLinks.map(({ label, href }) => (
            <NavLink key={href} href={href}>
              {label}
            </NavLink>
          ))}

          {isLoggedIn &&
            privateLinks.map(({ label, href }) => (
              <NavLink key={href} href={href}>
                {label}
              </NavLink>
            ))}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.03, borderColor: "#ff4d00", color: "#ff4d00" }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/75 backdrop-blur-sm transition-all duration-200"
            >
              <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
              Logout
            </motion.button>
          ) : (
            <>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.03, borderColor: "#ff4d00", color: "#ff4d00" }}
                  whileTap={{ scale: 0.97 }}
                  className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-2.5 text-sm font-semibold text-white/70 backdrop-blur-sm transition-all duration-200 sm:flex"
                >
                  <User size={16} />
                  Login
                </motion.button>
              </Link>

              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 28px #ff4d0066" }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)",
                    boxShadow: "0 0 18px #ff4d0040",
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />
                  Sign Up
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}