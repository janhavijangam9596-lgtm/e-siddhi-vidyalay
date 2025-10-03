import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../utils/auth';
import { useNavigation } from '../../hooks/useNavigation';
import {
  BookOpen, Calendar, Clock, Award, Target, TrendingUp,
  FileText, Bell, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  // Mock student data
  const studentData = {
    name: user?.name || 'Student',
    class: '10th A',
    rollNumber: '2024/101',
    attendance: 85,
    overallGrade: 'A',
    pendingAssignments: 3,
    upcomingExams: 2,
    recentScores: [
      { subject: 'Mathematics', score: 92, grade: 'A+' },
      { subject: 'Science', score: 88, grade: 'A' },
      { subject: 'English', score: 85, grade: 'A' }
    ],
    todaySchedule: [
      { time: '9:00 AM', subject: 'Mathematics', room: 'Room 101' },
      { time: '10:00 AM', subject: 'Physics', room: 'Lab 2' },
      { time: '11:00 AM', subject: 'English', room: 'Room 203' }
    ],
    announcements: [
      { title: 'Sports Day Registration', date: '2024-01-20', type: 'event' },
      { title: 'Mid-Term Exam Schedule', date: '2024-01-25', type: 'exam' }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Welcome back, {studentData.name}!</h1>
        <p className="mt-2 text-blue-100">
          Class: {studentData.class} | Roll Number: {studentData.rollNumber}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.attendance}%</div>
            <Progress value={studentData.attendance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.overallGrade}</div>
            <p className="text-xs text-muted-foreground">Excellent Performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">Assignments due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.upcomingExams}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Today's Schedule
              <Calendar className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentData.todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-accent rounded">
                  <div>
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">{item.room}</p>
                  </div>
                  <Badge variant="outline">{item.time}</Badge>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => navigate('my-schedule')}
            >
              View Full Schedule
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Scores */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Scores
              <TrendingUp className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentData.recentScores.map((score, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{score.subject}</p>
                    <p className="text-sm text-muted-foreground">Score: {score.score}%</p>
                  </div>
                  <Badge className={score.grade.startsWith('A') ? 'bg-green-100 text-green-800' : ''}>
                    {score.grade}
                  </Badge>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => navigate('my-grades')}
            >
              View All Grades
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Announcements
              <Bell className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentData.announcements.map((item, index) => (
                <div key={index} className="p-2 border-l-2 border-blue-500 pl-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => navigate('communication')}
            >
              View All Announcements
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('my-assignments')}
            >
              <FileText className="h-6 w-6 mb-2" />
              Assignments
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('my-library')}
            >
              <BookOpen className="h-6 w-6 mb-2" />
              Library
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('my-fees')}
            >
              <Target className="h-6 w-6 mb-2" />
              Fee Status
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('my-results')}
            >
              <Award className="h-6 w-6 mb-2" />
              Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


