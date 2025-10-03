import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';
import {
  ChevronLeft, TrendingUp, TrendingDown, Award, FileText,
  Download, Filter, BarChart3, PieChart, Target, BookOpen
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SubjectGrade {
  subject: string;
  code: string;
  teacher: string;
  credits: number;
  midterm: number;
  final: number;
  assignments: number;
  practical: number;
  total: number;
  grade: string;
  gradePoint: number;
  status: 'pass' | 'fail' | 'pending';
}

export function MyGrades() {
  const { navigate } = useNavigation();
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data
  const grades: SubjectGrade[] = [
    {
      subject: 'Mathematics',
      code: 'MATH301',
      teacher: 'Dr. Sarah Johnson',
      credits: 4,
      midterm: 38,
      final: 42,
      assignments: 8,
      practical: 0,
      total: 88,
      grade: 'A',
      gradePoint: 4.0,
      status: 'pass'
    },
    {
      subject: 'Physics',
      code: 'PHY201',
      teacher: 'Prof. Michael Brown',
      credits: 3,
      midterm: 35,
      final: 40,
      assignments: 7,
      practical: 10,
      total: 92,
      grade: 'A+',
      gradePoint: 4.0,
      status: 'pass'
    },
    {
      subject: 'English',
      code: 'ENG202',
      teacher: 'Ms. Emily Davis',
      credits: 3,
      midterm: 32,
      final: 38,
      assignments: 9,
      practical: 0,
      total: 79,
      grade: 'B+',
      gradePoint: 3.5,
      status: 'pass'
    },
    {
      subject: 'Chemistry',
      code: 'CHEM201',
      teacher: 'Dr. Lisa Anderson',
      credits: 3,
      midterm: 34,
      final: 41,
      assignments: 8,
      practical: 9,
      total: 92,
      grade: 'A+',
      gradePoint: 4.0,
      status: 'pass'
    },
    {
      subject: 'Computer Science',
      code: 'CS301',
      teacher: 'Dr. James Wilson',
      credits: 4,
      midterm: 40,
      final: 45,
      assignments: 10,
      practical: 0,
      total: 95,
      grade: 'A+',
      gradePoint: 4.0,
      status: 'pass'
    },
    {
      subject: 'History',
      code: 'HIST101',
      teacher: 'Prof. Robert Taylor',
      credits: 2,
      midterm: 30,
      final: 35,
      assignments: 6,
      practical: 0,
      total: 71,
      grade: 'B',
      gradePoint: 3.0,
      status: 'pass'
    }
  ];

  // Calculate statistics
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
  const weightedGradePoints = grades.reduce((sum, g) => sum + (g.gradePoint * g.credits), 0);
  const cgpa = (weightedGradePoints / totalCredits).toFixed(2);
  const averageScore = Math.round(grades.reduce((sum, g) => sum + g.total, 0) / grades.length);
  const passedSubjects = grades.filter(g => g.status === 'pass').length;

  // Grade distribution data for pie chart
  const gradeDistribution = [
    { name: 'A+', value: grades.filter(g => g.grade === 'A+').length, color: '#10B981' },
    { name: 'A', value: grades.filter(g => g.grade === 'A').length, color: '#3B82F6' },
    { name: 'B+', value: grades.filter(g => g.grade === 'B+').length, color: '#6366F1' },
    { name: 'B', value: grades.filter(g => g.grade === 'B').length, color: '#F59E0B' },
    { name: 'C', value: grades.filter(g => g.grade === 'C').length, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Subject performance data for bar chart
  const performanceData = grades.map(g => ({
    subject: g.code,
    score: g.total,
    grade: g.grade
  }));

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B+': return 'bg-indigo-100 text-indigo-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
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
            <h1 className="text-2xl font-bold">My Grades</h1>
            <p className="text-muted-foreground">Track your academic performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Semester</SelectItem>
              <SelectItem value="previous">Previous Semester</SelectItem>
              <SelectItem value="all">All Semesters</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Report Card
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cgpa}</div>
            <p className="text-xs text-muted-foreground">Out of 4.0</p>
            <Progress value={parseFloat(cgpa) * 25} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <Progress value={averageScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subjects Passed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {passedSubjects}/{grades.length}
            </div>
            <p className="text-xs text-muted-foreground">100% pass rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Grades Overview */}
      <Tabs defaultValue="detailed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detailed">Detailed Grades</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Grade History</TabsTrigger>
        </TabsList>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grades.map((grade, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{grade.subject}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{grade.code}</span>
                          <span>•</span>
                          <span>{grade.teacher}</span>
                          <span>•</span>
                          <span>{grade.credits} Credits</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getGradeColor(grade.grade)}>
                          Grade: {grade.grade}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(grade.status)}>
                          {grade.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Midterm</p>
                        <p className="font-semibold">{grade.midterm}/40</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Final</p>
                        <p className="font-semibold">{grade.final}/50</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Assignments</p>
                        <p className="font-semibold">{grade.assignments}/10</p>
                      </div>
                      {grade.practical > 0 && (
                        <div>
                          <p className="text-muted-foreground">Practical</p>
                          <p className="font-semibold">{grade.practical}/10</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Total Score</p>
                        <p className="font-semibold text-lg">{grade.total}%</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Progress value={grade.total} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">A+</p>
                  <p className="text-sm text-muted-foreground">Most Common Grade</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.max(...grades.map(g => g.total))}%</p>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.min(...grades.map(g => g.total))}%</p>
                  <p className="text-sm text-muted-foreground">Lowest Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">Top 10%</p>
                  <p className="text-sm text-muted-foreground">Class Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previous Semesters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Semester 1 - 2023</h4>
                      <p className="text-sm text-muted-foreground">6 subjects • 18 credits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">3.8</p>
                      <p className="text-sm text-muted-foreground">SGPA</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Semester 2 - 2023</h4>
                      <p className="text-sm text-muted-foreground">6 subjects • 19 credits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">3.9</p>
                      <p className="text-sm text-muted-foreground">SGPA</p>
                    </div>
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


