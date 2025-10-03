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
  Plus, Search, Eye, Edit, Trash2, Users, UserCheck, 
  Calendar as CalendarIcon, Clock, CheckCircle, XCircle,
  Download, Upload, RefreshCw, Filter, Star, Award,
  BarChart3, TrendingUp, AlertCircle, FileText, QrCode,
  Camera, Smartphone, Timer, Activity, PieChart
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  rollNumber: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  markedBy: string;
  markedAt: string;
  remarks?: string;
  parentNotified: boolean;
  created_at: string;
}

interface StaffAttendance {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'half_day';
  workingHours?: number;
  overtime?: number;
  markedBy: string;
  remarks?: string;
  created_at: string;
}

interface AttendanceStats {
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  attendanceRate: number;
  totalStaff: number;
  presentStaff: number;
  absentStaff: number;
  staffAttendanceRate: number;
}

interface AttendanceReport {
  studentId: string;
  studentName: string;
  class: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

interface AttendancePattern {
  date: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendanceRate: number;
}

export function AttendanceManagement() {
  const [studentAttendance, setStudentAttendance] = useState<AttendanceRecord[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendance[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentStudents: 0,
    absentStudents: 0,
    lateStudents: 0,
    attendanceRate: 0,
    totalStaff: 0,
    presentStaff: 0,
    absentStaff: 0,
    staffAttendanceRate: 0
  });
  const [attendanceReports, setAttendanceReports] = useState<AttendanceReport[]>([]);
  const [attendancePatterns, setAttendancePatterns] = useState<AttendancePattern[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isMarkAttendanceDialogOpen, setIsMarkAttendanceDialogOpen] = useState(false);
  const [isBulkAttendanceDialogOpen, setIsBulkAttendanceDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isQRScanDialogOpen, setIsQRScanDialogOpen] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  
  const [markAttendanceForm, setMarkAttendanceForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkInTime: '',
    remarks: ''
  });
  
  const [bulkAttendanceForm, setBulkAttendanceForm] = useState({
    class: '',
    section: '',
    date: new Date().toISOString().split('T')[0],
    students: [] as Array<{
      studentId: string;
      studentName: string;
      rollNumber: string;
      status: string;
      remarks: string;
    }>
  });
  
  const [reportFilters, setReportFilters] = useState({
    class: '',
    section: '',
    startDate: '',
    endDate: '',
    studentId: ''
  });

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedClass]);

  const loadData = async () => {
    try {
      const [studentAttData, staffAttData, statsData, reportsData, patternsData] = await Promise.all([
        api.getStudentAttendance({ date: selectedDate, class: selectedClass }),
        api.getStaffAttendance({ date: selectedDate }),
        api.getAttendanceStats({ date: selectedDate }),
        api.getAttendanceReports(reportFilters),
        api.getAttendancePatterns({ startDate: selectedDate, days: 30 })
      ]);
      
      setStudentAttendance(studentAttData);
      setStaffAttendance(staffAttData);
      setAttendanceStats(statsData);
      setAttendanceReports(reportsData);
      setAttendancePatterns(patternsData);
    } catch (error) {
      toast.error('Failed to load attendance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const attendanceData = {
        ...markAttendanceForm,
        markedBy: 'current_user', // This would be the logged-in user
        markedAt: new Date().toISOString(),
        parentNotified: false
      };
      
      await api.markStudentAttendance(attendanceData);
      toast.success('Attendance marked successfully');
      setIsMarkAttendanceDialogOpen(false);
      resetMarkAttendanceForm();
      loadData();
    } catch (error) {
      toast.error('Failed to mark attendance');
      console.error(error);
    }
  };

  const handleBulkAttendance = async () => {
    try {
      const bulkData = bulkAttendanceForm.students.map(student => ({
        studentId: student.studentId,
        date: bulkAttendanceForm.date,
        status: student.status,
        remarks: student.remarks,
        markedBy: 'current_user',
        markedAt: new Date().toISOString(),
        parentNotified: false
      }));
      
      await api.markBulkAttendance(bulkData);
      toast.success('Bulk attendance marked successfully');
      setIsBulkAttendanceDialogOpen(false);
      resetBulkAttendanceForm();
      loadData();
    } catch (error) {
      toast.error('Failed to mark bulk attendance');
      console.error(error);
    }
  };

  const handleAutoAttendance = async (method: 'qr' | 'biometric' | 'rfid') => {
    try {
      await api.enableAutoAttendance({ method, class: selectedClass });
      toast.success(`${method.toUpperCase()} attendance enabled`);
      loadData();
    } catch (error) {
      toast.error(`Failed to enable ${method} attendance`);
      console.error(error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const reportData = await api.generateAttendanceReport(reportFilters);
      setAttendanceReports(reportData);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    }
  };

  const handleNotifyParents = async (studentIds: string[]) => {
    try {
      await api.notifyParentsAbsenteeism(studentIds);
      toast.success('Parents notified successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to notify parents');
      console.error(error);
    }
  };

  const loadClassStudents = async (classValue: string, section: string) => {
    try {
      const students = await api.getClassStudents({ class: classValue, section });
      setBulkAttendanceForm({
        ...bulkAttendanceForm,
        class: classValue,
        section,
        students: students.map((student: any) => ({
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          status: 'present',
          remarks: ''
        }))
      });
    } catch (error) {
      toast.error('Failed to load class students');
      console.error(error);
    }
  };

  const resetMarkAttendanceForm = () => {
    setMarkAttendanceForm({
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      checkInTime: '',
      remarks: ''
    });
  };

  const resetBulkAttendanceForm = () => {
    setBulkAttendanceForm({
      class: '',
      section: '',
      date: new Date().toISOString().split('T')[0],
      students: []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      case 'half_day': return 'bg-orange-100 text-orange-800';
      case 'on_leave': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAttendance = studentAttendance.filter(record => {
    return (
      ((record.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (record.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || statusFilter === '' || record.status === statusFilter)
    );
  });

  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
  const paginatedAttendance = filteredAttendance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Attendance Management</h1>
          <p className="text-muted-foreground">
            Track and manage student and staff attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isQRScanDialogOpen} onOpenChange={setIsQRScanDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="mr-2 h-4 w-4" />
                QR Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code Attendance</DialogTitle>
                <DialogDescription>
                  Enable QR code based attendance for the selected class
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center border-2 border-dashed">
                    <QrCode className="h-24 w-24 text-gray-400" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Students can scan this QR code to mark their attendance
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => handleAutoAttendance('qr')}>
                      Enable QR Attendance
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download QR
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isBulkAttendanceDialogOpen} onOpenChange={setIsBulkAttendanceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Bulk Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Mark Bulk Attendance</DialogTitle>
                <DialogDescription>
                  Mark attendance for entire class at once
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bulkClass">Class</Label>
                    <Select 
                      value={bulkAttendanceForm.class} 
                      onValueChange={(value) => {
                        setBulkAttendanceForm({...bulkAttendanceForm, class: value});
                        if (value && bulkAttendanceForm.section) {
                          loadClassStudents(value, bulkAttendanceForm.section);
                        }
                      }}
                    >
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
                    <Label htmlFor="bulkSection">Section</Label>
                    <Select 
                      value={bulkAttendanceForm.section} 
                      onValueChange={(value) => {
                        setBulkAttendanceForm({...bulkAttendanceForm, section: value});
                        if (bulkAttendanceForm.class && value) {
                          loadClassStudents(bulkAttendanceForm.class, value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Section A</SelectItem>
                        <SelectItem value="B">Section B</SelectItem>
                        <SelectItem value="C">Section C</SelectItem>
                        <SelectItem value="D">Section D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bulkDate">Date</Label>
                    <Input
                      id="bulkDate"
                      type="date"
                      value={bulkAttendanceForm.date}
                      onChange={(e) => setBulkAttendanceForm({...bulkAttendanceForm, date: e.target.value})}
                    />
                  </div>
                </div>
                
                {bulkAttendanceForm.students.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Student List</h3>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const updatedStudents = bulkAttendanceForm.students.map(student => ({
                              ...student,
                              status: 'present'
                            }));
                            setBulkAttendanceForm({...bulkAttendanceForm, students: updatedStudents});
                          }}
                        >
                          Mark All Present
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const updatedStudents = bulkAttendanceForm.students.map(student => ({
                              ...student,
                              status: 'absent'
                            }));
                            setBulkAttendanceForm({...bulkAttendanceForm, students: updatedStudents});
                          }}
                        >
                          Mark All Absent
                        </Button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Remarks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkAttendanceForm.students.map((student, index) => (
                            <TableRow key={student.studentId}>
                              <TableCell>{student.rollNumber}</TableCell>
                              <TableCell>{student.studentName}</TableCell>
                              <TableCell>
                                <Select 
                                  value={student.status} 
                                  onValueChange={(value) => {
                                    const updatedStudents = [...bulkAttendanceForm.students];
                                    updatedStudents[index].status = value;
                                    setBulkAttendanceForm({...bulkAttendanceForm, students: updatedStudents});
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="excused">Excused</SelectItem>
                                    <SelectItem value="half_day">Half Day</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={student.remarks}
                                  onChange={(e) => {
                                    const updatedStudents = [...bulkAttendanceForm.students];
                                    updatedStudents[index].remarks = e.target.value;
                                    setBulkAttendanceForm({...bulkAttendanceForm, students: updatedStudents});
                                  }}
                                  placeholder="Optional remarks"
                                  className="w-40"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsBulkAttendanceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAttendance} disabled={bulkAttendanceForm.students.length === 0}>
                  Mark Attendance
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isMarkAttendanceDialogOpen} onOpenChange={setIsMarkAttendanceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Individual Attendance</DialogTitle>
                <DialogDescription>
                  Mark attendance for a specific student
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="attendanceStudent">Student</Label>
                  <Select 
                    value={markAttendanceForm.studentId} 
                    onValueChange={(value) => setMarkAttendanceForm({...markAttendanceForm, studentId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Students would be populated from API */}
                      <SelectItem value="student1">John Doe - 001</SelectItem>
                      <SelectItem value="student2">Jane Smith - 002</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="attendanceDate">Date</Label>
                    <Input
                      id="attendanceDate"
                      type="date"
                      value={markAttendanceForm.date}
                      onChange={(e) => setMarkAttendanceForm({...markAttendanceForm, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkInTime">Check-in Time</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={markAttendanceForm.checkInTime}
                      onChange={(e) => setMarkAttendanceForm({...markAttendanceForm, checkInTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="attendanceStatus">Status</Label>
                  <Select 
                    value={markAttendanceForm.status} 
                    onValueChange={(value) => setMarkAttendanceForm({...markAttendanceForm, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="excused">Excused</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="attendanceRemarks">Remarks</Label>
                  <Textarea
                    id="attendanceRemarks"
                    value={markAttendanceForm.remarks}
                    onChange={(e) => setMarkAttendanceForm({...markAttendanceForm, remarks: e.target.value})}
                    placeholder="Enter any remarks"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsMarkAttendanceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMarkAttendance}>
                  Mark Attendance
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
                <p className="text-sm text-muted-foreground">Present Students</p>
                <p className="text-2xl font-bold">{attendanceStats.presentStudents}</p>
                <p className="text-xs text-muted-foreground">of {attendanceStats.totalStudents}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Absent Students</p>
                <p className="text-2xl font-bold">{attendanceStats.absentStudents}</p>
                <p className="text-xs text-muted-foreground">{attendanceStats.lateStudents} late</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{attendanceStats.attendanceRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={attendanceStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Staff Present</p>
                <p className="text-2xl font-bold">{attendanceStats.presentStaff}</p>
                <p className="text-xs text-muted-foreground">of {attendanceStats.totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date and Class Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label htmlFor="selectedDate">Date</Label>
              <Input
                id="selectedDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label htmlFor="classFilter">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
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
              <Label htmlFor="sectionFilter">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadData}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="student-attendance" className="w-full">
        <TabsList>
          <TabsTrigger value="student-attendance">Student Attendance</TabsTrigger>
          <TabsTrigger value="staff-attendance">Staff Attendance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="student-attendance" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="excused">Excused</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    const absentStudents = filteredAttendance
                      .filter(record => record.status === 'absent')
                      .map(record => record.studentId);
                    if (absentStudents.length > 0) {
                      handleNotifyParents(absentStudents);
                    }
                  }}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Notify Parents
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
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
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead>Check-out Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marked By</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAttendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.rollNumber}</TableCell>
                          <TableCell>
                            <div className="font-medium">{record.studentName}</div>
                          </TableCell>
                          <TableCell>{record.studentClass}</TableCell>
                          <TableCell>{record.checkInTime || '-'}</TableCell>
                          <TableCell>{record.checkOutTime || '-'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.markedBy}</TableCell>
                          <TableCell>{record.remarks || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
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
                  {Math.min(currentPage * itemsPerPage, filteredAttendance.length)} of{' '}
                  {filteredAttendance.length} records
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
        
        <TabsContent value="staff-attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Attendance - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Overtime</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.staffName}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>{record.checkInTime || '-'}</TableCell>
                        <TableCell>{record.checkOutTime || '-'}</TableCell>
                        <TableCell>{record.workingHours ? `${record.workingHours}h` : '-'}</TableCell>
                        <TableCell>{record.overtime ? `${record.overtime}h` : '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
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
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <Label htmlFor="reportClass">Class</Label>
                  <Select 
                    value={reportFilters.class} 
                    onValueChange={(value) => setReportFilters({...reportFilters, class: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="1">Class 1</SelectItem>
                      <SelectItem value="5">Class 5</SelectItem>
                      <SelectItem value="10">Class 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reportStartDate">Start Date</Label>
                  <Input
                    id="reportStartDate"
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="reportEndDate">End Date</Label>
                  <Input
                    id="reportEndDate"
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleGenerateReport}>
                    Generate Report
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total Days</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceReports.map((report) => (
                      <TableRow key={report.studentId}>
                        <TableCell className="font-medium">{report.studentName}</TableCell>
                        <TableCell>{report.class}</TableCell>
                        <TableCell>{report.totalDays}</TableCell>
                        <TableCell className="text-green-600">{report.presentDays}</TableCell>
                        <TableCell className="text-red-600">{report.absentDays}</TableCell>
                        <TableCell className="text-yellow-600">{report.lateDays}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{report.attendancePercentage}%</span>
                            <Progress value={report.attendancePercentage} className="w-16 h-2" />
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
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendancePatterns.slice(0, 7).map((pattern) => (
                    <div key={pattern.date} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{new Date(pattern.date).toLocaleDateString()}</span>
                        <span className="text-sm font-medium">{pattern.attendanceRate}%</span>
                      </div>
                      <Progress value={pattern.attendanceRate} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Present: {pattern.totalPresent}</span>
                        <span>Absent: {pattern.totalAbsent}</span>
                        <span>Late: {pattern.totalLate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{attendanceStats.presentStudents}</div>
                      <div className="text-sm text-muted-foreground">Present Today</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{attendanceStats.absentStudents}</div>
                      <div className="text-sm text-muted-foreground">Absent Today</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
                    <div className="text-sm text-muted-foreground">Overall Attendance Rate</div>
                    <Progress value={attendanceStats.attendanceRate} className="w-full mt-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">{attendanceStats.lateStudents}</div>
                      <div className="text-xs text-muted-foreground">Late</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{attendanceStats.totalStudents}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{attendanceStats.presentStaff}</div>
                      <div className="text-xs text-muted-foreground">Staff Present</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}