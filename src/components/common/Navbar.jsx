"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tasks", href: "/tasks" },
  { label: "Browse Freelancers", href: "/freelancers" },
];

const privateLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
];

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="group relative px-3 py-2">
      <span
        className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
          isActive ? "text-white" : "text-white/55 group-hover:text-white"
        }`}
      >
        {children}
      </span>

      <span className="absolute inset-0 z-0 scale-75 rounded-lg bg-white/5 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100" />

      {isActive && (
        <motion.span
          layoutId="activeNavLine"
          className="absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-t-full bg-gradient-to-r from-transparent via-[#ff4d00] to-transparent shadow-[0_0_8px_#ff4d0080]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isLoggedIn = !!user;

  console.log("Navbar user:", user);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-4 z-50 px-4 sm:top-5 sm:px-6"
    >
      <nav
        className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl border border-[#ff4d00]/20 px-4 py-3 shadow-[0_8px_32px_rgba(255,77,0,0.12)] backdrop-blur-xl sm:px-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(38,12,2,0.92) 0%, rgba(13,4,0,0.92) 100%)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <img
            src="https://i.ibb.co.com/RkRMLc0c/Untitled-design.png"
            alt="Taskly logo"
            className="h-8 w-8 rounded-[9px] object-cover shadow-[0_2px_8px_rgba(255,77,0,0.35)]"
          />
          <span className="text-base font-bold tracking-tight text-white sm:text-[17px]">
            Taskly
          </span>
        </Link>

        {/* Desktop links — absolutely centered on the navbar, independent of
            how wide the logo or the right-side button happens to be */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex">
          {navLinks.map(({ label, href }) => (
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

        {isLoggedIn ? (
          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            <img
              src={user.image || "https://i.ibb.co.com/RkRMLc0c/Untitled-design.png"}
              alt={user.name || "User avatar"}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/15"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-shadow duration-200 hover:shadow-[0_0_22px_rgba(255,255,255,0.25)]"
            >
              Logout
            </motion.button>
          </div>
        ) : (
          <Link href="/auth/login" className="hidden shrink-0 md:block">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition-shadow duration-200"
              style={{
                background: "linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)",
                boxShadow: "0 0 18px #ff4d0040",
              }}
            >
              Login
            </motion.button>
          </Link>
        )}

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/5 hover:text-white md:hidden"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-[#ff4d00]/20 shadow-[0_12px_32px_rgba(0,0,0,0.45)] md:hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(38,12,2,0.98) 0%, rgba(13,4,0,0.98) 100%)",
              }}
            >
              <div className="flex flex-col px-2 py-2">
                {navLinks.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}

                {isLoggedIn &&
                  privateLinks.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {label}
                    </Link>
                  ))}

                {isLoggedIn ? (
                  <div className="mx-2 mt-2 mb-1 flex items-center gap-2.5">
                    <img
                      src={user.image || "https://i.ibb.co.com/RkRMLc0c/Untitled-design.png"}
                      alt={user.name || "User avatar"}
                      className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-2 mt-2 mb-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)",
                    }}
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}