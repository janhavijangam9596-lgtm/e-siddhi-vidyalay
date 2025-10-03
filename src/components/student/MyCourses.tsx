import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useNavigation } from '../../hooks/useNavigation';
import { 
  ChevronLeft, BookOpen, Clock, Calendar, Users, Award, TrendingUp, 
  Video, FileText, Download, PlayCircle, CheckCircle, AlertCircle,
  FolderOpen, MessageSquare, Link2, ExternalLink, Upload, Star,
  ArrowRight, BarChart, PlusCircle, Eye, Edit, User, Bell,
  Activity, Target, Zap, BookMarked, GraduationCap, Send
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  status: 'active' | 'completed' | 'upcoming';
  nextClass?: string;
  credits: number;
  schedule: string;
  room: string;
  enrolled: number;
  maxEnrolled: number;
  materials: CourseMaterial[];
  assignments: Assignment[];
  announcements: Announcement[];
  upcomingClasses: UpcomingClass[];
  description: string;
  rating: number;
}

interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'ppt' | 'doc' | 'link';
  size?: string;
  uploadedDate: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  maxScore: number;
  score?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface UpcomingClass {
  id: string;
  topic: string;
  date: string;
  time: string;
  type: 'lecture' | 'lab' | 'tutorial';
  joinUrl?: string;
  isLive?: boolean;
}

export function MyCourses() {
  const { navigate } = useNavigation();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced mock data
  const courses: Course[] = [
    {
      id: '1',
      title: 'Advanced Mathematics',
      code: 'MATH301',
      instructor: 'Dr. Sarah Johnson',
      progress: 75,
      totalLessons: 40,
      completedLessons: 30,
      status: 'active',
      nextClass: 'Tomorrow, 9:00 AM',
      credits: 4,
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      room: 'Room 204, Science Building',
      enrolled: 28,
      maxEnrolled: 30,
      rating: 4.5,
      description: 'Advanced calculus, linear algebra, and differential equations',
      materials: [
        { id: 'm1', title: 'Chapter 5 - Calculus Notes', type: 'pdf', size: '2.3 MB', uploadedDate: '2024-01-20' },
        { id: 'm2', title: 'Lecture Recording - Week 10', type: 'video', size: '156 MB', uploadedDate: '2024-01-18' },
        { id: 'm3', title: 'Practice Problems Set', type: 'doc', size: '1.2 MB', uploadedDate: '2024-01-15' }
      ],
      assignments: [
        { id: 'a1', title: 'Problem Set 5', dueDate: '2024-01-25', status: 'pending', maxScore: 100 },
        { id: 'a2', title: 'Mid-term Project', dueDate: '2024-02-01', status: 'pending', maxScore: 200 },
        { id: 'a3', title: 'Problem Set 4', dueDate: '2024-01-18', status: 'graded', grade: 'A', maxScore: 100, score: 92 }
      ],
      announcements: [
        { id: 'ann1', title: 'Quiz Next Week', content: 'Chapter 5 quiz scheduled for next Monday', date: '2024-01-20', priority: 'high' },
        { id: 'ann2', title: 'Office Hours Changed', content: 'Office hours moved to 3-5 PM on Tuesdays', date: '2024-01-19', priority: 'medium' }
      ],
      upcomingClasses: [
        { id: 'c1', topic: 'Differential Equations', date: '2024-01-22', time: '9:00 AM', type: 'lecture', joinUrl: 'https://meet.google.com/xxx', isLive: false },
        { id: 'c2', topic: 'Problem Solving Session', date: '2024-01-23', time: '2:00 PM', type: 'tutorial', joinUrl: 'https://meet.google.com/yyy' }
      ]
    },
    {
      id: '2',
      title: 'Physics II',
      code: 'PHY201',
      instructor: 'Prof. Michael Brown',
      progress: 60,
      totalLessons: 35,
      completedLessons: 21,
      status: 'active',
      nextClass: 'Today, 2:00 PM',
      credits: 3,
      schedule: 'Tue, Thu - 2:00 PM',
      room: 'Lab 3, Physics Building',
      enrolled: 25,
      maxEnrolled: 30,
      rating: 4.7,
      description: 'Mechanics, thermodynamics, and wave physics with laboratory work',
      materials: [
        { id: 'm4', title: 'Lab Manual - Experiment 8', type: 'pdf', size: '3.1 MB', uploadedDate: '2024-01-19' }
      ],
      assignments: [
        { id: 'a4', title: 'Lab Report 7', dueDate: '2024-01-24', status: 'pending', maxScore: 50 }
      ],
      announcements: [],
      upcomingClasses: [
        { id: 'c3', topic: 'Thermodynamics Lab', date: '2024-01-21', time: '2:00 PM', type: 'lab', isLive: true }
      ]
    }
  ];

  const handleJoinClass = (classItem: UpcomingClass) => {
    if (classItem.joinUrl) {
      window.open(classItem.joinUrl, '_blank');
    } else {
      alert('Joining virtual class...');
    }
  };

  const handleDownloadMaterial = (material: CourseMaterial) => {
    alert(`Downloading ${material.title}...`);
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    alert(`Opening submission for ${assignment.title}...`);
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'ppt': return <FolderOpen className="h-4 w-4" />;
      case 'doc': return <FileText className="h-4 w-4" />;
      case 'link': return <Link2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedCourse) {
    return (
      <div className="p-6 space-y-6">
        {/* Course Detail Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedCourse(null)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedCourse.title}</h1>
              <p className="text-muted-foreground">{selectedCourse.code} • {selectedCourse.instructor}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussion
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Classmates
            </Button>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCourse.progress}%</div>
              <Progress value={selectedCourse.progress} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Next Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {selectedCourse.upcomingClasses[0]?.topic || 'No upcoming'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedCourse.assignments.filter(a => a.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                <div className="text-2xl font-bold">{selectedCourse.rating}</div>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium">{selectedCourse.schedule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedCourse.room}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="font-medium">{selectedCourse.credits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enrollment</p>
                    <p className="font-medium">{selectedCourse.enrolled}/{selectedCourse.maxEnrolled}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCourse.upcomingClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{cls.topic}</h4>
                        <p className="text-sm text-muted-foreground">
                          {cls.date} at {cls.time} • {cls.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {cls.isLive && (
                          <Badge className="bg-red-500 text-white">LIVE</Badge>
                        )}
                        <Button size="sm" onClick={() => handleJoinClass(cls)}>
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCourse.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getMaterialIcon(material.type)}
                        <div>
                          <h4 className="font-medium">{material.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {material.size} • {material.uploadedDate}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleDownloadMaterial(material)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCourse.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Due: {assignment.dueDate} • Max: {assignment.maxScore} pts
                        </p>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                          {assignment.score && ` - ${assignment.score}/${assignment.maxScore}`}
                        </Badge>
                      </div>
                      {assignment.status === 'pending' && (
                        <Button size="sm" onClick={() => handleSubmitAssignment(assignment)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCourse.announcements.map((ann) => (
                    <div key={ann.id} className={`p-4 border rounded-lg ${
                      ann.priority === 'high' ? 'border-red-200 bg-red-50' : ''
                    }`}>
                      <div className="flex items-start gap-2">
                        <Bell className="h-4 w-4 mt-1" />
                        <div>
                          <h4 className="font-semibold">{ann.title}</h4>
                          <p className="text-sm mt-1">{ann.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">{ann.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('dashboard')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">Manage your enrolled courses</p>
          </div>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Browse Courses
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter(c => c.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, c) => sum + c.credits, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Due Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {courses.reduce((sum, c) => sum + c.assignments.filter(a => a.status === 'pending').length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {course.code} • {course.instructor}
                  </p>
                </div>
                <Badge className={getStatusColor(course.status)}>
                  {course.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {course.completedLessons}/{course.totalLessons} lessons
                  </p>
                </div>

                {course.upcomingClasses[0]?.isLive && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-700">Live Class Now!</span>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleJoinClass(course.upcomingClasses[0])}>
                        Join
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm" onClick={() => setSelectedCourse(course)}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Course
                  </Button>
                  {course.upcomingClasses.length > 0 && !course.upcomingClasses[0].isLive && (
                    <Button size="sm" variant="outline"
                      onClick={() => handleJoinClass(course.upcomingClasses[0])}>
                      <Video className="h-4 w-4 mr-2" />
                      Next Class
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
