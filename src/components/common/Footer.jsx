import Link from "next/link";
import { Mail } from "lucide-react";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tasks", href: "/tasks" },
  { label: "Browse Freelancers", href: "/freelancers" },
  { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
];

const socialLinks = [
  { label: "X", href: "#", icon: XIcon },
  { label: "LinkedIn", href: "#", icon: LinkedinIcon },
    { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "GitHub", href: "#", icon: GithubIcon },
];


function  XIcon(props) {
  return (
    <svg

      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.656l-5.214-6.817-5.965 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}


function  LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
         <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.851-3.037-1.853 0-2.136 1.447-2.136 2.941v5.665H9.352V9h3.414v1.561h.048c.476-.9 1.637-1.85 3.368-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.114 20.452H3.558V9h3.556v11.452Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (

    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
      <rect width="16" height="16" x="4" y="4" rx="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.7" cy="7.3" r="1.1" fill="currentColor" />
    </svg>

  );
}

function FacebookIcon(props) {
  return   (
     <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M14.2 8.2V6.9c0-.62.42-.77.72-.77h1.84V3.02L14.22 3c-2.82 0-3.46 2.11-3.46 3.46V8.2H8.54v3.2h2.22V21h3.44v-9.6h2.32l.31-3.2H14.2Z" />
    </svg>
  );
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>

      <path d="M12 2.25c-5.38 0-9.75 4.37-9.75 9.75 0 4.31 2.8 7.96 6.68 9.25.49.09.67-.21.67-.47v-1.66c-2.72.59-3.29-1.17-3.29-1.17-.44-1.13-1.08-1.43-1.08-1.43-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.87 1.49 2.28 1.06 2.84.81.09-.63.34-1.06.62-1.3-2.17-.25-4.45-1.09-4.45-4.83 0-1.07.38-1.94 1.01-2.62-.1-.25-.44-1.25.1-2.59 0 0 .82-.26 2.69 1 .78-.22 1.6-.32 2.43-.33.82 0 1.65.11 2.43.33 1.86-1.26 2.68-1 2.68-1 .54 1.34.2 2.34.1 2.59.63.68 1.01 1.55 1.01 2.62 0 3.75-2.29 4.58-4.47 4.82.35.3.66.9.66 1.82v2.7c0 .26.18.57.67.47A9.753 9.753 0 0 0 21.75 12c0-5.38-4.37-9.75-9.75-9.75Z" />
    </svg>

  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-sm text-white/55 transition hover:text-[#ff4d00]"
    >
       {children}
     </Link>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
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
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
            Connect with skilled freelancers, post tasks, and get focused work
            delivered faster.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
            Navigation
          </h2>
          <div className="mt-4 grid gap-3">

            {footerLinks.map(({ label, href }) => (
              <FooterLink key={href} href={href}>
                {label}
              </FooterLink>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
            Contact
          </h2>
          <a
            href="mailto:hello@taskly.com"
            className="mt-4 inline-flex items-center gap-2 break-all text-sm text-white/55 transition hover:text-[#ff4d00]"
          >
            <Mail size={15} strokeWidth={2} className="shrink-0" />
            hello@taskly.com
          </a>

          <div className="mt-6 flex flex-wrap gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:border-[#ff4d00] hover:text-[#ff4d00]"

              >
                <Icon className="h-[17px] w-[17px]" />

              </a>
            ))}
           </div>
        </div>
      </div>

       <div className="border-t border-white/10 px-4 py-5 sm:px-6">
        <p className="mx-auto max-w-6xl text-sm text-white/40">
          Copyright {year} Taskly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}