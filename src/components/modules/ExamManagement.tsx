import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { api } from '../../utils/api';
import { 
  Plus, Search, Eye, Edit, Trash2, FileText, Clock, 
  CheckCircle, XCircle, Calendar as CalendarIcon, Download,
  Upload, Users, GraduationCap, BookOpen, Award,
  TrendingUp, TrendingDown, BarChart3, PieChart,
  Filter, RefreshCw, AlertCircle, Star, Trophy,
  Calculator, Clipboard, FileSpreadsheet, PrinterIcon
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Exam {
  id: string;
  name: string;
  examType: 'unit_test' | 'mid_term' | 'final' | 'practical' | 'assignment' | 'project';
  class: string;
  subject: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  maxMarks: number;
  passingMarks: number;
  roomNumber?: string;
  invigilator?: string;
  instructions?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  academicYear: string;
  term: 'first' | 'second' | 'third';
  created_at: string;
  updated_at?: string;
}

interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail' | 'absent' | 'pending';
  remarks?: string;
  submitted_at?: string;
  created_at: string;
}

interface ExamSchedule {
  id: string;
  examId: string;
  examName: string;
  subject: string;
  class: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  invigilator: string;
}

interface ExamStats {
  totalExams: number;
  completedExams: number;
  upcomingExams: number;
  ongoingExams: number;
  averagePerformance: number;
  highestScore: number;
  lowestScore: number;
  passPercentage: number;
}

interface GradeDefinition {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  description: string;
  points: number;
}

export function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [stats, setStats] = useState<ExamStats>({
    totalExams: 0,
    completedExams: 0,
    upcomingExams: 0,
    ongoingExams: 0,
    averagePerformance: 0,
    highestScore: 0,
    lowestScore: 0,
    passPercentage: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddExamDialogOpen, setIsAddExamDialogOpen] = useState(false);
  const [isEditExamDialogOpen, setIsEditExamDialogOpen] = useState(false);
  const [isResultEntryDialogOpen, setIsResultEntryDialogOpen] = useState(false);
  const [isViewExamDialogOpen, setIsViewExamDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [newExam, setNewExam] = useState({
    name: '',
    examType: 'unit_test',
    class: '',
    subject: '',
    date: '',
    startTime: '',
    duration: '60',
    maxMarks: '100',
    passingMarks: '35',
    roomNumber: '',
    invigilator: '',
    instructions: '',
    academicYear: '2024-25',
    term: 'first'
  });
  
  const [resultEntry, setResultEntry] = useState({
    examId: '',
    results: [] as Array<{
      studentId: string;
      studentName: string;
      rollNumber: string;
      marksObtained: string;
      status: string;
      remarks: string;
    }>
  });

  const gradeDefinitions: GradeDefinition[] = [
    { grade: 'A+', minPercentage: 90, maxPercentage: 100, description: 'Outstanding', points: 10 },
    { grade: 'A', minPercentage: 80, maxPercentage: 89, description: 'Excellent', points: 9 },
    { grade: 'B+', minPercentage: 70, maxPercentage: 79, description: 'Very Good', points: 8 },
    { grade: 'B', minPercentage: 60, maxPercentage: 69, description: 'Good', points: 7 },
    { grade: 'C+', minPercentage: 50, maxPercentage: 59, description: 'Average', points: 6 },
    { grade: 'C', minPercentage: 40, maxPercentage: 49, description: 'Below Average', points: 5 },
    { grade: 'D', minPercentage: 35, maxPercentage: 39, description: 'Pass', points: 4 },
    { grade: 'F', minPercentage: 0, maxPercentage: 34, description: 'Fail', points: 0 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsData, resultsData, schedulesData, statsData] = await Promise.all([
        api.getExams().catch(() => []),
        api.getExamResults().catch(() => []),
        api.getExamSchedules().catch(() => []),
        api.getExamStats().catch(() => ({
          totalExams: 0,
          completedExams: 0,
          upcomingExams: 0,
          ongoingExams: 0,
          averagePerformance: 0,
          highestScore: 0,
          lowestScore: 0,
          passPercentage: 0
        }))
      ]);
      
      setExams(examsData || []);
      setResults(resultsData || []);
      setSchedules(schedulesData || []);
      setStats(statsData || {
        totalExams: 0,
        completedExams: 0,
        upcomingExams: 0,
        ongoingExams: 0,
        averagePerformance: 0,
        highestScore: 0,
        lowestScore: 0,
        passPercentage: 0
      });
    } catch (error) {
      toast.error('Failed to load exam data');
      console.error(error);
      // Set default values on error
      setExams([]);
      setResults([]);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async () => {
    try {
      const examData = {
        ...newExam,
        duration: parseInt(newExam.duration),
        maxMarks: parseInt(newExam.maxMarks),
        passingMarks: parseInt(newExam.passingMarks),
        status: 'scheduled'
      };
      
      await api.createExam(examData);
      toast.success('Exam created successfully');
      setIsAddExamDialogOpen(false);
      resetExamForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create exam');
      console.error(error);
    }
  };

  const handleEditExam = async () => {
    if (!selectedExam) return;
    try {
      const examData = {
        ...newExam,
        duration: parseInt(newExam.duration),
        maxMarks: parseInt(newExam.maxMarks),
        passingMarks: parseInt(newExam.passingMarks)
      };
      
      await api.updateExam(selectedExam.id, examData);
      toast.success('Exam updated successfully');
      setIsEditExamDialogOpen(false);
      resetExamForm();
      loadData();
    } catch (error) {
      toast.error('Failed to update exam');
      console.error(error);
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;
    try {
      await api.deleteExam(selectedExam.id);
      toast.success('Exam deleted successfully');
      setIsDeleteConfirmOpen(false);
      setSelectedExam(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete exam');
      console.error(error);
    }
  };

  const handleExportExam = (exam: Exam) => {
    const examData = JSON.stringify(exam, null, 2);
    const blob = new Blob([examData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-${exam.id}-${Date.now()}.json`;
    a.click();
    toast.success('Exam details exported successfully');
  };

  const handleExportResults = () => {
    const csvData = results.map(r => ({
      'Student Name': r.studentName,
      'Roll Number': r.rollNumber,
      'Exam': (exams || []).find(e => e.id === r.examId)?.name || '',
      'Subject': (exams || []).find(e => e.id === r.examId)?.subject || '',
      'Marks Obtained': r.marksObtained,
      'Max Marks': r.maxMarks,
      'Percentage': r.percentage,
      'Grade': r.grade,
      'Status': r.status,
      'Remarks': r.remarks || ''
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${Date.now()}.csv`;
    a.click();
    toast.success('Results exported successfully');
  };

  const handlePrintSchedule = () => {
    window.print();
    toast.success('Schedule sent to printer');
  };

  const handleSubmitResults = async () => {
    try {
      const resultsData = (resultEntry.results || []).map(result => ({
        examId: resultEntry.examId,
        studentId: result.studentId,
        marksObtained: parseInt(result.marksObtained || '0'),
        status: result.status,
        remarks: result.remarks,
        percentage: (parseInt(result.marksObtained || '0') / (selectedExam?.maxMarks || 1)) * 100,
        grade: calculateGrade((parseInt(result.marksObtained || '0') / (selectedExam?.maxMarks || 1)) * 100)
      }));
      
      await api.submitExamResults(resultsData);
      toast.success('Results submitted successfully');
      setIsResultEntryDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to submit results');
      console.error(error);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      if (selectedExamIds.length === 0) {
        toast.warning('Please select exams to schedule');
        return;
      }
      await api.generateExamSchedule(selectedExamIds);
      toast.success('Exam schedule generated successfully');
      setIsScheduleDialogOpen(false);
      setSelectedExamIds([]);
      loadData();
    } catch (error) {
      toast.error('Failed to generate schedule');
      console.error(error);
    }
  };

  const handlePublishResults = async (examId: string) => {
    try {
      await api.publishExamResults(examId);
      toast.success('Results published successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to publish results');
      console.error(error);
    }
  };

  const calculateGrade = (percentage: number): string => {
    for (const grade of gradeDefinitions) {
      if (percentage >= grade.minPercentage && percentage <= grade.maxPercentage) {
        return grade.grade;
      }
    }
    return 'F';
  };

  const resetExamForm = () => {
    setNewExam({
      name: '',
      examType: 'unit_test',
      class: '',
      subject: '',
      date: '',
      startTime: '',
      duration: '60',
      maxMarks: '100',
      passingMarks: '35',
      roomNumber: '',
      invigilator: '',
      instructions: '',
      academicYear: '2024-25',
      term: 'first'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'bg-red-100 text-red-800';
      case 'mid_term': return 'bg-orange-100 text-orange-800';
      case 'unit_test': return 'bg-blue-100 text-blue-800';
      case 'practical': return 'bg-purple-100 text-purple-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExams = (exams || []).filter(exam => {
    if (!exam) return false;
    return (
      ((exam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (exam.subject || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || statusFilter === 'all' || exam.status === statusFilter) &&
      (classFilter === '' || classFilter === 'all' || exam.class === classFilter) &&
      (examTypeFilter === '' || examTypeFilter === 'all' || exam.examType === examTypeFilter)
    );
  });

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Exam Management</h1>
          <p className="text-muted-foreground">
            Manage exams, schedules, and results
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsScheduleDialogOpen(true)}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Dialog open={isAddExamDialogOpen} onOpenChange={setIsAddExamDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>
                  Set up a new exam for students
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="examName">Exam Name</Label>
                    <Input
                      id="examName"
                      value={newExam.name}
                      onChange={(e) => setNewExam({...newExam, name: e.target.value})}
                      placeholder="Enter exam name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="examType">Exam Type</Label>
                    <Select value={newExam.examType} onValueChange={(value) => setNewExam({...newExam, examType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit_test">Unit Test</SelectItem>
                        <SelectItem value="mid_term">Mid Term</SelectItem>
                        <SelectItem value="final">Final Exam</SelectItem>
                        <SelectItem value="practical">Practical</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="examClass">Class</Label>
                    <Select value={newExam.class} onValueChange={(value) => setNewExam({...newExam, class: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nursery">Nursery</SelectItem>
                        <SelectItem value="kindergarten">Kindergarten</SelectItem>
                        <SelectItem value="1">Class 1</SelectItem>
                        <SelectItem value="2">Class 2</SelectItem>
                        <SelectItem value="3">Class 3</SelectItem>
                        <SelectItem value="4">Class 4</SelectItem>
                        <SelectItem value="5">Class 5</SelectItem>
                        <SelectItem value="6">Class 6</SelectItem>
                        <SelectItem value="7">Class 7</SelectItem>
                        <SelectItem value="8">Class 8</SelectItem>
                        <SelectItem value="9">Class 9</SelectItem>
                        <SelectItem value="10">Class 10</SelectItem>
                        <SelectItem value="11">Class 11</SelectItem>
                        <SelectItem value="12">Class 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="examSubject">Subject</Label>
                    <Select value={newExam.subject} onValueChange={(value) => setNewExam({...newExam, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="social_studies">Social Studies</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="computer_science">Computer Science</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="examDate">Exam Date</Label>
                    <Input
                      id="examDate"
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newExam.startTime}
                      onChange={(e) => setNewExam({...newExam, startTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newExam.duration}
                      onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxMarks">Maximum Marks</Label>
                    <Input
                      id="maxMarks"
                      type="number"
                      value={newExam.maxMarks}
                      onChange={(e) => setNewExam({...newExam, maxMarks: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passingMarks">Passing Marks</Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      value={newExam.passingMarks}
                      onChange={(e) => setNewExam({...newExam, passingMarks: e.target.value})}
                      placeholder="35"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={newExam.roomNumber}
                      onChange={(e) => setNewExam({...newExam, roomNumber: e.target.value})}
                      placeholder="Enter room number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invigilator">Invigilator</Label>
                    <Input
                      id="invigilator"
                      value={newExam.invigilator}
                      onChange={(e) => setNewExam({...newExam, invigilator: e.target.value})}
                      placeholder="Enter invigilator name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Select value={newExam.academicYear} onValueChange={(value) => setNewExam({...newExam, academicYear: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2025-26">2025-26</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="term">Term</Label>
                    <Select value={newExam.term} onValueChange={(value) => setNewExam({...newExam, term: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">First Term</SelectItem>
                        <SelectItem value="second">Second Term</SelectItem>
                        <SelectItem value="third">Third Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newExam.instructions}
                    onChange={(e) => setNewExam({...newExam, instructions: e.target.value})}
                    placeholder="Enter exam instructions"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddExamDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExam}>
                  Create Exam
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-2xl font-bold">{stats.totalExams}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Upcoming Exams</p>
                <p className="text-2xl font-bold">{stats.upcomingExams}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Average Performance</p>
                <p className="text-2xl font-bold">{stats.averagePerformance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pass Percentage</p>
                <p className="text-2xl font-bold">{stats.passPercentage}%</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exams" className="w-full">
        <TabsList>
          <TabsTrigger value="exams">Exam Management</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exams" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="mid_term">Mid Term</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="5">Class 5</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Exams Table */}
          <Card>
            <CardHeader>
              <CardTitle>Exams</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Max Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(paginatedExams || []).map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.name}</TableCell>
                          <TableCell>
                            <Badge className={getExamTypeColor(exam.examType)}>
                              {exam.examType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{exam.class}</TableCell>
                          <TableCell>{exam.subject}</TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date(exam.date).toLocaleDateString()}</div>
                              <div className="text-sm text-muted-foreground">{exam.startTime}</div>
                            </div>
                          </TableCell>
                          <TableCell>{exam.duration} min</TableCell>
                          <TableCell>{exam.maxMarks}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(exam.status)}>
                              {exam.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setIsViewExamDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {exam.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedExam(exam);
                                    setIsResultEntryDialogOpen(true);
                                  }}
                                >
                                  <Calculator className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setNewExam({
                                    name: exam.name,
                                    examType: exam.examType,
                                    class: exam.class,
                                    subject: exam.subject,
                                    date: exam.date,
                                    startTime: exam.startTime,
                                    duration: String(exam.duration),
                                    maxMarks: String(exam.maxMarks),
                                    passingMarks: String(exam.passingMarks),
                                    roomNumber: exam.roomNumber || '',
                                    invigilator: exam.invigilator || '',
                                    instructions: exam.instructions || '',
                                    academicYear: exam.academicYear,
                                    term: exam.term
                                  });
                                  setIsEditExamDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedExam(exam);
                                  setIsDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredExams.length)} of{' '}
                  {filteredExams.length} exams
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Exam Results</CardTitle>
              <Button variant="outline" onClick={handleExportResults}>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(results || []).slice(0, 10).map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.studentName}</div>
                            <div className="text-sm text-muted-foreground">{result.rollNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{(exams || []).find(e => e.id === result.examId)?.name || '-'}</TableCell>
                        <TableCell>{(exams || []).find(e => e.id === result.examId)?.subject || '-'}</TableCell>
                        <TableCell>{result.marksObtained}/{result.maxMarks}</TableCell>
                        <TableCell>{result.percentage.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant={result.grade === 'F' ? 'destructive' : 'default'}>
                            {result.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Exam Schedule</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrintSchedule}>
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print Schedule
                </Button>
                <Button variant="outline" onClick={() => {
                  const scheduleData = JSON.stringify(schedules, null, 2);
                  const blob = new Blob([scheduleData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `exam-schedule-${Date.now()}.json`;
                  a.click();
                  toast.success('Schedule exported successfully');
                }}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Invigilator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(schedules || []).map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{new Date(schedule.date).toLocaleDateString()}</TableCell>
                        <TableCell>{schedule.startTime} - {schedule.endTime}</TableCell>
                        <TableCell>{schedule.examName}</TableCell>
                        <TableCell>{schedule.class}</TableCell>
                        <TableCell>{schedule.subject}</TableCell>
                        <TableCell>{schedule.roomNumber}</TableCell>
                        <TableCell>{schedule.invigilator}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Score</span>
                    <span className="font-bold">{stats.averagePerformance}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Highest Score</span>
                    <span className="font-bold text-green-600">{stats.highestScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lowest Score</span>
                    <span className="font-bold text-red-600">{stats.lowestScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pass Rate</span>
                    <span className="font-bold">{stats.passPercentage}%</span>
                  </div>
                  <Progress value={stats.passPercentage} className="w-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(gradeDefinitions || []).slice(0, 6).map((grade) => (
                    <div key={grade.grade} className="flex justify-between items-center">
                      <span>{grade.grade} ({grade.description})</span>
                      <span className="font-medium">{grade.minPercentage}-{grade.maxPercentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Exam Dialog */}
      <Dialog open={isViewExamDialogOpen} onOpenChange={setIsViewExamDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exam Details</DialogTitle>
          </DialogHeader>
          
          {selectedExam && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Basic Information</h3>
                  <div className="space-y-1 text-sm">
                    <div>Name: {selectedExam.name}</div>
                    <div>Type: {selectedExam.examType.replace('_', ' ')}</div>
                    <div>Class: {selectedExam.class}</div>
                    <div>Subject: {selectedExam.subject}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Schedule</h3>
                  <div className="space-y-1 text-sm">
                    <div>Date: {new Date(selectedExam.date).toLocaleDateString()}</div>
                    <div>Start Time: {selectedExam.startTime}</div>
                    <div>Duration: {selectedExam.duration} minutes</div>
                    <div>Room: {selectedExam.roomNumber}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Marks</h3>
                  <div className="space-y-1 text-sm">
                    <div>Maximum Marks: {selectedExam.maxMarks}</div>
                    <div>Passing Marks: {selectedExam.passingMarks}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Other Details</h3>
                  <div className="space-y-1 text-sm">
                    <div>Invigilator: {selectedExam.invigilator}</div>
                    <div>Academic Year: {selectedExam.academicYear}</div>
                    <div>Term: {selectedExam.term}</div>
                  </div>
                </div>
              </div>
              
              {selectedExam.instructions && (
                <div>
                  <h3 className="font-medium mb-2">Instructions</h3>
                  <p className="text-sm">{selectedExam.instructions}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setNewExam({
                      name: selectedExam.name,
                      examType: selectedExam.examType,
                      class: selectedExam.class,
                      subject: selectedExam.subject,
                      date: selectedExam.date,
                      startTime: selectedExam.startTime,
                      duration: String(selectedExam.duration),
                      maxMarks: String(selectedExam.maxMarks),
                      passingMarks: String(selectedExam.passingMarks),
                      roomNumber: selectedExam.roomNumber || '',
                      invigilator: selectedExam.invigilator || '',
                      instructions: selectedExam.instructions || '',
                      academicYear: selectedExam.academicYear,
                      term: selectedExam.term
                    });
                    setIsViewExamDialogOpen(false);
                    setIsEditExamDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Exam
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleExportExam(selectedExam)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Details
                </Button>
                {selectedExam.status === 'completed' && (
                  <Button onClick={() => handlePublishResults(selectedExam.id)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Publish Results
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsViewExamDialogOpen(false);
                    setIsDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Result Entry Dialog */}
      <Dialog open={isResultEntryDialogOpen} onOpenChange={setIsResultEntryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enter Exam Results</DialogTitle>
            <DialogDescription>
              Enter marks for all students who appeared for the exam
            </DialogDescription>
          </DialogHeader>
          
          {selectedExam && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">{selectedExam.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedExam.class} - {selectedExam.subject} | Max Marks: {selectedExam.maxMarks}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would be populated with actual students */}
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>001</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0"
                          max={selectedExam.maxMarks}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input placeholder="Optional remarks" className="w-40" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsResultEntryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitResults}>
              Submit Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={isEditExamDialogOpen} onOpenChange={setIsEditExamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Update exam details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editExamName">Exam Name</Label>
                <Input
                  id="editExamName"
                  value={newExam.name}
                  onChange={(e) => setNewExam({...newExam, name: e.target.value})}
                  placeholder="Enter exam name"
                />
              </div>
              <div>
                <Label htmlFor="editExamType">Exam Type</Label>
                <Select value={newExam.examType} onValueChange={(value) => setNewExam({...newExam, examType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="mid_term">Mid Term</SelectItem>
                    <SelectItem value="final">Final Exam</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editExamClass">Class</Label>
                <Select value={newExam.class} onValueChange={(value) => setNewExam({...newExam, class: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="3">Class 3</SelectItem>
                    <SelectItem value="4">Class 4</SelectItem>
                    <SelectItem value="5">Class 5</SelectItem>
                    <SelectItem value="6">Class 6</SelectItem>
                    <SelectItem value="7">Class 7</SelectItem>
                    <SelectItem value="8">Class 8</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editExamSubject">Subject</Label>
                <Input
                  id="editExamSubject"
                  value={newExam.subject}
                  onChange={(e) => setNewExam({...newExam, subject: e.target.value})}
                  placeholder="Enter subject"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editExamDate">Exam Date</Label>
                <Input
                  id="editExamDate"
                  type="date"
                  value={newExam.date}
                  onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editStartTime">Start Time</Label>
                <Input
                  id="editStartTime"
                  type="time"
                  value={newExam.startTime}
                  onChange={(e) => setNewExam({...newExam, startTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editDuration">Duration (minutes)</Label>
                <Input
                  id="editDuration"
                  type="number"
                  value={newExam.duration}
                  onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editMaxMarks">Maximum Marks</Label>
                <Input
                  id="editMaxMarks"
                  type="number"
                  value={newExam.maxMarks}
                  onChange={(e) => setNewExam({...newExam, maxMarks: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editPassingMarks">Passing Marks</Label>
                <Input
                  id="editPassingMarks"
                  type="number"
                  value={newExam.passingMarks}
                  onChange={(e) => setNewExam({...newExam, passingMarks: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editRoomNumber">Room Number</Label>
                <Input
                  id="editRoomNumber"
                  value={newExam.roomNumber}
                  onChange={(e) => setNewExam({...newExam, roomNumber: e.target.value})}
                  placeholder="Enter room number"
                />
              </div>
              <div>
                <Label htmlFor="editInvigilator">Invigilator</Label>
                <Input
                  id="editInvigilator"
                  value={newExam.invigilator}
                  onChange={(e) => setNewExam({...newExam, invigilator: e.target.value})}
                  placeholder="Enter invigilator name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editInstructions">Instructions</Label>
              <Textarea
                id="editInstructions"
                value={newExam.instructions}
                onChange={(e) => setNewExam({...newExam, instructions: e.target.value})}
                placeholder="Enter exam instructions"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditExamDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditExam}>
              Update Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exam? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedExam && (
            <div className="py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You are about to delete <strong>{selectedExam.name}</strong> scheduled for {new Date(selectedExam.date).toLocaleDateString()}.
                  {results.filter(r => r.examId === selectedExam.id).length > 0 && (
                    <div className="mt-2 text-red-600">
                      Warning: This exam has {results.filter(r => r.examId === selectedExam.id).length} associated results that will also be deleted.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExam}>
              Delete Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Creation Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Exam Schedule</DialogTitle>
            <DialogDescription>
              Select exams to include in the automated schedule generation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Select Exams</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(exams || []).filter(exam => exam.status === 'scheduled').map((exam) => (
                  <div key={exam.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={`schedule-${exam.id}`}
                      checked={selectedExamIds.includes(exam.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedExamIds([...selectedExamIds, exam.id]);
                        } else {
                          setSelectedExamIds(selectedExamIds.filter(id => id !== exam.id));
                        }
                      }}
                    />
                    <Label htmlFor={`schedule-${exam.id}`} className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">{exam.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {exam.class} - {exam.subject} | {new Date(exam.date).toLocaleDateString()}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedExamIds.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectedExamIds.length} exam(s) selected for scheduling. The system will automatically arrange them to avoid conflicts.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedExamIds((exams || []).filter(e => e.status === 'scheduled').map(e => e.id));
                }}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedExamIds([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateSchedule} disabled={selectedExamIds.length === 0}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Generate Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
