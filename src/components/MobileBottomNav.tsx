import { useState, useEffect } from 'react';
import { Route } from '../utils/enhanced-router';
import { useNavigation } from '../hooks/useNavigation';
import {
  Home,
  Users,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  route: Route;
  color: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', route: 'dashboard', color: 'text-blue-600' },
  { icon: Users, label: 'Students', route: 'students', color: 'text-green-600' },
  { icon: BookOpen, label: 'Library', route: 'library', color: 'text-purple-600' },
  { icon: BarChart3, label: 'Reports', route: 'reports', color: 'text-orange-600' },
  { icon: Settings, label: 'Settings', route: 'settings', color: 'text-gray-600' },
];

export function MobileBottomNav() {
  const { currentRoute, navigate } = useNavigation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50
      lg:hidden
      transition-transform duration-300
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
    `}>
      {/* Gradient border top */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
      
      {/* Navigation bar with glassmorphism */}
      <nav className="glass-card border-t border-gray-200/20">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`
                  relative flex flex-col items-center justify-center
                  py-2 px-3 min-w-[64px]
                  transition-all duration-200
                  ${isActive ? 'scale-105' : 'hover:scale-105 active:scale-95'}
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                )}
                
                {/* Icon with animation */}
                <div className={`
                  relative p-1 rounded-lg transition-all duration-200
                  ${isActive ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : ''}
                `}>
                  <Icon 
                    className={`
                      h-5 w-5 transition-all duration-200
                      ${isActive ? item.color : 'text-gray-500'}
                      ${isActive ? 'animate-pulse' : ''}
                    `} 
                  />
                  
                  {/* Notification badge */}
                  {item.route === 'students' && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </div>
                
                {/* Label */}
                <span className={`
                  text-[10px] mt-1 transition-all duration-200
                  ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-500'}
                `}>
                  {item.label}
                </span>
                
                {/* Ripple effect container */}
                <span className="absolute inset-0 rounded-lg overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300"></span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}