"use client";

import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { FileText, Mail, Menu, X } from "lucide-react";
import PortalEntryTrigger from "@/components/beyond-terminal/PortalEntryTrigger";
import LinkedInMark from "@/components/ui/LinkedInMark";
import { navigationItems } from "@/data/navigation";
import { panelSpring } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useSectionState } from "@/lib/sectionStore";
import { useHamburgerVisibility } from "./navigation/useHamburgerVisibility";
import { useMarqueeRailTracking } from "./navigation/useMarqueeRailTracking";
import { useMobileNavigationDialog } from "./navigation/useMobileNavigationDialog";
import styles from "./Navigation.module.css";

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
  const isMarqueeUnderRail = useMarqueeRailTracking();
  const {
    closeMobileMenu,
    handleExitComplete,
    handleNavClick,
    hamburgerRef,
    isMobileMenuOpen,
    mobileMenuRef,
    openMobileMenu,
  } = useMobileNavigationDialog();
  const { isHamburgerHidden, revealHamburger } =
    useHamburgerVisibility(isMobileMenuOpen);

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
              tabIndex={-1}
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
          onClick={() => (isMobileMenuOpen ? closeMobileMenu() : openMobileMenu())}
          onFocus={revealHamburger}
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

      <AnimatePresence onExitComplete={handleExitComplete}>
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
