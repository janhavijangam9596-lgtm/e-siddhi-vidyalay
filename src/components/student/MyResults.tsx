import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';
import {
  ChevronLeft, Trophy, TrendingUp, Award, FileText,
  Download, CheckCircle, AlertCircle, Medal, Target
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SubjectResult {
  subject: string;
  code: string;
  examType: string;
  marks: number;
  totalMarks: number;
  grade: string;
  status: 'pass' | 'fail';
  credits: number;
  gradePoints: number;
}

interface SemesterResult {
  semester: number;
  year: string;
  sgpa: number;
  totalCredits: number;
  rank: number;
  totalStudents: number;
  status: 'completed' | 'ongoing';
  results: SubjectResult[];
}

export function MyResults() {
  const { navigate } = useNavigation();
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedExam, setSelectedExam] = useState('all');

  // Mock data
  const currentResults: SubjectResult[] = [
    {
      subject: 'Mathematics',
      code: 'MATH301',
      examType: 'Final',
      marks: 88,
      totalMarks: 100,
      grade: 'A',
      status: 'pass',
      credits: 4,
      gradePoints: 4.0
    },
    {
      subject: 'Physics',
      code: 'PHY201',
      examType: 'Final',
      marks: 92,
      totalMarks: 100,
      grade: 'A+',
      status: 'pass',
      credits: 3,
      gradePoints: 4.0
    },
    {
      subject: 'English',
      code: 'ENG202',
      examType: 'Final',
      marks: 79,
      totalMarks: 100,
      grade: 'B+',
      status: 'pass',
      credits: 3,
      gradePoints: 3.5
    },
    {
      subject: 'Chemistry',
      code: 'CHEM201',
      examType: 'Final',
      marks: 85,
      totalMarks: 100,
      grade: 'A',
      status: 'pass',
      credits: 3,
      gradePoints: 4.0
    },
    {
      subject: 'Computer Science',
      code: 'CS301',
      examType: 'Final',
      marks: 95,
      totalMarks: 100,
      grade: 'A+',
      status: 'pass',
      credits: 4,
      gradePoints: 4.0
    },
    {
      subject: 'History',
      code: 'HIST101',
      examType: 'Final',
      marks: 71,
      totalMarks: 100,
      grade: 'B',
      status: 'pass',
      credits: 2,
      gradePoints: 3.0
    }
  ];

  const semesterHistory: SemesterResult[] = [
    {
      semester: 1,
      year: '2021',
      sgpa: 3.75,
      totalCredits: 20,
      rank: 15,
      totalStudents: 120,
      status: 'completed',
      results: []
    },
    {
      semester: 2,
      year: '2022',
      sgpa: 3.82,
      totalCredits: 22,
      rank: 12,
      totalStudents: 120,
      status: 'completed',
      results: []
    },
    {
      semester: 3,
      year: '2022',
      sgpa: 3.90,
      totalCredits: 21,
      rank: 8,
      totalStudents: 118,
      status: 'completed',
      results: []
    },
    {
      semester: 4,
      year: '2023',
      sgpa: 3.88,
      totalCredits: 20,
      rank: 10,
      totalStudents: 118,
      status: 'completed',
      results: []
    },
    {
      semester: 5,
      year: '2023',
      sgpa: 3.92,
      totalCredits: 19,
      rank: 7,
      totalStudents: 115,
      status: 'completed',
      results: []
    }
  ];

  // Calculate statistics
  const totalCredits = currentResults.reduce((sum, r) => sum + r.credits, 0);
  const weightedGradePoints = currentResults.reduce((sum, r) => sum + (r.gradePoints * r.credits), 0);
  const currentSGPA = (weightedGradePoints / totalCredits).toFixed(2);
  const averageMarks = Math.round(currentResults.reduce((sum, r) => sum + r.marks, 0) / currentResults.length);
  const passedSubjects = currentResults.filter(r => r.status === 'pass').length;

  // Calculate CGPA
  const allSGPAs = [...semesterHistory.map(s => s.sgpa), parseFloat(currentSGPA)];
  const cgpa = (allSGPAs.reduce((sum, sgpa) => sum + sgpa, 0) / allSGPAs.length).toFixed(2);

  // Performance trend data
  const performanceTrend = semesterHistory.map(s => ({
    semester: `Sem ${s.semester}`,
    sgpa: s.sgpa,
    rank: s.rank
  }));

  performanceTrend.push({
    semester: 'Sem 6',
    sgpa: parseFloat(currentSGPA),
    rank: 5
  });

  // Subject performance for bar chart
  const subjectPerformance = currentResults.map(r => ({
    subject: r.code,
    marks: r.marks,
    grade: r.grade
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
    return status === 'pass' ? 'text-green-600' : 'text-red-600';
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
            <h1 className="text-2xl font-bold">My Results</h1>
            <p className="text-muted-foreground">View your exam results and academic performance</p>
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
            Transcript
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cgpa}</div>
            <p className="text-xs text-muted-foreground">Cumulative</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current SGPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSGPA}</div>
            <p className="text-xs text-muted-foreground">Semester 6</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Medal className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">#5</div>
            <p className="text-xs text-muted-foreground">Out of 115</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMarks}%</div>
            <Progress value={averageMarks} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">{passedSubjects}/{currentResults.length} passed</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Tabs */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Results</TabsTrigger>
          <TabsTrigger value="semester">Semester History</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="transcript">Academic Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semester 6 - Final Exam Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Subject</th>
                        <th className="text-left p-3">Code</th>
                        <th className="text-center p-3">Marks</th>
                        <th className="text-center p-3">Grade</th>
                        <th className="text-center p-3">Credits</th>
                        <th className="text-center p-3">Grade Points</th>
                        <th className="text-center p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResults.map((result, index) => (
                        <tr key={index} className="border-b hover:bg-accent/50">
                          <td className="p-3 font-medium">{result.subject}</td>
                          <td className="p-3 text-muted-foreground">{result.code}</td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold">{result.marks}</span>
                              <span className="text-xs text-muted-foreground">/{result.totalMarks}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">{result.credits}</td>
                          <td className="p-3 text-center">{result.gradePoints}</td>
                          <td className="p-3 text-center">
                            <span className={`font-medium ${getStatusColor(result.status)}`}>
                              {result.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted font-semibold">
                        <td colSpan={2} className="p-3">Total</td>
                        <td className="p-3 text-center">{currentResults.reduce((sum, r) => sum + r.marks, 0)}</td>
                        <td className="p-3 text-center">-</td>
                        <td className="p-3 text-center">{totalCredits}</td>
                        <td className="p-3 text-center">SGPA: {currentSGPA}</td>
                        <td className="p-3 text-center text-green-600">PASSED</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Marksheet
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semester" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semester-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {semesterHistory.map((sem) => (
                  <div key={sem.semester} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Semester {sem.semester} - {sem.year}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>Credits: {sem.totalCredits}</span>
                          <span>•</span>
                          <span>Rank: #{sem.rank}/{sem.totalStudents}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{sem.sgpa}</div>
                        <p className="text-xs text-muted-foreground">SGPA</p>
                      </div>
                    </div>
                    <Progress value={sem.sgpa * 25} className="mt-3 h-2" />
                  </div>
                ))}
                
                {/* Current Semester */}
                <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Semester 6 - 2024 (Current)</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Credits: {totalCredits}</span>
                        <span>•</span>
                        <span>Rank: #5/115</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{currentSGPA}</div>
                      <p className="text-xs text-muted-foreground">SGPA</p>
                    </div>
                  </div>
                  <Progress value={parseFloat(currentSGPA) * 25} className="mt-3 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>SGPA Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[3, 4]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="sgpa" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="marks" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Academic Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="font-semibold">Dean's List</p>
                  <p className="text-sm text-muted-foreground">3 times</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-semibold">Best Improvement</p>
                  <p className="text-sm text-muted-foreground">Semester 3</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Medal className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">Subject Topper</p>
                  <p className="text-sm text-muted-foreground">CS301 - Computer Science</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Official Academic Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">UNIVERSITY ACADEMIC TRANSCRIPT</h3>
                  <p className="text-muted-foreground">Bachelor of Technology - Computer Science</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-semibold">John Doe</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-semibold">2021CSE045</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">2021 - 2025</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold text-green-600">Ongoing</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Academic Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded">
                      <p className="text-2xl font-bold">{cgpa}</p>
                      <p className="text-xs text-muted-foreground">CGPA</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <p className="text-2xl font-bold">102</p>
                      <p className="text-xs text-muted-foreground">Credits Earned</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <p className="text-2xl font-bold">#5</p>
                      <p className="text-xs text-muted-foreground">Class Rank</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-8">
                  <div>
                    <p className="text-xs text-muted-foreground">Registrar</p>
                    <p className="font-semibold mt-4">_______________</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Issue</p>
                    <p className="font-semibold mt-4">Jan 15, 2024</p>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


