import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import {
  Plus, Search, Edit, Eye, Trash2, Download, Upload, Users,
  GraduationCap, Award, FileText, Camera, Phone, Mail,
  TrendingUp, AlertCircle,
  Filter, RefreshCw,
  UserCheck, Shield, Trophy,
  ChevronDown, ChevronRight, ArrowRight
} from 'lucide-react';


interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  bloodGroup?: string;
  gender: 'male' | 'female' | 'other';
  religion?: string;
  nationality?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  profilePhoto?: string;
  studentId: string;
  previousSchool?: string;
  transferCertificate?: string;
  academicYear: string;
  house?: string;
  transportRoute?: string;
  feeCategory?: string;
  created_at: string;
  updated_at?: string;
}

interface AcademicRecord {
  id: string;
  studentId: string;
  subject: string;
  term: string;
  marks: number;
  maxMarks: number;
  grade: string;
  percentage: number;
  remarks?: string;
  year: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  studentClass?: string;
  rollNumber?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | string;
  markedBy?: string;
  markedAt?: string;
  remarks?: string;
  parentNotified?: boolean;
  created_at?: string;
  subject?: string;
}

interface DisciplinaryRecord {
  id: string;
  studentId: string;
  date: string;
  type: 'warning' | 'suspension' | 'expulsion' | 'commendation';
  description: string;
  actionTaken: string;
  status: 'active' | 'resolved';
}

interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: 'academic' | 'sports' | 'cultural' | 'leadership';
  date: string;
  level: 'school' | 'district' | 'state' | 'national' | 'international';
  certificateUrl?: string;
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<DisciplinaryRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Bulk operations
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    class: '',
    section: '',
    rollNumber: '',
    dateOfBirth: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    bloodGroup: '',
    gender: 'male' as 'male' | 'female' | 'other',
    religion: '',
    nationality: '',
    emergencyContact: '',
    medicalConditions: '',
    studentId: '',
    previousSchool: '',
    academicYear: new Date().getFullYear().toString(),
    house: '',
    transportRoute: '',
    feeCategory: 'regular'
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, selectedClass, selectedSection, selectedStatus, selectedGender, selectedHouse]);

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
      setFilteredStudents(data);
      // Store in localStorage for persistence
      localStorage.setItem('students', JSON.stringify(data));
    } catch (error) {
      toast.error('Failed to load students from server, using local data');
      // Try to load from localStorage first
      const storedStudents = localStorage.getItem('students');
      if (storedStudents) {
        const parsedStudents = JSON.parse(storedStudents);
        setStudents(parsedStudents);
        setFilteredStudents(parsedStudents);
      } else {
        // Use demo data if no localStorage
        const demoStudents: Student[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@school.edu',
            phone: '+91 98765 43210',
            class: '10',
            section: 'A',
            rollNumber: '101',
            dateOfBirth: '2008-05-15',
            address: '123 Main St, City',
            parentName: 'Robert Doe',
            parentPhone: '+91 98765 43211',
            parentEmail: 'robert.doe@email.com',
            admissionDate: '2020-04-01',
            status: 'active',
            bloodGroup: 'O+',
            gender: 'male',
            studentId: 'STU001',
            academicYear: '2024',
            created_at: '2020-04-01'
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@school.edu',
            phone: '+91 98765 43212',
            class: '10',
            section: 'B',
            rollNumber: '102',
            dateOfBirth: '2008-08-20',
            address: '456 Oak Ave, City',
            parentName: 'Maria Smith',
            parentPhone: '+91 98765 43213',
            admissionDate: '2020-04-01',
            status: 'active',
            bloodGroup: 'A+',
            gender: 'female',
            studentId: 'STU002',
            academicYear: '2024',
            created_at: '2020-04-01'
          },
          {
            id: '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.j@school.edu',
            phone: '+91 98765 43214',
            class: '9',
            section: 'A',
            rollNumber: '201',
            dateOfBirth: '2009-01-10',
            address: '789 Pine Rd, City',
            parentName: 'David Johnson',
            parentPhone: '+91 98765 43215',
            admissionDate: '2021-04-01',
            status: 'active',
            bloodGroup: 'B+',
            gender: 'male',
            studentId: 'STU003',
            academicYear: '2024',
            created_at: '2021-04-01'
          }
        ];
        setStudents(demoStudents);
        setFilteredStudents(demoStudents);
        localStorage.setItem('students', JSON.stringify(demoStudents));
      }
    } finally {
      setLoading(false);
    }
  };


  const loadStudentDetails = async (studentId: string) => {
    try {
      const [academic, attendance, disciplinary, achievementData] = await Promise.all([
        api.getStudentAcademicRecords?.(studentId) || [],
        api.getStudentAttendance?.({}) || [],
        api.getStudentDisciplinaryRecords?.(studentId) || [],
        api.getStudentAchievements?.(studentId) || []
      ]);
      
      setAcademicRecords(academic);
      setAttendanceRecords(attendance);
      setDisciplinaryRecords(disciplinary);
      setAchievements(achievementData);
    } catch (error) {
      console.error('Failed to load student details:', error);
    }
  };

  const applyFilters = () => {
    if (!students || !Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }
    
    let filtered = students.filter(student => {
      if (!student) return false;
      
      const matchesSearch = searchTerm === '' || (
        (student.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.parentName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesClass = selectedClass === '' || student.class === selectedClass;
      const matchesSection = selectedSection === '' || student.section === selectedSection;
      const matchesStatus = selectedStatus === '' || student.status === selectedStatus;
      const matchesGender = selectedGender === '' || student.gender === selectedGender;
      const matchesHouse = selectedHouse === '' || student.house === selectedHouse;
      
      return matchesSearch && matchesClass && matchesSection && matchesStatus && matchesGender && matchesHouse;
    });
    
    setFilteredStudents(filtered || []);
  };

  const handleAddStudent = async () => {
    try {
      // Enhanced validation
      const requiredFields = ['firstName', 'lastName', 'class', 'section', 'rollNumber', 'parentName', 'parentPhone'];
      const missingFields = requiredFields.filter(field => !newStudent[field as keyof typeof newStudent]);

      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Check for duplicate roll number
      const duplicateRoll = students.find(s => s.rollNumber === newStudent.rollNumber && s.class === newStudent.class);
      if (duplicateRoll) {
        toast.error('Roll number already exists in this class');
        return;
      }

      const studentData: Student = {
        ...newStudent,
        id: `local-${Date.now()}`,
        status: 'active' as const,
        admissionDate: new Date().toISOString().split('T')[0],
        studentId: newStudent.studentId || `STU${Date.now()}`,
        created_at: new Date().toISOString()
      };

      // Try to save to API first
      try {
        await api.createStudent(studentData);
      } catch (apiError) {
        console.warn('API save failed, saving locally:', apiError);
      }

      // Add to local state and localStorage
      const updatedStudents = [...students, studentData];
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));

      toast.success('Student added successfully');
      setIsAddDialogOpen(false);
      resetNewStudent();
    } catch (error) {
      toast.error('Failed to add student');
      console.error(error);
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      // Try to update via API first
      try {
        await api.updateStudent(selectedStudent.id, selectedStudent);
      } catch (apiError) {
        console.warn('API update failed, updating locally:', apiError);
      }

      // Update in local state and localStorage
      const updatedStudents = students.map(s => s.id === selectedStudent.id ? selectedStudent : s);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));

      toast.success('Student updated successfully');
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast.error('Failed to update student');
      console.error(error);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Try to delete via API first
      try {
        await api.deleteStudent(studentId);
      } catch (apiError) {
        console.warn('API delete failed, deleting locally:', apiError);
      }

      // Remove from local state and localStorage
      const updatedStudents = students.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));

      toast.success('Student deleted successfully');
    } catch (error) {
      toast.error('Failed to delete student');
      console.error(error);
    }
  };

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student);
    await loadStudentDetails(student.id);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent({ ...student });
    setIsEditDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`)) {
      return;
    }

    try {
      // Try to delete via API first
      try {
        await Promise.all(selectedStudents.map(id => api.deleteStudent(id)));
      } catch (apiError) {
        console.warn('API bulk delete failed, deleting locally:', apiError);
      }

      // Remove from local state and localStorage
      const updatedStudents = students.filter(s => !selectedStudents.includes(s.id));
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));

      toast.success(`${selectedStudents.length} students deleted successfully`);
      setSelectedStudents([]);
      setSelectAll(false);
    } catch (error) {
      toast.error('Failed to delete students');
      console.error(error);
    }
  };

  const handlePromoteStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to promote');
      return;
    }

    try {
      await api.promoteStudents?.(selectedStudents);
      toast.success(`${selectedStudents.length} students promoted successfully`);
      setSelectedStudents([]);
      setSelectAll(false);
      setIsPromoteDialogOpen(false);
      loadStudents();
    } catch (error) {
      toast.error('Failed to promote students');
      console.error(error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    try {
      const data = await api.exportStudents?.(format, { students: filteredStudents.map(s => s.id) });
      // Handle file download
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Student data exported successfully');
    } catch (error) {
      toast.error('Failed to export student data');
      console.error(error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?)$/i)) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setUploadedFile(file);
      toast.success(`File "${file.name}" selected successfully`);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseCSV = (csvContent: string): any[] => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const students = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;
      
      const student: any = {};
      headers.forEach((header, index) => {
        const value = values[index].replace(/^["']|["']$/g, ''); // Remove quotes
        
        // Map CSV headers to student object properties
        if (header.includes('first') && header.includes('name')) {
          student.firstName = value;
        } else if (header.includes('last') && header.includes('name')) {
          student.lastName = value;
        } else if (header === 'class' || header === 'grade') {
          student.class = value;
        } else if (header === 'section') {
          student.section = value;
        } else if (header.includes('roll')) {
          student.rollNumber = value;
        } else if (header.includes('birth') || header === 'dob') {
          student.dateOfBirth = value;
        } else if (header === 'gender') {
          student.gender = value.toLowerCase();
        } else if (header.includes('parent') && header.includes('name')) {
          student.parentName = value;
        } else if (header.includes('parent') && header.includes('phone')) {
          student.parentPhone = value;
        } else if (header === 'email') {
          student.email = value;
        } else if (header === 'address') {
          student.address = value;
        } else if (header === 'phone') {
          student.phone = value;
        }
      });
      
      // Only add if required fields are present
      if (student.firstName && student.lastName && student.class && student.rollNumber) {
        // Set defaults for missing fields
        student.status = 'active';
        student.admissionDate = new Date().toISOString().split('T')[0];
        student.academicYear = new Date().getFullYear().toString();
        student.section = student.section || 'A';
        student.parentName = student.parentName || 'Not Provided';
        student.parentPhone = student.parentPhone || '0000000000';
        student.gender = student.gender || 'other';
        
        students.push(student);
      }
    }
    
    return students;
  };

  const parseExcel = async (): Promise<any[]> => {
    // For Excel files, we need a proper Excel parser library
    // For now, show an error message with instructions
    toast.error('Excel file detected. Please save as CSV format for now.');
    toast.info('In Excel: File → Save As → CSV (Comma delimited)');
    return [];
  };

  const parseStudentData = async (file: File, content: string): Promise<any[]> => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      return parseCSV(content);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // For Excel files, we would need a library like xlsx
      // For now, we'll ask users to use CSV
      return parseExcel();
    }
    
    return [];
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      // Read file content
      const fileContent = await readFileContent(uploadedFile);
      
      // Parse file based on type
      const students = await parseStudentData(uploadedFile, fileContent);
      
      if (!students || students.length === 0) {
        toast.error('No valid student data found in the file');
        return;
      }
      
      // Validate data before import
      toast.info('Validating student data...');
      const validationResult = await api.validateImportData(students);
      
      if (!validationResult.valid) {
        toast.error(`Validation failed: ${validationResult.message}`);
        if (validationResult.errors && validationResult.errors.length > 0) {
          console.error('Validation errors:', validationResult.errors);
          // Show first 3 errors
          validationResult.errors.slice(0, 3).forEach((error: string) => {
            toast.error(error);
          });
          if (validationResult.errors.length > 3) {
            toast.error(`And ${validationResult.errors.length - 3} more errors...`);
          }
        }
        return;
      }
      
      // Show warnings if any
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        validationResult.warnings.slice(0, 2).forEach((warning: string) => {
          toast.warning(warning);
        });
      }
      
      // Call API to import students
      toast.info(`Importing ${students.length} students...`);
      const result = await api.importStudents({ students, fileName: uploadedFile.name });
      
      if (result.success) {
        toast.success(
          `Successfully imported ${result.imported} students` +
          (result.failed > 0 ? `. ${result.failed} failed.` : '')
        );
        
        // Show error details if any students failed
        if (result.errors && result.errors.length > 0) {
          console.error('Import errors:', result.errors);
          result.errors.slice(0, 3).forEach((error: string) => {
            toast.error(error);
          });
        }
        
        setIsBulkUploadOpen(false);
        setUploadedFile(null);
        loadStudents();
      } else {
        toast.error(result.message || 'Failed to import students');
      }
    } catch (error) {
      toast.error('Failed to import students. Please check your file format.');
      console.error('Bulk import error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Get template from API
      const csvContent = await api.getImportTemplate();
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Template download error:', error);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents((filteredStudents || []).map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const resetNewStudent = () => {
    setNewStudent({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      class: '',
      section: '',
      rollNumber: '',
      dateOfBirth: '',
      address: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      bloodGroup: '',
      gender: 'male',
      religion: '',
      nationality: '',
      emergencyContact: '',
      medicalConditions: '',
      studentId: '',
      previousSchool: '',
      academicYear: new Date().getFullYear().toString(),
      house: '',
      transportRoute: '',
      feeCategory: 'regular'
    });
  };

  const initializeDemoData = async () => {
    try {
      await api.initializeDemoData();
      toast.success('Demo data initialized');
      loadStudents();
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      transferred: { color: 'bg-blue-100 text-blue-800', label: 'Transferred' },
      graduated: { color: 'bg-purple-100 text-purple-800', label: 'Graduated' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAttendancePercentage = (studentId: string) => {
    const records = attendanceRecords.filter(r => r.studentId === studentId);
    if (records.length === 0) return 0;
    const presentDays = records.filter(r => r.status === 'present').length;
    return Math.round((presentDays / records.length) * 100);
  };

  const getAverageGrade = (studentId: string) => {
    const records = academicRecords.filter(r => r.studentId === studentId);
    if (records.length === 0) return 'N/A';
    const totalMarks = records.reduce((sum, r) => sum + (r.marks / r.maxMarks) * 100, 0);
    return Math.round(totalMarks / records.length);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-gray-600">Comprehensive student information system</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Fill in the comprehensive student information below.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="academic">Academic Info</TabsTrigger>
                  <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={newStudent.firstName}
                        onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={newStudent.lastName}
                        onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={newStudent.gender} onValueChange={(value: string) => setNewStudent({...newStudent, gender: value as 'male' | 'female' | 'other'})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={newStudent.dateOfBirth}
                        onChange={(e) => setNewStudent({...newStudent, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select value={newStudent.bloodGroup} onValueChange={(value: string) => setNewStudent({...newStudent, bloodGroup: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={newStudent.address}
                        onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                        placeholder="Enter complete address"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={newStudent.studentId}
                        onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number *</Label>
                      <Input
                        id="rollNumber"
                        value={newStudent.rollNumber}
                        onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})}
                        placeholder="Enter roll number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select value={newStudent.class} onValueChange={(value: string) => setNewStudent({...newStudent, class: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(cls => (
                            <SelectItem key={cls} value={cls}>{cls} Standard</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">Section *</Label>
                      <Select value={newStudent.section} onValueChange={(value: string) => setNewStudent({...newStudent, section: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A', 'B', 'C', 'D', 'E'].map(sec => (
                            <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select value={newStudent.academicYear} onValueChange={(value: string) => setNewStudent({...newStudent, academicYear: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {Array.from({length: 5}, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}-{year + 1}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="house">House</Label>
                      <Select value={newStudent.house} onValueChange={(value: string) => setNewStudent({...newStudent, house: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select house" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="red">Red House</SelectItem>
                          <SelectItem value="blue">Blue House</SelectItem>
                          <SelectItem value="green">Green House</SelectItem>
                          <SelectItem value="yellow">Yellow House</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previousSchool">Previous School</Label>
                      <Input
                        id="previousSchool"
                        value={newStudent.previousSchool}
                        onChange={(e) => setNewStudent({...newStudent, previousSchool: e.target.value})}
                        placeholder="Enter previous school name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feeCategory">Fee Category</Label>
                      <Select value={newStudent.feeCategory} onValueChange={(value: string) => setNewStudent({...newStudent, feeCategory: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="scholarship">Scholarship</SelectItem>
                          <SelectItem value="concession">Concession</SelectItem>
                          <SelectItem value="staff_ward">Staff Ward</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="parent" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                      <Input
                        id="parentName"
                        value={newStudent.parentName}
                        onChange={(e) => setNewStudent({...newStudent, parentName: e.target.value})}
                        placeholder="Enter parent name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentPhone">Parent Phone *</Label>
                      <Input
                        id="parentPhone"
                        value={newStudent.parentPhone}
                        onChange={(e) => setNewStudent({...newStudent, parentPhone: e.target.value})}
                        placeholder="Enter parent phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail">Parent Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={newStudent.parentEmail}
                        onChange={(e) => setNewStudent({...newStudent, parentEmail: e.target.value})}
                        placeholder="Enter parent email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={newStudent.emergencyContact}
                        onChange={(e) => setNewStudent({...newStudent, emergencyContact: e.target.value})}
                        placeholder="Enter emergency contact"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transportRoute">Transport Route</Label>
                      <Select value={newStudent.transportRoute} onValueChange={(value: string) => setNewStudent({...newStudent, transportRoute: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport route" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="route1">Route 1 - City Center</SelectItem>
                          <SelectItem value="route2">Route 2 - Suburbs</SelectItem>
                          <SelectItem value="route3">Route 3 - East District</SelectItem>
                          <SelectItem value="route4">Route 4 - West District</SelectItem>
                          <SelectItem value="none">No Transport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Student Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                        placeholder="Enter student email"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="medicalConditions">Medical Conditions / Allergies</Label>
                      <Textarea
                        id="medicalConditions"
                        value={newStudent.medicalConditions}
                        onChange={(e) => setNewStudent({...newStudent, medicalConditions: e.target.value})}
                        placeholder="Enter any medical conditions or allergies"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStudent}>
                  Add Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{filteredStudents?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {(filteredStudents || []).filter(s => s?.status === 'active').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Classes</p>
                <p className="text-2xl font-bold">
                  {new Set((filteredStudents || []).map(s => s?.class).filter(Boolean)).size}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(filteredStudents || []).filter(s => {
                    if (!s?.admissionDate) return false;
                    const admissionDate = new Date(s.admissionDate);
                    const currentMonth = new Date();
                    return admissionDate.getMonth() === currentMonth.getMonth() && 
                           admissionDate.getFullYear() === currentMonth.getFullYear();
                  }).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search & Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              {showAdvancedFilters ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, roll number, student ID, or parent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                <Select value={selectedClass || "all"} onValueChange={(value: string) => setSelectedClass(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="all">All Classes</SelectItem>
                    {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(cls => (
                      <SelectItem key={cls} value={cls}>{cls} Standard</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSection || "all"} onValueChange={(value: string) => setSelectedSection(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {['A', 'B', 'C', 'D', 'E'].map(sec => (
                      <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus || "all"} onValueChange={(value: string) => setSelectedStatus(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedGender || "all"} onValueChange={(value: string) => setSelectedGender(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedHouse || "all"} onValueChange={(value: string) => setSelectedHouse(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Houses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Houses</SelectItem>
                    <SelectItem value="red">Red House</SelectItem>
                    <SelectItem value="blue">Blue House</SelectItem>
                    <SelectItem value="green">Green House</SelectItem>
                    <SelectItem value="yellow">Yellow House</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedStudents.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{selectedStudents.length} students selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsPromoteDialogOpen(true)}>
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Promote
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport('excel')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Selected
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Students ({filteredStudents?.length || 0})</CardTitle>
            <div className="flex items-center gap-2">
              {students.length === 0 && (
                <Button onClick={initializeDemoData} variant="outline" size="sm">
                  Load Demo Data
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setLoading(true);
                  loadStudents().finally(() => setLoading(false));
                }}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile Card View */}
          <div className="block sm:hidden p-4 space-y-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked: boolean) => handleSelectStudent(student.id, checked)}
                    />
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {student.profilePhoto ? (
                        <img
                          src={student.profilePhoto}
                          alt={`${student.firstName || ''} ${student.lastName || ''}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {(student.firstName || '?')[0]}{(student.lastName || '?')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-muted-foreground">ID: {student.studentId || student.rollNumber}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Class</p>
                      <p className="font-medium">{student.class} - {student.section}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Age</p>
                      <p className="font-medium">{calculateAge(student.dateOfBirth)} years</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm">Parent</p>
                    <p className="font-medium">{student.parentName}</p>
                    <p className="text-sm text-muted-foreground">{student.parentPhone}</p>
                  </div>
                  
                  <div className="flex gap-1 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewStudent(student)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditClick(student)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block table-responsive">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredStudents || []).map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked: boolean) => handleSelectStudent(student.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div>{student.studentId || student.rollNumber}</div>
                        <div className="text-xs text-gray-500">Roll: {student.rollNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {student.profilePhoto ? (
                            <img
                              src={student.profilePhoto}
                              alt={`${student.firstName || ''} ${student.lastName || ''}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {(student.firstName || '?')[0]}{(student.lastName || '?')[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{student.firstName} {student.lastName}</div>
                          {student.email && <div className="text-sm text-gray-500">{student.email}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{student.class} - {student.section}</div>
                        {student.house && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {student.house} House
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{student.parentName}</div>
                        {student.parentEmail && (
                          <div className="text-sm text-gray-500">{student.parentEmail}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{student.parentPhone}</div>
                        {student.phone && (
                          <div className="text-sm text-gray-500">S: {student.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>{calculateAge(student.dateOfBirth)} years</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewStudent(student)}
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditClick(student)}
                          title="Edit Student"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                          title="Delete Student"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredStudents || filteredStudents.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-gray-300" />
                        <div>No students found</div>
                        <div className="text-sm">Try adjusting your search criteria</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                {selectedStudent?.firstName && selectedStudent?.lastName && (
                  <span className="text-lg font-medium">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </span>
                )}
              </div>
              <div>
                <div>{selectedStudent?.firstName} {selectedStudent?.lastName}</div>
                <div className="text-sm text-gray-500">
                  {selectedStudent?.studentId} • {selectedStudent?.class}-{selectedStudent?.section}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Full Name</label>
                          <p className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Gender</label>
                          <p className="capitalize">{selectedStudent.gender}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Date of Birth</label>
                          <p>{selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Age</label>
                          <p>{calculateAge(selectedStudent.dateOfBirth)} years</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Blood Group</label>
                          <p>{selectedStudent.bloodGroup || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <p>{selectedStudent.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      {selectedStudent.address && (
                        <div>
                          <label className="text-sm text-gray-600">Address</label>
                          <p>{selectedStudent.address}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Parent/Guardian Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Parent/Guardian Name</label>
                        <p className="font-medium">{selectedStudent.parentName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Parent Phone</label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p>{selectedStudent.parentPhone}</p>
                        </div>
                      </div>
                      {selectedStudent.parentEmail && (
                        <div>
                          <label className="text-sm text-gray-600">Parent Email</label>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <p>{selectedStudent.parentEmail}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="academic" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Academic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Student ID</label>
                          <p className="font-medium">{selectedStudent.studentId}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Roll Number</label>
                          <p className="font-medium">{selectedStudent.rollNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Class & Section</label>
                          <p>{selectedStudent.class} - {selectedStudent.section}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Status</label>
                          <div className="mt-1">
                            <Badge className={selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {selectedStudent.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Average Grade</label>
                          <p className="text-2xl font-bold text-blue-600">{getAverageGrade(selectedStudent.id)}%</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Attendance</label>
                          <p className="text-2xl font-bold text-green-600">{getAttendancePercentage(selectedStudent.id)}%</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Academic Performance</span>
                            <span>{getAverageGrade(selectedStudent.id)}%</span>
                          </div>
                          <Progress value={parseInt(getAverageGrade(selectedStudent.id).toString())} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Attendance Rate</span>
                            <span>{getAttendancePercentage(selectedStudent.id)}%</span>
                          </div>
                          <Progress value={getAttendancePercentage(selectedStudent.id)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {academicRecords.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Academic Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Marks</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {academicRecords.slice(0, 5).map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{record.subject}</TableCell>
                              <TableCell>{record.term}</TableCell>
                              <TableCell>{record.marks}/{record.maxMarks}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{record.grade}</Badge>
                              </TableCell>
                              <TableCell>{record.percentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="attendance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {attendanceRecords.filter(r => r.status === 'present').length}
                        </p>
                        <p className="text-sm text-gray-600">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {attendanceRecords.filter(r => r.status === 'absent').length}
                        </p>
                        <p className="text-sm text-gray-600">Absent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {attendanceRecords.filter(r => r.status === 'late').length}
                        </p>
                        <p className="text-sm text-gray-600">Late</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{getAttendancePercentage(selectedStudent.id)}%</p>
                        <p className="text-sm text-gray-600">Overall</p>
                      </div>
                    </div>

                    {attendanceRecords.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Subject</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceRecords.slice(0, 10).map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    record.status === 'present' ? 'bg-green-100 text-green-800' :
                                    record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.subject || 'General'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      Student Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {achievements.length > 0 ? (
                      <div className="space-y-4">
                        {achievements.map((achievement) => (
                          <div key={achievement.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{achievement.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="capitalize">
                                    {achievement.category}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {achievement.level}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {new Date(achievement.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Award className="h-8 w-8 text-yellow-600" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p>No achievements recorded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="disciplinary" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      Disciplinary Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {disciplinaryRecords.length > 0 ? (
                      <div className="space-y-4">
                        {disciplinaryRecords.map((record) => (
                          <div key={record.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className={
                                      record.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                      record.type === 'suspension' ? 'bg-red-100 text-red-800' :
                                      'bg-red-100 text-red-800'
                                    }
                                  >
                                    {record.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {new Date(record.date).toLocaleDateString()}
                                  </span>
                                  <Badge variant={record.status === 'resolved' ? 'default' : 'destructive'}>
                                    {record.status}
                                  </Badge>
                                </div>
                                <p className="font-medium mb-1">{record.description}</p>
                                <p className="text-sm text-gray-600">Action: {record.actionTaken}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p>No disciplinary records</p>
                        <p className="text-sm">Student has a clean record</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Student Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">Profile Photo</span>
                        </div>
                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <Camera className="h-8 w-8" />
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">Transfer Certificate</span>
                        </div>
                        <p className="text-sm text-gray-500">Not uploaded</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Quick Actions</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Upload Document
                        </Button>
                        <Button variant="outline" size="sm">
                          Generate Report Card
                        </Button>
                        <Button variant="outline" size="sm">
                          Export Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedStudent) {
                handleEditClick(selectedStudent);
              }
            }}>
              Edit Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog - Enhanced */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student information below.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="academic">Academic Info</TabsTrigger>
                <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">First Name *</Label>
                    <Input
                      id="edit-firstName"
                      value={selectedStudent.firstName}
                      onChange={(e) => setSelectedStudent({...selectedStudent, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Last Name *</Label>
                    <Input
                      id="edit-lastName"
                      value={selectedStudent.lastName}
                      onChange={(e) => setSelectedStudent({...selectedStudent, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select value={selectedStudent.gender} onValueChange={(value: string) => setSelectedStudent({...selectedStudent, gender: value as 'male' | 'female' | 'other'})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                    <Input
                      id="edit-dateOfBirth"
                      type="date"
                      value={selectedStudent.dateOfBirth}
                      onChange={(e) => setSelectedStudent({...selectedStudent, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-bloodGroup">Blood Group</Label>
                    <Select value={selectedStudent.bloodGroup} onValueChange={(value: string) => setSelectedStudent({...selectedStudent, bloodGroup: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Textarea
                      id="edit-address"
                      value={selectedStudent.address}
                      onChange={(e) => setSelectedStudent({...selectedStudent, address: e.target.value})}
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="academic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-class">Class *</Label>
                    <Select value={selectedStudent.class} onValueChange={(value: string) => setSelectedStudent({...selectedStudent, class: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(cls => (
                          <SelectItem key={cls} value={cls}>{cls} Standard</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-section">Section *</Label>
                    <Select value={selectedStudent.section} onValueChange={(value: string) => setSelectedStudent({...selectedStudent, section: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A', 'B', 'C', 'D', 'E'].map(sec => (
                          <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rollNumber">Roll Number *</Label>
                    <Input
                      id="edit-rollNumber"
                      value={selectedStudent.rollNumber}
                      onChange={(e) => setSelectedStudent({...selectedStudent, rollNumber: e.target.value})}
                      placeholder="Enter roll number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={selectedStudent.status} onValueChange={(value: string) => setSelectedStudent({...selectedStudent, status: value as 'active' | 'inactive' | 'transferred' | 'graduated'})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="transferred">Transferred</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="parent" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-parentName">Parent/Guardian Name</Label>
                    <Input
                      id="edit-parentName"
                      value={selectedStudent.parentName}
                      onChange={(e) => setSelectedStudent({...selectedStudent, parentName: e.target.value})}
                      placeholder="Enter parent name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-parentPhone">Parent Phone</Label>
                    <Input
                      id="edit-parentPhone"
                      value={selectedStudent.parentPhone}
                      onChange={(e) => setSelectedStudent({...selectedStudent, parentPhone: e.target.value})}
                      placeholder="Enter parent phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-parentEmail">Parent Email</Label>
                    <Input
                      id="edit-parentEmail"
                      type="email"
                      value={selectedStudent.parentEmail || ''}
                      onChange={(e) => setSelectedStudent({...selectedStudent, parentEmail: e.target.value})}
                      placeholder="Enter parent email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
                    <Input
                      id="edit-emergencyContact"
                      value={selectedStudent.emergencyContact || ''}
                      onChange={(e) => setSelectedStudent({...selectedStudent, emergencyContact: e.target.value})}
                      placeholder="Enter emergency contact"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-house">House</Label>
                    <Select value={selectedStudent.house} onValueChange={(value: string) => setSelectedStudent({...selectedStudent, house: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select house" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">Red House</SelectItem>
                        <SelectItem value="blue">Blue House</SelectItem>
                        <SelectItem value="green">Green House</SelectItem>
                        <SelectItem value="yellow">Yellow House</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-transportRoute">Transport Route</Label>
                    <Select value={selectedStudent.transportRoute} onValueChange={(value: string) => setSelectedStudent({...selectedStudent, transportRoute: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport route" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="route1">Route 1 - City Center</SelectItem>
                        <SelectItem value="route2">Route 2 - Suburbs</SelectItem>
                        <SelectItem value="route3">Route 3 - East District</SelectItem>
                        <SelectItem value="route4">Route 4 - West District</SelectItem>
                        <SelectItem value="none">No Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-medicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="edit-medicalConditions"
                      value={selectedStudent.medicalConditions || ''}
                      onChange={(e) => setSelectedStudent({...selectedStudent, medicalConditions: e.target.value})}
                      placeholder="Enter any medical conditions"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent}>
              Update Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promote Students Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Students</DialogTitle>
            <DialogDescription>
              Promote {selectedStudents.length} selected students to the next class.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action will move students to the next academic level. This cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePromoteStudents}>
                Confirm Promotion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={(open: boolean) => {
        setIsBulkUploadOpen(open);
        if (!open) {
          setUploadedFile(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Students</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to import multiple students at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFileSelect(event);
                }
              }}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {uploadedFile ? (
                <div>
                  <p className="text-lg font-medium text-green-600 mb-2">File Selected!</p>
                  <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">({(uploadedFile.size / 1024).toFixed(2)} KB)</p>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">Drop your file here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                  <Button variant="outline" onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    document.getElementById('file-upload')?.click();
                  }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Import Guidelines:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Required columns: First Name, Last Name, Class, Section, Roll Number</li>
                <li>• Optional columns: Date of Birth, Gender, Parent Name, Parent Phone, Email, Address</li>
                <li>• Download sample template for reference</li>
              </ul>
            </div>
            
            {uploadedFile && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ready to import from: <strong>{uploadedFile.name}</strong>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsBulkUploadOpen(false);
                    setUploadedFile(null);
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkUpload}
                  disabled={!uploadedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Students
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
