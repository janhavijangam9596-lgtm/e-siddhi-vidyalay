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
  Plus, Search, Eye, Edit, Trash2, CreditCard, DollarSign, 
  AlertCircle, CheckCircle, Clock, Download, Upload, Receipt,
  Calendar as CalendarIcon, TrendingUp, TrendingDown, Users,
  Filter, RefreshCw, FileText, PieChart, BarChart3, Percent,
  IndianRupee, Wallet, CreditCardIcon, Building, Phone
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  rollNumber: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial' | 'waived';
  description: string;
  academicYear: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'online' | 'cheque';
  transactionId?: string;
  discount?: number;
  penalty?: number;
  paidAmount?: number;
  remainingAmount?: number;
  receiptNumber?: string;
  created_at: string;
  updated_at?: string;
}

interface FeeStructure {
  id: string;
  class: string;
  feeType: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  description: string;
  mandatory: boolean;
  dueDay: number;
  created_at: string;
}

interface FeeCollection {
  id: string;
  studentId: string;
  feeIds: string[];
  totalAmount: number;
  collectedAmount: number;
  paymentMethod: string;
  transactionId?: string;
  receiptNumber: string;
  collectedBy: string;
  collectionDate: string;
  remarks?: string;
}

interface FeeStats {
  totalDue: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
  monthlyCollection: number;
  overdueStudents: number;
  partialPayments: number;
}

export function FeesManagement() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [collections, setCollections] = useState<FeeCollection[]>([]);
  const [stats, setStats] = useState<FeeStats>({
    totalDue: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
    monthlyCollection: 0,
    overdueStudents: 0,
    partialPayments: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  const [isAddStructureDialogOpen, setIsAddStructureDialogOpen] = useState(false);
  const [isCollectFeeDialogOpen, setIsCollectFeeDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);

  const [newFee, setNewFee] = useState({
    studentId: '',
    feeType: '',
    amount: '',
    dueDate: '',
    description: '',
    academicYear: '2024-25'
  });

  const [newStructure, setNewStructure] = useState({
    class: '',
    feeType: '',
    amount: '',
    frequency: 'monthly',
    description: '',
    mandatory: true,
    dueDay: 15
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    transactionId: '',
    discount: '',
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feesData, structuresData, collectionsData, statsData] = await Promise.all([
        api.getFees(),
        api.getFeeStructures(),
        api.getFeeCollections(),
        api.getFeeStats()
      ]);
      
      setFees(feesData);
      setFeeStructures(structuresData);
      setCollections(collectionsData);
      setStats(statsData);
    } catch (error) {
      // Use demo data if API fails
      const demoFees: Fee[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'John Doe',
          studentClass: '10th',
          rollNumber: '101',
          feeType: 'Tuition Fee',
          amount: 15000,
          dueDate: '2024-01-15',
          paidDate: '2024-01-10',
          status: 'paid',
          description: 'Monthly tuition fee',
          academicYear: '2024-25',
          paymentMethod: 'online',
          transactionId: 'TXN123456',
          paidAmount: 15000,
          receiptNumber: 'REC001',
          created_at: '2024-01-01'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Jane Smith',
          studentClass: '10th',
          rollNumber: '102',
          feeType: 'Tuition Fee',
          amount: 15000,
          dueDate: '2024-01-15',
          status: 'overdue',
          description: 'Monthly tuition fee',
          academicYear: '2024-25',
          remainingAmount: 15000,
          created_at: '2024-01-01'
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Mike Johnson',
          studentClass: '9th',
          rollNumber: '201',
          feeType: 'Lab Fee',
          amount: 5000,
          dueDate: '2024-02-01',
          status: 'pending',
          description: 'Science lab fee',
          academicYear: '2024-25',
          remainingAmount: 5000,
          created_at: '2024-01-15'
        },
        {
          id: '4',
          studentId: 'STU001',
          studentName: 'John Doe',
          studentClass: '10th',
          rollNumber: '101',
          feeType: 'Transport Fee',
          amount: 3000,
          dueDate: '2024-01-20',
          status: 'partial',
          description: 'Monthly transport fee',
          academicYear: '2024-25',
          paidAmount: 1500,
          remainingAmount: 1500,
          created_at: '2024-01-01'
        }
      ];
      
      const demoStructures: FeeStructure[] = [
        {
          id: '1',
          class: '10th',
          feeType: 'Tuition Fee',
          amount: 15000,
          frequency: 'monthly',
          description: 'Regular tuition fee',
          mandatory: true,
          dueDay: 15,
          created_at: '2024-01-01'
        },
        {
          id: '2',
          class: '10th',
          feeType: 'Lab Fee',
          amount: 5000,
          frequency: 'quarterly',
          description: 'Science and computer lab fee',
          mandatory: true,
          dueDay: 1,
          created_at: '2024-01-01'
        },
        {
          id: '3',
          class: 'All',
          feeType: 'Transport Fee',
          amount: 3000,
          frequency: 'monthly',
          description: 'School bus service',
          mandatory: false,
          dueDay: 20,
          created_at: '2024-01-01'
        }
      ];
      
      const demoStats: FeeStats = {
        totalDue: 38000,
        totalCollected: 16500,
        totalPending: 21500,
        totalOverdue: 15000,
        collectionRate: 43.4,
        monthlyCollection: 16500,
        overdueStudents: 1,
        partialPayments: 1
      };
      
      setFees(demoFees);
      setFeeStructures(demoStructures);
      setCollections([]);
      setStats(demoStats);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = async () => {
    try {
      await api.createFee({
        ...newFee,
        amount: parseFloat(newFee.amount),
        status: 'pending'
      });
      toast.success('Fee created successfully');
      setIsAddFeeDialogOpen(false);
      resetFeeForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create fee');
      console.error(error);
    }
  };

  const handleAddStructure = async () => {
    try {
      await api.createFeeStructure({
        ...newStructure,
        amount: parseFloat(newStructure.amount)
      });
      toast.success('Fee structure created successfully');
      setIsAddStructureDialogOpen(false);
      resetStructureForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create fee structure');
      console.error(error);
    }
  };

  const handleCollectFee = async () => {
    if (!selectedFee) return;
    
    try {
      const amount = parseFloat(paymentForm.amount);
      const discount = parseFloat(paymentForm.discount) || 0;
      const finalAmount = amount - discount;
      
      await api.collectFee(selectedFee.id, {
        amount: finalAmount,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId,
        discount,
        remarks: paymentForm.remarks
      });
      
      toast.success('Payment collected successfully');
      setIsCollectFeeDialogOpen(false);
      resetPaymentForm();
      loadData();
    } catch (error) {
      toast.error('Failed to collect payment');
      console.error(error);
    }
  };

  const handleBulkFeeGeneration = async (classId: string, feeType: string) => {
    try {
      await api.generateBulkFees({ classId, feeType });
      toast.success('Bulk fees generated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to generate bulk fees');
      console.error(error);
    }
  };

  const handleSendReminder = async (feeId: string) => {
    try {
      await api.sendFeeReminder(feeId);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Failed to send reminder');
      console.error(error);
    }
  };

  const resetFeeForm = () => {
    setNewFee({
      studentId: '',
      feeType: '',
      amount: '',
      dueDate: '',
      description: '',
      academicYear: '2024-25'
    });
  };

  const resetStructureForm = () => {
    setNewStructure({
      class: '',
      feeType: '',
      amount: '',
      frequency: 'monthly',
      description: '',
      mandatory: true,
      dueDay: 15
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      paymentMethod: 'cash',
      transactionId: '',
      discount: '',
      remarks: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'waived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFees = fees.filter(fee => {
    return (
      (fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       fee.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       fee.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || fee.status === statusFilter) &&
      (classFilter === '' || fee.studentClass === classFilter) &&
      (feeTypeFilter === '' || fee.feeType === feeTypeFilter)
    );
  });

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const paginatedFees = filteredFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Fees Management</h1>
          <p className="text-muted-foreground">
            Manage student fees, collections, and payment tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddStructureDialogOpen} onOpenChange={setIsAddStructureDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Fee Structure</DialogTitle>
                <DialogDescription>
                  Define fee structure for a class or category
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="structureClass">Class</Label>
                  <Select value={newStructure.class} onValueChange={(value) => setNewStructure({...newStructure, class: value})}>
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
                  <Label htmlFor="structureFeeType">Fee Type</Label>
                  <Select value={newStructure.feeType} onValueChange={(value) => setNewStructure({...newStructure, feeType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition Fee</SelectItem>
                      <SelectItem value="admission">Admission Fee</SelectItem>
                      <SelectItem value="examination">Examination Fee</SelectItem>
                      <SelectItem value="library">Library Fee</SelectItem>
                      <SelectItem value="sports">Sports Fee</SelectItem>
                      <SelectItem value="transport">Transport Fee</SelectItem>
                      <SelectItem value="hostel">Hostel Fee</SelectItem>
                      <SelectItem value="activity">Activity Fee</SelectItem>
                      <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="structureAmount">Amount</Label>
                  <Input
                    id="structureAmount"
                    type="number"
                    value={newStructure.amount}
                    onChange={(e) => setNewStructure({...newStructure, amount: e.target.value})}
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="structureFrequency">Frequency</Label>
                  <Select value={newStructure.frequency} onValueChange={(value) => setNewStructure({...newStructure, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="structureDescription">Description</Label>
                  <Textarea
                    id="structureDescription"
                    value={newStructure.description}
                    onChange={(e) => setNewStructure({...newStructure, description: e.target.value})}
                    placeholder="Enter description"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mandatory"
                    checked={newStructure.mandatory}
                    onCheckedChange={(checked) => setNewStructure({...newStructure, mandatory: !!checked})}
                  />
                  <Label htmlFor="mandatory">Mandatory Fee</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddStructureDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStructure}>
                  Create Structure
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddFeeDialogOpen} onOpenChange={setIsAddFeeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Fee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Individual Fee</DialogTitle>
                <DialogDescription>
                  Add a fee for a specific student
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentId">Student</Label>
                  <Select value={newFee.studentId} onValueChange={(value) => setNewFee({...newFee, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Student options would be populated from API */}
                      <SelectItem value="student1">John Doe - Class 5A</SelectItem>
                      <SelectItem value="student2">Jane Smith - Class 6B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="feeType">Fee Type</Label>
                  <Select value={newFee.feeType} onValueChange={(value) => setNewFee({...newFee, feeType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition Fee</SelectItem>
                      <SelectItem value="examination">Examination Fee</SelectItem>
                      <SelectItem value="library">Library Fee</SelectItem>
                      <SelectItem value="sports">Sports Fee</SelectItem>
                      <SelectItem value="transport">Transport Fee</SelectItem>
                      <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newFee.amount}
                    onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newFee.dueDate}
                    onChange={(e) => setNewFee({...newFee, dueDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newFee.description}
                    onChange={(e) => setNewFee({...newFee, description: e.target.value})}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddFeeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFee}>
                  Add Fee
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
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold">₹{stats.totalDue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">₹{stats.totalCollected.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{stats.collectionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Overdue Students</p>
                <p className="text-2xl font-bold">{stats.overdueStudents}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fees" className="w-full">
        <TabsList>
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="collections">Payment History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fees" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search fees..."
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
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="waived">Waived</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-48">
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
                  </SelectContent>
                </Select>
                
                <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fee Types</SelectItem>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="examination">Examination</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {bulkSelection.length > 0 && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg mt-4">
                  <span className="text-sm">{bulkSelection.length} fees selected</span>
                  <Button size="sm" variant="outline">
                    <Receipt className="mr-2 h-4 w-4" />
                    Send Reminders
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setBulkSelection([])}>
                    Clear Selection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Fees Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Fees</CardTitle>
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
                            checked={bulkSelection.length === paginatedFees.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBulkSelection(paginatedFees.map(f => f.id));
                              } else {
                                setBulkSelection([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>
                            <Checkbox
                              checked={bulkSelection.includes(fee.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setBulkSelection([...bulkSelection, fee.id]);
                                } else {
                                  setBulkSelection(bulkSelection.filter(id => id !== fee.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fee.studentName}</div>
                              <div className="text-sm text-muted-foreground">
                                {fee.studentClass} - {fee.rollNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{fee.feeType}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">₹{fee.amount.toLocaleString()}</div>
                              {fee.discount && fee.discount > 0 && (
                                <div className="text-sm text-green-600">
                                  Discount: ₹{fee.discount}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date(fee.dueDate).toLocaleDateString()}</div>
                              {fee.status === 'overdue' && (
                                <div className="text-sm text-red-600">
                                  {Math.ceil((Date.now() - new Date(fee.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(fee.status)}>
                              {fee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {fee.paymentMethod && (
                              <div className="text-sm">
                                <div>{fee.paymentMethod}</div>
                                {fee.transactionId && (
                                  <div className="text-muted-foreground">
                                    {fee.transactionId}
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedFee(fee);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {fee.status !== 'paid' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedFee(fee);
                                    setPaymentForm({
                                      ...paymentForm,
                                      amount: (fee.remainingAmount || fee.amount).toString()
                                    });
                                    setIsCollectFeeDialogOpen(true);
                                  }}
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
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
                  {Math.min(currentPage * itemsPerPage, filteredFees.length)} of{' '}
                  {filteredFees.length} fees
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
        
        <TabsContent value="structures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Mandatory</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeStructures.map((structure) => (
                      <TableRow key={structure.id}>
                        <TableCell>{structure.class}</TableCell>
                        <TableCell>{structure.feeType}</TableCell>
                        <TableCell>₹{structure.amount.toLocaleString()}</TableCell>
                        <TableCell>{structure.frequency}</TableCell>
                        <TableCell>
                          <Badge variant={structure.mandatory ? "default" : "secondary"}>
                            {structure.mandatory ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
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
        
        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Collection Date</TableHead>
                      <TableHead>Collected By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collections.map((collection) => (
                      <TableRow key={collection.id}>
                        <TableCell className="font-mono">{collection.receiptNumber}</TableCell>
                        <TableCell>{collection.studentId}</TableCell>
                        <TableCell>₹{collection.collectedAmount.toLocaleString()}</TableCell>
                        <TableCell>{collection.paymentMethod}</TableCell>
                        <TableCell>{new Date(collection.collectionDate).toLocaleDateString()}</TableCell>
                        <TableCell>{collection.collectedBy}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Receipt className="h-4 w-4" />
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
        
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Monthly Target</span>
                    <span className="font-bold">₹50,00,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Collected This Month</span>
                    <span className="font-bold text-green-600">₹{stats.monthlyCollection.toLocaleString()}</span>
                  </div>
                  <Progress value={(stats.monthlyCollection / 5000000) * 100} className="w-full" />
                  <div className="text-sm text-muted-foreground">
                    {Math.round((stats.monthlyCollection / 5000000) * 100)}% of monthly target achieved
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Outstanding</span>
                    <span className="font-bold text-red-600">₹{stats.totalPending.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Overdue Amount</span>
                    <span className="font-bold text-orange-600">₹{stats.totalOverdue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Students with Dues</span>
                    <span className="font-bold">{stats.overdueStudents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Collection Dialog */}
      <Dialog open={isCollectFeeDialogOpen} onOpenChange={setIsCollectFeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>
              Record payment for {selectedFee?.studentName} - {selectedFee?.feeType}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFee && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Due Amount:</span>
                  <span className="font-bold">₹{(selectedFee.remainingAmount || selectedFee.amount).toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  placeholder="Enter payment amount"
                />
              </div>
              
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                <Input
                  id="transactionId"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                  placeholder="Enter transaction ID"
                />
              </div>
              
              <div>
                <Label htmlFor="discount">Discount (Optional)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={paymentForm.discount}
                  onChange={(e) => setPaymentForm({...paymentForm, discount: e.target.value})}
                  placeholder="Enter discount amount"
                />
              </div>
              
              <div>
                <Label htmlFor="paymentRemarks">Remarks</Label>
                <Textarea
                  id="paymentRemarks"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})}
                  placeholder="Enter any remarks"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCollectFeeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCollectFee}>
              Collect Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Fee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fee Details</DialogTitle>
          </DialogHeader>
          
          {selectedFee && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Student Information</h3>
                  <div className="space-y-1 text-sm">
                    <div>Name: {selectedFee.studentName}</div>
                    <div>Class: {selectedFee.studentClass}</div>
                    <div>Roll Number: {selectedFee.rollNumber}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Fee Information</h3>
                  <div className="space-y-1 text-sm">
                    <div>Type: {selectedFee.feeType}</div>
                    <div>Amount: ₹{selectedFee.amount.toLocaleString()}</div>
                    <div>Due Date: {new Date(selectedFee.dueDate).toLocaleDateString()}</div>
                    <div>Status: <Badge className={getStatusColor(selectedFee.status)}>{selectedFee.status}</Badge></div>
                  </div>
                </div>
              </div>
              
              {selectedFee.paidDate && (
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <div className="space-y-1 text-sm">
                    <div>Paid Date: {new Date(selectedFee.paidDate).toLocaleDateString()}</div>
                    <div>Payment Method: {selectedFee.paymentMethod}</div>
                    {selectedFee.transactionId && <div>Transaction ID: {selectedFee.transactionId}</div>}
                    {selectedFee.receiptNumber && <div>Receipt Number: {selectedFee.receiptNumber}</div>}
                  </div>
                </div>
              )}
              
              {selectedFee.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm">{selectedFee.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}