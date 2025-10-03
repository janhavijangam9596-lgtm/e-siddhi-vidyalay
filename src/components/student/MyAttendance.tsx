import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';
import {
  ChevronLeft, Calendar, TrendingUp, TrendingDown, AlertTriangle,
  Download, CheckCircle, XCircle, Clock, BarChart3
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SubjectAttendance {
  subject: string;
  code: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
  lastAbsent: string;
}

interface AttendanceDay {
  date: string;
  day: string;
  status: 'present' | 'absent' | 'holiday' | 'weekend';
  subjects?: string[];
}

export function MyAttendance() {
  const { navigate } = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data
  const overallAttendance = 85;
  const totalDays = 120;
  const presentDays = 102;
  const absentDays = 18;
  const requiredAttendance = 75;

  const subjectAttendance: SubjectAttendance[] = [
    {
      subject: 'Mathematics',
      code: 'MATH301',
      totalClasses: 45,
      attendedClasses: 42,
      percentage: 93,
      status: 'good',
      lastAbsent: '5 days ago'
    },
    {
      subject: 'Physics',
      code: 'PHY201',
      totalClasses: 40,
      attendedClasses: 35,
      percentage: 87.5,
      status: 'good',
      lastAbsent: '1 week ago'
    },
    {
      subject: 'English',
      code: 'ENG202',
      totalClasses: 30,
      attendedClasses: 22,
      percentage: 73,
      status: 'warning',
      lastAbsent: '2 days ago'
    },
    {
      subject: 'Chemistry',
      code: 'CHEM201',
      totalClasses: 38,
      attendedClasses: 34,
      percentage: 89,
      status: 'good',
      lastAbsent: '10 days ago'
    },
    {
      subject: 'Computer Science',
      code: 'CS301',
      totalClasses: 42,
      attendedClasses: 39,
      percentage: 93,
      status: 'good',
      lastAbsent: '1 week ago'
    },
    {
      subject: 'History',
      code: 'HIST101',
      totalClasses: 25,
      attendedClasses: 17,
      percentage: 68,
      status: 'critical',
      lastAbsent: 'Today'
    }
  ];

  // Monthly attendance trend data
  const monthlyTrend = [
    { month: 'Aug', attendance: 92 },
    { month: 'Sep', attendance: 88 },
    { month: 'Oct', attendance: 85 },
    { month: 'Nov', attendance: 87 },
    { month: 'Dec', attendance: 85 },
    { month: 'Jan', attendance: 83 }
  ];

  // Weekly attendance data
  const weeklyData = [
    { day: 'Mon', classes: 5, attended: 5 },
    { day: 'Tue', classes: 4, attended: 3 },
    { day: 'Wed', classes: 5, attended: 4 },
    { day: 'Thu', classes: 4, attended: 4 },
    { day: 'Fri', classes: 3, attended: 3 }
  ];

  // Calendar data for current month
  const generateCalendarDays = (): AttendanceDay[] => {
    const days: AttendanceDay[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dayOfWeek = date.getDay();
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });

      let status: AttendanceDay['status'] = 'present';
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
      } else if (Math.random() > 0.85) {
        status = 'absent';
      } else if (Math.random() > 0.95) {
        status = 'holiday';
      }

      days.push({
        date: dateStr,
        day: dayStr,
        status,
        subjects: status === 'absent' ? ['MATH301', 'PHY201', 'CS301'] : undefined
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDayStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-300';
      case 'absent': return 'bg-red-100 text-red-800 border-red-300';
      case 'holiday': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'weekend': return 'bg-gray-100 text-gray-500 border-gray-300';
      default: return 'bg-white';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">My Attendance</h1>
            <p className="text-muted-foreground">Track your attendance record</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="previous">Previous Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendance}%</div>
            <Progress value={overallAttendance} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {overallAttendance >= requiredAttendance ? 'Above minimum' : 'Below minimum'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentDays}</div>
            <p className="text-xs text-muted-foreground">Out of {totalDays} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentDays}</div>
            <p className="text-xs text-muted-foreground">Total absences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5/5</div>
            <p className="text-xs text-green-600">All attended</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Tabs */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Subject-wise</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectAttendance.map((subject, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{subject.subject}</h4>
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadgeColor(subject.status)}>
                          {subject.percentage}%
                        </Badge>
                        {subject.status === 'critical' && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={subject.percentage} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Attended: {subject.attendedClasses}/{subject.totalClasses} classes</span>
                        <span>Last absent: {subject.lastAbsent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
              <div className="flex gap-4 text-sm mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
                  <span>Weekend</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {/* Add empty cells for days before month starts */}
                {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg border text-center cursor-pointer hover:opacity-80 transition-opacity ${getDayStatusColor(day.status)}`}
                    title={day.status === 'absent' && day.subjects ? `Missed: ${day.subjects.join(', ')}` : ''}
                  >
                    <div className="text-sm font-medium">{parseInt(day.date.split(' ')[1])}</div>
                    {day.status === 'absent' && (
                      <div className="text-xs mt-1">
                        {day.subjects?.length} missed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="classes" fill="#E5E7EB" name="Total Classes" />
                    <Bar dataKey="attended" fill="#10B981" name="Attended" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">Mon</p>
                  <p className="text-sm text-muted-foreground">Best Day (95%)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">Tue</p>
                  <p className="text-sm text-muted-foreground">Worst Day (75%)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">Morning</p>
                  <p className="text-sm text-muted-foreground">Best Time (92%)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Consecutive Presents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg border-red-200 bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Critical Attendance - History</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Your attendance in History (HIST101) is 68%, below the minimum requirement of 75%. 
                      You need to attend the next 5 consecutive classes to reach the minimum.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Warning - English</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your attendance in English (ENG202) is 73%, close to the minimum requirement. 
                      Missing 2 more classes will put you below the threshold.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Upcoming Medical Certificate Deadline</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Submit your medical certificate for absence on Dec 15-17 by tomorrow to avoid penalty.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


