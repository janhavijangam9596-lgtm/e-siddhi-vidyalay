import { useState, useEffect, useCallback } from 'react';

// All available routes in the application
export type Route = 
  | 'dashboard'
  | 'management'
  | 'students'
  | 'staff'
  | 'admission' 
  | 'fees'
  | 'exam'
  | 'library'
  | 'classes'
  | 'timetable'
  | 'attendance'
  | 'health'
  | 'accounts'
  | 'transport'
  | 'hostel'
  | 'communication'
  | 'reports'
  | 'certificates'
  | 'sports'
  | 'alumni'
  | 'birthday'
  | 'inventory'
  | 'admin'
  | 'settings'
  | 'calendar'
  | 'profile'
  | 'notifications'
  | 'student-dashboard'
  | 'my-courses'
  | 'my-grades'
  | 'my-assignments'
  | 'my-schedule'
  | 'my-attendance'
  | 'my-fees'
  | 'my-library'
  | 'my-exams'
  | 'my-results'
  | '404';

// Route metadata for better navigation
interface RouteMetadata {
  title: string;
  path: string;
  icon?: string;
  requiresAuth: boolean;
  roles?: string[];
  category?: 'academic' | 'management' | 'other';
}

// Route configuration
const routeConfig: Record<Route, RouteMetadata> = {
  dashboard: {
    title: 'Dashboard',
    path: '/',
    requiresAuth: true,
    category: 'academic'
  },
  management: {
    title: 'Management Hub',
    path: '/management',
    requiresAuth: true,
    category: 'management'
  },
  students: {
    title: 'Student Management',
    path: '/students',
    requiresAuth: true,
    category: 'academic'
  },
  staff: {
    title: 'Staff Management',
    path: '/staff',
    requiresAuth: true,
    category: 'academic'
  },
  admission: {
    title: 'Admission Management',
    path: '/admission',
    requiresAuth: true,
    category: 'academic'
  },
  fees: {
    title: 'Fees Management',
    path: '/fees',
    requiresAuth: true,
    category: 'management'
  },
  exam: {
    title: 'Exam Management',
    path: '/exam',
    requiresAuth: true,
    category: 'academic'
  },
  library: {
    title: 'Library Management',
    path: '/library',
    requiresAuth: true,
    category: 'academic'
  },
  classes: {
    title: 'Class Management',
    path: '/classes',
    requiresAuth: true,
    category: 'academic'
  },
  timetable: {
    title: 'Timetable Management',
    path: '/timetable',
    requiresAuth: true,
    category: 'academic'
  },
  attendance: {
    title: 'Attendance Management',
    path: '/attendance',
    requiresAuth: true,
    category: 'academic'
  },
  health: {
    title: 'Health Records',
    path: '/health',
    requiresAuth: true,
    category: 'academic'
  },
  accounts: {
    title: 'Accounts Management',
    path: '/accounts',
    requiresAuth: true,
    category: 'management'
  },
  transport: {
    title: 'Transport Management',
    path: '/transport',
    requiresAuth: true,
    category: 'management'
  },
  hostel: {
    title: 'Hostel Management',
    path: '/hostel',
    requiresAuth: true,
    category: 'management'
  },
  communication: {
    title: 'Communication Center',
    path: '/communication',
    requiresAuth: true,
    category: 'management'
  },
  reports: {
    title: 'Reports & Analytics',
    path: '/reports',
    requiresAuth: true,
    category: 'management'
  },
  certificates: {
    title: 'Certificate Management',
    path: '/certificates',
    requiresAuth: true,
    category: 'management'
  },
  sports: {
    title: 'Sports Management',
    path: '/sports',
    requiresAuth: true,
    category: 'other'
  },
  alumni: {
    title: 'Alumni Management',
    path: '/alumni',
    requiresAuth: true,
    category: 'other'
  },
  birthday: {
    title: 'Birthday Management',
    path: '/birthday',
    requiresAuth: true,
    category: 'other'
  },
  inventory: {
    title: 'Inventory Management',
    path: '/inventory',
    requiresAuth: true,
    category: 'other'
  },
  admin: {
    title: 'Admin Management',
    path: '/admin',
    requiresAuth: true,
    roles: ['admin'],
    category: 'other'
  },
  settings: {
    title: 'System Settings',
    path: '/settings',
    requiresAuth: true,
    category: 'other'
  },
  calendar: {
    title: 'Calendar',
    path: '/calendar',
    requiresAuth: true,
    category: 'other'
  },
  profile: {
    title: 'User Profile',
    path: '/profile',
    requiresAuth: true,
    category: 'other'
  },
  notifications: {
    title: 'Notifications',
    path: '/notifications',
    requiresAuth: true,
    category: 'other'
  },
  'student-dashboard': {
    title: 'Student Dashboard',
    path: '/student-dashboard',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  'my-courses': {
    title: 'My Courses',
    path: '/my-courses',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  'my-grades': {
    title: 'My Grades',
    path: '/my-grades',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  'my-assignments': {
    title: 'My Assignments',
    path: '/my-assignments',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  'my-schedule': {
    title: 'My Schedule',
    path: '/my-schedule',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  'my-attendance': {
    title: 'My Attendance',
    path: '/my-attendance',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  'my-fees': {
    title: 'My Fees',
    path: '/my-fees',
    requiresAuth: true,
    roles: ['student'],
    category: 'management'
  },
  'my-library': {
    title: 'My Library',
    path: '/my-library',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  'my-exams': {
    title: 'My Exams',
    path: '/my-exams',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  'my-results': {
    title: 'My Results',
    path: '/my-results',
    requiresAuth: true,
    roles: ['student'],
    category: 'academic'
  },
  '404': {
    title: 'Page Not Found',
    path: '/404',
    requiresAuth: false,
    category: 'other'
  }
};

// Navigation history for back/forward functionality
class NavigationHistory {
  private history: Route[] = ['dashboard'];
  private currentIndex = 0;

  push(route: Route) {
    // Remove any forward history when navigating to a new route
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(route);
    this.currentIndex++;
    
    // Keep history size limited
    if (this.history.length > 50) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  goBack(): Route | null {
    if (this.canGoBack()) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  goForward(): Route | null {
    if (this.canGoForward()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  getCurrent(): Route {
    return this.history[this.currentIndex];
  }

  getHistory(): Route[] {
    return [...this.history];
  }
}

// Enhanced router hook
export function useEnhancedRouter() {
  // Initialize from URL on first render
  const getInitialRoute = (): Route => {
    const path = window.location.pathname;
    for (const [route, config] of Object.entries(routeConfig)) {
      if (config.path === path) {
        return route as Route;
      }
    }
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('page')) {
      const page = searchParams.get('page');
      if (page && isValidRoute(page)) {
        return page as Route;
      }
    }
    return 'dashboard';
  };

  const [currentRoute, setCurrentRoute] = useState<Route>(getInitialRoute);
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [navigationHistory] = useState(() => new NavigationHistory());
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeKey, setRouteKey] = useState(0);

  // Navigate to a specific route
  const navigate = useCallback((route: Route, params: Record<string, string> = {}, options: { replace?: boolean } = {}) => {
    if (!isValidRoute(route)) {
      console.error(`Invalid route: ${route}`);
      route = '404';
    }

    // Don't navigate if it's the same route (unless params are different)
    if (route === currentRoute && JSON.stringify(params) === JSON.stringify(routeParams)) {
      return;
    }

    setIsNavigating(true);
    
    // Force update state with new reference to trigger re-render
    setCurrentRoute(route);
    setRouteParams({...params});
    setRouteKey(prev => prev + 1);
    
    // Update navigation history
    if (!options.replace) {
      navigationHistory.push(route);
    }
    
    // Update URL
    const url = new URL(window.location.href);
    url.pathname = routeConfig[route].path;
    
    // Add query parameters
    url.searchParams.delete('page'); // Remove old page param
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    // Update browser history
    if (options.replace) {
      window.history.replaceState({ route, params }, '', url.toString());
    } else {
      window.history.pushState({ route, params }, '', url.toString());
    }
    
    // Update document title
    document.title = `${routeConfig[route].title} - eSiddhiविद्यालय`;
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    setTimeout(() => setIsNavigating(false), 100);
  }, [navigationHistory, currentRoute, routeParams]);

  // Navigate back
  const goBack = useCallback(() => {
    const previousRoute = navigationHistory.goBack();
    if (previousRoute) {
      navigate(previousRoute, {}, { replace: true });
      window.history.back();
    }
  }, [navigationHistory, navigate]);

  // Navigate forward
  const goForward = useCallback(() => {
    const nextRoute = navigationHistory.goForward();
    if (nextRoute) {
      navigate(nextRoute, {}, { replace: true });
      window.history.forward();
    }
  }, [navigationHistory, navigate]);

  // Get route metadata
  const getRouteMetadata = useCallback((route: Route): RouteMetadata => {
    return routeConfig[route] || routeConfig['404'];
  }, []);

  // Check if user can access route
  const canAccessRoute = useCallback((route: Route, userRole?: string): boolean => {
    const metadata = routeConfig[route];
    if (!metadata) return false;
    
    if (!metadata.requiresAuth) return true;
    
    if (metadata.roles && userRole) {
      return metadata.roles.includes(userRole);
    }
    
    return true;
  }, []);

  // Get breadcrumbs
  const getBreadcrumbs = useCallback((): { title: string; route: Route }[] => {
    const breadcrumbs: { title: string; route: Route }[] = [
      { title: 'Home', route: 'dashboard' }
    ];
    
    if (currentRoute !== 'dashboard') {
      breadcrumbs.push({
        title: routeConfig[currentRoute].title,
        route: currentRoute
      });
    }
    
    return breadcrumbs;
  }, [currentRoute]);

  // Initialize router from URL
  useEffect(() => {
    const initializeRoute = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Find matching route from path
      let matchedRoute: Route = 'dashboard';
      for (const [route, config] of Object.entries(routeConfig)) {
        if (config.path === path) {
          matchedRoute = route as Route;
          break;
        }
      }
      
      // Fallback to query parameter
      if (matchedRoute === 'dashboard' && searchParams.has('page')) {
        const page = searchParams.get('page');
        if (page && isValidRoute(page)) {
          matchedRoute = page as Route;
        }
      }
      
      // Extract parameters
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (key !== 'page') {
          params[key] = value;
        }
      });
      
      setCurrentRoute(matchedRoute);
      setRouteParams(params);
      document.title = `${routeConfig[matchedRoute].title} - eSiddhiविद्यालय`;
    };

    initializeRoute();

    // Handle browser back/forward
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.route && isValidRoute(event.state.route)) {
        setCurrentRoute(event.state.route as Route);
        setRouteParams(event.state.params || {});
        document.title = `${routeConfig[event.state.route as Route].title} - eSiddhiविद्यालय`;
      } else {
        initializeRoute();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    currentRoute,
    routeParams,
    routeKey,
    navigate,
    goBack,
    goForward,
    canGoBack: navigationHistory.canGoBack(),
    canGoForward: navigationHistory.canGoForward(),
    getRouteMetadata,
    canAccessRoute,
    getBreadcrumbs,
    isNavigating,
    history: navigationHistory.getHistory()
  };
}

// Check if a route is valid
function isValidRoute(route: string): route is Route {
  return route in routeConfig;
}

// Export original useRouter for backward compatibility
export function useRouter() {
  const { currentRoute, routeParams, navigate, routeKey } = useEnhancedRouter();
  return { currentRoute, routeParams, navigate, routeKey };
}

// Export route config for use in other components
export { routeConfig, type RouteMetadata };