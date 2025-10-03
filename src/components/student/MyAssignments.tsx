import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useNavigation } from '../../hooks/useNavigation';
import {
  ChevronLeft, FileText, Clock, CheckCircle, AlertCircle,
  Calendar, Upload, Download, Eye, Search, Filter
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: string;
  maxMarks: number;
  obtainedMarks?: number;
  attachments?: string[];
  submittedOn?: string;
}

export function MyAssignments() {
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  // Mock data
  const assignments: Assignment[] = [
    {
      id: '1',
      title: 'Solve Quadratic Equations',
      subject: 'Mathematics',
      description: 'Complete exercises 5.1 to 5.5 from the textbook',
      dueDate: '2024-02-05',
      status: 'pending',
      maxMarks: 20
    },
    {
      id: '2',
      title: 'Essay on Climate Change',
      subject: 'English',
      description: 'Write a 500-word essay on the impact of climate change',
      dueDate: '2024-02-03',
      status: 'submitted',
      maxMarks: 25,
      submittedOn: '2024-02-02'
    },
    {
      id: '3',
      title: 'Physics Lab Report',
      subject: 'Physics',
      description: 'Submit lab report on electricity experiments',
      dueDate: '2024-01-28',
      status: 'graded',
      maxMarks: 30,
      obtainedMarks: 27,
      grade: 'A',
      submittedOn: '2024-01-27'
    },
    {
      id: '4',
      title: 'History Project',
      subject: 'History',
      description: 'Create a presentation on World War II',
      dueDate: '2024-01-20',
      status: 'overdue',
      maxMarks: 40
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'submitted': return CheckCircle;
      case 'graded': return CheckCircle;
      case 'overdue': return AlertCircle;
      default: return FileText;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterSubject === 'all' || assignment.subject === filterSubject;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const submittedCount = assignments.filter(a => a.status === 'submitted').length;
  const gradedCount = assignments.filter(a => a.status === 'graded').length;

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
            <h1 className="text-2xl font-bold">My Assignments</h1>
            <p className="text-muted-foreground">Track and submit your assignments</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{submittedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gradedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const StatusIcon = getStatusIcon(assignment.status);
            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{assignment.subject}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {assignment.dueDate}
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {assignment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {assignment.description}
                  </p>
                  
                  {assignment.status === 'graded' && (
                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg mb-4">
                      <div>
                        <p className="text-sm font-medium">Score</p>
                        <p className="text-lg font-bold">
                          {assignment.obtainedMarks}/{assignment.maxMarks}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Grade: {assignment.grade}
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {assignment.status === 'pending' && (
                      <>
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Resources
                        </Button>
                      </>
                    )}
                    
                    {(assignment.status === 'submitted' || assignment.status === 'graded') && (
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Submission
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredAssignments
            .filter(a => a.status === 'pending')
            .map(assignment => (
              <Card key={assignment.id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{assignment.description}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {filteredAssignments
            .filter(a => a.status === 'submitted')
            .map(assignment => (
              <Card key={assignment.id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{assignment.description}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {filteredAssignments
            .filter(a => a.status === 'graded')
            .map(assignment => (
              <Card key={assignment.id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{assignment.description}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}


