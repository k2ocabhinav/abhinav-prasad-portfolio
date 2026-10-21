import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToSection } from "@/lib/utils";

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

export function useMobileNavigationDialog() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const restoreBodyScrollRef = useRef<(() => void) | null>(null);
  const shouldRestoreFocusRef = useRef(false);
  const pendingSectionFocusRef = useRef<string | null>(null);

  const closeMobileMenu = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    restoreBodyScrollRef.current?.();
    restoreBodyScrollRef.current = null;
    setIsMobileMenuOpen(false);
  }, []);

  const openMobileMenu = useCallback(() => {
    shouldRestoreFocusRef.current = false;
    setIsMobileMenuOpen(true);
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

  const handleExitComplete = useCallback(() => {
    if (!shouldRestoreFocusRef.current) {
      return;
    }
    shouldRestoreFocusRef.current = false;
    hamburgerRef.current?.focus();
  }, []);

  return {
    closeMobileMenu,
    handleExitComplete,
    handleNavClick,
    hamburgerRef,
    isMobileMenuOpen,
    mobileMenuRef,
    openMobileMenu,
  };
}
