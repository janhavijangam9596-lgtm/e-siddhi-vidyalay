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
  Plus, Search, Eye, CheckCircle, XCircle, Clock, Edit, Trash2, 
  Download, Upload, Users, FileText, Phone, Mail, MapPin,
  Calendar as CalendarIcon, TrendingUp, AlertCircle, Star,
  Filter, RefreshCw, UserCheck, BookOpen, GraduationCap,
  ClipboardList, BarChart3, PieChart, Activity, Award
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Admission {
  id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact?: string;
  previousSchool: string;
  previousGrade?: string;
  appliedClass: string;
  appliedSection: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'interview_scheduled' | 'documents_pending';
  documents: AdmissionDocument[];
  remarks: string;
  interviewDate?: string;
  interviewScore?: number;
  admissionFee?: number;
  nationality?: string;
  religion?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  siblingInSchool?: boolean;
  scholarshipApplied?: boolean;
  priority: 'high' | 'medium' | 'low';
  source: 'online' | 'walk_in' | 'referral' | 'agent';
  referredBy?: string;
  created_at: string;
  updated_at: string;
}

interface AdmissionDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  verified: boolean;
  uploadedAt: string;
}

interface AdmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  waitlisted: number;
  interview_scheduled: number;
  documents_pending: number;
  conversionRate: number;
  averageProcessingTime: number;
}

export function AdmissionManagement() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [stats, setStats] = useState<AdmissionStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
    interview_scheduled: 0,
    documents_pending: 0,
    conversionRate: 0,
    averageProcessingTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('applicationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);

  const [newAdmission, setNewAdmission] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
    previousSchool: '',
    previousGrade: '',
    appliedClass: '',
    appliedSection: '',
    nationality: '',
    religion: '',
    bloodGroup: '',
    medicalConditions: '',
    siblingInSchool: false,
    scholarshipApplied: false,
    priority: 'medium',
    source: 'online',
    referredBy: '',
    remarks: ''
  });

  useEffect(() => {
    loadAdmissions();
    loadStats();
  }, []);

  const loadAdmissions = async () => {
    try {
      const data = await api.getAdmissions();
      setAdmissions(data);
    } catch (error) {
      toast.error('Failed to load admissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getAdmissionStats();
      setStats(data || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
        interview_scheduled: 0,
        documents_pending: 0,
        conversionRate: 0,
        averageProcessingTime: 0
      });
    } catch (error) {
      console.error('Failed to load admission stats:', error);
      // Set default values on error
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
        interview_scheduled: 0,
        documents_pending: 0,
        conversionRate: 0,
        averageProcessingTime: 0
      });
    }
  };

  const handleAddAdmission = async () => {
    try {
      const applicationNumber = `ADM${Date.now()}`;
      const admissionData = {
        ...newAdmission,
        applicationNumber,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        documents: []
      };
      
      await api.createAdmission(admissionData);
      toast.success('Admission application created successfully');
      setIsAddDialogOpen(false);
      resetForm();
      loadAdmissions();
      loadStats();
    } catch (error) {
      toast.error('Failed to create admission application');
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, remarks?: string) => {
    try {
      await api.updateAdmission(id, { status, remarks });
      toast.success('Status updated successfully');
      loadAdmissions();
      loadStats();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleScheduleInterview = async (id: string, interviewDate: string) => {
    try {
      await api.updateAdmission(id, { 
        status: 'interview_scheduled', 
        interviewDate 
      });
      toast.success('Interview scheduled successfully');
      loadAdmissions();
    } catch (error) {
      toast.error('Failed to schedule interview');
      console.error(error);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      await api.bulkUpdateAdmissions(bulkSelection, { status: action });
      toast.success(`Bulk ${action} completed successfully`);
      setBulkSelection([]);
      loadAdmissions();
      loadStats();
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
      console.error(error);
    }
  };

  const resetForm = () => {
    setNewAdmission({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      emergencyContact: '',
      previousSchool: '',
      previousGrade: '',
      appliedClass: '',
      appliedSection: '',
      nationality: '',
      religion: '',
      bloodGroup: '',
      medicalConditions: '',
      siblingInSchool: false,
      scholarshipApplied: false,
      priority: 'medium',
      source: 'online',
      referredBy: '',
      remarks: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted': return 'bg-blue-100 text-blue-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      case 'documents_pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    return (
      (admission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       admission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       admission.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       admission.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || statusFilter === 'all' || admission.status === statusFilter) &&
      (classFilter === '' || classFilter === 'all' || admission.appliedClass === classFilter) &&
      (priorityFilter === '' || priorityFilter === 'all' || admission.priority === priorityFilter) &&
      (sourceFilter === '' || sourceFilter === 'all' || admission.source === sourceFilter)
    );
  });

  const totalPages = Math.ceil(filteredAdmissions.length / itemsPerPage);
  const paginatedAdmissions = filteredAdmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Admission Management</h1>
          <p className="text-muted-foreground">
            Manage student admission applications and processes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAdmissions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Admission Application</DialogTitle>
                <DialogDescription>
                  Create a new admission application for a prospective student
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="academic">Academic Info</TabsTrigger>
                  <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
                  <TabsTrigger value="additional">Additional Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newAdmission.firstName}
                        onChange={(e) => setNewAdmission({...newAdmission, firstName: e.target.value})}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newAdmission.lastName}
                        onChange={(e) => setNewAdmission({...newAdmission, lastName: e.target.value})}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAdmission.email}
                        onChange={(e) => setNewAdmission({...newAdmission, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newAdmission.phone}
                        onChange={(e) => setNewAdmission({...newAdmission, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={newAdmission.dateOfBirth}
                        onChange={(e) => setNewAdmission({...newAdmission, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={newAdmission.gender} onValueChange={(value) => setNewAdmission({...newAdmission, gender: value})}>
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
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newAdmission.address}
                      onChange={(e) => setNewAdmission({...newAdmission, address: e.target.value})}
                      placeholder="Enter full address"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appliedClass">Applied Class</Label>
                      <Select value={newAdmission.appliedClass} onValueChange={(value) => setNewAdmission({...newAdmission, appliedClass: value})}>
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
                      <Label htmlFor="appliedSection">Applied Section</Label>
                      <Select value={newAdmission.appliedSection} onValueChange={(value) => setNewAdmission({...newAdmission, appliedSection: value})}>
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="previousSchool">Previous School</Label>
                      <Input
                        id="previousSchool"
                        value={newAdmission.previousSchool}
                        onChange={(e) => setNewAdmission({...newAdmission, previousSchool: e.target.value})}
                        placeholder="Enter previous school name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="previousGrade">Previous Grade</Label>
                      <Input
                        id="previousGrade"
                        value={newAdmission.previousGrade}
                        onChange={(e) => setNewAdmission({...newAdmission, previousGrade: e.target.value})}
                        placeholder="Enter previous grade"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="parent" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentName">Parent/Guardian Name</Label>
                      <Input
                        id="parentName"
                        value={newAdmission.parentName}
                        onChange={(e) => setNewAdmission({...newAdmission, parentName: e.target.value})}
                        placeholder="Enter parent/guardian name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentPhone">Parent Phone</Label>
                      <Input
                        id="parentPhone"
                        value={newAdmission.parentPhone}
                        onChange={(e) => setNewAdmission({...newAdmission, parentPhone: e.target.value})}
                        placeholder="Enter parent phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentEmail">Parent Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={newAdmission.parentEmail}
                        onChange={(e) => setNewAdmission({...newAdmission, parentEmail: e.target.value})}
                        placeholder="Enter parent email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={newAdmission.emergencyContact}
                        onChange={(e) => setNewAdmission({...newAdmission, emergencyContact: e.target.value})}
                        placeholder="Enter emergency contact"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="additional" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={newAdmission.nationality}
                        onChange={(e) => setNewAdmission({...newAdmission, nationality: e.target.value})}
                        placeholder="Enter nationality"
                      />
                    </div>
                    <div>
                      <Label htmlFor="religion">Religion</Label>
                      <Input
                        id="religion"
                        value={newAdmission.religion}
                        onChange={(e) => setNewAdmission({...newAdmission, religion: e.target.value})}
                        placeholder="Enter religion"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select value={newAdmission.bloodGroup} onValueChange={(value) => setNewAdmission({...newAdmission, bloodGroup: value})}>
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
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newAdmission.priority} onValueChange={(value) => setNewAdmission({...newAdmission, priority: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="source">Application Source</Label>
                      <Select value={newAdmission.source} onValueChange={(value) => setNewAdmission({...newAdmission, source: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="walk_in">Walk-in</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="referredBy">Referred By</Label>
                      <Input
                        id="referredBy"
                        value={newAdmission.referredBy}
                        onChange={(e) => setNewAdmission({...newAdmission, referredBy: e.target.value})}
                        placeholder="Enter referrer name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="siblingInSchool"
                        checked={newAdmission.siblingInSchool}
                        onCheckedChange={(checked) => setNewAdmission({...newAdmission, siblingInSchool: !!checked})}
                      />
                      <Label htmlFor="siblingInSchool">Has sibling in school</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="scholarshipApplied"
                        checked={newAdmission.scholarshipApplied}
                        onCheckedChange={(checked) => setNewAdmission({...newAdmission, scholarshipApplied: !!checked})}
                      />
                      <Label htmlFor="scholarshipApplied">Applied for scholarship</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      value={newAdmission.medicalConditions}
                      onChange={(e) => setNewAdmission({...newAdmission, medicalConditions: e.target.value})}
                      placeholder="Enter any medical conditions or allergies"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={newAdmission.remarks}
                      onChange={(e) => setNewAdmission({...newAdmission, remarks: e.target.value})}
                      placeholder="Enter any additional remarks"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAdmission}>
                  Create Application
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
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="documents_pending">Documents Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-48">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
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
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48">
                  <Star className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {bulkSelection.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <span className="text-sm">{bulkSelection.length} applications selected</span>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('approved')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Bulk Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('rejected')}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Bulk Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => setBulkSelection([])}>
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admission Applications</CardTitle>
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
                        checked={bulkSelection.length === paginatedAdmissions.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkSelection(paginatedAdmissions.map(a => a.id));
                          } else {
                            setBulkSelection([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Application #</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Applied Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAdmissions.map((admission) => (
                    <TableRow key={admission.id}>
                      <TableCell>
                        <Checkbox
                          checked={bulkSelection.includes(admission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBulkSelection([...bulkSelection, admission.id]);
                            } else {
                              setBulkSelection(bulkSelection.filter(id => id !== admission.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-mono">{admission.applicationNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{admission.firstName} {admission.lastName}</div>
                          <div className="text-sm text-muted-foreground">{admission.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{admission.appliedClass} - {admission.appliedSection}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(admission.status)}>
                          {admission.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(admission.priority)}>
                          {admission.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{admission.source}</TableCell>
                      <TableCell>{new Date(admission.applicationDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdmission(admission);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdmission(admission);
                              setIsEditDialogOpen(true);
                            }}
                          >
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
              {Math.min(currentPage * itemsPerPage, filteredAdmissions.length)} of{' '}
              {filteredAdmissions.length} applications
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete information for application #{selectedAdmission?.applicationNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAdmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedAdmission.firstName} {selectedAdmission.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedAdmission.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedAdmission.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <span>{new Date(selectedAdmission.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span>{selectedAdmission.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="text-right">{selectedAdmission.address}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parent/Guardian Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedAdmission.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedAdmission.parentPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedAdmission.parentEmail}</span>
                    </div>
                    {selectedAdmission.emergencyContact && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Emergency Contact:</span>
                        <span>{selectedAdmission.emergencyContact}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Academic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applied Class:</span>
                      <span>{selectedAdmission.appliedClass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applied Section:</span>
                      <span>{selectedAdmission.appliedSection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previous School:</span>
                      <span>{selectedAdmission.previousSchool}</span>
                    </div>
                    {selectedAdmission.previousGrade && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Previous Grade:</span>
                        <span>{selectedAdmission.previousGrade}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(selectedAdmission.status)}>
                        {selectedAdmission.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge className={getPriorityColor(selectedAdmission.priority)}>
                        {selectedAdmission.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source:</span>
                      <span>{selectedAdmission.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Application Date:</span>
                      <span>{new Date(selectedAdmission.applicationDate).toLocaleDateString()}</span>
                    </div>
                    {selectedAdmission.interviewDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interview Date:</span>
                        <span>{new Date(selectedAdmission.interviewDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {selectedAdmission.remarks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Remarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedAdmission.remarks}</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedAdmission.id, 'approved')}
                  disabled={selectedAdmission.status === 'approved'}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedAdmission.id, 'rejected')}
                  disabled={selectedAdmission.status === 'rejected'}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedAdmission.id, 'waitlisted')}
                  disabled={selectedAdmission.status === 'waitlisted'}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Waitlist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleScheduleInterview(selectedAdmission.id, new Date().toISOString())}
                  disabled={selectedAdmission.status === 'interview_scheduled'}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}