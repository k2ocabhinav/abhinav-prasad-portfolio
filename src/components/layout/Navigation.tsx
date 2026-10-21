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

// Follow the jump with focus so keyboard and screen-reader users land inside
// the section they chose. `preventScroll` keeps the smooth scroll single.
function focusSectionHeading(id: string): void {
  const section = document.getElementById(id);
  if (!section) {
    return;
  }

  const target = section.querySelector<HTMLElement>("h1, h2, h3") ?? section;
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

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
    railDark: overDarkField,
    navMode,
  } = useSectionState();
  const prefersReducedMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHamburgerHidden, setIsHamburgerHidden] = useState(false);
  const [isMarqueeUnderRail, setIsMarqueeUnderRail] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const restoreBodyScrollRef = useRef<(() => void) | null>(null);
  const shouldRestoreFocusRef = useRef(false);
  const pendingSectionFocusRef = useRef<string | null>(null);

  useEffect(() => {
    const marquee = document.querySelector<HTMLElement>('[data-marquee="true"]');
    if (!marquee) {
      return;
    }

    let observer: IntersectionObserver | undefined;
    const observeCenterBand = () => {
      observer?.disconnect();
      const inset = Math.round(window.innerHeight * 0.45);
      observer = new IntersectionObserver(
        (entries) => setIsMarqueeUnderRail(Boolean(entries[0]?.isIntersecting)),
        { rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: 0 }
      );
      observer.observe(marquee);
    };

    observeCenterBand();
    window.addEventListener("resize", observeCenterBand, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeCenterBand);
    };
  }, []);

  const closeMobileMenu = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    restoreBodyScrollRef.current?.();
    restoreBodyScrollRef.current = null;
    setIsMobileMenuOpen(false);
  }, []);

  const handleNavClick = useCallback((id: string) => {
    const wasMenuOpen = isMobileMenuOpen;
    closeMobileMenu();
    scrollToSection(id);

    if (wasMenuOpen) {
      // The menu's exit restores focus to its trigger by default. A chosen
      // section should own focus instead, once the close commit has cleared
      // the inert page.
      shouldRestoreFocusRef.current = false;
      pendingSectionFocusRef.current = id;
    } else {
      window.requestAnimationFrame(() => focusSectionHeading(id));
    }
  }, [closeMobileMenu, isMobileMenuOpen]);

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
    if (isMobileMenuOpen) {
      return;
    }

    const sectionId = pendingSectionFocusRef.current;
    if (!sectionId) {
      return;
    }

    pendingSectionFocusRef.current = null;
    const frame = window.requestAnimationFrame(() =>
      focusSectionHeading(sectionId)
    );

    return () => window.cancelAnimationFrame(frame);
  }, [isMobileMenuOpen]);

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

  // Keep the phone trigger out of the reading column while the visitor is
  // moving down the page. It returns on an upward gesture, at both ends of the
  // page, on keyboard focus, and it never hides while the menu is open.
  useEffect(() => {
    if (isMobileMenuOpen) {
      return;
    }

    let frame = 0;
    let lastY = window.scrollY;
    let maxScroll = 0;

    // Cache the scroll range; only resize and content-height changes refresh
    // it. The scroll handler then does no layout reads.
    const measure = () => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", measure, { passive: true });

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 4) {
        return;
      }
      lastY = y;

      const atEdge = y <= 96 || maxScroll - y <= 96;
      setIsHamburgerHidden(!atEdge && delta > 0);
    };

    const handleScroll = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        data-site-chrome="navigation-rail"
        data-nav-tone={overDarkField ? "dark" : "light"}
        data-marquee-under-rail={isMarqueeUnderRail ? "true" : undefined}
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
              aria-label={item.label}
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
          aria-label={`Email ${fullName}`}
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
          aria-label={`Download ${fullName}'s résumé`}
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
        className={cn(
          styles.mobileHamburger,
          isHamburgerHidden && !isMobileMenuOpen && styles.mobileHamburgerHidden
        )}
        data-site-chrome="navigation-toggle"
        data-hamburger-hidden={
          isHamburgerHidden && !isMobileMenuOpen ? "true" : "false"
        }
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
          onFocus={() => setIsHamburgerHidden(false)}
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
                      styles.mobileNavAction
                    )}
                  >
                    <span>LinkedIn</span>
                    <LinkedInMark size={16} />
                  </a>
                ) : null}
                <a
                  href={`mailto:${email}`}
                  onClick={closeMobileMenu}
                  className={cn(styles.mobileNavItem, styles.mobileNavAction)}
                >
                  <span>Email</span>
                  <Mail size={16} aria-hidden="true" focusable="false" />
                </a>
                <a
                  href={resumeHref}
                  download
                  onClick={closeMobileMenu}
                  className={cn(styles.mobileNavItem, styles.mobileNavAction)}
                >
                  <span>Résumé</span>
                  <FileText size={16} aria-hidden="true" focusable="false" />
                </a>
              </nav>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
