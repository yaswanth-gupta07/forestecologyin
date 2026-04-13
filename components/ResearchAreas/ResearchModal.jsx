"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

export default function ResearchModal({ selectedTopic, onClose }) {
  if (!selectedTopic) return null;

  const gallery = selectedTopic.gallery.map((src) => optimizeCloudinaryUrl(src));
  const activeSrc = gallery[0] || "/placeholders/research.svg";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020705]/85 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#0C241A]"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
            <Image src={activeSrc} alt={selectedTopic.title} fill className="object-cover" />
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-[#EBF8F0]">{selectedTopic.title}</h3>
            <p className="mt-4 text-[#C6E8D8] leading-relaxed">{selectedTopic.description}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
