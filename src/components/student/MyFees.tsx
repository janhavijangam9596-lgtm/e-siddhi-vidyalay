import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';
import {
  ChevronLeft, CreditCard, Download, Receipt, AlertCircle,
  Calendar, CheckCircle, Clock, DollarSign, FileText, TrendingUp
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FeeComponent {
  name: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  category: string;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  method: string;
  transactionId: string;
  status: 'success' | 'pending' | 'failed';
  description: string;
}

interface FeeBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export function MyFees() {
  const { navigate } = useNavigation();
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const totalFees = 45000;
  const paidAmount = 30000;
  const pendingAmount = 15000;
  const overdueAmount = 5000;
  const nextDueDate = 'Jan 15, 2024';

  const feeComponents: FeeComponent[] = [
    {
      name: 'Tuition Fee',
      amount: 25000,
      dueDate: 'Jan 15, 2024',
      status: 'paid',
      category: 'Academic'
    },
    {
      name: 'Library Fee',
      amount: 2000,
      dueDate: 'Jan 15, 2024',
      status: 'paid',
      category: 'Facilities'
    },
    {
      name: 'Lab Fee',
      amount: 3000,
      dueDate: 'Jan 15, 2024',
      status: 'paid',
      category: 'Academic'
    },
    {
      name: 'Sports Fee',
      amount: 1500,
      dueDate: 'Feb 1, 2024',
      status: 'pending',
      category: 'Activities'
    },
    {
      name: 'Exam Fee',
      amount: 5000,
      dueDate: 'Feb 15, 2024',
      status: 'pending',
      category: 'Academic'
    },
    {
      name: 'Transport Fee',
      amount: 8000,
      dueDate: 'Dec 1, 2023',
      status: 'overdue',
      category: 'Services'
    },
    {
      name: 'Hostel Fee',
      amount: 500,
      dueDate: 'Feb 1, 2024',
      status: 'pending',
      category: 'Accommodation'
    }
  ];

  const paymentHistory: PaymentHistory[] = [
    {
      id: 'TXN2024001',
      date: 'Jan 5, 2024',
      amount: 25000,
      method: 'Online Banking',
      transactionId: 'UPI20240105123456',
      status: 'success',
      description: 'Tuition Fee - Semester 6'
    },
    {
      id: 'TXN2023012',
      date: 'Dec 20, 2023',
      amount: 3000,
      method: 'Credit Card',
      transactionId: 'CC20231220789012',
      status: 'success',
      description: 'Lab Fee'
    },
    {
      id: 'TXN2023011',
      date: 'Dec 15, 2023',
      amount: 2000,
      method: 'Debit Card',
      transactionId: 'DC20231215345678',
      status: 'success',
      description: 'Library Fee'
    },
    {
      id: 'TXN2023010',
      date: 'Nov 30, 2023',
      amount: 8000,
      method: 'Cash',
      transactionId: 'CASH20231130901234',
      status: 'failed',
      description: 'Transport Fee - Failed'
    }
  ];

  const feeBreakdown: FeeBreakdown[] = [
    { category: 'Academic', amount: 33000, percentage: 73, color: '#3B82F6' },
    { category: 'Services', amount: 8000, percentage: 18, color: '#10B981' },
    { category: 'Facilities', amount: 2000, percentage: 4, color: '#F59E0B' },
    { category: 'Activities', amount: 1500, percentage: 3, color: '#8B5CF6' },
    { category: 'Accommodation', amount: 500, percentage: 1, color: '#EC4899' }
  ];

  // Monthly payment trend
  const monthlyPayments = [
    { month: 'Aug', amount: 15000 },
    { month: 'Sep', amount: 5000 },
    { month: 'Oct', amount: 3000 },
    { month: 'Nov', amount: 2000 },
    { month: 'Dec', amount: 5000 },
    { month: 'Jan', amount: 25000 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

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
            <h1 className="text-2xl font-bold">My Fees</h1>
            <p className="text-muted-foreground">Manage your fee payments</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Semester</SelectItem>
              <SelectItem value="previous">Previous Semester</SelectItem>
              <SelectItem value="all">All Semesters</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Fee Statement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</div>
            <Progress value={(paidAmount / totalFees) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Due by {nextDueDate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-red-600">Immediate payment required</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Management Tabs */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Fee Breakdown</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feeComponents.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div>
                        <h4 className="font-medium">{component.name}</h4>
                        <p className="text-sm text-muted-foreground">{component.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">₹{component.amount.toLocaleString()}</span>
                        <Badge className={getStatusColor(component.status)}>
                          {component.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={feeBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.category}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {feeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {feeBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                        <span>{item.category}</span>
                      </div>
                      <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{payment.description}</h4>
                          {getStatusIcon(payment.status)}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Transaction ID: {payment.transactionId}</span>
                          <span>•</span>
                          <span>{payment.date}</span>
                          <span>•</span>
                          <span>{payment.method}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">₹{payment.amount.toLocaleString()}</div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Receipt className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete your pending payments to avoid late fees
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feeComponents.filter(f => f.status === 'pending' || f.status === 'overdue').map((fee, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${fee.status === 'overdue' ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{fee.name}</h4>
                        <p className="text-sm text-muted-foreground">Due: {fee.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">₹{fee.amount.toLocaleString()}</div>
                        <Badge className={getStatusColor(fee.status)}>
                          {fee.status}
                        </Badge>
                      </div>
                    </div>
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Payment Methods Available</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>Net Banking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>UPI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>Cash at Office</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyPayments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Paid (Year)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹1,85,000</div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">All payments on time</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹15,416</div>
                <p className="text-sm text-muted-foreground mt-2">Per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Late Fees Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹2,500</div>
                <p className="text-sm text-muted-foreground mt-2">By timely payments</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


