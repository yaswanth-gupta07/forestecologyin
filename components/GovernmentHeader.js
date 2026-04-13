import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/gallery", label: "Gallery" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
];

export default function GovernmentHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    links.forEach((link) => {
      if (link.href !== router.pathname) {
        router.prefetch(link.href);
      }
    });
  }, [router]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#0b2418]/95 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
          : "bg-[#0f2c1f]/92 backdrop-blur-sm"
      }`}
    >
      <div className="w-full px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Link href="/" className="min-w-0">
            <p className="truncate text-lg font-black uppercase tracking-[0.12em] text-[#ECF9F1]">
              Forest Ecology Lab
            </p>
            <p className="truncate text-[11px] font-medium text-[#8BDDB9]">
              Sreenath Subrahmanyam | IISc | SRMAP
            </p>
          </Link>
          <button
            type="button"
            className="rounded-lg border border-[#63D3A6]/40 px-3 py-1.5 text-xs font-medium text-[#C8E9D8]"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>

        <div className="hidden items-center lg:flex">
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="min-w-0">
              <p className="truncate text-2xl font-black uppercase tracking-[0.12em] text-[#ECF9F1]">
                Forest Ecology Lab
              </p>
              <p className="truncate text-xs font-medium text-[#8BDDB9]">
                Sreenath Subrahmanyam | IISc | SRMAP
              </p>
            </Link>
          </div>

          <nav className="flex items-center justify-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  router.pathname === link.href
                    ? "text-[#8BDDB9]"
                    : "text-[#D6F1E3] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end">
            <Link
              href="/team#collaborators"
              className="rounded-full border border-[#63D3A6]/60 px-3 py-1.5 text-sm font-semibold text-[#8DE2BD] transition hover:bg-[#63D3A6]/20"
            >
              Collaborators
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/55 lg:hidden"
              aria-label="Close menu backdrop"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 top-0 z-[60] h-screen w-[68vw] max-w-[300px] min-w-[240px] border-r border-[#63D3A6]/25 bg-[#0b2418] p-4 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-end">
                <button
                  type="button"
                  className="rounded-md border border-[#63D3A6]/40 px-2 py-1 text-[#D6F1E3]"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>
              <nav className="mt-5 flex flex-col gap-1.5">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-2 text-[18px] font-medium tracking-[0.01em] leading-tight transition-all duration-200 active:scale-[0.98] ${
                      router.pathname === link.href
                        ? "bg-transparent text-[#8BDDB9]"
                        : "bg-transparent border-transparent text-[#D6F1E3] hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/team#collaborators"
                onClick={() => setOpen(false)}
                className="mt-5 block rounded-md border border-[#63D3A6]/50 px-3 py-2.5 text-center text-[15px] font-medium tracking-[0.01em] transition-all duration-200 active:scale-[0.98] text-[#8DE2BD]"
              >
                Collaborators
              </Link>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}