"use client";

import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { FileText, Mail, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import PortalEntryTrigger from "@/components/beyond-terminal/PortalEntryTrigger";
import LinkedInMark from "@/components/ui/LinkedInMark";
import { navigationItems } from "@/data/navigation";
import { panelSpring } from "@/lib/animations";
import { scrollToSection, cn } from "@/lib/utils";
import { useSectionState } from "@/lib/sectionStore";
import styles from "./Navigation.module.css";

const DESKTOP_RAIL_QUERY =
  "(min-width: 768px) and (hover: hover) and (pointer: fine)";
const MENU_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface NavigationProps {
  /** Resume PDF path, offered on the first screen from the rail and menu. */
  resumeHref: string;
  /** Contact email, offered on the first screen from the rail and menu. */
  email: string;
  /** Profile LinkedIn URL; the rail and menu omit the link when it is absent. */
  linkedinHref?: string;
  /** Full name used in the LinkedIn link's accessible name. */
  fullName: string;
}

export default function Navigation({
  resumeHref,
  email,
  linkedinHref,
  fullName,
}: NavigationProps) {
  const {
    activeId: activeSection,
    dark: overDarkField,
    navMode,
  } = useSectionState();
  const prefersReducedMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const restoreBodyScrollRef = useRef<(() => void) | null>(null);
  const shouldRestoreFocusRef = useRef(false);

  const closeMobileMenu = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    restoreBodyScrollRef.current?.();
    restoreBodyScrollRef.current = null;
    setIsMobileMenuOpen(false);
  }, []);

  const handleNavClick = useCallback((id: string) => {
    closeMobileMenu();
    scrollToSection(id);
  }, [closeMobileMenu]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const body = document.body;
    const siteContent = document.getElementById("site-content");
    const siteContentWasInert = siteContent?.inert ?? false;
    const scrollY = window.scrollY;
    const originalBodyStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    let hasRestoredBody = false;

    const restoreBodyScroll = () => {
      if (hasRestoredBody) {
        return;
      }

      hasRestoredBody = true;
      body.style.overflow = originalBodyStyles.overflow;
      body.style.position = originalBodyStyles.position;
      body.style.top = originalBodyStyles.top;
      body.style.width = originalBodyStyles.width;
      body.style.paddingRight = originalBodyStyles.paddingRight;
      window.scrollTo(0, scrollY);
    };

    restoreBodyScrollRef.current = restoreBodyScroll;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (siteContent) {
      siteContent.inert = true;
    }
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const getFocusableElements = () => {
      return mobileMenuRef.current
        ? Array.from(
            mobileMenuRef.current.querySelectorAll<HTMLElement>(
              MENU_FOCUSABLE_SELECTOR
            )
          )
        : [];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstElement ||
          !focusableElements.includes(activeElement as HTMLElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => {
      const firstMenuControl = mobileMenuRef.current?.querySelector<HTMLElement>(
        MENU_FOCUSABLE_SELECTOR
      );
      firstMenuControl?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      restoreBodyScroll();
      if (siteContent) {
        siteContent.inert = siteContentWasInert;
      }
      if (restoreBodyScrollRef.current === restoreBodyScroll) {
        restoreBodyScrollRef.current = null;
      }
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  useEffect(() => {
    const desktopRailMedia = window.matchMedia(DESKTOP_RAIL_QUERY);
    const handleDesktopRailChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMobileMenu();
      }
    };

    desktopRailMedia.addEventListener("change", handleDesktopRailChange);
    return () => {
      desktopRailMedia.removeEventListener("change", handleDesktopRailChange);
    };
  }, [closeMobileMenu]);

  return (
    <>
      <nav
        data-site-chrome="navigation-rail"
        data-nav-tone={overDarkField ? "dark" : "light"}
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
              aria-current={activeSection === item.id ? "location" : undefined}
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
              <div
                data-rail-dot="true"
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
              <div
                data-rail-dot="true"
                className={cn(styles.railDot, styles.railDotRoute)}
              />
            </PortalEntryTrigger>
          )
        )}

        <span className={styles.railRule} aria-hidden="true" />

        {linkedinHref ? (
          <a
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${fullName} on LinkedIn (opens in a new tab)`}
            className={cn(styles.railItem, styles.railAction)}
          >
            <span className={cn(styles.railLabel, styles.railLabelRoute)}>
              LinkedIn
            </span>
            <LinkedInMark size={14} className={styles.railIcon} />
          </a>
        ) : null}
        <a
          href={`mailto:${email}`}
          className={cn(styles.railItem, styles.railAction)}
        >
          <span className={cn(styles.railLabel, styles.railLabelRoute)}>
            Email
          </span>
          <Mail
            size={14}
            className={styles.railIcon}
            aria-hidden="true"
            focusable="false"
          />
        </a>
        <a
          href={resumeHref}
          download
          className={cn(styles.railItem, styles.railAction)}
        >
          <span className={cn(styles.railLabel, styles.railLabelRoute)}>
            Résumé
          </span>
          <FileText
            size={14}
            className={styles.railIcon}
            aria-hidden="true"
            focusable="false"
          />
        </a>
      </nav>

      <div
        className={styles.mobileHamburger}
        data-site-chrome="navigation-toggle"
        aria-hidden={isMobileMenuOpen ? "true" : undefined}
        style={{ visibility: isMobileMenuOpen ? "hidden" : undefined }}
      >
        <button
          ref={hamburgerRef}
          type="button"
          onClick={() => {
            if (isMobileMenuOpen) {
              closeMobileMenu();
            } else {
              shouldRestoreFocusRef.current = false;
              setIsMobileMenuOpen(true);
            }
          }}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-panel"
          disabled={isMobileMenuOpen}
          tabIndex={isMobileMenuOpen ? -1 : undefined}
          className={cn(
            styles.hamburgerButton,
            navMode === "transparent" && styles.hamburgerButtonTransparent
          )}
        >
          {isMobileMenuOpen ? (
            <X size={20} aria-hidden="true" focusable="false" />
          ) : (
            <Menu size={20} aria-hidden="true" focusable="false" />
          )}
        </button>
      </div>

      <AnimatePresence
        onExitComplete={() => {
          if (!shouldRestoreFocusRef.current) {
            return;
          }
          shouldRestoreFocusRef.current = false;
          hamburgerRef.current?.focus();
        }}
      >
        {isMobileMenuOpen && (
          <>
            <m.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close navigation"
              tabIndex={-1}
              data-mobile-navigation-backdrop
              className={styles.mobileBackdrop}
              onClick={closeMobileMenu}
            />
            <m.div
              ref={mobileMenuRef}
              id="mobile-navigation-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={prefersReducedMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
              transition={panelSpring}
              className={styles.mobileMenu}
            >
              <button
                type="button"
                aria-label="Close menu"
                className={styles.hamburgerButton}
                style={{
                  position: "absolute",
                  top: "max(1rem, env(safe-area-inset-top))",
                  right: "max(1rem, env(safe-area-inset-right))",
                }}
                onClick={closeMobileMenu}
              >
                <X size={20} aria-hidden="true" focusable="false" />
              </button>
              <nav className={styles.mobileNav} aria-label="Mobile navigation">
                {navigationItems.map((item) =>
                  item.kind === "section" ? (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      aria-current={
                        activeSection === item.id ? "location" : undefined
                      }
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
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </PortalEntryTrigger>
                  )
                )}

                <span className={styles.mobileDivider} aria-hidden="true" />

                {linkedinHref ? (
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${fullName} on LinkedIn (opens in a new tab)`}
                    onClick={closeMobileMenu}
                    className={cn(
                      styles.mobileNavItem,
                      styles.mobileNavLinkedIn
                    )}
                  >
                    <span>LinkedIn</span>
                    <LinkedInMark size={16} />
                  </a>
                ) : null}
                <a
                  href={`mailto:${email}`}
                  onClick={closeMobileMenu}
                  className={cn(styles.mobileNavItem, styles.mobileNavRoute)}
                >
                  Email
                </a>
                <a
                  href={resumeHref}
                  download
                  onClick={closeMobileMenu}
                  className={cn(styles.mobileNavItem, styles.mobileNavRoute)}
                >
                  Résumé
                </a>
              </nav>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
