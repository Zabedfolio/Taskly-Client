"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User, Settings, LogOut, LayoutDashboard, DollarSign } from "lucide-react";

import { authClient, useSession } from "@/lib/auth-client";

import { useTheme } from "@/contexts/ThemeContext";
import NotificationBell from "@/components/common/NotificationBell";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tasks", href: "/browse" },
  { label: "Browse Freelancers", href: "/freelancers" },
];


const DASHBOARD_ROUTES = {
  client:     "/dashboard/client",
    freelancer: "/dashboard/freelancer",
  admin:      "/dashboard/admin",
};

function getDashboardHref(role) {
  return DASHBOARD_ROUTES[role] ?? "/dashboard";
}

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + "/");

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


function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  if (!mounted) return null;

  const  isDark = theme === "dark";

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
         style={{
        width: 36, height: 36,
        borderRadius: 10,
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.22s",
           color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}

          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {isDark ? (
            
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
             ) : (
            
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />

              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                 <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />

              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
         </motion.span>
      </AnimatePresence>

    </button>
  );
}

export default function  Navbar() {
  const  [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const  router = useRouter();
  const { theme } = useTheme();
  const user = session?.user;
  const isLoggedIn = !!user;
  const  isDark = theme === "dark";

  const profileDropdownRef = useRef(null);

  
    useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
  useEffect(() => {

    if (user?.isBlocked) {
      handleLogout();

    }
  }, [user]);

  const dashboardHref = getDashboardHref(user?.role);

  
  async function handleLogout() {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.refresh();

            router.push("/auth/login");
          },

        },
      });
    } catch (err) {
      console.warn("signOut request failed:", err);
      router.refresh();
      router.push("/auth/login");
    }
  }

  const navBg = isDark
    ? "linear-gradient(180deg, rgba(38,12,2,0.92) 0%, rgba(13,4,0,0.92) 100%)"
    : "linear-gradient(180deg, rgba(255,250,245,0.95) 0%, rgba(248,245,240,0.95) 100%)";


  const borderColor = isDark ? "rgba(255,77,0,0.2)" : "rgba(255,77,0,0.15)";

    const logoTextColor = isDark ? "#fff" : "#1a1a1a";

     return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-4 z-50 px-4 sm:top-5 sm:px-6"
    >
      <nav

        className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(255,77,0,0.12)] backdrop-blur-xl sm:px-5"
        style={{
          background: navBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <img
            src="https://i.ibb.co.com/RkRMLc0c/Untitled-design.png"
            alt="Taskly logo"

            className="h-8 w-8 rounded-[9px] object-cover shadow-[0_2px_8px_rgba(255,77,0,0.35)]"
           />
          <span className="text-base font-bold tracking-tight sm:text-[17px]" style={{ color: logoTextColor }}>
            Taskly
          </span>
        </Link>

        

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex">
          {navLinks.map(({ label, href }) => (
            <NavLink key={href} href={href}>
              {label}

              </NavLink>
          ))}

          {isLoggedIn && (
            <NavLink href={dashboardHref}>Dashboard</NavLink>
          )}
        </div>

        
        <div className="hidden shrink-0 items-center gap-2.5 md:flex">
          
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              
              <NotificationBell />

              
              <div ref={profileDropdownRef} className="relative z-50">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((open) => !open)}

                  className="flex items-center gap-1.5 rounded-full p-0.5 transition-all hover:bg-white/5 focus:outline-none"

                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"

                >
                  <img

                    src={user.image || "https://i.ibb.co.com/RkRMLc0c/Untitled-design.png"}

                    alt={user.name || "User avatar"}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[#ff4d00]/30 hover:ring-[#ff4d00] transition-all"
                  />
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isDark ? "text-white/50" : "text-black/50"
                    } ${isProfileDropdownOpen ? "rotate-180 text-[#ff4d00]" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                      style={{
                        background: isDark
                          ? "linear-gradient(180deg, rgba(38,12,2,0.96) 0%, rgba(13,4,0,0.98) 100%)"
                          : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,248,245,0.98) 100%)",
                        borderColor: isDark ? "rgba(255,77,0,0.22)" : "rgba(255,77,0,0.15)",
                        color: isDark ? "#fff" : "#1a1a1a",
                      }}
                     >
                      
                      <div className="flex items-center gap-3 pb-3">
                        <img
                          src={user.image || "https://i.ibb.co.com/RkRMLc0c/Untitled-design.png"}
                          alt={user.name || "User avatar"}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-bold leading-tight" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                            {user.name || "User"}
                          </h4>
                          <p className="truncate text-[11px] leading-tight text-white/40" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                            {user.email}
                          </p>
                          <span
                            className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                               style={{
                              color: user.role === "freelancer" ? "#22c55e" : user.role === "admin" ? "#a855f7" : "#ff4d00",
                              background: user.role === "freelancer" ? "rgba(34,197,94,0.1)" : user.role === "admin" ? "rgba(168,85,247,0.1)" : "rgba(255,77,0,0.1)",
                              border: `1px solid ${
                                user.role === "freelancer"
                                    ? "rgba(34,197,94,0.2)"
                                  : user.role === "admin"
                                  ? "rgba(168,85,247,0.2)"
                                  : "rgba(255,77,0,0.2)"
                              }`,
                            }}

                          >
                            ● {user.role || "client"}
                          </span>

                        </div>
                      </div>

                      
                      <div className="h-[1px] my-1" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />

                      
                      <div className="flex flex-col gap-0.5 py-1">
                        <Link
                          href={dashboardHref}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:bg-[#ff4d00]/10 hover:text-[#ff4d00]"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)",
                          }}

                        >
                          <LayoutDashboard size={13} />
                           Dashboard
                        </Link>

                        <Link
                          href={`${dashboardHref}/settings`}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:bg-[#ff4d00]/10 hover:text-[#ff4d00]"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)",
                          }}
                        >
                          <Settings size={13} />

                          Settings

                        </Link>


                        {user.role === "freelancer" && (
                          <Link
                            href="/dashboard/freelancer/earnings"
                            onClick={() => setIsProfileDropdownOpen(false)}
                             className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:bg-[#ff4d00]/10 hover:text-[#ff4d00]"
                             style={{
                              color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)",
                            }}
                          >
                            <DollarSign size={13} />
                            Earnings
                          </Link>
                        )}
                      </div>

                      
                      <div className="h-[1px] my-1" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />

                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all text-[#ef4444] hover:bg-[#ef4444]/10"
                      >
                        <LogOut size={13} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
               </>
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
        </div>

        
         <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
           className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5 md:hidden"
          style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)" }}

        >
           {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        
        <AnimatePresence>
             {isMenuOpen && (
               <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}

              className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-[#ff4d00]/20 shadow-[0_12px_32px_rgba(0,0,0,0.45)] md:hidden"
              style={{

                background: isDark

                  ? "linear-gradient(180deg, rgba(38,12,2,0.98) 0%, rgba(13,4,0,0.98) 100%)"
                  : "linear-gradient(180deg, rgba(255,250,245,0.98) 0%, rgba(248,245,240,0.98) 100%)",
              }}
            >
              <div className="flex flex-col px-2 py-2">
                   {navLinks.map(({ label, href }) => (
                  <Link
                    key={href}

                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)" }}
                  >
                    {label}
                  </Link>
                ))}

                {isLoggedIn && (
                  <>
                    <Link
                      href={dashboardHref}
                      onClick={() => setIsMenuOpen(false)}
                        className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                      style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)" }}
                       >
                      Dashboard

                    </Link>

                    <Link
                      href={`${dashboardHref}/settings`}
                       onClick={() => setIsMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                      style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)" }}
                    >
                      Settings
                    </Link>

                    {user.role === "freelancer" && (

                      <Link
                        href="/dashboard/freelancer/earnings"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                        style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)" }}
                      >
                        Earnings
                      </Link>
                    )}
                  </>
                )}

                
                  <div className="mx-2 mt-1 flex items-center justify-between rounded-xl px-3 py-2">
                  <span className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                    {isDark ? "Dark mode" : "Light mode"}
                  </span>
                  <ThemeToggle />
                </div>

                {isLoggedIn ? (
                  <div className="mx-2 mt-2 mb-1 flex items-center gap-2.5">
                    <img
                       src={user.image || "https://i.ibb.co.com/RkRMLc0c/Untitled-design.png"}
                      alt={user.name || "User avatar"}
                        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                    />

                    <button
                      type="button"
                       onClick={() => { handleLogout(); setIsMenuOpen(false); }}

                      className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                      style={{ background: isDark ? "#fff" : "#1a1a1a", color: isDark ? "#000" : "#fff" }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link

                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-2 mt-2 mb-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)" }}
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