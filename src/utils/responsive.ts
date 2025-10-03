// Responsive utility functions and hooks

import { useState, useEffect } from 'react';

// Breakpoint values matching Tailwind CSS
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof typeof breakpoints;

// Custom hook to detect current breakpoint
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setWindowSize({ width, height: window.innerHeight });

      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    windowSize,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md' || breakpoint === 'lg',
    isDesktop: breakpoint === 'xl' || breakpoint === '2xl',
    isSmallScreen: breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md',
    isMediumScreen: breakpoint === 'lg' || breakpoint === 'xl',
    isLargeScreen: breakpoint === '2xl',
  };
}

// Custom hook to detect mobile device
export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const mobile = Boolean(
      userAgent.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
      )
    );
    setIsMobile(mobile);
  }, []);

  return isMobile;
}

// Custom hook for responsive columns
export function useResponsiveColumns(
  defaultColumns: number = 1,
  breakpointColumns?: Partial<Record<Breakpoint, number>>
) {
  const { breakpoint } = useBreakpoint();
  const [columns, setColumns] = useState(defaultColumns);

  useEffect(() => {
    if (breakpointColumns) {
      // Find the appropriate column count for current breakpoint
      const currentColumns = breakpointColumns[breakpoint] || defaultColumns;
      setColumns(currentColumns);
    }
  }, [breakpoint, breakpointColumns, defaultColumns]);

  return columns;
}

// Utility function to generate responsive classes
export function getResponsiveClasses(
  base: string,
  responsive?: Partial<Record<Breakpoint, string>>
): string {
  if (!responsive) return base;

  const classes = [base];
  Object.entries(responsive).forEach(([breakpoint, className]) => {
    if (breakpoint === 'xs') {
      classes.push(className);
    } else {
      classes.push(`${breakpoint}:${className}`);
    }
  });

  return classes.join(' ');
}

// Common responsive patterns
export const responsivePatterns = {
  container: 'mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
  
  padding: {
    sm: 'p-2 sm:p-3 lg:p-4',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-10',
  },
  
  spacing: {
    sm: 'space-y-2 sm:space-y-3 lg:space-y-4',
    md: 'space-y-4 sm:space-y-6 lg:space-y-8',
    lg: 'space-y-6 sm:space-y-8 lg:space-y-10',
  },
  
  grid: {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 md:grid-cols-2',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    auto: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  },
  
  text: {
    xs: 'text-xs',
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl',
    '3xl': 'text-2xl sm:text-3xl',
    '4xl': 'text-3xl sm:text-4xl',
    '5xl': 'text-4xl sm:text-5xl',
  },
  
  heading: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
    h5: 'text-sm sm:text-base md:text-lg lg:text-xl font-medium',
    h6: 'text-sm sm:text-base md:text-lg font-medium',
  },
  
  button: {
    sm: 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
    md: 'px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base',
    lg: 'px-4 py-2 text-base sm:px-6 sm:py-3 sm:text-lg',
  },
  
  card: {
    sm: 'p-3 sm:p-4 lg:p-5',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-10',
  },
  
  gap: {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
  },
};

// Media query utilities
export const mediaQueries = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  mobile: '(max-width: 639px)',
  tablet: '(min-width: 640px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
};

// Custom hook for media queries
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
}

// Responsive table utilities
export function useResponsiveTable() {
  const { isMobile } = useBreakpoint();
  
  return {
    showMobileView: isMobile,
    tableClass: isMobile ? 'block' : 'table-responsive',
    containerClass: 'w-full overflow-x-auto',
  };
}

// Export all utilities
export default {
  breakpoints,
  useBreakpoint,
  useMobileDetect,
  useResponsiveColumns,
  getResponsiveClasses,
  responsivePatterns,
  mediaQueries,
  useMediaQuery,
  useResponsiveTable,
};