import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { api } from '../../utils/api';
import { 
  Users, GraduationCap, DollarSign, BookOpen, Calendar,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, Award, MapPin, Phone, Mail, Building2,
  BarChart3, PieChart, LineChart, Activity, Target,
  Star, Trophy, Heart, Zap, Shield, Eye, Settings,
  RefreshCw, Download, Bell, Search, Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DashboardStats {
  overview: {
    totalStudents: number;
    totalStaff: number;
    totalRevenue: number;
    monthlyExpenses: number;
    activeClasses: number;
    libraryBooks: number;
    hostelOccupancy: number;
    transportUtilization: number;
  };
  academic: {
    averageAttendance: number;
    examResults: {
      passed: number;
      failed: number;
      distinction: number;
    };
    subjectPerformance: { subject: string; average: number }[];
    upcomingExams: number;
  };
  financial: {
    feeCollection: {
      collected: number;
      pending: number;
      overdue: number;
    };
    monthlyTrends: { month: string; income: number; expenses: number }[];
    profitMargin: number;
    budgetUtilization: number;
  };
  operational: {
    staffAttendance: number;
    facilityUtilization: number;
    maintenanceRequests: number;
    inventoryAlerts: number;
    transportRoutes: number;
    libraryIssues: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: string;
  count?: number;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'admission' | 'fee' | 'exam' | 'attendance' | 'staff' | 'system';
}

interface TopPerformer {
  id: string;
  name: string;
  category: 'student' | 'teacher' | 'class' | 'subject';
  metric: string;
  value: number;
  change: number;
  avatar?: string;
}

export function ManagementDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    overview: {
      totalStudents: 0,
      totalStaff: 0,
      totalRevenue: 0,
      monthlyExpenses: 0,
      activeClasses: 0,
      libraryBooks: 0,
      hostelOccupancy: 0,
      transportUtilization: 0
    },
    academic: {
      averageAttendance: 0,
      examResults: { passed: 0, failed: 0, distinction: 0 },
      subjectPerformance: [],
      upcomingExams: 0
    },
    financial: {
      feeCollection: { collected: 0, pending: 0, overdue: 0 },
      monthlyTrends: [],
      profitMargin: 0,
      budgetUtilization: 0
    },
    operational: {
      staffAttendance: 0,
      facilityUtilization: 0,
      maintenanceRequests: 0,
      inventoryAlerts: 0,
      transportRoutes: 0,
      libraryIssues: 0
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Student Admission',
      description: 'Add new student admission',
      icon: Users,
      color: 'bg-blue-500',
      action: 'admission',
      count: stats.overview.totalStudents
    },
    {
      id: '2',
      title: 'Fee Collection',
      description: 'Manage fee payments',
      icon: DollarSign,
      color: 'bg-green-500',
      action: 'fees',
      count: stats.financial.feeCollection.pending
    },
    {
      id: '3',
      title: 'Attendance',
      description: 'Mark daily attendance',
      icon: CheckCircle,
      color: 'bg-purple-500',
      action: 'attendance',
      count: Math.round(stats.academic.averageAttendance)
    },
    {
      id: '4',
      title: 'Exam Management',
      description: 'Schedule and manage exams',
      icon: GraduationCap,
      color: 'bg-orange-500',
      action: 'exam',
      count: stats.academic.upcomingExams
    },
    {
      id: '5',
      title: 'Staff Management',
      description: 'Manage staff records',
      icon: Building2,
      color: 'bg-indigo-500',
      action: 'staff',
      count: stats.overview.totalStaff
    },
    {
      id: '6',
      title: 'Reports',
      description: 'Generate reports',
      icon: BarChart3,
      color: 'bg-red-500',
      action: 'reports'
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, notificationsData, activitiesData, performersData] = await Promise.all([
        api.getDashboardStats(),
        api.getNotifications(),
        api.getRecentActivities(),
        api.getTopPerformers()
      ]);

      setStats(statsData);
      setNotifications(notificationsData);
      setRecentActivities(activitiesData);
      setTopPerformers(performersData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Bell className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'admission': return <Users className="h-4 w-4 text-blue-500" />;
      case 'fee': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'exam': return <GraduationCap className="h-4 w-4 text-purple-500" />;
      case 'attendance': return <CheckCircle className="h-4 w-4 text-orange-500" />;
      case 'staff': return <Building2 className="h-4 w-4 text-indigo-500" />;
      case 'system': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPerformerIcon = (category: string) => {
    switch (category) {
      case 'student': return <Users className="h-4 w-4 text-blue-500" />;
      case 'teacher': return <GraduationCap className="h-4 w-4 text-green-500" />;
      case 'class': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'subject': return <Award className="h-4 w-4 text-orange-500" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Management Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of school operations and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Customize
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.overview.totalStudents}</p>
                <p className="text-xs text-green-600">↑ 12% from last month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹{stats.overview.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">↑ 8% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Average Attendance</p>
                <p className="text-2xl font-bold">{stats.academic.averageAttendance}%</p>
                <p className="text-xs text-yellow-600">↓ 2% from last month</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={stats.academic.averageAttendance} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Staff Attendance</p>
                <p className="text-2xl font-bold">{stats.operational.staffAttendance}%</p>
                <p className="text-xs text-green-600">↑ 3% from last month</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={stats.operational.staffAttendance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  {action.count !== undefined && (
                    <p className="text-xs font-bold text-blue-600">{action.count}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      <span className="text-blue-600">{activity.user}</span> {activity.action} <span className="font-semibold">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 border rounded-lg ${!notification.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="academic" className="w-full">
        <TabsList>
          <TabsTrigger value="academic">Academic Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial Overview</TabsTrigger>
          <TabsTrigger value="operational">Operations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="academic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Results Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{stats.academic.examResults.passed}</div>
                      <div className="text-xs text-muted-foreground">Passed</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">{stats.academic.examResults.distinction}</div>
                      <div className="text-xs text-muted-foreground">Distinction</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">{stats.academic.examResults.failed}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pass Rate:</span>
                      <span className="font-bold">
                        {Math.round((stats.academic.examResults.passed / (stats.academic.examResults.passed + stats.academic.examResults.failed)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(stats.academic.examResults.passed / (stats.academic.examResults.passed + stats.academic.examResults.failed)) * 100} 
                      className="w-full" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.academic.subjectPerformance.map((subject, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{subject.subject}</span>
                        <span className="font-medium">{subject.average}%</span>
                      </div>
                      <Progress value={subject.average} className="w-full h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topPerformers.map((performer) => (
                  <div key={performer.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={performer.avatar} />
                      <AvatarFallback>
                        {performer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{performer.name}</h4>
                      <div className="flex items-center gap-1">
                        {getPerformerIcon(performer.category)}
                        <span className="text-xs text-muted-foreground">{performer.category}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold">{performer.value}%</span>
                        <span className={`text-xs ${performer.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {performer.change >= 0 ? '↑' : '↓'} {Math.abs(performer.change)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Collection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Collected:</span>
                      <span className="font-bold text-green-600">₹{stats.financial.feeCollection.collected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending:</span>
                      <span className="font-bold text-yellow-600">₹{stats.financial.feeCollection.pending.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Overdue:</span>
                      <span className="font-bold text-red-600">₹{stats.financial.feeCollection.overdue.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Collection Rate:</span>
                      <span className="font-bold">
                        {Math.round((stats.financial.feeCollection.collected / 
                          (stats.financial.feeCollection.collected + stats.financial.feeCollection.pending + stats.financial.feeCollection.overdue)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(stats.financial.feeCollection.collected / 
                        (stats.financial.feeCollection.collected + stats.financial.feeCollection.pending + stats.financial.feeCollection.overdue)) * 100} 
                      className="w-full" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profit Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.financial.profitMargin}%</div>
                    <div className="text-sm text-muted-foreground">Profit Margin</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Revenue:</span>
                      <span className="font-bold text-green-600">₹{stats.overview.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expenses:</span>
                      <span className="font-bold text-red-600">₹{stats.overview.monthlyExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Net Profit:</span>
                      <span className="text-blue-600">₹{(stats.overview.totalRevenue - stats.overview.monthlyExpenses).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Progress value={stats.financial.profitMargin} className="w-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Budget Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.financial.budgetUtilization}%</div>
                    <div className="text-sm text-muted-foreground">Budget Used</div>
                  </div>
                  
                  <Progress value={stats.financial.budgetUtilization} className="w-full" />
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Infrastructure:</span>
                      <span>35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salaries:</span>
                      <span>45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operations:</span>
                      <span>20%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Facility Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Classrooms</span>
                    <span className="font-bold">{stats.overview.activeClasses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Library Books</span>
                    <span className="font-bold">{stats.overview.libraryBooks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hostel Occupancy</span>
                    <span className="font-bold">{stats.overview.hostelOccupancy}%</span>
                  </div>
                  <Progress value={stats.overview.hostelOccupancy} className="w-full" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transport Routes</span>
                    <span className="font-bold">{stats.operational.transportRoutes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Maintenance & Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Maintenance Requests</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.operational.maintenanceRequests}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Inventory Alerts</span>
                    <Badge className="bg-red-100 text-red-800">
                      {stats.operational.inventoryAlerts}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Library Issues</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {stats.operational.libraryIssues}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.operational.staffAttendance}%</div>
                    <div className="text-sm text-muted-foreground">Average Attendance</div>
                  </div>
                  <Progress value={stats.operational.staffAttendance} className="w-full" />
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Teaching Staff:</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Administrative:</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Support Staff:</span>
                      <span className="font-medium">88%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Enrollment Growth</h4>
                      <p className="text-sm text-green-700">Student enrollment increased by 12% this quarter, indicating strong market presence.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Attendance Concern</h4>
                      <p className="text-sm text-yellow-700">Student attendance dropped by 2% last month. Consider implementing engagement initiatives.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Academic Excellence</h4>
                      <p className="text-sm text-blue-700">Math and Science subjects showing consistent improvement in test scores.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-800">Digital Adoption</h4>
                      <p className="text-sm text-purple-700">95% of staff and students are actively using the digital platform.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                    <div>
                      <h4 className="font-medium text-blue-800">Focus on Attendance</h4>
                      <p className="text-sm text-blue-700">Implement attendance rewards program and parent notification system.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border-l-4 border-green-500 bg-green-50">
                    <div>
                      <h4 className="font-medium text-green-800">Expand Infrastructure</h4>
                      <p className="text-sm text-green-700">Consider adding more classrooms to accommodate growing enrollment.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border-l-4 border-orange-500 bg-orange-50">
                    <div>
                      <h4 className="font-medium text-orange-800">Technology Upgrade</h4>
                      <p className="text-sm text-orange-700">Invest in smart classroom technology to enhance learning experience.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border-l-4 border-purple-500 bg-purple-50">
                    <div>
                      <h4 className="font-medium text-purple-800">Staff Development</h4>
                      <p className="text-sm text-purple-700">Organize professional development workshops for teaching staff.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">+12%</div>
                  <div className="text-sm text-blue-700">Student Growth</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">+8%</div>
                  <div className="text-sm text-green-700">Revenue Growth</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">+15%</div>
                  <div className="text-sm text-purple-700">Academic Scores</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}