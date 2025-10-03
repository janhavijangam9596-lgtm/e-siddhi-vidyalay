import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { 
  Bell, Search, Filter, Check, X, Trash2, Archive, 
  AlertCircle, Info, CheckCircle, XCircle, Clock,
  RefreshCw, Settings, Download, ChevronRight,
  Mail, MessageSquare, Calendar, DollarSign, Users,
  GraduationCap, BookOpen, AlertTriangle, Star
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'academic' | 'fee' | 'event' | 'system' | 'announcement' | 'alert';
  timestamp: string;
  read: boolean;
  starred: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  sender?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function NotificationsModule() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Student Admission',
      message: 'John Doe has submitted admission application for Class 10-A. Please review the application.',
      type: 'info',
      category: 'academic',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      starred: false,
      actionRequired: true,
      actionUrl: '/admissions',
      actionLabel: 'Review Application',
      sender: 'Admissions System',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Fee Payment Received',
      message: 'Payment of ₹25,000 received from Jane Smith (Student ID: STU002) for Term 2 fees.',
      type: 'success',
      category: 'fee',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      starred: true,
      actionRequired: false,
      sender: 'Finance Department',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'System Maintenance Scheduled',
      message: 'The system will undergo scheduled maintenance tonight from 11 PM to 2 AM. Please save your work.',
      type: 'warning',
      category: 'system',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: false,
      actionRequired: false,
      sender: 'System Administrator',
      priority: 'high'
    },
    {
      id: '4',
      title: 'Parent-Teacher Meeting',
      message: 'PTM scheduled for Saturday, 10 AM - 1 PM. All class teachers must be present.',
      type: 'info',
      category: 'event',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: true,
      actionRequired: true,
      actionUrl: '/events',
      actionLabel: 'View Details',
      sender: 'Principal Office',
      priority: 'medium'
    },
    {
      id: '5',
      title: 'Low Attendance Alert',
      message: 'Student Mike Johnson (Class 9-B) has attendance below 75%. Immediate action required.',
      type: 'error',
      category: 'alert',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      read: false,
      starred: false,
      actionRequired: true,
      actionUrl: '/students',
      actionLabel: 'View Student',
      sender: 'Attendance System',
      priority: 'urgent'
    },
    {
      id: '6',
      title: 'New Announcement',
      message: 'Sports Day will be held on Friday. All students must participate in at least one event.',
      type: 'info',
      category: 'announcement',
      timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      read: true,
      starred: false,
      actionRequired: false,
      sender: 'Sports Department',
      priority: 'low'
    }
  ]);

  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, selectedCategory, selectedType, selectedPriority, activeTab, showOnlyUnread, showOnlyStarred]);

  const applyFilters = () => {
    let filtered = [...notifications];

    // Tab filter
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (activeTab === 'starred') {
      filtered = filtered.filter(n => n.starred);
    } else if (activeTab === 'action') {
      filtered = filtered.filter(n => n.actionRequired);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.sender?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }

    // Additional filters
    if (showOnlyUnread) {
      filtered = filtered.filter(n => !n.read);
    }
    if (showOnlyStarred) {
      filtered = filtered.filter(n => n.starred);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredNotifications(filtered);
  };

  const markAsRead = (notificationIds: string[]) => {
    setNotifications(prev => 
      prev.map(n => 
        notificationIds.includes(n.id) ? { ...n, read: true } : n
      )
    );
    toast.success(`Marked ${notificationIds.length} notification(s) as read`);
  };

  const markAsUnread = (notificationIds: string[]) => {
    setNotifications(prev => 
      prev.map(n => 
        notificationIds.includes(n.id) ? { ...n, read: false } : n
      )
    );
    toast.success(`Marked ${notificationIds.length} notification(s) as unread`);
  };

  const toggleStar = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, starred: !n.starred } : n
      )
    );
  };

  const deleteNotifications = (notificationIds: string[]) => {
    setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
    setSelectedNotifications([]);
    toast.success(`Deleted ${notificationIds.length} notification(s)`);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const clearAllNotifications = () => {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      setNotifications([]);
      toast.success('All notifications cleared');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'fee': return <DollarSign className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'announcement': return <MessageSquare className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    starred: notifications.filter(n => n.starred).length,
    actionRequired: notifications.filter(n => n.actionRequired).length,
    urgent: notifications.filter(n => n.priority === 'urgent').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600">Manage all your notifications in one place</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Starred</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.starred}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Action Required</p>
                <p className="text-2xl font-bold text-orange-600">{stats.actionRequired}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Notifications</CardTitle>
            <div className="flex gap-2">
              {selectedNotifications.length > 0 && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAsRead(selectedNotifications)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark as Read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAsUnread(selectedNotifications)}
                  >
                    Mark as Unread
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => deleteNotifications(selectedNotifications)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={clearAllNotifications}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox 
                  checked={showOnlyUnread}
                  onCheckedChange={(checked) => setShowOnlyUnread(!!checked)}
                />
                <span className="text-sm">Show only unread</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox 
                  checked={showOnlyStarred}
                  onCheckedChange={(checked) => setShowOnlyStarred(!!checked)}
                />
                <span className="text-sm">Show only starred</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 pt-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
                <TabsTrigger value="starred">Starred ({stats.starred})</TabsTrigger>
                <TabsTrigger value="action">Action Required ({stats.actionRequired})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="p-6 pt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-all ${
                          !notification.read 
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedNotifications.includes(notification.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedNotifications([...selectedNotifications, notification.id]);
                              } else {
                                setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                              }
                            }}
                          />
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(notification.type)}
                                <h3 className="font-medium">{notification.title}</h3>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleStar(notification.id)}
                              >
                                <Star 
                                  className={`h-4 w-4 ${
                                    notification.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                                  }`} 
                                />
                              </Button>
                            </div>
                            
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {getCategoryIcon(notification.category)}
                                <span>{notification.sender}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                              
                              {notification.actionRequired && notification.actionUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => window.location.href = notification.actionUrl!}
                                >
                                  {notification.actionLabel || 'Take Action'}
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}