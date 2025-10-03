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
  Plus, Search, Eye, Edit, Trash2, Users, GraduationCap, 
  Calendar as CalendarIcon, Clock, CheckCircle, XCircle,
  Download, Upload, RefreshCw, Filter, Star, Award,
  BarChart3, TrendingUp, AlertCircle, FileText, UserPlus,
  Building, BookOpen, MapPin, Phone, Mail, Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ClassInfo {
  id: string;
  className: string;
  section: string;
  academicYear: string;
  classTeacherId: string;
  classTeacherName: string;
  roomNumber: string;
  capacity: number;
  currentStrength: number;
  subjects: Subject[];
  timetable: TimeSlot[];
  fees: ClassFee[];
  created_at: string;
  updated_at?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  periodsPerWeek: number;
  syllabus?: string;
  books: string[];
}

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomNumber?: string;
}

interface ClassFee {
  id: string;
  feeType: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  mandatory: boolean;
}

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'transferred';
}

interface ClassStats {
  totalClasses: number;
  totalStudents: number;
  averageStrength: number;
  teacherStudentRatio: number;
  capacityUtilization: number;
  activeTeachers: number;
}

export function ClassManagement() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<ClassStats>({
    totalClasses: 0,
    totalStudents: 0,
    averageStrength: 0,
    teacherStudentRatio: 0,
    capacityUtilization: 0,
    activeTeachers: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false);
  const [isViewClassDialogOpen, setIsViewClassDialogOpen] = useState(false);
  const [isAssignStudentsDialogOpen, setIsAssignStudentsDialogOpen] = useState(false);
  const [isTimetableDialogOpen, setIsTimetableDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);

  const [newClass, setNewClass] = useState({
    className: '',
    section: '',
    academicYear: '2024-25',
    classTeacherId: '',
    roomNumber: '',
    capacity: '40',
    subjects: [] as string[]
  });

  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    teacherId: '',
    periodsPerWeek: '5',
    syllabus: '',
    books: ''
  });

  const [assignStudentsForm, setAssignStudentsForm] = useState({
    classId: '',
    studentIds: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesData, subjectsData, studentsData, statsData] = await Promise.all([
        api.getClasses().catch(() => []),
        api.getSubjects().catch(() => []),
        api.getUnassignedStudents().catch(() => []),
        api.getClassStats().catch(() => ({
          totalClasses: 0,
          totalStudents: 0,
          averageStrength: 0,
          teacherStudentRatio: 0,
          capacityUtilization: 0,
          activeTeachers: 0
        }))
      ]);
      
      setClasses(classesData || []);
      setSubjects(subjectsData || []);
      setStudents(studentsData || []);
      setStats(statsData || {
        totalClasses: 0,
        totalStudents: 0,
        averageStrength: 0,
        teacherStudentRatio: 0,
        capacityUtilization: 0,
        activeTeachers: 0
      });
    } catch (error) {
      toast.error('Failed to load class data');
      console.error(error);
      // Set default values on error
      setClasses([]);
      setSubjects([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    try {
      const classData = {
        ...newClass,
        capacity: parseInt(newClass.capacity),
        currentStrength: 0,
        subjects: newClass.subjects,
        timetable: [],
        fees: []
      };
      
      await api.createClass(classData);
      toast.success('Class created successfully');
      setIsAddClassDialogOpen(false);
      resetClassForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create class');
      console.error(error);
    }
  };

  const handleAddSubject = async () => {
    try {
      const subjectData = {
        ...newSubject,
        periodsPerWeek: parseInt(newSubject.periodsPerWeek),
        books: newSubject.books.split(',').map(book => book.trim()).filter(book => book)
      };
      
      await api.createSubject(subjectData);
      toast.success('Subject created successfully');
      setIsAddSubjectDialogOpen(false);
      resetSubjectForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create subject');
      console.error(error);
    }
  };

  const handleAssignStudents = async () => {
    try {
      await api.assignStudentsToClass({
        classId: assignStudentsForm.classId,
        studentIds: assignStudentsForm.studentIds
      });
      toast.success('Students assigned successfully');
      setIsAssignStudentsDialogOpen(false);
      resetAssignStudentsForm();
      loadData();
    } catch (error) {
      toast.error('Failed to assign students');
      console.error(error);
    }
  };

  const handlePromoteClass = async (classId: string, targetClass: string) => {
    try {
      await api.promoteClass(classId, targetClass);
      toast.success('Class promoted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to promote class');
      console.error(error);
    }
  };

  const handleGenerateTimetable = async (classId: string) => {
    try {
      await api.generateTimetable(classId);
      toast.success('Timetable generated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to generate timetable');
      console.error(error);
    }
  };

  const resetClassForm = () => {
    setNewClass({
      className: '',
      section: '',
      academicYear: '2024-25',
      classTeacherId: '',
      roomNumber: '',
      capacity: '40',
      subjects: []
    });
  };

  const resetSubjectForm = () => {
    setNewSubject({
      name: '',
      code: '',
      teacherId: '',
      periodsPerWeek: '5',
      syllabus: '',
      books: ''
    });
  };

  const resetAssignStudentsForm = () => {
    setAssignStudentsForm({
      classId: '',
      studentIds: []
    });
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-orange-600';
    if (utilization >= 50) return 'text-green-600';
    return 'text-blue-600';
  };

  const filteredClasses = classes.filter(classItem => {
    if (!classItem) return false;
    
    const matchesSearch = searchTerm === '' || (
      (classItem.className || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.section || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.classTeacherName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesYear = yearFilter === '' || yearFilter === 'all' || classItem.academicYear === yearFilter;
    const matchesTeacher = teacherFilter === '' || teacherFilter === 'all' || classItem.classTeacherId === teacherFilter;
    
    return matchesSearch && matchesYear && matchesTeacher;
  });

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Class Management</h1>
          <p className="text-muted-foreground">
            Manage classes, subjects, and student assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddSubjectDialogOpen} onOpenChange={setIsAddSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Create a new subject for the curriculum
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subjectName">Subject Name</Label>
                    <Input
                      id="subjectName"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                      placeholder="Enter subject name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subjectCode">Subject Code</Label>
                    <Input
                      id="subjectCode"
                      value={newSubject.code}
                      onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                      placeholder="Enter subject code"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subjectTeacher">Teacher</Label>
                    <Select value={newSubject.teacherId} onValueChange={(value) => setNewSubject({...newSubject, teacherId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Teachers would be populated from API */}
                        <SelectItem value="teacher1">John Smith - Mathematics</SelectItem>
                        <SelectItem value="teacher2">Jane Doe - English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="periodsPerWeek">Periods Per Week</Label>
                    <Input
                      id="periodsPerWeek"
                      type="number"
                      value={newSubject.periodsPerWeek}
                      onChange={(e) => setNewSubject({...newSubject, periodsPerWeek: e.target.value})}
                      placeholder="Enter periods per week"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="syllabus">Syllabus</Label>
                  <Textarea
                    id="syllabus"
                    value={newSubject.syllabus}
                    onChange={(e) => setNewSubject({...newSubject, syllabus: e.target.value})}
                    placeholder="Enter syllabus details"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="books">Books (comma-separated)</Label>
                  <Input
                    id="books"
                    value={newSubject.books}
                    onChange={(e) => setNewSubject({...newSubject, books: e.target.value})}
                    placeholder="Enter book names separated by commas"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddSubjectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSubject}>
                  Add Subject
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>
                  Create a new class section for the academic year
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="className">Class Name</Label>
                    <Select value={newClass.className} onValueChange={(value) => setNewClass({...newClass, className: value})}>
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
                    <Label htmlFor="section">Section</Label>
                    <Select value={newClass.section} onValueChange={(value) => setNewClass({...newClass, section: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Section A</SelectItem>
                        <SelectItem value="B">Section B</SelectItem>
                        <SelectItem value="C">Section C</SelectItem>
                        <SelectItem value="D">Section D</SelectItem>
                        <SelectItem value="E">Section E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Select value={newClass.academicYear} onValueChange={(value) => setNewClass({...newClass, academicYear: value})}>
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
                    <Label htmlFor="classTeacher">Class Teacher</Label>
                    <Select value={newClass.classTeacherId} onValueChange={(value) => setNewClass({...newClass, classTeacherId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Teachers would be populated from API */}
                        <SelectItem value="teacher1">John Smith</SelectItem>
                        <SelectItem value="teacher2">Jane Doe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={newClass.roomNumber}
                      onChange={(e) => setNewClass({...newClass, roomNumber: e.target.value})}
                      placeholder="Enter room number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newClass.capacity}
                      onChange={(e) => setNewClass({...newClass, capacity: e.target.value})}
                      placeholder="Enter class capacity"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Subjects</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={subject.id}
                          checked={newClass.subjects.includes(subject.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewClass({
                                ...newClass,
                                subjects: [...newClass.subjects, subject.id]
                              });
                            } else {
                              setNewClass({
                                ...newClass,
                                subjects: newClass.subjects.filter(id => id !== subject.id)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={subject.id} className="text-sm">
                          {subject.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddClassDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddClass}>
                  Create Class
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
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Average Strength</p>
                <p className="text-2xl font-bold">{stats.averageStrength}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Capacity Utilization</p>
                <p className="text-2xl font-bold">{stats.capacityUtilization}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={stats.capacityUtilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="assignments">Student Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="classes" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search classes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                
                <Dialog open={isAssignStudentsDialogOpen} onOpenChange={setIsAssignStudentsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Students
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Assign Students to Class</DialogTitle>
                      <DialogDescription>
                        Select students to assign to a class
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="assignClass">Select Class</Label>
                        <Select 
                          value={assignStudentsForm.classId} 
                          onValueChange={(value) => setAssignStudentsForm({...assignStudentsForm, classId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((classItem) => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.className} - {classItem.section} ({classItem.currentStrength}/{classItem.capacity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Available Students</Label>
                        <div className="max-h-64 overflow-y-auto border rounded-lg p-4 mt-2">
                          {students.map((student) => (
                            <div key={student.id} className="flex items-center space-x-2 mb-2">
                              <Checkbox
                                id={student.id}
                                checked={assignStudentsForm.studentIds.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setAssignStudentsForm({
                                      ...assignStudentsForm,
                                      studentIds: [...assignStudentsForm.studentIds, student.id]
                                    });
                                  } else {
                                    setAssignStudentsForm({
                                      ...assignStudentsForm,
                                      studentIds: assignStudentsForm.studentIds.filter(id => id !== student.id)
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={student.id} className="text-sm flex-1">
                                {student.name} - {student.rollNumber}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAssignStudentsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAssignStudents}>
                        Assign Students
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {bulkSelection.length > 0 && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg mt-4">
                  <span className="text-sm">{bulkSelection.length} classes selected</span>
                  <Button size="sm" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Bulk Settings
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setBulkSelection([])}>
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Classes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Classes Overview</CardTitle>
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
                        <TableHead className="w-12">
                          <Checkbox
                            checked={bulkSelection.length === paginatedClasses.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBulkSelection(paginatedClasses.map(c => c.id));
                              } else {
                                setBulkSelection([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Class Teacher</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Strength</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClasses.map((classItem) => (
                        <TableRow key={classItem.id}>
                          <TableCell>
                            <Checkbox
                              checked={bulkSelection.includes(classItem.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setBulkSelection([...bulkSelection, classItem.id]);
                                } else {
                                  setBulkSelection(bulkSelection.filter(id => id !== classItem.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classItem.className} - {classItem.section}</div>
                              <div className="text-sm text-muted-foreground">{classItem.academicYear}</div>
                            </div>
                          </TableCell>
                          <TableCell>{classItem.classTeacherName}</TableCell>
                          <TableCell>{classItem.roomNumber}</TableCell>
                          <TableCell className="font-bold">{classItem.currentStrength}</TableCell>
                          <TableCell>{classItem.capacity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${getUtilizationColor((classItem.currentStrength / classItem.capacity) * 100)}`}>
                                {Math.round((classItem.currentStrength / classItem.capacity) * 100)}%
                              </span>
                              <Progress 
                                value={(classItem.currentStrength / classItem.capacity) * 100} 
                                className="w-16 h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{(classItem.subjects || []).length} subjects</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedClass(classItem);
                                  setIsViewClassDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateTimetable(classItem.id)}
                              >
                                <CalendarIcon className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
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
                  {Math.min(currentPage * itemsPerPage, filteredClasses.length)} of{' '}
                  {filteredClasses.length} classes
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
        
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Periods/Week</TableHead>
                      <TableHead>Books</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-mono">{subject.code}</TableCell>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>{subject.teacherName}</TableCell>
                        <TableCell>{subject.periodsPerWeek}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {(subject.books || []).slice(0, 2).map((book, index) => (
                              <div key={index}>{book}</div>
                            ))}
                            {(subject.books || []).length > 2 && (
                              <div className="text-muted-foreground">
                                +{(subject.books || []).length - 2} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Class Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((classItem) => (
                  <Card key={classItem.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{classItem.className} - {classItem.section}</h3>
                        <p className="text-sm text-muted-foreground">{classItem.classTeacherName}</p>
                      </div>
                      <Badge variant="outline">
                        {classItem.currentStrength}/{classItem.capacity}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress 
                        value={(classItem.currentStrength / classItem.capacity) * 100} 
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Room: {classItem.roomNumber}</span>
                        <span>{Math.round((classItem.currentStrength / classItem.capacity) * 100)}% full</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Students
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.slice(0, 6).map((classItem) => (
                    <div key={classItem.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{classItem.className} - {classItem.section}</span>
                        <span className="text-sm font-medium">
                          {classItem.currentStrength}/{classItem.capacity}
                        </span>
                      </div>
                      <Progress 
                        value={(classItem.currentStrength / classItem.capacity) * 100} 
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
                      <div className="text-sm text-muted-foreground">Total Classes</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
                      <div className="text-sm text-muted-foreground">Total Students</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Teacher-Student Ratio</span>
                      <span className="font-bold">1:{stats.teacherStudentRatio}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Class Size</span>
                      <span className="font-bold">{stats.averageStrength}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Capacity Utilization</span>
                      <span className="font-bold">{stats.capacityUtilization}%</span>
                    </div>
                  </div>
                  
                  <Progress value={stats.capacityUtilization} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Class Dialog */}
      <Dialog open={isViewClassDialogOpen} onOpenChange={setIsViewClassDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class:</span>
                      <span>{selectedClass.className} - {selectedClass.section}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Academic Year:</span>
                      <span>{selectedClass.academicYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class Teacher:</span>
                      <span>{selectedClass.classTeacherName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Number:</span>
                      <span>{selectedClass.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span>{selectedClass.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Strength:</span>
                      <span className="font-bold">{selectedClass.currentStrength}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(selectedClass.subjects || []).map((subject) => (
                        <div key={subject.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{subject.name}</span>
                          <Badge variant="outline">{subject.periodsPerWeek}p/w</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timetable</CardTitle>
                </CardHeader>
                <CardContent>
                  {(selectedClass.timetable || []).length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Room</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(selectedClass.timetable || []).map((slot) => (
                            <TableRow key={slot.id}>
                              <TableCell>{slot.day}</TableCell>
                              <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                              <TableCell>{slot.subjectName}</TableCell>
                              <TableCell>{slot.teacherName}</TableCell>
                              <TableCell>{slot.roomNumber}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">No timetable generated yet</p>
                      <Button 
                        className="mt-4"
                        onClick={() => handleGenerateTimetable(selectedClass.id)}
                      >
                        Generate Timetable
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Class
                </Button>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Students
                </Button>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Manage Timetable
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}