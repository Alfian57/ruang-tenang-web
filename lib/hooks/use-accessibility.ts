import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to trap focus within a container (useful for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap becomes active
    firstElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to restore focus when a modal/dialog closes
 */
export function useFocusRestore() {
  const previousActiveElement = useRef<Element | null>(null);

  const saveFocus = useCallback(() => {
    previousActiveElement.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Hook for keyboard navigation in lists (arrow keys)
 */
export function useListKeyboardNavigation<T extends HTMLElement>(
  items: NodeListOf<T> | T[],
  options: {
    orientation?: "vertical" | "horizontal" | "both";
    loop?: boolean;
    onSelect?: (element: T) => void;
  } = {}
) {
  const { orientation = "vertical", loop = true, onSelect } = options;
  const currentIndex = useRef(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const itemsArray = Array.from(items);
      if (itemsArray.length === 0) return;

      let newIndex = currentIndex.current;
      const isVertical = orientation === "vertical" || orientation === "both";
      const isHorizontal = orientation === "horizontal" || orientation === "both";

      switch (event.key) {
        case "ArrowDown":
          if (isVertical) {
            event.preventDefault();
            newIndex = loop
              ? (currentIndex.current + 1) % itemsArray.length
              : Math.min(currentIndex.current + 1, itemsArray.length - 1);
          }
          break;
        case "ArrowUp":
          if (isVertical) {
            event.preventDefault();
            newIndex = loop
              ? (currentIndex.current - 1 + itemsArray.length) % itemsArray.length
              : Math.max(currentIndex.current - 1, 0);
          }
          break;
        case "ArrowRight":
          if (isHorizontal) {
            event.preventDefault();
            newIndex = loop
              ? (currentIndex.current + 1) % itemsArray.length
              : Math.min(currentIndex.current + 1, itemsArray.length - 1);
          }
          break;
        case "ArrowLeft":
          if (isHorizontal) {
            event.preventDefault();
            newIndex = loop
              ? (currentIndex.current - 1 + itemsArray.length) % itemsArray.length
              : Math.max(currentIndex.current - 1, 0);
          }
          break;
        case "Home":
          event.preventDefault();
          newIndex = 0;
          break;
        case "End":
          event.preventDefault();
          newIndex = itemsArray.length - 1;
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onSelect?.(itemsArray[currentIndex.current]);
          return;
        default:
          return;
      }

      currentIndex.current = newIndex;
      itemsArray[newIndex]?.focus();
    },
    [items, orientation, loop, onSelect]
  );

  return { handleKeyDown, currentIndex };
}

/**
 * Hook for managing "skip to main content" link
 */
export function useSkipToMain(mainContentId: string = "main-content") {
  const skipToMain = useCallback(() => {
    const mainContent = document.getElementById(mainContentId);
    if (mainContent) {
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  }, [mainContentId]);

  return skipToMain;
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement is made
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
}

/**
 * Hook for managing reduced motion preference
 */
export function usePrefersReducedMotion() {
  const mediaQuery = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  const getInitialState = () => mediaQuery?.matches ?? false;

  const ref = useRef(getInitialState());

  useEffect(() => {
    if (!mediaQuery) return;

    const handler = (event: MediaQueryListEvent) => {
      ref.current = event.matches;
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mediaQuery]);

  return ref.current;
}

/**
 * Hook for color contrast preference
 */
export function usePrefersHighContrast() {
  const mediaQuery = typeof window !== "undefined"
    ? window.matchMedia("(prefers-contrast: more)")
    : null;

  const getInitialState = () => mediaQuery?.matches ?? false;

  const ref = useRef(getInitialState());

  useEffect(() => {
    if (!mediaQuery) return;

    const handler = (event: MediaQueryListEvent) => {
      ref.current = event.matches;
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mediaQuery]);

  return ref.current;
}
