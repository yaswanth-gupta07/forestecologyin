"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function GalleryLightbox({ activeImage, src, onClose, onError }) {
  return (
    <AnimatePresence>
      {activeImage ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020705]/80 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#0C241A]"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[16/9]">
              <Image src={src} alt={activeImage.title} fill className="object-cover" onError={onError} />
            </div>
            <div className="flex items-center justify-between p-4">
              <p className="text-sm text-[#D8F0E3]">{activeImage.title}</p>
              <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-[#E4F5EC]">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
