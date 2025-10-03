import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';
import {
  ChevronLeft, Calendar, Clock, MapPin, FileText,
  Download, AlertCircle, CheckCircle, Info, User
} from 'lucide-react';

interface Exam {
  id: string;
  subject: string;
  code: string;
  type: 'midterm' | 'final' | 'practical' | 'quiz';
  date: string;
  time: string;
  duration: string;
  venue: string;
  seatNumber: string;
  status: 'upcoming' | 'completed' | 'ongoing';
  syllabus: string[];
  materials: string[];
  instructor: string;
}

interface HallTicket {
  examName: string;
  rollNumber: string;
  studentName: string;
  semester: string;
  exams: Exam[];
}

export function MyExams() {
  const { navigate } = useNavigation();
  const [selectedSemester, setSelectedSemester] = useState('current');

  // Mock data
  const upcomingExams: Exam[] = [
    {
      id: 'EX001',
      subject: 'Mathematics',
      code: 'MATH301',
      type: 'final',
      date: 'Feb 15, 2024',
      time: '09:00 AM - 12:00 PM',
      duration: '3 hours',
      venue: 'Hall A, Building 1',
      seatNumber: 'A-45',
      status: 'upcoming',
      syllabus: ['Calculus', 'Linear Algebra', 'Differential Equations'],
      materials: ['Calculator', 'Geometry Box'],
      instructor: 'Dr. Sarah Johnson'
    },
    {
      id: 'EX002',
      subject: 'Physics',
      code: 'PHY201',
      type: 'practical',
      date: 'Feb 18, 2024',
      time: '02:00 PM - 05:00 PM',
      duration: '3 hours',
      venue: 'Physics Lab 2',
      seatNumber: 'Lab-12',
      status: 'upcoming',
      syllabus: ['Mechanics', 'Thermodynamics'],
      materials: ['Lab Manual', 'Lab Coat'],
      instructor: 'Prof. Michael Brown'
    },
    {
      id: 'EX003',
      subject: 'Computer Science',
      code: 'CS301',
      type: 'midterm',
      date: 'Feb 20, 2024',
      time: '10:00 AM - 12:00 PM',
      duration: '2 hours',
      venue: 'Computer Lab 5',
      seatNumber: 'CL-23',
      status: 'upcoming',
      syllabus: ['Data Structures', 'Algorithms', 'Complexity Analysis'],
      materials: ['Laptop', 'Rough Sheets'],
      instructor: 'Dr. James Wilson'
    }
  ];

  const completedExams: Exam[] = [
    {
      id: 'EX004',
      subject: 'English',
      code: 'ENG202',
      type: 'midterm',
      date: 'Jan 10, 2024',
      time: '09:00 AM - 11:00 AM',
      duration: '2 hours',
      venue: 'Room 105',
      seatNumber: 'R-15',
      status: 'completed',
      syllabus: ['Literature', 'Grammar', 'Essay Writing'],
      materials: ['Pen', 'Paper'],
      instructor: 'Ms. Emily Davis'
    },
    {
      id: 'EX005',
      subject: 'Chemistry',
      code: 'CHEM201',
      type: 'quiz',
      date: 'Jan 5, 2024',
      time: '03:00 PM - 04:00 PM',
      duration: '1 hour',
      venue: 'Room 202',
      seatNumber: 'B-08',
      status: 'completed',
      syllabus: ['Organic Chemistry Basics'],
      materials: ['Pen'],
      instructor: 'Dr. Lisa Anderson'
    }
  ];

  const examInstructions = [
    'Arrive at the exam venue 15 minutes before the scheduled time',
    'Carry your student ID card and hall ticket',
    'Mobile phones and electronic devices are not allowed',
    'Use only blue or black pen for writing',
    'Rough work should be done on the sheets provided',
    'Do not leave the exam hall without permission',
    'Any form of malpractice will lead to disqualification'
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'bg-red-100 text-red-800';
      case 'midterm': return 'bg-yellow-100 text-yellow-800';
      case 'practical': return 'bg-green-100 text-green-800';
      case 'quiz': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExam = (date: string) => {
    const examDate = new Date(date);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            <h1 className="text-2xl font-bold">My Exams</h1>
            <p className="text-muted-foreground">View exam schedules and information</p>
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
            Hall Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Exam</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Mathematics</div>
            <p className="text-xs text-muted-foreground">In {getDaysUntilExam('Feb 15, 2024')} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedExams.length}</div>
            <p className="text-xs text-muted-foreground">Exams finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length + completedExams.length}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Exam Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="hallticket">Hall Ticket</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Examinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-lg">{exam.subject}</h4>
                          <Badge className={getTypeColor(exam.type)}>
                            {exam.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Code: {exam.code} • Instructor: {exam.instructor}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.venue}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Syllabus:</p>
                          <div className="flex flex-wrap gap-2">
                            {exam.syllabus.map((topic, index) => (
                              <Badge key={index} variant="secondary">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Required Materials:</p>
                          <p className="text-sm text-muted-foreground">{exam.materials.join(', ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">Seat: {exam.seatNumber}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {getDaysUntilExam(exam.date) > 0 ? (
                            <span className="text-blue-600">In {getDaysUntilExam(exam.date)} days</span>
                          ) : (
                            <span className="text-red-600">Today</span>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="mt-2">
                          <FileText className="h-4 w-4 mr-2" />
                          Syllabus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Examinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedExams.map((exam) => (
                  <div key={exam.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{exam.subject}</h4>
                          <Badge className={getTypeColor(exam.type)}>
                            {exam.type}
                          </Badge>
                          <Badge variant="outline" className="text-green-600">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {exam.code} • {exam.date} • {exam.time}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Result
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hallticket" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Examination Hall Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">UNIVERSITY EXAMINATION</h3>
                  <p className="text-muted-foreground">Semester 6 - Final Examinations</p>
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
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-semibold">B.Tech Computer Science</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <p className="font-semibold">6th Semester</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Exam Schedule</h4>
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left text-sm">Date</th>
                        <th className="border p-2 text-left text-sm">Subject</th>
                        <th className="border p-2 text-left text-sm">Time</th>
                        <th className="border p-2 text-left text-sm">Venue</th>
                        <th className="border p-2 text-left text-sm">Seat No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingExams.map((exam) => (
                        <tr key={exam.id}>
                          <td className="border p-2 text-sm">{exam.date}</td>
                          <td className="border p-2 text-sm">{exam.subject}</td>
                          <td className="border p-2 text-sm">{exam.time.split(' - ')[0]}</td>
                          <td className="border p-2 text-sm">{exam.venue}</td>
                          <td className="border p-2 text-sm">{exam.seatNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground">Controller of Examinations</p>
                    <p className="font-semibold mt-4">_______________</p>
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

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Examination Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900">Important Notice</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Students must strictly follow all examination rules. Any violation may lead to cancellation of the exam.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">General Instructions</h4>
                  <ul className="space-y-2">
                    {examInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Items Allowed</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Pen (Blue/Black)', 'Pencil', 'Eraser', 'Scale', 'Calculator (if permitted)', 'Hall Ticket'].map(item => (
                      <div key={item} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Items Not Allowed</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Mobile Phone', 'Smart Watch', 'Bluetooth Device', 'Books/Notes', 'Bags', 'Food Items'].map(item => (
                      <div key={item} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
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


