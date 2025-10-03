import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { api } from '../utils/api';
import { useNavigation } from '../hooks/useNavigation';
import { PageLoading } from '../utils/loading';
import { NetworkError, ErrorAlert } from '../utils/error-handling';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Users,
  GraduationCap,
  CreditCard,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  BookOpen,
  Trophy,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Activity,
  DollarSign,
  UserPlus,
  Library,
  Award,
  BarChart3,
  Bell,
  FileText,
  AlertCircle,
  School,
  Target,
  Plus,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  pendingAdmissions: number;
  totalFees: number;
  activeTeachers?: number;
  totalBooks?: number;
  attendanceRate?: number;
  feesCollectionRate?: number;
  monthlyRevenue?: number;
  totalExpenses?: number;
  newAdmissions?: number;
  graduatedStudents?: number;
}

interface RecentActivity {
  id: string;
  type: 'admission' | 'fee' | 'exam' | 'attendance' | 'library' | 'event';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
  icon?: any;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'holiday' | 'meeting' | 'sports' | 'cultural';
  priority: 'high' | 'medium' | 'low';
}

interface PerformanceData {
  month: string;
  students: number;
  revenue: number;
  attendance: number;
}

export function DashboardHome() {
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [isInitializingDemo, setIsInitializingDemo] = useState(false);
   const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
   const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
   const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
   const [selectedPeriod, setSelectedPeriod] = useState('month');
   const { navigate } = useNavigation();

   // No modal or form states needed for quick action redirects

  useEffect(() => {
    loadStats();
    loadRecentActivities();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
      
      // Try to initialize demo data if no data exists
      if (data.totalStudents === 0 && data.totalClasses === 0) {
        console.log('No data found, initializing demo data...');
        await initializeDemoData();
      }
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
      // Use comprehensive demo data when API fails
      const demoStats: DashboardStats = {
        totalStudents: 1250,
        totalClasses: 48,
        pendingAdmissions: 23,
        totalFees: 2850000,
        activeTeachers: 85,
        totalBooks: 15420,
        attendanceRate: 92.5,
        feesCollectionRate: 87.3,
        monthlyRevenue: 450000,
        totalExpenses: 320000,
        newAdmissions: 45,
        graduatedStudents: 210
      };
      setStats(demoStats);
      
      // Load demo activities
      const demoActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'admission',
          title: 'New Student Admission',
          description: 'Rahul Sharma admitted to Class 10-A',
          timestamp: '2 hours ago',
          status: 'success',
          icon: UserPlus
        },
        {
          id: '2',
          type: 'fee',
          title: 'Fee Payment Received',
          description: '₹15,000 received from Priya Patel (Class 9-B)',
          timestamp: '3 hours ago',
          status: 'success',
          icon: DollarSign
        },
        {
          id: '3',
          type: 'exam',
          title: 'Exam Results Published',
          description: 'Mid-term results for Class 12 are now available',
          timestamp: '5 hours ago',
          status: 'info',
          icon: FileText
        },
        {
          id: '4',
          type: 'attendance',
          title: 'Low Attendance Alert',
          description: 'Class 8-C attendance dropped below 80%',
          timestamp: '1 day ago',
          status: 'warning',
          icon: AlertCircle
        },
        {
          id: '5',
          type: 'library',
          title: 'Overdue Books',
          description: '12 books are overdue for return',
          timestamp: '1 day ago',
          status: 'warning',
          icon: BookOpen
        },
        {
          id: '6',
          type: 'event',
          title: 'Sports Day Scheduled',
          description: 'Annual sports day on 15th February',
          timestamp: '2 days ago',
          status: 'info',
          icon: Trophy
        }
      ];
      setRecentActivities(demoActivities);
      
      // Load demo events
      const demoEvents: UpcomingEvent[] = [
        {
          id: '1',
          title: 'Parent-Teacher Meeting',
          date: '2024-02-05',
          type: 'meeting',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Annual Examination',
          date: '2024-03-01',
          type: 'exam',
          priority: 'high'
        },
        {
          id: '3',
          title: 'Republic Day Celebration',
          date: '2024-01-26',
          type: 'cultural',
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Science Exhibition',
          date: '2024-02-20',
          type: 'cultural',
          priority: 'medium'
        },
        {
          id: '5',
          title: 'Winter Vacation',
          date: '2024-12-25',
          type: 'holiday',
          priority: 'low'
        }
      ];
      setUpcomingEvents(demoEvents);
      
      // Load performance data
      const demoPerfData: PerformanceData[] = [
        { month: 'Aug', students: 1180, revenue: 420000, attendance: 91 },
        { month: 'Sep', students: 1200, revenue: 435000, attendance: 93 },
        { month: 'Oct', students: 1210, revenue: 440000, attendance: 92 },
        { month: 'Nov', students: 1225, revenue: 445000, attendance: 94 },
        { month: 'Dec', students: 1240, revenue: 448000, attendance: 91 },
        { month: 'Jan', students: 1250, revenue: 450000, attendance: 92.5 }
      ];
      setPerformanceData(demoPerfData);
    } finally {
      setLoading(false);
    }
  };

  const initializeDemoData = async () => {
    try {
      setIsInitializingDemo(true);
      toast.loading('Setting up demo data...', { id: 'demo-init' });

      await api.initializeDemoData();

      // Reload stats after demo data initialization
      const newData = await api.getDashboardStats();
      setStats(newData);

      toast.success('Demo data initialized successfully!', { id: 'demo-init' });
    } catch (initError: any) {
      console.error('Failed to initialize demo data:', initError);
      toast.error('Failed to initialize demo data', { id: 'demo-init' });
    } finally {
      setIsInitializingDemo(false);
    }
  };

  // Quick action handlers

  // No handlers needed for quick action redirects

  // Load recent activities from API
  const loadRecentActivities = async () => {
    try {
      const activities = await api.getRecentActivities();
      setRecentActivities(activities);
    } catch (error) {
      console.log('Using demo activities data');
      // Keep the demo data as fallback
    }
  };


  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageLoading text="Loading dashboard..." />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6">
        <NetworkError onRetry={loadStats} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-full">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
        <div className="space-y-6">
          {/* Hero Welcome Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 lg:p-10 shadow-2xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="text-white">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 drop-shadow-lg">
                    Welcome to <span className="text-yellow-300">eSiddhiविद्यालय</span>
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl opacity-95 drop-shadow">
                    Empowering education through smart management
                  </p>
                </div>
                {/* Debug Controls */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadStats}
                    disabled={loading}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  {(!stats || (stats.totalStudents === 0 && stats.totalClasses === 0)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={initializeDemoData}
                      disabled={isInitializingDemo}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      {isInitializingDemo ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Users className="mr-2 h-4 w-4" />
                      )}
                      Initialize Demo Data
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards with Glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Students Card */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 overflow-hidden border-l-4 border-blue-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5"></div>
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                    +12%
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase tracking-wider">Total Students</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalStudents || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active Enrollments</p>
                </div>
              </div>
            </div>

            {/* Classes Card */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 overflow-hidden border-l-4 border-green-500">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5"></div>
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase tracking-wider">Total Classes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalClasses || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Running</p>
                </div>
              </div>
            </div>

            {/* Pending Admissions Card */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 overflow-hidden border-l-4 border-orange-500">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5"></div>
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase tracking-wider">Pending Admissions</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.pendingAdmissions || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Review Required</p>
                </div>
              </div>
            </div>

            {/* Fees Card */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 overflow-hidden border-l-4 border-purple-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5"></div>
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                    +8%
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase tracking-wider">Total Fees Collected</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{stats?.totalFees?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This Year</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <ErrorAlert 
              error={error} 
              onDismiss={() => setError(null)}
              className="mb-6"
            />
          )}

          {/* Demo Data Initialization */}
          {stats && stats.totalStudents === 0 && stats.totalClasses === 0 && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <AlertTriangle className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">No Data Found</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Get started by initializing demo data to explore the system features.
                    </p>
                  </div>
                  <Button 
                    onClick={initializeDemoData} 
                    disabled={isInitializingDemo}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  >
                    {isInitializingDemo ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      'Initialize Demo Data'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold">{stats?.attendanceRate || 0}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-indigo-500" />
                </div>
                <Progress value={stats?.attendanceRate || 0} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fee Collection</p>
                    <p className="text-2xl font-bold">{stats?.feesCollectionRate || 0}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={stats?.feesCollectionRate || 0} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                    <p className="text-2xl font-bold">{stats?.activeTeachers || 0}</p>
                  </div>
                  <School className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Teaching staff</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-pink-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Library Books</p>
                    <p className="text-2xl font-bold">{stats?.totalBooks?.toLocaleString() || 0}</p>
                  </div>
                  <Library className="h-8 w-8 text-pink-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Total collection</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Analytics Tabs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                  <TabsTrigger value="academics">Academics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold">₹{stats?.monthlyRevenue?.toLocaleString() || 0}</p>
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expenses</span>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold">₹{stats?.totalExpenses?.toLocaleString() || 0}</p>
                      <p className="text-xs text-red-600">-5% from last month</p>
                    </div>
                  </div>
                  
                  {/* Performance Chart Placeholder */}
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Performance Chart</p>
                      <div className="mt-4 space-y-2">
                        {performanceData.map((data, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-12">{data.month}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-500 h-2 rounded-full"
                                style={{ width: `${(data.revenue / 500000) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-700 w-20 text-right">
                              ₹{(data.revenue / 1000).toFixed(0)}k
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="students" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats?.newAdmissions || 0}</div>
                        <p className="text-xs text-muted-foreground">New Admissions This Month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats?.graduatedStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">Graduated Students</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="finance" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Tuition Fees</span>
                      <span className="font-semibold">₹{((stats?.totalFees || 0) * 0.7).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Transport Fees</span>
                      <span className="font-semibold">₹{((stats?.totalFees || 0) * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Other Fees</span>
                      <span className="font-semibold">₹{((stats?.totalFees || 0) * 0.15).toLocaleString()}</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="academics" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Pass Percentage</p>
                      <p className="text-2xl font-bold">94.5%</p>
                      <Progress value={94.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Average Grade</p>
                      <p className="text-2xl font-bold">B+</p>
                      <Badge className="bg-green-100 text-green-800">Good Performance</Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions and Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-between" variant="outline" onClick={() => navigate('students')}>
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Student
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button className="w-full justify-between" variant="outline" onClick={() => navigate('exam')}>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Exam
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button className="w-full justify-between" variant="outline" onClick={() => navigate('fees')}>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Manage Fees
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button className="w-full justify-between" variant="outline" onClick={() => navigate('library')}>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Add Book
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activity.icon || Bell;
              const statusColors = {
                success: 'bg-green-100 text-green-800 border-green-200',
                warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                info: 'bg-blue-100 text-blue-800 border-blue-200',
                error: 'bg-red-100 text-red-800 border-red-200'
              };

              const handleActivityClick = () => {
                // Navigate based on activity type
                switch (activity.type) {
                  case 'admission':
                    navigate('students');
                    break;
                  case 'fee':
                    navigate('fees');
                    break;
                  case 'exam':
                    navigate('exam');
                    break;
                  case 'attendance':
                    navigate('attendance');
                    break;
                  case 'library':
                    navigate('library');
                    break;
                  case 'event':
                    navigate('calendar');
                    break;
                  default:
                    navigate('reports');
                }
                toast.info(`Viewing ${activity.type} details`);
              };

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={handleActivityClick}
                >
                  <div className={`p-2 rounded-lg ${statusColors[activity.status]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 mt-1" />
                </div>
              );
            })}

            <Button variant="outline" className="w-full" onClick={() => navigate('reports')}>
              View All Activities
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const priorityColors = {
                high: 'bg-red-100 text-red-800',
                medium: 'bg-yellow-100 text-yellow-800',
                low: 'bg-green-100 text-green-800'
              };
              
              const eventIcons = {
                exam: ClipboardCheck,
                holiday: Calendar,
                meeting: Users,
                sports: Trophy,
                cultural: Award
              };
              
              const EventIcon = eventIcons[event.type] || Calendar;
              
              return (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <EventIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge className={priorityColors[event.priority]}>
                    {event.priority.toUpperCase()}
                  </Badge>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => navigate('calendar')}>
              <Calendar className="h-4 w-4 mr-2" />
              View Full Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Year Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Year Completion</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                7 months remaining in academic year
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collection Rate</span>
                <span>82%</span>
              </div>
              <Progress value={82} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                ₹2.5L pending collection
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Users</span>
                <span>90%</span>
              </div>
              <Progress value={90} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                245 users active today
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      </div>
      </div>
    </div>
  );
}
