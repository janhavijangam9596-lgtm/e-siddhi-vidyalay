import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Route } from '../utils/enhanced-router';

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
  isNavigating: boolean;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialize from URL
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Map paths to routes
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

    const route = pathToRoute[path] || 'dashboard';
    setCurrentRoute(route);
  }, []);

  const navigate = useCallback((route: Route) => {
    console.log('Navigating to:', route);
    
    // Immediately update the current route state
    setCurrentRoute(route);
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
      'settings': '/settings',
      'calendar': '/calendar',
      'profile': '/profile',
      'student-dashboard': '/student-dashboard',
      '404': '/404'
    };

    const path = routeToPaths[route] || '/';
    window.history.pushState({ route }, '', path);
    
    // Clear navigation state after a brief delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 100);
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.route) {
        setCurrentRoute(event.state.route);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ currentRoute, navigate, isNavigating }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useSimpleRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useSimpleRouter must be used within RouterProvider');
  }
  return context;
}