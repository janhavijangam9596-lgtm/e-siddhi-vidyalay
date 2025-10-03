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


interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employeeId: string;
  dateOfBirth: string;
  address: string;
  joiningDate: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  bloodGroup?: string;
  gender: 'male' | 'female' | 'other';
  religion?: string;
  nationality?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  profilePhoto?: string;
  salary?: number;
  qualification?: string;
  experience?: number;
  subjects?: string[];
  created_at: string;
  updated_at?: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | string;
  markedBy?: string;
  markedAt?: string;
  remarks?: string;
  workingHours?: number;
  overtime?: number;
  created_at?: string;
}

interface LeaveRecord {
  id: string;
  staffId: string;
  leaveType: 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  days: number;
}

export function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Bulk operations
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    employeeId: '',
    dateOfBirth: '',
    address: '',
    joiningDate: '',
    bloodGroup: '',
    gender: 'male' as 'male' | 'female' | 'other',
    religion: '',
    nationality: '',
    emergencyContact: '',
    medicalConditions: '',
    salary: '',
    qualification: '',
    experience: '',
    subjects: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [staff, searchTerm, selectedDepartment, selectedDesignation, selectedStatus, selectedGender]);

  const loadStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaff(data);
      setFilteredStaff(data);
      // Store in localStorage for persistence
      localStorage.setItem('staff', JSON.stringify(data));
    } catch (error) {
      toast.error('Failed to load staff from server, using local data');
      // Try to load from localStorage first
      const storedStaff = localStorage.getItem('staff');
      if (storedStaff) {
        const parsedStaff = JSON.parse(storedStaff);
        setStaff(parsedStaff);
        setFilteredStaff(parsedStaff);
      } else {
        // Use demo data if no localStorage
        const demoStaff: Staff[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@school.edu',
            phone: '+91 98765 43210',
            department: 'Mathematics',
            designation: 'Teacher',
            employeeId: 'EMP001',
            dateOfBirth: '1985-05-15',
            address: '123 Main St, City',
            joiningDate: '2010-04-01',
            status: 'active',
            bloodGroup: 'O+',
            gender: 'male',
            qualification: 'M.Sc. Mathematics',
            experience: 14,
            subjects: ['Mathematics', 'Statistics'],
            salary: 45000,
            created_at: '2010-04-01'
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Johnson',
            email: 'jane.johnson@school.edu',
            phone: '+91 98765 43211',
            department: 'English',
            designation: 'Teacher',
            employeeId: 'EMP002',
            dateOfBirth: '1988-08-20',
            address: '456 Oak Ave, City',
            joiningDate: '2012-04-01',
            status: 'active',
            bloodGroup: 'A+',
            gender: 'female',
            qualification: 'M.A. English Literature',
            experience: 12,
            subjects: ['English', 'Literature'],
            salary: 42000,
            created_at: '2012-04-01'
          },
          {
            id: '3',
            firstName: 'Mike',
            lastName: 'Williams',
            email: 'mike.williams@school.edu',
            phone: '+91 98765 43212',
            department: 'Science',
            designation: 'Lab Assistant',
            employeeId: 'EMP003',
            dateOfBirth: '1990-01-10',
            address: '789 Pine Rd, City',
            joiningDate: '2015-04-01',
            status: 'active',
            bloodGroup: 'B+',
            gender: 'male',
            qualification: 'B.Sc. Chemistry',
            experience: 9,
            subjects: ['Chemistry'],
            salary: 25000,
            created_at: '2015-04-01'
          }
        ];
        setStaff(demoStaff);
        setFilteredStaff(demoStaff);
        localStorage.setItem('staff', JSON.stringify(demoStaff));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStaffDetails = async (staffId: string) => {
    try {
      const [attendance, leaves] = await Promise.all([
        api.getStaffAttendance?.({}) || [],
        api.getStaffLeaves?.() || []
      ]);

      setAttendanceRecords(attendance.filter((r: AttendanceRecord) => r.staffId === staffId));
      setLeaveRecords(leaves.filter((l: LeaveRecord) => l.staffId === staffId));
    } catch (error) {
      console.error('Failed to load staff details:', error);
    }
  };

  const applyFilters = () => {
    if (!staff || !Array.isArray(staff)) {
      setFilteredStaff([]);
      return;
    }

    let filtered = staff.filter(staffMember => {
      if (!staffMember) return false;

      const matchesSearch = searchTerm === '' || (
        (staffMember.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staffMember.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staffMember.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staffMember.department || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDepartment = selectedDepartment === '' || staffMember.department === selectedDepartment;
      const matchesDesignation = selectedDesignation === '' || staffMember.designation === selectedDesignation;
      const matchesStatus = selectedStatus === '' || staffMember.status === selectedStatus;
      const matchesGender = selectedGender === '' || staffMember.gender === selectedGender;

      return matchesSearch && matchesDepartment && matchesDesignation && matchesStatus && matchesGender;
    });

    setFilteredStaff(filtered || []);
  };

  const handleAddStaff = async () => {
    try {
      // Enhanced validation
      const requiredFields = ['firstName', 'lastName', 'department', 'designation', 'employeeId'];
      const missingFields = requiredFields.filter(field => !newStaff[field as keyof typeof newStaff]);

      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Check for duplicate employee ID
      const duplicateEmpId = staff.find(s => s.employeeId === newStaff.employeeId);
      if (duplicateEmpId) {
        toast.error('Employee ID already exists');
        return;
      }

      const staffData: Staff = {
        ...newStaff,
        id: `local-${Date.now()}`,
        status: 'active' as const,
        joiningDate: newStaff.joiningDate || new Date().toISOString().split('T')[0],
        employeeId: newStaff.employeeId,
        salary: newStaff.salary ? parseFloat(newStaff.salary) : undefined,
        experience: newStaff.experience ? parseInt(newStaff.experience) : undefined,
        subjects: newStaff.subjects ? newStaff.subjects.split(',').map(s => s.trim()) : [],
        created_at: new Date().toISOString()
      };

      // Try to save to API first
      try {
        await api.createStaff(staffData);
      } catch (apiError) {
        console.warn('API save failed, saving locally:', apiError);
      }

      // Add to local state and localStorage
      const updatedStaff = [...staff, staffData];
      setStaff(updatedStaff);
      setFilteredStaff(updatedStaff);
      localStorage.setItem('staff', JSON.stringify(updatedStaff));

      toast.success('Staff member added successfully');
      setIsAddDialogOpen(false);
      resetNewStaff();
    } catch (error) {
      toast.error('Failed to add staff member');
      console.error(error);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    try {
      // Try to update via API first
      try {
        await api.updateStaff(selectedStaff.id, selectedStaff);
      } catch (apiError) {
        console.warn('API update failed, updating locally:', apiError);
      }

      // Update in local state and localStorage
      const updatedStaff = staff.map(s => s.id === selectedStaff.id ? selectedStaff : s);
      setStaff(updatedStaff);
      setFilteredStaff(updatedStaff);
      localStorage.setItem('staff', JSON.stringify(updatedStaff));

      toast.success('Staff member updated successfully');
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      toast.error('Failed to update staff member');
      console.error(error);
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Try to delete via API first
      try {
        await api.deleteStaff(staffId);
      } catch (apiError) {
        console.warn('API delete failed, deleting locally:', apiError);
      }

      // Remove from local state and localStorage
      const updatedStaff = staff.filter(s => s.id !== staffId);
      setStaff(updatedStaff);
      setFilteredStaff(updatedStaff);
      localStorage.setItem('staff', JSON.stringify(updatedStaff));

      toast.success('Staff member deleted successfully');
    } catch (error) {
      toast.error('Failed to delete staff member');
      console.error(error);
    }
  };

  const handleViewStaff = async (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    await loadStaffDetails(staffMember.id);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (staffMember: Staff) => {
    setSelectedStaff({ ...staffMember });
    setIsEditDialogOpen(true);
  };

  const handleSelectStaff = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaffIds(prev => [...prev, staffId]);
    } else {
      setSelectedStaffIds(prev => prev.filter(id => id !== staffId));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStaffIds((filteredStaff || []).map(s => s.id));
    } else {
      setSelectedStaffIds([]);
    }
  };

  const resetNewStaff = () => {
    setNewStaff({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      employeeId: '',
      dateOfBirth: '',
      address: '',
      joiningDate: '',
      bloodGroup: '',
      gender: 'male',
      religion: '',
      nationality: '',
      emergencyContact: '',
      medicalConditions: '',
      salary: '',
      qualification: '',
      experience: '',
      subjects: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      terminated: { color: 'bg-red-100 text-red-800', label: 'Terminated' },
      on_leave: { color: 'bg-blue-100 text-blue-800', label: 'On Leave' }
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

  const getAttendancePercentage = (staffId: string) => {
    const records = attendanceRecords.filter(r => r.staffId === staffId);
    if (records.length === 0) return 0;
    const presentDays = records.filter(r => r.status === 'present').length;
    return Math.round((presentDays / records.length) * 100);
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
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-gray-600">Comprehensive staff information system</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Fill in the comprehensive staff information below.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="professional">Professional Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={newStaff.firstName}
                        onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={newStaff.lastName}
                        onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={newStaff.gender} onValueChange={(value: string) => setNewStaff({...newStaff, gender: value as 'male' | 'female' | 'other'})}>
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
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={newStaff.dateOfBirth}
                        onChange={(e) => setNewStaff({...newStaff, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select value={newStaff.bloodGroup} onValueChange={(value: string) => setNewStaff({...newStaff, bloodGroup: value})}>
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
                        value={newStaff.address}
                        onChange={(e) => setNewStaff({...newStaff, address: e.target.value})}
                        placeholder="Enter complete address"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="professional" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        value={newStaff.employeeId}
                        onChange={(e) => setNewStaff({...newStaff, employeeId: e.target.value})}
                        placeholder="Enter employee ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Select value={newStaff.department} onValueChange={(value: string) => setNewStaff({...newStaff, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Social Studies">Social Studies</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Physical Education">Physical Education</SelectItem>
                          <SelectItem value="Art">Art</SelectItem>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="Accounts">Accounts</SelectItem>
                          <SelectItem value="Library">Library</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Select value={newStaff.designation} onValueChange={(value: string) => setNewStaff({...newStaff, designation: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Principal">Principal</SelectItem>
                          <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                          <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                          <SelectItem value="Teacher">Teacher</SelectItem>
                          <SelectItem value="Subject Teacher">Subject Teacher</SelectItem>
                          <SelectItem value="Lab Assistant">Lab Assistant</SelectItem>
                          <SelectItem value="Librarian">Librarian</SelectItem>
                          <SelectItem value="Accountant">Accountant</SelectItem>
                          <SelectItem value="Clerk">Clerk</SelectItem>
                          <SelectItem value="Peon">Peon</SelectItem>
                          <SelectItem value="Security Guard">Security Guard</SelectItem>
                          <SelectItem value="Maintenance Staff">Maintenance Staff</SelectItem>
                          <SelectItem value="Driver">Driver</SelectItem>
                          <SelectItem value="Conductor">Conductor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joiningDate">Joining Date</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        value={newStaff.joiningDate}
                        onChange={(e) => setNewStaff({...newStaff, joiningDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input
                        id="qualification"
                        value={newStaff.qualification}
                        onChange={(e) => setNewStaff({...newStaff, qualification: e.target.value})}
                        placeholder="Enter qualification"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience (years)</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={newStaff.experience}
                        onChange={(e) => setNewStaff({...newStaff, experience: e.target.value})}
                        placeholder="Enter years of experience"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Monthly Salary</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={newStaff.salary}
                        onChange={(e) => setNewStaff({...newStaff, salary: e.target.value})}
                        placeholder="Enter monthly salary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjects">Subjects (comma separated)</Label>
                      <Input
                        id="subjects"
                        value={newStaff.subjects}
                        onChange={(e) => setNewStaff({...newStaff, subjects: e.target.value})}
                        placeholder="Enter subjects taught"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={newStaff.emergencyContact}
                        onChange={(e) => setNewStaff({...newStaff, emergencyContact: e.target.value})}
                        placeholder="Enter emergency contact"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <Input
                        id="religion"
                        value={newStaff.religion}
                        onChange={(e) => setNewStaff({...newStaff, religion: e.target.value})}
                        placeholder="Enter religion"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={newStaff.nationality}
                        onChange={(e) => setNewStaff({...newStaff, nationality: e.target.value})}
                        placeholder="Enter nationality"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Textarea
                        id="medicalConditions"
                        value={newStaff.medicalConditions}
                        onChange={(e) => setNewStaff({...newStaff, medicalConditions: e.target.value})}
                        placeholder="Enter any medical conditions"
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
                <Button onClick={handleAddStaff}>
                  Add Staff Member
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
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{filteredStaff?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold text-green-600">
                  {(filteredStaff || []).filter(s => s?.status === 'active').length}
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
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">
                  {new Set((filteredStaff || []).map(s => s?.department).filter(Boolean)).size}
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
                <p className="text-sm font-medium text-muted-foreground">Teachers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(filteredStaff || []).filter(s => s?.designation?.includes('Teacher')).length}
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
                placeholder="Search by name, employee ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                <Select value={selectedDepartment || "all"} onValueChange={(value: string) => setSelectedDepartment(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Physical Education">Physical Education</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Accounts">Accounts</SelectItem>
                    <SelectItem value="Library">Library</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDesignation || "all"} onValueChange={(value: string) => setSelectedDesignation(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Designations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Designations</SelectItem>
                    <SelectItem value="Principal">Principal</SelectItem>
                    <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                    <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Subject Teacher">Subject Teacher</SelectItem>
                    <SelectItem value="Lab Assistant">Lab Assistant</SelectItem>
                    <SelectItem value="Librarian">Librarian</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="Clerk">Clerk</SelectItem>
                    <SelectItem value="Peon">Peon</SelectItem>
                    <SelectItem value="Security Guard">Security Guard</SelectItem>
                    <SelectItem value="Maintenance Staff">Maintenance Staff</SelectItem>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="Conductor">Conductor</SelectItem>
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
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedStaffIds.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{selectedStaffIds.length} staff members selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Selected
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Members ({filteredStaff?.length || 0})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  loadStaff().finally(() => setLoading(false));
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
            {filteredStaff.map((staffMember) => (
              <Card key={staffMember.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedStaffIds.includes(staffMember.id)}
                      onCheckedChange={(checked: boolean) => handleSelectStaff(staffMember.id, checked)}
                    />
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {staffMember.profilePhoto ? (
                        <img
                          src={staffMember.profilePhoto}
                          alt={`${staffMember.firstName || ''} ${staffMember.lastName || ''}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {(staffMember.firstName || '?')[0]}{(staffMember.lastName || '?')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(staffMember.status)}
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{staffMember.firstName} {staffMember.lastName}</p>
                    <p className="text-sm text-muted-foreground">ID: {staffMember.employeeId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{staffMember.department}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Designation</p>
                      <p className="font-medium">{staffMember.designation}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Contact</p>
                    <p className="font-medium">{staffMember.phone}</p>
                    <p className="text-sm text-muted-foreground">{staffMember.email}</p>
                  </div>

                  <div className="flex gap-1 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewStaff(staffMember)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditClick(staffMember)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteStaff(staffMember.id, `${staffMember.firstName} ${staffMember.lastName}`)}
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
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredStaff || []).map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStaffIds.includes(staffMember.id)}
                        onCheckedChange={(checked: boolean) => handleSelectStaff(staffMember.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div>{staffMember.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {staffMember.profilePhoto ? (
                            <img
                              src={staffMember.profilePhoto}
                              alt={`${staffMember.firstName || ''} ${staffMember.lastName || ''}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {(staffMember.firstName || '?')[0]}{(staffMember.lastName || '?')[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{staffMember.firstName} {staffMember.lastName}</div>
                          {staffMember.email && <div className="text-sm text-gray-500">{staffMember.email}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{staffMember.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{staffMember.designation}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{staffMember.phone}</div>
                        {staffMember.email && (
                          <div className="text-sm text-gray-500">{staffMember.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(staffMember.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStaff(staffMember)}
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(staffMember)}
                          title="Edit Staff"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteStaff(staffMember.id, `${staffMember.firstName} ${staffMember.lastName}`)}
                          title="Delete Staff"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredStaff || filteredStaff.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-gray-300" />
                        <div>No staff members found</div>
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

      {/* View Staff Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                {selectedStaff?.firstName && selectedStaff?.lastName && (
                  <span className="text-lg font-medium">
                    {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
                  </span>
                )}
              </div>
              <div>
                <div>{selectedStaff?.firstName} {selectedStaff?.lastName}</div>
                <div className="text-sm text-gray-500">
                  {selectedStaff?.employeeId} • {selectedStaff?.department}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedStaff && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
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
                          <p className="font-medium">{selectedStaff.firstName} {selectedStaff.lastName}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Gender</label>
                          <p className="capitalize">{selectedStaff.gender}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Date of Birth</label>
                          <p>{selectedStaff.dateOfBirth ? new Date(selectedStaff.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Age</label>
                          <p>{calculateAge(selectedStaff.dateOfBirth)} years</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Blood Group</label>
                          <p>{selectedStaff.bloodGroup || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <p>{selectedStaff.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      {selectedStaff.address && (
                        <div>
                          <label className="text-sm text-gray-600">Address</label>
                          <p>{selectedStaff.address}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p>{selectedStaff.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p>{selectedStaff.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      {selectedStaff.emergencyContact && (
                        <div>
                          <label className="text-sm text-gray-600">Emergency Contact</label>
                          <p>{selectedStaff.emergencyContact}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="professional" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Employee ID</label>
                          <p className="font-medium">{selectedStaff.employeeId}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Department</label>
                          <p>{selectedStaff.department}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Designation</label>
                          <p>{selectedStaff.designation}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Status</label>
                          <div className="mt-1">
                            {getStatusBadge(selectedStaff.status)}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Joining Date</label>
                          <p>{selectedStaff.joiningDate ? new Date(selectedStaff.joiningDate).toLocaleDateString() : 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Experience</label>
                          <p>{selectedStaff.experience ? `${selectedStaff.experience} years` : 'Not provided'}</p>
                        </div>
                      </div>
                      {selectedStaff.qualification && (
                        <div>
                          <label className="text-sm text-gray-600">Qualification</label>
                          <p>{selectedStaff.qualification}</p>
                        </div>
                      )}
                      {selectedStaff.subjects && selectedStaff.subjects.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-600">Subjects</label>
                          <p>{selectedStaff.subjects.join(', ')}</p>
                        </div>
                      )}
                      {selectedStaff.salary && (
                        <div>
                          <label className="text-sm text-gray-600">Monthly Salary</label>
                          <p className="font-medium">₹{selectedStaff.salary.toLocaleString()}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Attendance Rate</label>
                          <p className="text-2xl font-bold text-green-600">{getAttendancePercentage(selectedStaff.id)}%</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Experience Level</label>
                          <p className="text-2xl font-bold text-blue-600">{selectedStaff.experience || 0} yrs</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Attendance Rate</span>
                            <span>{getAttendancePercentage(selectedStaff.id)}%</span>
                          </div>
                          <Progress value={getAttendancePercentage(selectedStaff.id)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                        <p className="text-2xl font-bold text-blue-600">{getAttendancePercentage(selectedStaff.id)}%</p>
                        <p className="text-sm text-gray-600">Overall</p>
                      </div>
                    </div>

                    {attendanceRecords.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Working Hours</TableHead>
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
                              <TableCell>{record.checkInTime || '-'}</TableCell>
                              <TableCell>{record.checkOutTime || '-'}</TableCell>
                              <TableCell>{record.workingHours ? `${record.workingHours}h` : '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Staff Documents
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
                          <span className="font-medium">ID Proof</span>
                        </div>
                        <p className="text-sm text-gray-500">Not uploaded</p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">Qualification Certificates</span>
                        </div>
                        <p className="text-sm text-gray-500">Not uploaded</p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">Experience Letters</span>
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
                          Generate Report
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
              if (selectedStaff) {
                handleEditClick(selectedStaff);
              }
            }}>
              Edit Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the staff information below.
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="professional">Professional Info</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">First Name *</Label>
                    <Input
                      id="edit-firstName"
                      value={selectedStaff.firstName}
                      onChange={(e) => setSelectedStaff({...selectedStaff, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Last Name *</Label>
                    <Input
                      id="edit-lastName"
                      value={selectedStaff.lastName}
                      onChange={(e) => setSelectedStaff({...selectedStaff, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select value={selectedStaff.gender} onValueChange={(value: string) => setSelectedStaff({...selectedStaff, gender: value as 'male' | 'female' | 'other'})}>
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
                      value={selectedStaff.dateOfBirth}
                      onChange={(e) => setSelectedStaff({...selectedStaff, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-bloodGroup">Blood Group</Label>
                    <Select value={selectedStaff.bloodGroup} onValueChange={(value: string) => setSelectedStaff({...selectedStaff, bloodGroup: value})}>
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
                      value={selectedStaff.address}
                      onChange={(e) => setSelectedStaff({...selectedStaff, address: e.target.value})}
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="professional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department *</Label>
                    <Select value={selectedStaff.department} onValueChange={(value: string) => setSelectedStaff({...selectedStaff, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Physical Education">Physical Education</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Accounts">Accounts</SelectItem>
                        <SelectItem value="Library">Library</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-designation">Designation *</Label>
                    <Select value={selectedStaff.designation} onValueChange={(value: string) => setSelectedStaff({...selectedStaff, designation: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Principal">Principal</SelectItem>
                        <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                        <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Subject Teacher">Subject Teacher</SelectItem>
                        <SelectItem value="Lab Assistant">Lab Assistant</SelectItem>
                        <SelectItem value="Librarian">Librarian</SelectItem>
                        <SelectItem value="Accountant">Accountant</SelectItem>
                        <SelectItem value="Clerk">Clerk</SelectItem>
                        <SelectItem value="Peon">Peon</SelectItem>
                        <SelectItem value="Security Guard">Security Guard</SelectItem>
                        <SelectItem value="Maintenance Staff">Maintenance Staff</SelectItem>
                        <SelectItem value="Driver">Driver</SelectItem>
                        <SelectItem value="Conductor">Conductor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={selectedStaff.status} onValueChange={(value: string) => setSelectedStaff({...selectedStaff, status: value as 'active' | 'inactive' | 'terminated' | 'on_leave'})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-qualification">Qualification</Label>
                    <Input
                      id="edit-qualification"
                      value={selectedStaff.qualification || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, qualification: e.target.value})}
                      placeholder="Enter qualification"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-experience">Experience (years)</Label>
                    <Input
                      id="edit-experience"
                      type="number"
                      value={selectedStaff.experience || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, experience: parseInt(e.target.value) || undefined})}
                      placeholder="Enter years of experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salary">Monthly Salary</Label>
                    <Input
                      id="edit-salary"
                      type="number"
                      value={selectedStaff.salary || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, salary: parseFloat(e.target.value) || undefined})}
                      placeholder="Enter monthly salary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subjects">Subjects (comma separated)</Label>
                    <Input
                      id="edit-subjects"
                      value={selectedStaff.subjects ? selectedStaff.subjects.join(', ') : ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                      placeholder="Enter subjects taught"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedStaff.email || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={selectedStaff.phone || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
                    <Input
                      id="edit-emergencyContact"
                      value={selectedStaff.emergencyContact || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, emergencyContact: e.target.value})}
                      placeholder="Enter emergency contact"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-religion">Religion</Label>
                    <Input
                      id="edit-religion"
                      value={selectedStaff.religion || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, religion: e.target.value})}
                      placeholder="Enter religion"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nationality">Nationality</Label>
                    <Input
                      id="edit-nationality"
                      value={selectedStaff.nationality || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, nationality: e.target.value})}
                      placeholder="Enter nationality"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-medicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="edit-medicalConditions"
                      value={selectedStaff.medicalConditions || ''}
                      onChange={(e) => setSelectedStaff({...selectedStaff, medicalConditions: e.target.value})}
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
            <Button onClick={handleEditStaff}>
              Update Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
