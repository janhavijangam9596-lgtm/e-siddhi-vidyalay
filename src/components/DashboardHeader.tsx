import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { useAuth } from '../utils/auth';
import { useNavigation } from '../hooks/useNavigation';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  Wifi,
  WifiOff,
  Shield,
  Clock,
} from 'lucide-react';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<'online' | 'maintenance' | 'error'>('online');
  const [notifications] = useState([
    {
      id: '1',
      title: 'New Student Admission',
      message: 'John Doe has submitted admission application',
      time: '2 hours ago',
      type: 'info',
      read: false
    },
    {
      id: '2',
      title: 'Fee Payment Received',
      message: 'Payment of ₹25,000 received from Jane Smith',
      time: '4 hours ago',
      type: 'success',
      read: false
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight at 11 PM',
      time: '1 day ago',
      type: 'warning',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Check system status periodically
    const statusCheck = setInterval(() => {
      checkSystemStatus();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timeInterval);
      clearInterval(statusCheck);
    };
  }, []);

  const checkSystemStatus = async () => {
    try {
      await api.getDashboardStats();
      setSystemStatus('online');
    } catch (error) {
      setSystemStatus('error');
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'principal': return 'Principal';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      case 'accountant': return 'Accountant';
      case 'librarian': return 'Librarian';
      default: return 'User';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'principal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student': return 'bg-green-100 text-green-800 border-green-200';
      case 'accountant': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        // Implement global search functionality
        const [students, staff, books] = await Promise.allSettled([
          api.searchStudents(searchQuery),
          api.searchStaff(searchQuery),
          api.searchBooks(searchQuery)
        ]);
        
        // Process search results and show in a modal or navigate to results page
        console.log('Search results:', { students, staff, books });
        toast.success(`Found results for "${searchQuery}"`);
      } catch (error) {
        toast.error('Search failed. Please try again.');
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-responsive flex h-14 sm:h-16 items-center justify-between">
        {/* Left Side - Search */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <MobileSidebarDrawer />
          </div>
          
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8 h-8 sm:h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* System Status & Time */}
          <div className="hidden lg:flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <Separator orientation="vertical" className="h-4" />
            
            <div className="flex items-center gap-1">
              <Shield className={`h-3 w-3 ${
                systemStatus === 'online' ? 'text-green-500' : 
                systemStatus === 'maintenance' ? 'text-yellow-500' : 'text-red-500'
              }`} />
              <span className={
                systemStatus === 'online' ? 'text-green-600' : 
                systemStatus === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
              }>
                {systemStatus === 'online' ? 'All Systems Operational' : 
                 systemStatus === 'maintenance' ? 'Maintenance Mode' : 'System Issues'}
              </span>
            </div>

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Actions and Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-4 w-4" />
          </Button>

          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Notifications</h4>
                  <Badge variant="secondary">{unreadCount} new</Badge>
                </div>
                <Separator />
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate('notifications')}
                >
                  View All Notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`} />
                  <AvatarFallback>
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end" forceMount>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`} />
                    <AvatarFallback>
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${getRoleBadgeColor(user?.role)}`}
                    >
                      {getRoleDisplayName(user?.role)}
                    </Badge>
                  </div>
                </div>
                
                {user?.department && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <strong>Department:</strong> {user.department}
                  </div>
                )}
                
                <Separator />
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-8 px-2"
                    onClick={() => navigate('settings')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-8 px-2"
                    onClick={() => navigate('settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </div>
                
                {user?.lastLogin && (
                  <div className="text-xs text-muted-foreground">
                    Last login: {new Date(user.lastLogin).toLocaleString()}
                  </div>
                )}
                
                <Separator />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}