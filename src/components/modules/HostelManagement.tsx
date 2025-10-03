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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { api } from '../../utils/api';
import { 
  Plus, Search, Eye, Edit, Trash2, Home, Bed, Users,
  MapPin, Phone, Mail, Calendar, Clock, AlertTriangle,
  Download, Upload, RefreshCw, Filter, Settings,
  UserCheck, UserX, Key, Shield, Utensils, Wifi,
  Car, ShowerHead, Tv, CheckCircle, DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Hostel {
  id: string;
  hostelName: string;
  hostelType: 'boys' | 'girls' | 'mixed';
  address: string;
  contactNumber: string;
  email: string;
  wardenId: string;
  wardenName: string;
  totalRooms: number;
  occupiedRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  facilities: string[];
  rules: string[];
  feeStructure: {
    monthlyFee: number;
    securityDeposit: number;
    admissionFee: number;
    maintenanceFee: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
}

interface Room {
  id: string;
  hostelId: string;
  hostelName: string;
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'dormitory';
  floor: number;
  capacity: number;
  currentOccupancy: number;
  monthlyFee: number;
  facilities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  students: RoomStudent[];
  created_at: string;
}

interface RoomStudent {
  studentId: string;
  studentName: string;
  bedNumber: number;
  allottedDate: string;
}

interface HostelStudent {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  rollNumber: string;
  hostelId: string;
  hostelName: string;
  roomId: string;
  roomNumber: string;
  bedNumber: number;
  allottedDate: string;
  parentName: string;
  parentContact: string;
  parentEmail: string;
  emergencyContact: string;
  medicalInfo?: string;
  feeStatus: 'paid' | 'pending' | 'overdue';
  lastFeePaidDate?: string;
  status: 'active' | 'inactive' | 'suspended';
  checkInTime?: string;
  checkOutTime?: string;
  created_at: string;
}

interface Staff {
  id: string;
  staffId: string;
  name: string;
  designation: 'warden' | 'assistant_warden' | 'security' | 'maintenance' | 'cook' | 'cleaner';
  hostelId?: string;
  hostelName?: string;
  contactNumber: string;
  email: string;
  address: string;
  joinDate: string;
  salary: number;
  workShift: 'morning' | 'evening' | 'night' | 'full_day';
  permissions: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

interface HostelExpense {
  id: string;
  hostelId: string;
  hostelName: string;
  expenseType: 'maintenance' | 'food' | 'utilities' | 'staff_salary' | 'supplies' | 'other';
  description: string;
  amount: number;
  expenseDate: string;
  approvedBy: string;
  billNumber?: string;
  vendorName?: string;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
}

interface HostelStats {
  totalHostels: number;
  totalStudents: number;
  occupancyRate: number;
  availableRooms: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  feeCollectionRate: number;
  maintenanceRequests: number;
}

export function HostelManagement() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<HostelStudent[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [expenses, setExpenses] = useState<HostelExpense[]>([]);
  const [stats, setStats] = useState<HostelStats>({
    totalHostels: 0,
    totalStudents: 0,
    occupancyRate: 0,
    availableRooms: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    feeCollectionRate: 0,
    maintenanceRequests: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddHostelDialogOpen, setIsAddHostelDialogOpen] = useState(false);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isAllotRoomDialogOpen, setIsAllotRoomDialogOpen] = useState(false);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');

  const [newHostel, setNewHostel] = useState({
    hostelName: '',
    hostelType: 'boys',
    address: '',
    contactNumber: '',
    email: '',
    wardenId: '',
    totalRooms: '',
    totalBeds: '',
    facilities: '',
    rules: '',
    monthlyFee: '',
    securityDeposit: '',
    admissionFee: '',
    maintenanceFee: ''
  });

  const [newRoom, setNewRoom] = useState({
    hostelId: '',
    roomNumber: '',
    roomType: 'double',
    floor: '',
    capacity: '',
    monthlyFee: '',
    facilities: ''
  });

  const [roomAllotment, setRoomAllotment] = useState({
    studentId: '',
    hostelId: '',
    roomId: '',
    bedNumber: '',
    parentName: '',
    parentContact: '',
    parentEmail: '',
    emergencyContact: '',
    medicalInfo: ''
  });

  const [newStaff, setNewStaff] = useState({
    staffId: '',
    name: '',
    designation: 'warden',
    hostelId: '',
    contactNumber: '',
    email: '',
    address: '',
    joinDate: '',
    salary: '',
    workShift: 'full_day',
    permissions: ''
  });

  const [newExpense, setNewExpense] = useState({
    hostelId: '',
    expenseType: 'maintenance',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    billNumber: '',
    vendorName: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hostelsData, roomsData, studentsData, staffData, expensesData, statsData] = await Promise.all([
        api.getHostels(),
        api.getHostelRooms(),
        api.getHostelStudents(),
        api.getHostelStaff(),
        api.getHostelExpenses(),
        api.getHostelStats()
      ]);
      
      setHostels(hostelsData);
      setRooms(roomsData);
      setStudents(studentsData);
      setStaff(staffData);
      setExpenses(expensesData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load hostel data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHostel = async () => {
    try {
      const hostelData = {
        ...newHostel,
        totalRooms: parseInt(newHostel.totalRooms),
        occupiedRooms: 0,
        totalBeds: parseInt(newHostel.totalBeds),
        occupiedBeds: 0,
        facilities: newHostel.facilities.split(',').map(f => f.trim()).filter(f => f),
        rules: newHostel.rules.split(',').map(r => r.trim()).filter(r => r),
        feeStructure: {
          monthlyFee: parseFloat(newHostel.monthlyFee),
          securityDeposit: parseFloat(newHostel.securityDeposit),
          admissionFee: parseFloat(newHostel.admissionFee),
          maintenanceFee: parseFloat(newHostel.maintenanceFee)
        },
        wardenName: staff.find(s => s.id === newHostel.wardenId)?.name || '',
        status: 'active'
      };
      
      await api.createHostel(hostelData);
      toast.success('Hostel added successfully');
      setIsAddHostelDialogOpen(false);
      resetHostelForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add hostel');
      console.error(error);
    }
  };

  const handleAddRoom = async () => {
    try {
      const roomData = {
        ...newRoom,
        hostelName: hostels.find(h => h.id === newRoom.hostelId)?.hostelName || '',
        floor: parseInt(newRoom.floor),
        capacity: parseInt(newRoom.capacity),
        currentOccupancy: 0,
        monthlyFee: parseFloat(newRoom.monthlyFee),
        facilities: newRoom.facilities.split(',').map(f => f.trim()).filter(f => f),
        status: 'available',
        students: []
      };
      
      await api.createHostelRoom(roomData);
      toast.success('Room added successfully');
      setIsAddRoomDialogOpen(false);
      resetRoomForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add room');
      console.error(error);
    }
  };

  const handleRoomAllotment = async () => {
    try {
      const allotmentData = {
        ...roomAllotment,
        hostelName: hostels.find(h => h.id === roomAllotment.hostelId)?.hostelName || '',
        roomNumber: rooms.find(r => r.id === roomAllotment.roomId)?.roomNumber || '',
        bedNumber: parseInt(roomAllotment.bedNumber),
        allottedDate: new Date().toISOString(),
        feeStatus: 'pending',
        status: 'active'
      };
      
      await api.allotHostelRoom(allotmentData);
      toast.success('Room allotted successfully');
      setIsAllotRoomDialogOpen(false);
      resetAllotmentForm();
      loadData();
    } catch (error) {
      toast.error('Failed to allot room');
      console.error(error);
    }
  };

  const handleAddStaff = async () => {
    try {
      const staffData = {
        ...newStaff,
        hostelName: hostels.find(h => h.id === newStaff.hostelId)?.hostelName || '',
        salary: parseFloat(newStaff.salary),
        permissions: newStaff.permissions.split(',').map(p => p.trim()).filter(p => p),
        status: 'active'
      };
      
      await api.createHostelStaff(staffData);
      toast.success('Staff member added successfully');
      setIsAddStaffDialogOpen(false);
      resetStaffForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add staff member');
      console.error(error);
    }
  };

  const handleAddExpense = async () => {
    try {
      const expenseData = {
        ...newExpense,
        hostelName: hostels.find(h => h.id === newExpense.hostelId)?.hostelName || '',
        amount: parseFloat(newExpense.amount),
        approvedBy: 'Current User',
        status: 'pending'
      };
      
      await api.createHostelExpense(expenseData);
      toast.success('Expense recorded successfully');
      setIsAddExpenseDialogOpen(false);
      resetExpenseForm();
      loadData();
    } catch (error) {
      toast.error('Failed to record expense');
      console.error(error);
    }
  };

  const resetHostelForm = () => {
    setNewHostel({
      hostelName: '',
      hostelType: 'boys',
      address: '',
      contactNumber: '',
      email: '',
      wardenId: '',
      totalRooms: '',
      totalBeds: '',
      facilities: '',
      rules: '',
      monthlyFee: '',
      securityDeposit: '',
      admissionFee: '',
      maintenanceFee: ''
    });
  };

  const resetRoomForm = () => {
    setNewRoom({
      hostelId: '',
      roomNumber: '',
      roomType: 'double',
      floor: '',
      capacity: '',
      monthlyFee: '',
      facilities: ''
    });
  };

  const resetAllotmentForm = () => {
    setRoomAllotment({
      studentId: '',
      hostelId: '',
      roomId: '',
      bedNumber: '',
      parentName: '',
      parentContact: '',
      parentEmail: '',
      emergencyContact: '',
      medicalInfo: ''
    });
  };

  const resetStaffForm = () => {
    setNewStaff({
      staffId: '',
      name: '',
      designation: 'warden',
      hostelId: '',
      contactNumber: '',
      email: '',
      address: '',
      joinDate: '',
      salary: '',
      workShift: 'full_day',
      permissions: ''
    });
  };

  const resetExpenseForm = () => {
    setNewExpense({
      hostelId: '',
      expenseType: 'maintenance',
      description: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      billNumber: '',
      vendorName: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'available': case 'paid': case 'approved': return 'bg-green-100 text-green-800';
      case 'occupied': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': case 'suspended': case 'maintenance': return 'bg-red-100 text-red-800';
      case 'reserved': case 'overdue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHostelTypeColor = (type: string) => {
    switch (type) {
      case 'boys': return 'bg-blue-100 text-blue-800';
      case 'girls': return 'bg-pink-100 text-pink-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'single': return 'bg-green-100 text-green-800';
      case 'double': return 'bg-blue-100 text-blue-800';
      case 'triple': return 'bg-orange-100 text-orange-800';
      case 'dormitory': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDesignationColor = (designation: string) => {
    switch (designation) {
      case 'warden': return 'bg-blue-100 text-blue-800';
      case 'assistant_warden': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'cook': return 'bg-yellow-100 text-yellow-800';
      case 'cleaner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student => {
    return (
      (student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (hostelFilter === '' || student.hostelId === hostelFilter) &&
      (statusFilter === '' || student.status === statusFilter)
    );
  });

  const filteredRooms = rooms.filter(room => {
    return (
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (hostelFilter === '' || room.hostelId === hostelFilter) &&
      (roomTypeFilter === '' || room.roomType === roomTypeFilter) &&
      (statusFilter === '' || room.status === statusFilter)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Hostel Management</h1>
          <p className="text-muted-foreground">
            Manage hostel accommodations, students, and operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Hostel Expense</DialogTitle>
                <DialogDescription>
                  Record a new expense for hostel operations
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expenseHostel">Hostel</Label>
                    <Select value={newExpense.hostelId} onValueChange={(value) => setNewExpense({...newExpense, hostelId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map((hostel) => (
                          <SelectItem key={hostel.id} value={hostel.id}>
                            {hostel.hostelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expenseType">Expense Type</Label>
                    <Select value={newExpense.expenseType} onValueChange={(value) => setNewExpense({...newExpense, expenseType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="staff_salary">Staff Salary</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="expenseDescription">Description</Label>
                  <Textarea
                    id="expenseDescription"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder="Enter expense description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expenseAmount">Amount</Label>
                    <Input
                      id="expenseAmount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseDate">Expense Date</Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={newExpense.expenseDate}
                      onChange={(e) => setNewExpense({...newExpense, expenseDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billNumber">Bill Number (Optional)</Label>
                    <Input
                      id="billNumber"
                      value={newExpense.billNumber}
                      onChange={(e) => setNewExpense({...newExpense, billNumber: e.target.value})}
                      placeholder="Enter bill number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorName">Vendor Name (Optional)</Label>
                    <Input
                      id="vendorName"
                      value={newExpense.vendorName}
                      onChange={(e) => setNewExpense({...newExpense, vendorName: e.target.value})}
                      placeholder="Enter vendor name"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExpense}>
                  Record Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserCheck className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Hostel Staff</DialogTitle>
                <DialogDescription>
                  Add a new staff member to hostel management
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input
                      id="staffId"
                      value={newStaff.staffId}
                      onChange={(e) => setNewStaff({...newStaff, staffId: e.target.value})}
                      placeholder="Enter staff ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staffName">Full Name</Label>
                    <Input
                      id="staffName"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staffDesignation">Designation</Label>
                    <Select value={newStaff.designation} onValueChange={(value) => setNewStaff({...newStaff, designation: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warden">Warden</SelectItem>
                        <SelectItem value="assistant_warden">Assistant Warden</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="cook">Cook</SelectItem>
                        <SelectItem value="cleaner">Cleaner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="staffHostel">Assigned Hostel</Label>
                    <Select value={newStaff.hostelId} onValueChange={(value) => setNewStaff({...newStaff, hostelId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map((hostel) => (
                          <SelectItem key={hostel.id} value={hostel.id}>
                            {hostel.hostelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staffContact">Contact Number</Label>
                    <Input
                      id="staffContact"
                      value={newStaff.contactNumber}
                      onChange={(e) => setNewStaff({...newStaff, contactNumber: e.target.value})}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staffEmail">Email</Label>
                    <Input
                      id="staffEmail"
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="staffAddress">Address</Label>
                  <Textarea
                    id="staffAddress"
                    value={newStaff.address}
                    onChange={(e) => setNewStaff({...newStaff, address: e.target.value})}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="joinDate">Join Date</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={newStaff.joinDate}
                      onChange={(e) => setNewStaff({...newStaff, joinDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="staffSalary">Salary</Label>
                    <Input
                      id="staffSalary"
                      type="number"
                      value={newStaff.salary}
                      onChange={(e) => setNewStaff({...newStaff, salary: e.target.value})}
                      placeholder="Enter salary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workShift">Work Shift</Label>
                    <Select value={newStaff.workShift} onValueChange={(value) => setNewStaff({...newStaff, workShift: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                        <SelectItem value="full_day">Full Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="permissions">Permissions (comma-separated)</Label>
                  <Input
                    id="permissions"
                    value={newStaff.permissions}
                    onChange={(e) => setNewStaff({...newStaff, permissions: e.target.value})}
                    placeholder="e.g., room_access, student_records, maintenance"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddStaffDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStaff}>
                  Add Staff
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAllotRoomDialogOpen} onOpenChange={setIsAllotRoomDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Key className="mr-2 h-4 w-4" />
                Allot Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Allot Hostel Room</DialogTitle>
                <DialogDescription>
                  Assign a room to a student
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="allotStudent">Student</Label>
                  <Select value={roomAllotment.studentId} onValueChange={(value) => setRoomAllotment({...roomAllotment, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student1">John Doe - Class 10A - Roll 101</SelectItem>
                      <SelectItem value="student2">Jane Smith - Class 9B - Roll 205</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="allotHostel">Hostel</Label>
                    <Select value={roomAllotment.hostelId} onValueChange={(value) => setRoomAllotment({...roomAllotment, hostelId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map((hostel) => (
                          <SelectItem key={hostel.id} value={hostel.id}>
                            {hostel.hostelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="allotRoom">Room</Label>
                    <Select value={roomAllotment.roomId} onValueChange={(value) => setRoomAllotment({...roomAllotment, roomId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms
                          .filter(room => room.hostelId === roomAllotment.hostelId && room.status === 'available')
                          .map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.roomNumber} ({room.capacity - room.currentOccupancy} beds available)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bedNumber">Bed Number</Label>
                  <Input
                    id="bedNumber"
                    type="number"
                    value={roomAllotment.bedNumber}
                    onChange={(e) => setRoomAllotment({...roomAllotment, bedNumber: e.target.value})}
                    placeholder="Enter bed number"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentName">Parent Name</Label>
                    <Input
                      id="parentName"
                      value={roomAllotment.parentName}
                      onChange={(e) => setRoomAllotment({...roomAllotment, parentName: e.target.value})}
                      placeholder="Enter parent name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentContact">Parent Contact</Label>
                    <Input
                      id="parentContact"
                      value={roomAllotment.parentContact}
                      onChange={(e) => setRoomAllotment({...roomAllotment, parentContact: e.target.value})}
                      placeholder="Enter parent contact"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentEmail">Parent Email</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={roomAllotment.parentEmail}
                      onChange={(e) => setRoomAllotment({...roomAllotment, parentEmail: e.target.value})}
                      placeholder="Enter parent email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={roomAllotment.emergencyContact}
                      onChange={(e) => setRoomAllotment({...roomAllotment, emergencyContact: e.target.value})}
                      placeholder="Enter emergency contact"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="medicalInfo">Medical Information (Optional)</Label>
                  <Textarea
                    id="medicalInfo"
                    value={roomAllotment.medicalInfo}
                    onChange={(e) => setRoomAllotment({...roomAllotment, medicalInfo: e.target.value})}
                    placeholder="Enter any medical conditions or requirements"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAllotRoomDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRoomAllotment}>
                  Allot Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bed className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>
                  Add a new room to the selected hostel
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomHostel">Hostel</Label>
                  <Select value={newRoom.hostelId} onValueChange={(value) => setNewRoom({...newRoom, hostelId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((hostel) => (
                        <SelectItem key={hostel.id} value={hostel.id}>
                          {hostel.hostelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={newRoom.roomNumber}
                      onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                      placeholder="Enter room number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomFloor">Floor</Label>
                    <Input
                      id="roomFloor"
                      type="number"
                      value={newRoom.floor}
                      onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                      placeholder="Enter floor number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomType">Room Type</Label>
                    <Select value={newRoom.roomType} onValueChange={(value) => setNewRoom({...newRoom, roomType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="triple">Triple</SelectItem>
                        <SelectItem value="dormitory">Dormitory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roomCapacity">Capacity</Label>
                    <Input
                      id="roomCapacity"
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                      placeholder="Enter bed capacity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomFee">Monthly Fee</Label>
                    <Input
                      id="roomFee"
                      type="number"
                      value={newRoom.monthlyFee}
                      onChange={(e) => setNewRoom({...newRoom, monthlyFee: e.target.value})}
                      placeholder="Enter monthly fee"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="roomFacilities">Facilities (comma-separated)</Label>
                  <Textarea
                    id="roomFacilities"
                    value={newRoom.facilities}
                    onChange={(e) => setNewRoom({...newRoom, facilities: e.target.value})}
                    placeholder="e.g., AC, Attached Bathroom, Study Table, Wardrobe"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddRoomDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRoom}>
                  Add Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddHostelDialogOpen} onOpenChange={setIsAddHostelDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Hostel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Hostel</DialogTitle>
                <DialogDescription>
                  Add a new hostel to the management system
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hostelName">Hostel Name</Label>
                    <Input
                      id="hostelName"
                      value={newHostel.hostelName}
                      onChange={(e) => setNewHostel({...newHostel, hostelName: e.target.value})}
                      placeholder="Enter hostel name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hostelType">Hostel Type</Label>
                    <Select value={newHostel.hostelType} onValueChange={(value) => setNewHostel({...newHostel, hostelType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boys">Boys</SelectItem>
                        <SelectItem value="girls">Girls</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="hostelAddress">Address</Label>
                  <Textarea
                    id="hostelAddress"
                    value={newHostel.address}
                    onChange={(e) => setNewHostel({...newHostel, address: e.target.value})}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hostelContact">Contact Number</Label>
                    <Input
                      id="hostelContact"
                      value={newHostel.contactNumber}
                      onChange={(e) => setNewHostel({...newHostel, contactNumber: e.target.value})}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hostelEmail">Email</Label>
                    <Input
                      id="hostelEmail"
                      type="email"
                      value={newHostel.email}
                      onChange={(e) => setNewHostel({...newHostel, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="warden">Warden</Label>
                    <Select value={newHostel.wardenId} onValueChange={(value) => setNewHostel({...newHostel, wardenId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warden" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.filter(s => s.designation === 'warden').map((warden) => (
                          <SelectItem key={warden.id} value={warden.id}>
                            {warden.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalRooms">Total Rooms</Label>
                    <Input
                      id="totalRooms"
                      type="number"
                      value={newHostel.totalRooms}
                      onChange={(e) => setNewHostel({...newHostel, totalRooms: e.target.value})}
                      placeholder="Enter total rooms"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalBeds">Total Beds</Label>
                    <Input
                      id="totalBeds"
                      type="number"
                      value={newHostel.totalBeds}
                      onChange={(e) => setNewHostel({...newHostel, totalBeds: e.target.value})}
                      placeholder="Enter total beds"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="hostelFacilities">Facilities (comma-separated)</Label>
                  <Textarea
                    id="hostelFacilities"
                    value={newHostel.facilities}
                    onChange={(e) => setNewHostel({...newHostel, facilities: e.target.value})}
                    placeholder="e.g., WiFi, Mess, Library, Gym, Laundry"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="hostelRules">Rules & Regulations (comma-separated)</Label>
                  <Textarea
                    id="hostelRules"
                    value={newHostel.rules}
                    onChange={(e) => setNewHostel({...newHostel, rules: e.target.value})}
                    placeholder="e.g., No smoking, Lights out by 10 PM, Visitors allowed till 6 PM"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyFee">Monthly Fee</Label>
                    <Input
                      id="monthlyFee"
                      type="number"
                      value={newHostel.monthlyFee}
                      onChange={(e) => setNewHostel({...newHostel, monthlyFee: e.target.value})}
                      placeholder="Enter monthly fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="securityDeposit">Security Deposit</Label>
                    <Input
                      id="securityDeposit"
                      type="number"
                      value={newHostel.securityDeposit}
                      onChange={(e) => setNewHostel({...newHostel, securityDeposit: e.target.value})}
                      placeholder="Enter security deposit"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admissionFee">Admission Fee</Label>
                    <Input
                      id="admissionFee"
                      type="number"
                      value={newHostel.admissionFee}
                      onChange={(e) => setNewHostel({...newHostel, admissionFee: e.target.value})}
                      placeholder="Enter admission fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenanceFee">Maintenance Fee</Label>
                    <Input
                      id="maintenanceFee"
                      type="number"
                      value={newHostel.maintenanceFee}
                      onChange={(e) => setNewHostel({...newHostel, maintenanceFee: e.target.value})}
                      placeholder="Enter maintenance fee"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddHostelDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddHostel}>
                  Add Hostel
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
                <p className="text-sm text-muted-foreground">Total Hostels</p>
                <p className="text-2xl font-bold">{stats.totalHostels}</p>
                <p className="text-xs text-muted-foreground">Active facilities</p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">{stats.occupancyRate}% occupancy</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={stats.occupancyRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">₹{stats.monthlyExpenses.toLocaleString()} expenses</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Available Rooms</p>
                <p className="text-2xl font-bold">{stats.availableRooms}</p>
                <p className="text-xs text-muted-foreground">{stats.feeCollectionRate}% fee collection</p>
              </div>
              <Bed className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hostels" className="w-full">
        <TabsList>
          <TabsTrigger value="hostels">Hostels</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hostels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <Card key={hostel.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{hostel.hostelName}</h3>
                        <p className="text-sm text-muted-foreground">{hostel.address}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getHostelTypeColor(hostel.hostelType)}>
                          {hostel.hostelType}
                        </Badge>
                        <Badge className={getStatusColor(hostel.status)}>
                          {hostel.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Warden:</span>
                        <p>{hostel.wardenName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span>
                        <p>{hostel.contactNumber}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Rooms:</span>
                        <p>{hostel.occupiedRooms}/{hostel.totalRooms}</p>
                        <Progress value={(hostel.occupiedRooms / hostel.totalRooms) * 100} className="w-full h-2 mt-1" />
                      </div>
                      <div>
                        <span className="font-medium">Beds:</span>
                        <p>{hostel.occupiedBeds}/{hostel.totalBeds}</p>
                        <Progress value={(hostel.occupiedBeds / hostel.totalBeds) * 100} className="w-full h-2 mt-1" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Monthly Fee:</span>
                      <p className="text-lg font-bold text-green-600">₹{hostel.feeStructure.monthlyFee.toLocaleString()}</p>
                    </div>
                    
                    {hostel.facilities.length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Facilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {hostel.facilities.slice(0, 3).map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                          {hostel.facilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hostel.facilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="rooms" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rooms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={hostelFilter} onValueChange={setHostelFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hostels</SelectItem>
                    {hostels.map((hostel) => (
                      <SelectItem key={hostel.id} value={hostel.id}>
                        {hostel.hostelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="triple">Triple</SelectItem>
                    <SelectItem value="dormitory">Dormitory</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Room {room.roomNumber}</h3>
                        <p className="text-sm text-muted-foreground">{room.hostelName} - Floor {room.floor}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getRoomTypeColor(room.roomType)}>
                          {room.roomType}
                        </Badge>
                        <Badge className={getStatusColor(room.status)}>
                          {room.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Occupancy:</span>
                        <span className="font-medium">{room.currentOccupancy}/{room.capacity}</span>
                      </div>
                      <Progress value={(room.currentOccupancy / room.capacity) * 100} className="w-full" />
                      
                      <div className="flex justify-between">
                        <span>Monthly Fee:</span>
                        <span className="font-bold text-green-600">₹{room.monthlyFee.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {room.facilities.length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Facilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.facilities.slice(0, 3).map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                          {room.facilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.facilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {room.students.length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Students:</span>
                        <div className="space-y-1 mt-1">
                          {room.students.map((student, index) => (
                            <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                              {student.studentName} (Bed {student.bedNumber})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
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
                
                <Select value={hostelFilter} onValueChange={setHostelFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hostels</SelectItem>
                    {hostels.map((hostel) => (
                      <SelectItem key={hostel.id} value={hostel.id}>
                        {hostel.hostelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Hostel Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Hostel</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Fee Status</TableHead>
                      <TableHead>Parent Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.slice(0, 15).map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {student.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.studentName}</div>
                              <div className="text-sm text-muted-foreground">Roll: {student.rollNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.studentClass}</TableCell>
                        <TableCell>{student.hostelName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Room {student.roomNumber}</div>
                            <div className="text-muted-foreground">Bed {student.bedNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.feeStatus)}>
                            {student.feeStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{student.parentName}</div>
                            <div className="text-muted-foreground">{student.parentContact}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
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
        
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Hostel</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.slice(0, 15).map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {member.staffId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDesignationColor(member.designation)}>
                            {member.designation.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.hostelName || 'All Hostels'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{member.contactNumber}</div>
                            <div className="text-muted-foreground">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{member.workShift.replace('_', ' ')}</TableCell>
                        <TableCell className="font-bold">₹{member.salary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
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
        
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Hostel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.slice(0, 15).map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                        <TableCell>{expense.hostelName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {expense.expenseType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-48 truncate">{expense.description}</TableCell>
                        <TableCell className="font-bold">₹{expense.amount.toLocaleString()}</TableCell>
                        <TableCell>{expense.vendorName || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(expense.status)}>
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {expense.status === 'pending' && (
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
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
      </Tabs>
    </div>
  );
}