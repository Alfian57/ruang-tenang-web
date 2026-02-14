// Accessibility hooks
export {
  useFocusTrap,
  useFocusRestore,
  useListKeyboardNavigation,
  useSkipToMain,
  useAnnounce,
  usePrefersReducedMotion,
  usePrefersHighContrast,
} from "./use-accessibility";

// Optimistic update hooks
export {
  useOptimistic,
  useOptimisticLike,
  useOptimisticMessages,
  useOptimisticList,
} from "./use-optimistic";

// Responsive hooks
export {
  useBreakpoint,
  useIsMobile,
  useIsTouchDevice,
  useMediaQuery,
  useWindowSize,
  useScrollPosition,
  useScrollLock,
  useScrollDirection,
  useInView,
  useDebounce,
  useThrottle,
  useIsSmallScreen,
  useIsMediumScreen,
  useIsLargeScreen,
  useIsExtraLargeScreen,
  useIsPortrait,
  useIsLandscape,
} from "./use-responsive";
