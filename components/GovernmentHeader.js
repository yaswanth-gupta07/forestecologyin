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

export default function GovernmentHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b shadow-sm">
      {/* Top Official Header */}
      <div className="bg-white text-[#0d2818] border-b border-gray-200">
        <div className="w-full px-4 py-4 flex items-center justify-between pl-4">
          <div className="flex items-center gap-3">
            {/* Forest Ecology Logo */}
            <div className="w-10 h-10 bg-[#63D3A6] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L10.91 8.26L12 2Z M12 15.4L16.24 18.18L15.24 13.24L19.24 9.67L14.16 9.08L12 4.5L9.84 9.08L4.76 9.67L8.76 13.24L7.76 18.18L12 15.4Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wide text-[#0d2818] uppercase leading-tight">FOREST ECOLOGY LAB</h1>
              <div className="text-xs font-medium leading-tight">
                <span className="text-[#63D3A6] font-semibold">Sreenath Subrahmanyam</span>
                <span className="text-[#123326] ml-2">| IISc | SRMAP</span>
              </div>
            </div>
          </div>

          {/* Official Links as Chips */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <a href="/team#collaborators" className="px-3 py-1.5 bg-[#63D3A6] text-white rounded-full font-medium hover:bg-[#4CAF87] transition-all shadow-sm">
              Collaborators
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Made Smaller */}
      <div className="bg-[#123326]">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-between h-10">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-1.5 rounded-md text-[#C8E9D8] hover:text-white hover:bg-[#0d2818] transition-colors"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Main menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Navigation - Smaller */}
            <div className="hidden lg:flex items-center space-x-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-1 text-xs font-medium border-b-2 transition-all duration-200 ${router.pathname === link.href
                    ? "text-[#63D3A6] border-[#63D3A6]"
                    : "text-[#C8E9D8] border-transparent hover:text-white hover:border-[#63D3A6]"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Empty space where search was */}
            <div className="hidden lg:flex items-center">
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[55] bg-black/50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="lg:hidden fixed top-0 left-0 z-[60] h-full w-80 bg-[#0d2818] shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#63D3A6]/30">
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-[#C8E9D8] hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${router.pathname === link.href
                        ? "text-[#63D3A6] bg-[#63D3A6]/10"
                        : "text-[#C8E9D8] hover:text-white hover:bg-[#123326]"
                        }`}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-[#63D3A6]/30">
                  <div className="space-y-2">
                    <a href="/team#collaborators" className="block px-4 py-3 text-sm bg-[#63D3A6]/20 text-[#63D3A6] rounded-lg font-medium hover:bg-[#63D3A6]/30 transition-colors">Collaborators</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}