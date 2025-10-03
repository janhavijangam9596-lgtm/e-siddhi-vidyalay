import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Heart,
  Globe,
  Shield,
  Clock,
  Users,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

export function DashboardFooter() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-6 py-3">
        {/* Left Side - System Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>System Status:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Online
            </Badge>
          </div>
          
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span>{isOnline ? 'Connected' : 'Offline'}</span>
          </div>
        </div>

        {/* Center - Time and Date */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <span className="text-muted-foreground hidden md:block">
            {formatDate(currentTime)}
          </span>
        </div>

        {/* Right Side - Credits and Links */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>245 Active Users</span>
          </div>
          
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>by eSiddhiविद्यालय Team</span>
          </div>
        </div>
      </div>

      {/* Secondary Footer Bar */}
      <div className="border-t bg-muted/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 md:px-6 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2024 eSiddhiविद्यालय School Management System</span>
            <Separator orientation="vertical" className="hidden sm:block h-3" />
            <span>Version 2.1.0</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="link" className="h-auto p-0 text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Privacy Policy
            </Button>
            <Button variant="link" className="h-auto p-0 text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Support
            </Button>
            <Button variant="link" className="h-auto p-0 text-xs">
              Documentation
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}