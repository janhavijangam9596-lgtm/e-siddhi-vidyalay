import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { api } from '../../utils/api';
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, Users, 
  GraduationCap, DollarSign, Calendar as CalendarIcon,
  Download, Filter, RefreshCw, FileText, Activity,
  Eye, Share, PrinterIcon, Settings, Target
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AnalyticsData {
  enrollment: EnrollmentData;
  academic: AcademicData;
  financial: FinancialData;
  attendance: AttendanceData;
  performance: PerformanceData;
  trends: TrendData[];
}

interface EnrollmentData {
  totalStudents: number;
  newAdmissions: number;
  dropouts: number;
  retentionRate: number;
  genderDistribution: { male: number; female: number };
  classWiseDistribution: { [key: string]: number };
  ageDistribution: { [key: string]: number };
}

interface AcademicData {
  totalClasses: number;
  averageClassSize: number;
  teacherStudentRatio: number;
  subjectPerformance: { [key: string]: number };
  examResults: { passed: number; failed: number; distinction: number };
  attendanceRate: number;
}

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  feeCollection: number;
  outstandingFees: number;
  scholarships: number;
  budgetUtilization: number;
}

interface AttendanceData {
  studentAttendance: number;
  staffAttendance: number;
  monthlyTrends: { month: string; rate: number }[];
  classWiseAttendance: { [key: string]: number };
}

interface PerformanceData {
  overallGrade: string;
  topPerformers: number;
  averageMarks: number;
  improvementRate: number;
  subjectWisePerformance: { subject: string; average: number }[];
}

interface TrendData {
  period: string;
  students: number;
  revenue: number;
  attendance: number;
  performance: number;
}

interface Report {
  id: string;
  name: string;
  type: string;
  description: string;
  lastGenerated: string;
  size: string;
  format: 'pdf' | 'excel' | 'csv';
  access: 'public' | 'private' | 'restricted';
}

export function ReportsAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedClass, setSelectedClass] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date()
  });

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedClass, dateRange]);

  const loadData = async () => {
    try {
      const [analyticsResponse, reportsResponse] = await Promise.all([
        api.getAnalyticsData({ 
          period: selectedPeriod, 
          class: selectedClass,
          dateRange 
        }),
        api.getReports()
      ]);
      
      setAnalyticsData(analyticsResponse);
      setReports(reportsResponse);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      const response = await api.generateReport({
        type: reportType,
        period: selectedPeriod,
        class: selectedClass,
        dateRange
      });
      
      toast.success(`${reportType} report generated successfully`);
      loadData();
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    }
  };

  const handleExportData = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await api.exportAnalytics({
        format,
        period: selectedPeriod,
        class: selectedClass,
        dateRange
      });
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  if (loading || !analyticsData) {
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
          <h1>Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and reporting dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => handleExportData('pdf')}>
                  Export as PDF
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => handleExportData('excel')}>
                  Export as Excel
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => handleExportData('csv')}>
                  Export as CSV
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Customize
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label htmlFor="period">Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="class">Class Filter</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="1">Class 1</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="5">Class 5</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => range && setDateRange(range)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{analyticsData.enrollment.totalStudents}</p>
                <p className="text-xs text-green-600">
                  +{analyticsData.enrollment.newAdmissions} new admissions
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{analyticsData.attendance.studentAttendance}%</p>
                <p className="text-xs text-muted-foreground">
                  Staff: {analyticsData.attendance.staffAttendance}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={analyticsData.attendance.studentAttendance} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Fee Collection</p>
                <p className="text-2xl font-bold">₹{analyticsData.financial.feeCollection.toLocaleString()}</p>
                <p className="text-xs text-red-600">
                  ₹{analyticsData.financial.outstandingFees.toLocaleString()} outstanding
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Academic Performance</p>
                <p className="text-2xl font-bold">{analyticsData.performance.overallGrade}</p>
                <p className="text-xs text-green-600">
                  {analyticsData.performance.topPerformers} top performers
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution by Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analyticsData.enrollment.classWiseDistribution).map(([className, count]) => (
                    <div key={className} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Class {className}</span>
                        <span className="font-medium">{count} students</span>
                      </div>
                      <Progress 
                        value={(count / analyticsData.enrollment.totalStudents) * 100} 
                        className="w-full h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {analyticsData.attendance.studentAttendance}%
                      </div>
                      <div className="text-xs text-muted-foreground">Student Attendance</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {analyticsData.attendance.staffAttendance}%
                      </div>
                      <div className="text-xs text-muted-foreground">Staff Attendance</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Class-wise Attendance</h4>
                    {Object.entries(analyticsData.attendance.classWiseAttendance).slice(0, 5).map(([className, rate]) => (
                      <div key={className} className="flex justify-between items-center">
                        <span className="text-sm">Class {className}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={rate} className="w-16 h-2" />
                          <span className="text-sm font-medium">{rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Revenue</span>
                    <span className="font-bold text-green-600">
                      ₹{analyticsData.financial.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Expenses</span>
                    <span className="font-bold text-red-600">
                      ₹{analyticsData.financial.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Net Profit</span>
                    <span className={`font-bold ${analyticsData.financial.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{analyticsData.financial.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span>Budget Utilization</span>
                      <span className="font-bold">{analyticsData.financial.budgetUtilization}%</span>
                    </div>
                    <Progress value={analyticsData.financial.budgetUtilization} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analyticsData.performance.overallGrade}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Grade</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-sm font-bold text-green-600">
                        {analyticsData.academic.examResults.passed}
                      </div>
                      <div className="text-xs text-muted-foreground">Passed</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="text-sm font-bold text-yellow-600">
                        {analyticsData.academic.examResults.distinction}
                      </div>
                      <div className="text-xs text-muted-foreground">Distinction</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-sm font-bold text-red-600">
                        {analyticsData.academic.examResults.failed}
                      </div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Subject Performance</h4>
                    {analyticsData.performance.subjectWisePerformance.slice(0, 4).map((subject) => (
                      <div key={subject.subject} className="flex justify-between items-center">
                        <span className="text-sm">{subject.subject}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={subject.average} className="w-16 h-2" />
                          <span className="text-sm font-medium">{subject.average}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="enrollment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Students</span>
                    <span className="font-bold">{analyticsData.enrollment.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New Admissions</span>
                    <span className="font-bold text-green-600">+{analyticsData.enrollment.newAdmissions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dropouts</span>
                    <span className="font-bold text-red-600">-{analyticsData.enrollment.dropouts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retention Rate</span>
                    <span className="font-bold">{analyticsData.enrollment.retentionRate}%</span>
                  </div>
                  <Progress value={analyticsData.enrollment.retentionRate} className="w-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Male Students</span>
                      <span className="font-bold">{analyticsData.enrollment.genderDistribution.male}</span>
                    </div>
                    <Progress 
                      value={(analyticsData.enrollment.genderDistribution.male / analyticsData.enrollment.totalStudents) * 100} 
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Female Students</span>
                      <span className="font-bold">{analyticsData.enrollment.genderDistribution.female}</span>
                    </div>
                    <Progress 
                      value={(analyticsData.enrollment.genderDistribution.female / analyticsData.enrollment.totalStudents) * 100} 
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round((analyticsData.enrollment.genderDistribution.male / analyticsData.enrollment.totalStudents) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Male</div>
                    </div>
                    <div className="text-center p-3 bg-pink-50 rounded">
                      <div className="text-lg font-bold text-pink-600">
                        {Math.round((analyticsData.enrollment.genderDistribution.female / analyticsData.enrollment.totalStudents) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Female</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analyticsData.enrollment.ageDistribution).map(([ageGroup, count]) => (
                    <div key={ageGroup} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{ageGroup} years</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress 
                        value={(count / analyticsData.enrollment.totalStudents) * 100} 
                        className="w-full h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="academic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Classes</span>
                    <span className="font-bold">{analyticsData.academic.totalClasses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Class Size</span>
                    <span className="font-bold">{analyticsData.academic.averageClassSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Teacher-Student Ratio</span>
                    <span className="font-bold">1:{analyticsData.academic.teacherStudentRatio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Attendance Rate</span>
                    <span className="font-bold">{analyticsData.academic.attendanceRate}%</span>
                  </div>
                  <Progress value={analyticsData.academic.attendanceRate} className="w-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Exam Results Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {analyticsData.academic.examResults.passed}
                      </div>
                      <div className="text-xs text-muted-foreground">Passed</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">
                        {analyticsData.academic.examResults.distinction}
                      </div>
                      <div className="text-xs text-muted-foreground">Distinction</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">
                        {analyticsData.academic.examResults.failed}
                      </div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Pass Rate</h4>
                    <Progress 
                      value={(analyticsData.academic.examResults.passed / (analyticsData.academic.examResults.passed + analyticsData.academic.examResults.failed)) * 100} 
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {Math.round((analyticsData.academic.examResults.passed / (analyticsData.academic.examResults.passed + analyticsData.academic.examResults.failed)) * 100)}% Pass Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analyticsData.academic.subjectPerformance).map(([subject, score]) => (
                  <div key={subject} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{subject}</span>
                      <span className="font-medium">{score}%</span>
                    </div>
                    <Progress value={score} className="w-full h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Revenue</span>
                    <span className="font-bold text-green-600">
                      ₹{analyticsData.financial.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Expenses</span>
                    <span className="font-bold text-red-600">
                      ₹{analyticsData.financial.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Net Profit</span>
                    <span className={`font-bold ${analyticsData.financial.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{analyticsData.financial.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((analyticsData.financial.netProfit / analyticsData.financial.totalRevenue) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Profit Margin</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fee Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Fees Collected</span>
                    <span className="font-bold text-green-600">
                      ₹{analyticsData.financial.feeCollection.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Outstanding Fees</span>
                    <span className="font-bold text-red-600">
                      ₹{analyticsData.financial.outstandingFees.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scholarships</span>
                    <span className="font-bold text-blue-600">
                      ₹{analyticsData.financial.scholarships.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Collection Rate</h4>
                    <Progress 
                      value={(analyticsData.financial.feeCollection / (analyticsData.financial.feeCollection + analyticsData.financial.outstandingFees)) * 100} 
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {Math.round((analyticsData.financial.feeCollection / (analyticsData.financial.feeCollection + analyticsData.financial.outstandingFees)) * 100)}% Collected
                    </div>
                  </div>
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
                    <div className="text-3xl font-bold text-purple-600">
                      {analyticsData.financial.budgetUtilization}%
                    </div>
                    <div className="text-sm text-muted-foreground">Budget Utilized</div>
                  </div>
                  
                  <Progress value={analyticsData.financial.budgetUtilization} className="w-full" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Infrastructure</span>
                      <span>35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salaries</span>
                      <span>45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operations</span>
                      <span>20%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.trends.map((trend, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold">{trend.period}</div>
                      <div className="text-xs text-muted-foreground">Period</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{trend.students}</div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">₹{trend.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{trend.attendance}%</div>
                      <div className="text-xs text-muted-foreground">Attendance</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleGenerateReport('enrollment')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Enrollment Report
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleGenerateReport('academic')}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Academic Report
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleGenerateReport('financial')}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Financial Report
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleGenerateReport('attendance')}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Attendance Report
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleGenerateReport('comprehensive')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Comprehensive Report
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{report.name}</h4>
                          <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                          <Badge className={report.access === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {report.access}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>Generated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                          <span>Size: {report.size}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}