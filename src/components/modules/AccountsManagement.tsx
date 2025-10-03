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
import { api } from '../../utils/api';
import {
  Plus, Search, Eye, Edit, DollarSign,
  TrendingUp, TrendingDown, Download,
  RefreshCw, Filter, PieChart, Receipt,
  Wallet, Building
} from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  transactionNumber: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  account: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'online';
  reference?: string;
  status: 'completed' | 'pending' | 'cancelled';
  tags: string[];
  attachments: string[];
  createdBy: string;
  created_at: string;
}

interface Account {
  id: string;
  accountName: string;
  accountType: 'cash' | 'bank' | 'petty_cash' | 'investment';
  accountNumber?: string;
  bankName?: string;
  balance: number;
  openingBalance: number;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  description?: string;
  created_at: string;
}

interface Budget {
  id: string;
  name: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'exceeded';
  created_at: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  tax: number;
  totalAmount: number;
  created_at: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalAccounts: number;
  cashFlow: number;
  outstandingInvoices: number;
  budgetUtilization: number;
}

export function AccountsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    totalAccounts: 0,
    cashFlow: 0,
    outstandingInvoices: 0,
    budgetUtilization: 0
  });
  
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const dateFilter = '';

  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    account: '',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    tags: ''
  });

  const [newAccount, setNewAccount] = useState({
    accountName: '',
    accountType: 'bank',
    accountNumber: '',
    bankName: '',
    openingBalance: '',
    currency: 'INR',
    description: ''
  });

  const [newBudget, setNewBudget] = useState({
    name: '',
    category: '',
    allocatedAmount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
    tax: 18
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, accountsData, budgetsData, invoicesData, statsData] = await Promise.all([
        api.getTransactions(),
        api.getAccounts(),
        api.getBudgets(),
        api.getInvoices(),
        api.getFinancialStats()
      ]);
      
      setTransactions(transactionsData);
      setAccounts(accountsData);
      setBudgets(budgetsData);
      setInvoices(invoicesData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load financial data');
      console.error(error);
    } finally {
      // Loading complete
    }
  };

  const handleAddTransaction = async () => {
    try {
      const transactionData = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        transactionNumber: `TXN${Date.now()}`,
        status: 'completed',
        createdBy: 'current_user',
        tags: newTransaction.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        attachments: []
      };
      
      await api.createTransaction(transactionData);
      toast.success('Transaction added successfully');
      setIsAddTransactionDialogOpen(false);
      resetTransactionForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add transaction');
      console.error(error);
    }
  };

  const handleAddAccount = async () => {
    try {
      const accountData = {
        ...newAccount,
        openingBalance: parseFloat(newAccount.openingBalance),
        balance: parseFloat(newAccount.openingBalance),
        status: 'active'
      };
      
      await api.createAccount(accountData);
      toast.success('Account created successfully');
      setIsAddAccountDialogOpen(false);
      resetAccountForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create account');
      console.error(error);
    }
  };

  const handleAddBudget = async () => {
    try {
      const budgetData = {
        ...newBudget,
        allocatedAmount: parseFloat(newBudget.allocatedAmount),
        spentAmount: 0,
        remainingAmount: parseFloat(newBudget.allocatedAmount),
        status: 'active'
      };
      
      await api.createBudget(budgetData);
      toast.success('Budget created successfully');
      setIsAddBudgetDialogOpen(false);
      resetBudgetForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create budget');
      console.error(error);
    }
  };

  const resetTransactionForm = () => {
    setNewTransaction({
      type: 'income',
      category: '',
      amount: '',
      description: '',
      account: '',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      tags: ''
    });
  };

  const resetAccountForm = () => {
    setNewAccount({
      accountName: '',
      accountType: 'bank',
      accountNumber: '',
      bankName: '',
      openingBalance: '',
      currency: 'INR',
      description: ''
    });
  };

  const resetBudgetForm = () => {
    setNewBudget({
      name: '',
      category: '',
      allocatedAmount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': case 'active': return 'bg-green-100 text-green-800';
      case 'pending': case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'exceeded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const filteredTransactions = (transactions || []).filter(transaction => {
    if (!transaction) return false;
    return (
      ((transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (transaction.transactionNumber || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter === '' || transaction.type === typeFilter) &&
      (accountFilter === '' || transaction.account === accountFilter) &&
      (dateFilter === '' || (transaction.date || '').includes(dateFilter))
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Accounts & Finance Management</h1>
          <p className="text-muted-foreground">
            Manage financial transactions, accounts, and budgets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateInvoiceDialogOpen} onOpenChange={setIsCreateInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Receipt className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>
                  Generate a new invoice for services or fees
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={newInvoice.clientName}
                      onChange={(e) => setNewInvoice({...newInvoice, clientName: e.target.value})}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={newInvoice.date}
                      onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Invoice Items</Label>
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mt-2">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const updatedItems = [...newInvoice.items];
                          updatedItems[index].description = e.target.value;
                          setNewInvoice({...newInvoice, items: updatedItems});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updatedItems = [...newInvoice.items];
                          updatedItems[index].quantity = parseInt(e.target.value);
                          setNewInvoice({...newInvoice, items: updatedItems});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => {
                          const updatedItems = [...newInvoice.items];
                          updatedItems[index].rate = parseFloat(e.target.value);
                          setNewInvoice({...newInvoice, items: updatedItems});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={item.quantity * item.rate}
                        disabled
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setNewInvoice({
                      ...newInvoice,
                      items: [...newInvoice.items, { description: '', quantity: 1, rate: 0 }]
                    })}
                  >
                    Add Item
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={newInvoice.tax}
                    onChange={(e) => setNewInvoice({...newInvoice, tax: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateInvoiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddBudgetDialogOpen} onOpenChange={setIsAddBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PieChart className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Budget</DialogTitle>
                <DialogDescription>
                  Set up a new budget for expense tracking
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budgetName">Budget Name</Label>
                  <Input
                    id="budgetName"
                    value={newBudget.name}
                    onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                    placeholder="Enter budget name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetCategory">Category</Label>
                    <Select value={newBudget.category} onValueChange={(value: string) => setNewBudget({...newBudget, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="salaries">Salaries</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budgetPeriod">Period</Label>
                    <Select value={newBudget.period} onValueChange={(value: string) => setNewBudget({...newBudget, period: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="allocatedAmount">Allocated Amount</Label>
                  <Input
                    id="allocatedAmount"
                    type="number"
                    value={newBudget.allocatedAmount}
                    onChange={(e) => setNewBudget({...newBudget, allocatedAmount: e.target.value})}
                    placeholder="Enter allocated amount"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetStartDate">Start Date</Label>
                    <Input
                      id="budgetStartDate"
                      type="date"
                      value={newBudget.startDate}
                      onChange={(e) => setNewBudget({...newBudget, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetEndDate">End Date</Label>
                    <Input
                      id="budgetEndDate"
                      type="date"
                      value={newBudget.endDate}
                      onChange={(e) => setNewBudget({...newBudget, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddBudgetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBudget}>
                  Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddAccountDialogOpen} onOpenChange={setIsAddAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>
                  Create a new financial account
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={newAccount.accountName}
                    onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                    placeholder="Enter account name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select value={newAccount.accountType} onValueChange={(value: string) => setNewAccount({...newAccount, accountType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank Account</SelectItem>
                        <SelectItem value="petty_cash">Petty Cash</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={newAccount.currency} onValueChange={(value: string) => setNewAccount({...newAccount, currency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {newAccount.accountType === 'bank' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={newAccount.bankName}
                        onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={newAccount.accountNumber}
                        onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                        placeholder="Enter account number"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="openingBalance">Opening Balance</Label>
                  <Input
                    id="openingBalance"
                    type="number"
                    value={newAccount.openingBalance}
                    onChange={(e) => setNewAccount({...newAccount, openingBalance: e.target.value})}
                    placeholder="Enter opening balance"
                  />
                </div>
                
                <div>
                  <Label htmlFor="accountDescription">Description</Label>
                  <Textarea
                    id="accountDescription"
                    value={newAccount.description}
                    onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                    placeholder="Enter account description"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddAccountDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAccount}>
                  Create Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Record a new financial transaction
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionType">Type</Label>
                    <Select value={newTransaction.type} onValueChange={(value: string) => setNewTransaction({...newTransaction, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTransaction.category} onValueChange={(value: string) => setNewTransaction({...newTransaction, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {newTransaction.type === 'income' ? (
                          <>
                            <SelectItem value="fees">Student Fees</SelectItem>
                            <SelectItem value="donations">Donations</SelectItem>
                            <SelectItem value="grants">Grants</SelectItem>
                            <SelectItem value="other_income">Other Income</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="salaries">Salaries</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="supplies">Supplies</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="other_expense">Other Expense</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Enter transaction description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account">Account</Label>
                    <Select value={newTransaction.account} onValueChange={(value: string) => setNewTransaction({...newTransaction, account: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={newTransaction.paymentMethod} onValueChange={(value: string) => setNewTransaction({...newTransaction, paymentMethod: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reference">Reference (Optional)</Label>
                    <Input
                      id="reference"
                      value={newTransaction.reference}
                      onChange={(e) => setNewTransaction({...newTransaction, reference: e.target.value})}
                      placeholder="Enter reference number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      value={newTransaction.tags}
                      onChange={(e) => setNewTransaction({...newTransaction, tags: e.target.value})}
                      placeholder="Enter tags, separated by commas"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddTransactionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTransaction}>
                  Add Transaction
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
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{(stats.totalIncome || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{(stats.totalExpenses || 0).toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(stats.netProfit || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{stats.profitMargin}% margin</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Cash Flow</p>
                <p className={`text-2xl font-bold ${(stats.cashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(stats.cashFlow || 0).toLocaleString()}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono">{transaction.transactionNumber}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className={transaction.type === 'income' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                          {transaction.type === 'income' ? '+' : '-'}₹{(transaction.amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{accounts.find(a => a.id === transaction.account)?.accountName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
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
        
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{account.accountName}</h3>
                        <p className="text-sm text-muted-foreground">{account.accountType}</p>
                      </div>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Balance:</span>
                        <span className="font-bold text-lg">₹{(account.balance || 0).toLocaleString()}</span>
                      </div>
                      {account.bankName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Bank:</span>
                          <span className="text-sm">{account.bankName}</span>
                        </div>
                      )}
                      {account.accountNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Account #:</span>
                          <span className="text-sm font-mono">{account.accountNumber}</span>
                        </div>
                      )}
                    </div>
                    
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
        
        <TabsContent value="budgets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <Card key={budget.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{budget.name}</h3>
                        <p className="text-sm text-muted-foreground">{budget.category} • {budget.period}</p>
                      </div>
                      <Badge className={getStatusColor(budget.status)}>
                        {budget.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Allocated:</span>
                        <span className="font-medium">₹{(budget.allocatedAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Spent:</span>
                        <span className="font-medium text-red-600">₹{(budget.spentAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remaining:</span>
                        <span className="font-medium text-green-600">₹{(budget.remainingAmount || 0).toLocaleString()}</span>
                      </div>
                      
                      <Progress 
                        value={(budget.spentAmount / budget.allocatedAmount) * 100} 
                        className="w-full"
                      />
                      <div className="text-center text-sm text-muted-foreground">
                        {Math.round((budget.spentAmount / budget.allocatedAmount) * 100)}% utilized
                      </div>
                    </div>
                    
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
        
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.slice(0, 10).map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold">₹{(invoice.totalAmount || 0).toLocaleString()}</TableCell>
                        <TableCell className="font-bold">₹{(invoice.paidAmount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Income</span>
                    <span className="font-bold text-green-600">₹{(stats.totalIncome || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Expenses</span>
                    <span className="font-bold text-red-600">₹{(stats.totalExpenses || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Net Profit</span>
                    <span className={`font-bold ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{(stats.netProfit || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Profit Margin</span>
                    <span className="font-bold">{stats.profitMargin}%</span>
                  </div>
                  <Progress value={stats.profitMargin} className="w-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{stats.totalAccounts}</div>
                      <div className="text-xs text-muted-foreground">Total Accounts</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{stats.outstandingInvoices}</div>
                      <div className="text-xs text-muted-foreground">Outstanding Invoices</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Budget Utilization</span>
                      <span className="font-bold">{stats.budgetUtilization}%</span>
                    </div>
                    <Progress value={stats.budgetUtilization} className="w-full" />
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