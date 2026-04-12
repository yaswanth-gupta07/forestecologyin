import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/gallery", label: "Gallery" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full max-w-[100vw] min-w-0 flex items-center justify-start gap-3 px-4 md:px-6 pt-4">
      <Link href="/" className="min-w-0 flex-shrink font-black text-xl uppercase tracking-[0.08em] text-[#F2FBF7] hover:text-[#60d3a1] transition-colors md:text-4xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        Forest Ecology <span className="text-[#63D3A6]">Lab</span>
      </Link>
      <nav className="flex-shrink-0 rounded-2xl bg-[#0d2818] px-3 py-2 md:rounded-3xl md:px-5 md:py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#D1ECDC] md:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            Menu
          </button>

          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-[#60d3a1] ${router.pathname === link.href ? "text-[#60d3a1]" : "text-[#C5E8D4]"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu - dimmed backdrop + compact nav dropdown */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="backdrop"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/40 md:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            />
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="fixed right-4 top-20 z-[60] w-[calc(100%-2rem)] max-w-xs rounded-2xl border border-white/10 bg-[#0d2818]/95 p-3 shadow-xl backdrop-blur-md md:hidden"
            >
              <div className="flex flex-col gap-0.5">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-4 py-2.5 text-sm ${router.pathname === link.href ? "bg-[#63D3A6]/25 text-[#60d3a1]" : "text-[#CFEADA] hover:bg-white/5"
                      }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
