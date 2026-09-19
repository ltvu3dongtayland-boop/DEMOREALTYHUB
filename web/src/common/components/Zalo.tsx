"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function StickyContact() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      if (customEvent.detail) {
        setIsMobileMenuOpen(customEvent.detail.open);
      }
    };
    window.addEventListener("mobile-menu-toggle", handleToggle);
    return () => {
      window.removeEventListener("mobile-menu-toggle", handleToggle);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          data-clean-hide="floating-widget"
          className="fixed bottom-[152px] right-6 z-35 flex flex-col items-center gap-3 lg:bottom-24"
        >
          <motion.a
            href="https://zalo.me/0939653777"
            target="_blank"
            rel="nofollow noopener noreferrer"
            whileTap={{ scale: 0.94 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_25px_rgba(0,104,255,0.45)] hover:shadow-[0_4px_35px_rgba(0,104,255,0.65)] hover:scale-105 transition-all duration-300 cursor-pointer overflow-visible"
            aria-label="Liên hệ qua Zalo"
          >
            {/* Vòng sáng lan tỏa giống ChatWidget */}
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-chat-halo rounded-full"
            />

            {/* Khung tròn cắt phần ảnh tràn ra */}
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden">
              <img
                src="/images/logo-zalo.webp"
                alt="Zalo"
                className="h-full w-auto max-w-none animate-zalo-shake"
              />
            </span>
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
