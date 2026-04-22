"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PortalEntryTrigger from "@/components/beyond-terminal/PortalEntryTrigger";
import { navigationItems, sections } from "@/data/navigation";
import { panelSpring } from "@/lib/animations";
import { scrollToSection, cn } from "@/lib/utils";
import { useLandingNavMode } from "@/hooks/useLandingNavMode";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const sectionIds = sections.map((s) => s.id);
  const activeSection = useScrollSpy(sectionIds);
  const navMode = useLandingNavMode(80);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback((id: string) => {
    scrollToSection(id);
    setIsMobileMenuOpen(false);
  }, []);

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
      <nav
        className={cn(
          styles.desktopRail,
          navMode === "transparent" && styles.desktopRailTransparent
        )}
        aria-label="Section navigation"
      >
        {navigationItems.map((item) =>
          item.kind === "section" ? (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={styles.railItem}
              onClick={(event) => {
                event.preventDefault();
                handleNavClick(item.id);
              }}
            >
              <span
                className={cn(
                  styles.railLabel,
                  activeSection === item.id && styles.railLabelActive
                )}
              >
                {item.label}
              </span>
              <motion.div
                whileHover={{ scale: 1.5 }}
                className={cn(
                  styles.railDot,
                  activeSection === item.id && styles.railDotActive
                )}
              />
            </a>
          ) : (
            <PortalEntryTrigger
              key={item.href}
              href={item.href}
              source={item.source}
              variant={item.variant}
              skin={item.skin}
              aria-label={`Open ${item.label}`}
              className={cn(styles.railItem, styles.railItemRoute)}
            >
              <span className={cn(styles.railLabel, styles.railLabelRoute)}>
                {item.label}
              </span>
              <motion.div
                whileHover={{ scale: 1.15 }}
                className={cn(styles.railDot, styles.railDotRoute)}
              />
            </PortalEntryTrigger>
          )
        )}
      </nav>

      <div className={styles.mobileHamburger}>
        <button
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className={cn(
            styles.hamburgerButton,
            navMode === "transparent" && styles.hamburgerButtonTransparent
          )}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

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
                {navigationItems.map((item) =>
                  item.kind === "section" ? (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        handleNavClick(item.id);
                      }}
                      className={cn(
                        styles.mobileNavItem,
                        activeSection === item.id && styles.mobileNavItemActive
                      )}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <PortalEntryTrigger
                      key={item.href}
                      href={item.href}
                      source={item.source}
                      variant={item.variant}
                      skin={item.skin}
                      className={cn(styles.mobileNavItem, styles.mobileNavRoute)}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </PortalEntryTrigger>
                  )
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
