"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Menu } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { sections } from "@/data/navigation";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { scrollToSection, cn } from "@/lib/utils";
import { panelSpring } from "@/lib/animations";
import styles from "./Navigation.module.css";

// =============================================================================
// Navigation — Desktop rail (right side) + Mobile hamburger slide-out
// =============================================================================

export default function Navigation() {
  const sectionIds = sections.map((s) => s.id);
  const activeSection = useScrollSpy(sectionIds);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback(
    (id: string) => {
      scrollToSection(id);
      setIsMobileMenuOpen(false);
    },
    []
  );

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Desktop Rail Navigation */}
      <nav className={styles.desktopRail} aria-label="Section navigation">
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={styles.railItem}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(id);
            }}
          >
            <span
              className={cn(
                styles.railLabel,
                activeSection === id && styles.railLabelActive
              )}
            >
              {label}
            </span>
            <motion.div
              whileHover={{ scale: 1.5 }}
              className={cn(
                styles.railDot,
                activeSection === id && styles.railDotActive
              )}
            />
          </a>
        ))}
      </nav>

      {/* Mobile Hamburger Button */}
      <div className={styles.mobileHamburger}>
        <button
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className={styles.hamburgerButton}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close navigation menu"
              className={styles.mobileBackdrop}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={panelSpring}
              className={styles.mobileMenu}
            >
              <nav className={styles.mobileNav} aria-label="Mobile navigation">
                {sections.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(id);
                    }}
                    className={cn(
                      styles.mobileNavItem,
                      activeSection === id && styles.mobileNavItemActive
                    )}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
