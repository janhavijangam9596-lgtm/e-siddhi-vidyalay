import { useState, useEffect, useCallback } from 'react';
import { Route } from '../utils/enhanced-router';

// Global state to ensure synchronization
let globalRoute: Route = 'dashboard';
let listeners: Set<(route: Route) => void> = new Set();

const notifyListeners = (route: Route) => {
  globalRoute = route;
  listeners.forEach(listener => listener(route));
};

export function useNavigation() {
  const [currentRoute, setCurrentRoute] = useState<Route>(globalRoute);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Initialize from URL on first mount
    const path = window.location.pathname;
    const pathToRoute: Record<string, Route> = {
      '/': 'dashboard',
      '/my-courses': 'my-courses',
      '/my-grades': 'my-grades',
      '/my-assignments': 'my-assignments',
      '/my-schedule': 'my-schedule',
      '/my-attendance': 'my-attendance',
      '/my-fees': 'my-fees',
      '/my-library': 'my-library',
      '/my-exams': 'my-exams',
      '/my-results': 'my-results',
      '/management': 'management',
      '/students': 'students',
      '/staff': 'staff',
      '/admission': 'admission',
      '/fees': 'fees',
      '/exam': 'exam',
      '/library': 'library',
      '/classes': 'classes',
      '/timetable': 'timetable',
      '/attendance': 'attendance',
      '/health': 'health',
      '/accounts': 'accounts',
      '/transport': 'transport',
      '/hostel': 'hostel',
      '/communication': 'communication',
      '/reports': 'reports',
      '/certificates': 'certificates',
      '/sports': 'sports',
      '/alumni': 'alumni',
      '/birthday': 'birthday',
      '/inventory': 'inventory',
      '/settings': 'settings',
      '/calendar': 'calendar',
      '/profile': 'profile',
      '/student-dashboard': 'student-dashboard',
    };
    
    const initialRoute = pathToRoute[path] || 'dashboard';
    if (initialRoute !== globalRoute) {
      notifyListeners(initialRoute);
    }
    
    // Subscribe to route changes
    const handleRouteChange = (route: Route) => {
      setCurrentRoute(route);
    };
    
    listeners.add(handleRouteChange);
    
    // Handle browser back/forward
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.route) {
        notifyListeners(event.state.route);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      listeners.delete(handleRouteChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((route: Route) => {
    if (route === currentRoute) {
      return; // Don't navigate to the same route
    }

    console.log('Navigating from', currentRoute, 'to', route);
    
    setIsNavigating(true);
    
    // Update URL
    const routeToPaths: Record<Route, string> = {
      'dashboard': '/',
      'my-courses': '/my-courses',
      'my-grades': '/my-grades',
      'my-assignments': '/my-assignments',
      'my-schedule': '/my-schedule',
      'my-attendance': '/my-attendance',
      'my-fees': '/my-fees',
      'my-library': '/my-library',
      'my-exams': '/my-exams',
      'my-results': '/my-results',
      'management': '/management',
      'students': '/students',
      'staff': '/staff',
      'admission': '/admission',
      'fees': '/fees',
      'exam': '/exam',
      'library': '/library',
      'classes': '/classes',
      'timetable': '/timetable',
      'attendance': '/attendance',
      'health': '/health',
      'accounts': '/accounts',
      'transport': '/transport',
      'hostel': '/hostel',
      'communication': '/communication',
      'reports': '/reports',
      'certificates': '/certificates',
      'sports': '/sports',
      'alumni': '/alumni',
      'birthday': '/birthday',
      'inventory': '/inventory',
      'admin': '/admin',
      'settings': '/settings',
      'calendar': '/calendar',
      'profile': '/profile',
      'notifications': '/notifications',
      'student-dashboard': '/student-dashboard',
      '404': '/404'
    };

    const path = routeToPaths[route] || '/';
    window.history.pushState({ route }, '', path);
    
    // Notify all listeners immediately
    notifyListeners(route);
    
    // Clear navigation state
    setTimeout(() => {
      setIsNavigating(false);
    }, 50);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute]);

  return { currentRoute, navigate, isNavigating };
}