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
import { api } from '../../utils/api';
import { 
  Plus, Search, Eye, Edit, Trash2, Package, Warehouse,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Download, Upload, RefreshCw, Filter, BarChart3,
  ShoppingCart, Truck, Calendar, Settings, Tag,
  Box, Layers, Archive, Clock, DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  subcategory?: string;
  description: string;
  unitOfMeasurement: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  location: string;
  barcode?: string;
  expiryDate?: string;
  batchNumber?: string;
  status: 'active' | 'inactive' | 'discontinued';
  lastUpdated: string;
  created_at: string;
}

interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  transactionType: 'purchase' | 'issue' | 'return' | 'adjustment' | 'transfer';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  fromLocation?: string;
  toLocation?: string;
  requestedBy?: string;
  approvedBy?: string;
  reason: string;
  referenceNumber?: string;
  transactionDate: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  created_at: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  createdBy: string;
  created_at: string;
}

interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface StockRequest {
  id: string;
  requestNumber: string;
  requestedBy: string;
  requestedByName: string;
  department: string;
  requestDate: string;
  requiredDate: string;
  items: StockRequestItem[];
  status: 'pending' | 'approved' | 'partially_fulfilled' | 'fulfilled' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
  remarks?: string;
  created_at: string;
}

interface StockRequestItem {
  itemId: string;
  itemName: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  issuedQuantity?: number;
  unitCost: number;
}

interface Supplier {
  id: string;
  supplierName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  paymentTerms: string;
  rating: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringSoon: number;
  pendingRequests: number;
  monthlyConsumption: number;
  inventoryTurnover: number;
}

interface UnitOfMeasurement {
  id: string;
  unitName: string;
  unitSymbol: string;
  unitType: 'weight' | 'length' | 'volume' | 'quantity' | 'area' | 'time';
  baseUnit?: string;
  conversionFactor?: number;
  description?: string;
  isActive: boolean;
  created_at: string;
}

export function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [unitsOfMeasurement, setUnitsOfMeasurement] = useState<UnitOfMeasurement[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringSoon: 0,
    pendingRequests: 0,
    monthlyConsumption: 0,
    inventoryTurnover: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [isCreatePODialogOpen, setIsCreatePODialogOpen] = useState(false);
  const [isStockRequestDialogOpen, setIsStockRequestDialogOpen] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [isAddUOMDialogOpen, setIsAddUOMDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const [newItem, setNewItem] = useState({
    itemCode: '',
    itemName: '',
    category: '',
    subcategory: '',
    description: '',
    unitOfMeasurement: '',
    currentStock: '',
    minimumStock: '',
    maximumStock: '',
    reorderLevel: '',
    unitCost: '',
    supplier: '',
    location: '',
    barcode: '',
    expiryDate: '',
    batchNumber: ''
  });

  const [newTransaction, setNewTransaction] = useState({
    itemId: '',
    transactionType: 'purchase',
    quantity: '',
    unitCost: '',
    fromLocation: '',
    toLocation: '',
    requestedBy: '',
    reason: '',
    referenceNumber: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const [newPurchaseOrder, setNewPurchaseOrder] = useState({
    supplier: '',
    expectedDeliveryDate: '',
    items: [{ itemId: '', quantity: '', unitCost: '' }],
    tax: '18'
  });

  const [newStockRequest, setNewStockRequest] = useState({
    requestedBy: '',
    department: '',
    requiredDate: '',
    items: [{ itemId: '', requestedQuantity: '' }],
    remarks: ''
  });

  const [newSupplier, setNewSupplier] = useState({
    supplierName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    paymentTerms: '',
    rating: '5'
  });

  const [newUOM, setNewUOM] = useState({
    unitName: '',
    unitSymbol: '',
    unitType: 'quantity',
    baseUnit: '',
    conversionFactor: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        itemsData, 
        transactionsData, 
        purchaseOrdersData, 
        stockRequestsData, 
        suppliersData, 
        uomData,
        statsData
      ] = await Promise.all([
        api.getInventoryItems(),
        api.getStockTransactions(),
        api.getPurchaseOrders(),
        api.getStockRequests(),
        api.getSuppliers(),
        api.getUnitsOfMeasurement(),
        api.getInventoryStats()
      ]);
      
      setItems(itemsData);
      setTransactions(transactionsData);
      setPurchaseOrders(purchaseOrdersData);
      setStockRequests(stockRequestsData);
      setSuppliers(suppliersData);
      setUnitsOfMeasurement(uomData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load inventory data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const itemData = {
        ...newItem,
        itemCode: newItem.itemCode || `ITM${Date.now()}`,
        currentStock: parseFloat(newItem.currentStock),
        minimumStock: parseFloat(newItem.minimumStock),
        maximumStock: parseFloat(newItem.maximumStock),
        reorderLevel: parseFloat(newItem.reorderLevel),
        unitCost: parseFloat(newItem.unitCost),
        totalValue: parseFloat(newItem.currentStock) * parseFloat(newItem.unitCost),
        status: 'active',
        lastUpdated: new Date().toISOString()
      };
      
      await api.createInventoryItem(itemData);
      toast.success('Item added successfully');
      setIsAddItemDialogOpen(false);
      resetItemForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add item');
      console.error(error);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const transactionData = {
        ...newTransaction,
        quantity: parseFloat(newTransaction.quantity),
        unitCost: newTransaction.unitCost ? parseFloat(newTransaction.unitCost) : undefined,
        totalCost: newTransaction.unitCost ? parseFloat(newTransaction.quantity) * parseFloat(newTransaction.unitCost) : undefined,
        status: 'completed'
      };
      
      await api.createStockTransaction(transactionData);
      toast.success('Transaction recorded successfully');
      setIsAddTransactionDialogOpen(false);
      resetTransactionForm();
      loadData();
    } catch (error) {
      toast.error('Failed to record transaction');
      console.error(error);
    }
  };

  const handleCreatePO = async () => {
    try {
      const poData = {
        orderNumber: `PO${Date.now()}`,
        supplier: newPurchaseOrder.supplier,
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: newPurchaseOrder.expectedDeliveryDate,
        items: newPurchaseOrder.items.map(item => ({
          itemId: item.itemId,
          itemName: items.find(i => i.id === item.itemId)?.itemName || '',
          quantity: parseFloat(item.quantity),
          unitCost: parseFloat(item.unitCost),
          totalCost: parseFloat(item.quantity) * parseFloat(item.unitCost)
        })).filter(item => item.itemId),
        subtotal: 0,
        tax: parseFloat(newPurchaseOrder.tax),
        totalAmount: 0,
        status: 'draft',
        createdBy: 'Current User'
      };
      
      // Calculate subtotal and total
      poData.subtotal = poData.items.reduce((sum, item) => sum + item.totalCost, 0);
      poData.totalAmount = poData.subtotal + (poData.subtotal * poData.tax / 100);
      
      await api.createPurchaseOrder(poData);
      toast.success('Purchase order created successfully');
      setIsCreatePODialogOpen(false);
      resetPOForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create purchase order');
      console.error(error);
    }
  };

  const handleStockRequest = async () => {
    try {
      const requestData = {
        requestNumber: `SR${Date.now()}`,
        requestedBy: 'current_user',
        requestedByName: newStockRequest.requestedBy,
        department: newStockRequest.department,
        requestDate: new Date().toISOString(),
        requiredDate: newStockRequest.requiredDate,
        items: newStockRequest.items.map(item => ({
          itemId: item.itemId,
          itemName: items.find(i => i.id === item.itemId)?.itemName || '',
          requestedQuantity: parseFloat(item.requestedQuantity),
          unitCost: items.find(i => i.id === item.itemId)?.unitCost || 0
        })).filter(item => item.itemId),
        status: 'pending',
        remarks: newStockRequest.remarks
      };
      
      await api.createStockRequest(requestData);
      toast.success('Stock request submitted successfully');
      setIsStockRequestDialogOpen(false);
      resetStockRequestForm();
      loadData();
    } catch (error) {
      toast.error('Failed to submit stock request');
      console.error(error);
    }
  };

  const handleAddSupplier = async () => {
    try {
      const supplierData = {
        ...newSupplier,
        rating: parseFloat(newSupplier.rating),
        status: 'active'
      };
      
      await api.createSupplier(supplierData);
      toast.success('Supplier added successfully');
      setIsAddSupplierDialogOpen(false);
      resetSupplierForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add supplier');
      console.error(error);
    }
  };

  const handleAddUOM = async () => {
    try {
      const uomData = {
        ...newUOM,
        conversionFactor: newUOM.conversionFactor ? parseFloat(newUOM.conversionFactor) : undefined,
        isActive: true
      };
      
      await api.createUnitOfMeasurement(uomData);
      toast.success('Unit of measurement added successfully');
      setIsAddUOMDialogOpen(false);
      resetUOMForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add unit of measurement');
      console.error(error);
    }
  };

  const resetItemForm = () => {
    setNewItem({
      itemCode: '',
      itemName: '',
      category: '',
      subcategory: '',
      description: '',
      unitOfMeasurement: '',
      currentStock: '',
      minimumStock: '',
      maximumStock: '',
      reorderLevel: '',
      unitCost: '',
      supplier: '',
      location: '',
      barcode: '',
      expiryDate: '',
      batchNumber: ''
    });
  };

  const resetTransactionForm = () => {
    setNewTransaction({
      itemId: '',
      transactionType: 'purchase',
      quantity: '',
      unitCost: '',
      fromLocation: '',
      toLocation: '',
      requestedBy: '',
      reason: '',
      referenceNumber: '',
      transactionDate: new Date().toISOString().split('T')[0]
    });
  };

  const resetPOForm = () => {
    setNewPurchaseOrder({
      supplier: '',
      expectedDeliveryDate: '',
      items: [{ itemId: '', quantity: '', unitCost: '' }],
      tax: '18'
    });
  };

  const resetStockRequestForm = () => {
    setNewStockRequest({
      requestedBy: '',
      department: '',
      requiredDate: '',
      items: [{ itemId: '', requestedQuantity: '' }],
      remarks: ''
    });
  };

  const resetSupplierForm = () => {
    setNewSupplier({
      supplierName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      paymentTerms: '',
      rating: '5'
    });
  };

  const resetUOMForm = () => {
    setNewUOM({
      unitName: '',
      unitSymbol: '',
      unitType: 'quantity',
      baseUnit: '',
      conversionFactor: '',
      description: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': case 'approved': case 'fulfilled': case 'received': return 'bg-green-100 text-green-800';
      case 'pending': case 'sent': case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': case 'cancelled': case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': case 'partially_fulfilled': return 'bg-blue-100 text-blue-800';
      case 'discontinued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (item.currentStock <= item.minimumStock) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    if (item.currentStock >= item.maximumStock) return { status: 'Overstock', color: 'bg-orange-100 text-orange-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const filteredItems = items.filter(item => {
    const stockStatus = getStockStatus(item);
    return (
      (item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === '' || item.category === categoryFilter) &&
      (statusFilter === '' || item.status === statusFilter) &&
      (stockFilter === '' || stockStatus.status === stockFilter)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage school inventory, stock levels, and procurement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddUOMDialogOpen} onOpenChange={setIsAddUOMDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Add UOM
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Unit of Measurement</DialogTitle>
                <DialogDescription>
                  Define a new unit of measurement for inventory items
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitName">Unit Name</Label>
                    <Input
                      id="unitName"
                      value={newUOM.unitName}
                      onChange={(e) => setNewUOM({...newUOM, unitName: e.target.value})}
                      placeholder="e.g., Kilogram"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitSymbol">Unit Symbol</Label>
                    <Input
                      id="unitSymbol"
                      value={newUOM.unitSymbol}
                      onChange={(e) => setNewUOM({...newUOM, unitSymbol: e.target.value})}
                      placeholder="e.g., kg"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select value={newUOM.unitType} onValueChange={(value) => setNewUOM({...newUOM, unitType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="length">Length</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="time">Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseUnit">Base Unit (Optional)</Label>
                    <Input
                      id="baseUnit"
                      value={newUOM.baseUnit}
                      onChange={(e) => setNewUOM({...newUOM, baseUnit: e.target.value})}
                      placeholder="e.g., gram"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conversionFactor">Conversion Factor</Label>
                    <Input
                      id="conversionFactor"
                      type="number"
                      value={newUOM.conversionFactor}
                      onChange={(e) => setNewUOM({...newUOM, conversionFactor: e.target.value})}
                      placeholder="e.g., 1000"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="uomDescription">Description</Label>
                  <Textarea
                    id="uomDescription"
                    value={newUOM.description}
                    onChange={(e) => setNewUOM({...newUOM, description: e.target.value})}
                    placeholder="Enter description"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddUOMDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUOM}>
                  Add UOM
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Truck className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Add a new supplier to the vendor database
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    value={newSupplier.supplierName}
                    onChange={(e) => setNewSupplier({...newSupplier, supplierName: e.target.value})}
                    placeholder="Enter supplier name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={newSupplier.contactPerson}
                      onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                      placeholder="Enter contact person"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierEmail">Email</Label>
                    <Input
                      id="supplierEmail"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierPhone">Phone</Label>
                    <Input
                      id="supplierPhone"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierCategory">Category</Label>
                    <Input
                      id="supplierCategory"
                      value={newSupplier.category}
                      onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                      placeholder="e.g., Stationery, Furniture"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="supplierAddress">Address</Label>
                  <Textarea
                    id="supplierAddress"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      value={newSupplier.paymentTerms}
                      onChange={(e) => setNewSupplier({...newSupplier, paymentTerms: e.target.value})}
                      placeholder="e.g., Net 30, Cash on delivery"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierRating">Rating (1-5)</Label>
                    <Input
                      id="supplierRating"
                      type="number"
                      min="1"
                      max="5"
                      value={newSupplier.rating}
                      onChange={(e) => setNewSupplier({...newSupplier, rating: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddSupplierDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier}>
                  Add Supplier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isStockRequestDialogOpen} onOpenChange={setIsStockRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Stock Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Stock Request</DialogTitle>
                <DialogDescription>
                  Request items from inventory
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requestedBy">Requested By</Label>
                    <Input
                      id="requestedBy"
                      value={newStockRequest.requestedBy}
                      onChange={(e) => setNewStockRequest({...newStockRequest, requestedBy: e.target.value})}
                      placeholder="Enter requester name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requestDepartment">Department</Label>
                    <Input
                      id="requestDepartment"
                      value={newStockRequest.department}
                      onChange={(e) => setNewStockRequest({...newStockRequest, department: e.target.value})}
                      placeholder="Enter department"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="requiredDate">Required Date</Label>
                  <Input
                    id="requiredDate"
                    type="date"
                    value={newStockRequest.requiredDate}
                    onChange={(e) => setNewStockRequest({...newStockRequest, requiredDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Requested Items</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewStockRequest({
                        ...newStockRequest,
                        items: [...newStockRequest.items, { itemId: '', requestedQuantity: '' }]
                      })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {newStockRequest.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 items-center">
                        <Select 
                          value={item.itemId} 
                          onValueChange={(value) => {
                            const updatedItems = [...newStockRequest.items];
                            updatedItems[index].itemId = value;
                            setNewStockRequest({...newStockRequest, items: updatedItems});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((inventoryItem) => (
                              <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                                {inventoryItem.itemName} (Stock: {inventoryItem.currentStock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={item.requestedQuantity}
                          onChange={(e) => {
                            const updatedItems = [...newStockRequest.items];
                            updatedItems[index].requestedQuantity = e.target.value;
                            setNewStockRequest({...newStockRequest, items: updatedItems});
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedItems = newStockRequest.items.filter((_, i) => i !== index);
                            setNewStockRequest({...newStockRequest, items: updatedItems});
                          }}
                          disabled={newStockRequest.items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="requestRemarks">Remarks</Label>
                  <Textarea
                    id="requestRemarks"
                    value={newStockRequest.remarks}
                    onChange={(e) => setNewStockRequest({...newStockRequest, remarks: e.target.value})}
                    placeholder="Enter any additional remarks"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsStockRequestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStockRequest}>
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreatePODialogOpen} onOpenChange={setIsCreatePODialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Create PO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order for inventory replenishment
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="poSupplier">Supplier</Label>
                    <Select value={newPurchaseOrder.supplier} onValueChange={(value) => setNewPurchaseOrder({...newPurchaseOrder, supplier: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.supplierName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                    <Input
                      id="expectedDeliveryDate"
                      type="date"
                      value={newPurchaseOrder.expectedDeliveryDate}
                      onChange={(e) => setNewPurchaseOrder({...newPurchaseOrder, expectedDeliveryDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Order Items</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewPurchaseOrder({
                        ...newPurchaseOrder,
                        items: [...newPurchaseOrder.items, { itemId: '', quantity: '', unitCost: '' }]
                      })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {newPurchaseOrder.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <Select 
                          value={item.itemId} 
                          onValueChange={(value) => {
                            const updatedItems = [...newPurchaseOrder.items];
                            updatedItems[index].itemId = value;
                            setNewPurchaseOrder({...newPurchaseOrder, items: updatedItems});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((inventoryItem) => (
                              <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                                {inventoryItem.itemName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedItems = [...newPurchaseOrder.items];
                            updatedItems[index].quantity = e.target.value;
                            setNewPurchaseOrder({...newPurchaseOrder, items: updatedItems});
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Unit Cost"
                          value={item.unitCost}
                          onChange={(e) => {
                            const updatedItems = [...newPurchaseOrder.items];
                            updatedItems[index].unitCost = e.target.value;
                            setNewPurchaseOrder({...newPurchaseOrder, items: updatedItems});
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedItems = newPurchaseOrder.items.filter((_, i) => i !== index);
                            setNewPurchaseOrder({...newPurchaseOrder, items: updatedItems});
                          }}
                          disabled={newPurchaseOrder.items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="poTax">Tax (%)</Label>
                  <Input
                    id="poTax"
                    type="number"
                    value={newPurchaseOrder.tax}
                    onChange={(e) => setNewPurchaseOrder({...newPurchaseOrder, tax: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreatePODialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePO}>
                  Create Purchase Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Stock Transaction</DialogTitle>
                <DialogDescription>
                  Record stock movement or adjustment
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionItem">Item</Label>
                    <Select value={newTransaction.itemId} onValueChange={(value) => setNewTransaction({...newTransaction, itemId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.itemName} (Stock: {item.currentStock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transactionType">Transaction Type</Label>
                    <Select value={newTransaction.transactionType} onValueChange={(value) => setNewTransaction({...newTransaction, transactionType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="issue">Issue</SelectItem>
                        <SelectItem value="return">Return</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionQuantity">Quantity</Label>
                    <Input
                      id="transactionQuantity"
                      type="number"
                      value={newTransaction.quantity}
                      onChange={(e) => setNewTransaction({...newTransaction, quantity: e.target.value})}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionUnitCost">Unit Cost (Optional)</Label>
                    <Input
                      id="transactionUnitCost"
                      type="number"
                      value={newTransaction.unitCost}
                      onChange={(e) => setNewTransaction({...newTransaction, unitCost: e.target.value})}
                      placeholder="Enter unit cost"
                    />
                  </div>
                </div>
                
                {newTransaction.transactionType === 'transfer' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromLocation">From Location</Label>
                      <Input
                        id="fromLocation"
                        value={newTransaction.fromLocation}
                        onChange={(e) => setNewTransaction({...newTransaction, fromLocation: e.target.value})}
                        placeholder="Enter source location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="toLocation">To Location</Label>
                      <Input
                        id="toLocation"
                        value={newTransaction.toLocation}
                        onChange={(e) => setNewTransaction({...newTransaction, toLocation: e.target.value})}
                        placeholder="Enter destination location"
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionDate">Transaction Date</Label>
                    <Input
                      id="transactionDate"
                      type="date"
                      value={newTransaction.transactionDate}
                      onChange={(e) => setNewTransaction({...newTransaction, transactionDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referenceNumber">Reference Number</Label>
                    <Input
                      id="referenceNumber"
                      value={newTransaction.referenceNumber}
                      onChange={(e) => setNewTransaction({...newTransaction, referenceNumber: e.target.value})}
                      placeholder="Enter reference number"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="transactionReason">Reason</Label>
                  <Textarea
                    id="transactionReason"
                    value={newTransaction.reason}
                    onChange={(e) => setNewTransaction({...newTransaction, reason: e.target.value})}
                    placeholder="Enter reason for transaction"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddTransactionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTransaction}>
                  Record Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new item to the inventory database
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemCode">Item Code</Label>
                    <Input
                      id="itemCode"
                      value={newItem.itemCode}
                      onChange={(e) => setNewItem({...newItem, itemCode: e.target.value})}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newItem.itemName}
                      onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                      placeholder="Enter item name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      placeholder="e.g., Stationery, Furniture"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={newItem.subcategory}
                      onChange={(e) => setNewItem({...newItem, subcategory: e.target.value})}
                      placeholder="Enter subcategory"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Enter item description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitOfMeasurement">Unit of Measurement</Label>
                    <Select value={newItem.unitOfMeasurement} onValueChange={(value) => setNewItem({...newItem, unitOfMeasurement: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select UOM" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitsOfMeasurement.filter(uom => uom.isActive).map((uom) => (
                          <SelectItem key={uom.id} value={uom.id}>
                            {uom.unitName} ({uom.unitSymbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select value={newItem.supplier} onValueChange={(value) => setNewItem({...newItem, supplier: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.filter(s => s.status === 'active').map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.supplierName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={newItem.currentStock}
                      onChange={(e) => setNewItem({...newItem, currentStock: e.target.value})}
                      placeholder="Enter current stock"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Unit Cost</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      value={newItem.unitCost}
                      onChange={(e) => setNewItem({...newItem, unitCost: e.target.value})}
                      placeholder="Enter unit cost"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minimumStock">Minimum Stock</Label>
                    <Input
                      id="minimumStock"
                      type="number"
                      value={newItem.minimumStock}
                      onChange={(e) => setNewItem({...newItem, minimumStock: e.target.value})}
                      placeholder="Min stock level"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maximumStock">Maximum Stock</Label>
                    <Input
                      id="maximumStock"
                      type="number"
                      value={newItem.maximumStock}
                      onChange={(e) => setNewItem({...newItem, maximumStock: e.target.value})}
                      placeholder="Max stock level"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      value={newItem.reorderLevel}
                      onChange={(e) => setNewItem({...newItem, reorderLevel: e.target.value})}
                      placeholder="Reorder level"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Storage Location</Label>
                    <Input
                      id="location"
                      value={newItem.location}
                      onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                      placeholder="Enter storage location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={newItem.barcode}
                      onChange={(e) => setNewItem({...newItem, barcode: e.target.value})}
                      placeholder="Enter barcode"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newItem.expiryDate}
                      onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
                    <Input
                      id="batchNumber"
                      value={newItem.batchNumber}
                      onChange={(e) => setNewItem({...newItem, batchNumber: e.target.value})}
                      placeholder="Enter batch number"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>
                  Add Item
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
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-xs text-muted-foreground">Active inventory</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Inventory value</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
                <p className="text-xs text-muted-foreground">{stats.outOfStockItems} out of stock</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {stats.lowStockItems} items with low stock levels and {stats.outOfStockItems} items out of stock. 
            Consider creating purchase orders to replenish inventory.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="items" className="w-full">
        <TabsList>
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="stock-requests">Stock Requests</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="uom">Units of Measurement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Stationery">Stationery</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Sports">Sports Equipment</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Overstock">Overstock</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min/Max</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.slice(0, 15).map((item) => {
                      const stockStatus = getStockStatus(item);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.itemCode}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.itemName}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.unitOfMeasurement} | {item.location}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{item.category}</div>
                              {item.subcategory && (
                                <div className="text-sm text-muted-foreground">{item.subcategory}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-bold">{item.currentStock}</div>
                              <Badge className={stockStatus.color} variant="outline">
                                {stockStatus.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>Min: {item.minimumStock}</div>
                            <div>Max: {item.maximumStock}</div>
                          </TableCell>
                          <TableCell>₹{item.unitCost.toLocaleString()}</TableCell>
                          <TableCell className="font-bold">₹{item.totalValue.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
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
                              <Button size="sm" variant="outline">
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 15).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.itemName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.transactionType)}>
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          {transaction.transactionType === 'issue' || transaction.transactionType === 'adjustment' ? '-' : '+'}
                          {transaction.quantity}
                        </TableCell>
                        <TableCell>
                          {transaction.totalCost && `₹${transaction.totalCost.toLocaleString()}`}
                        </TableCell>
                        <TableCell className="max-w-48 truncate">{transaction.reason}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
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
        
        <TabsContent value="purchase-orders" className="space-y-4">
          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <Card key={po.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">PO #{po.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          Supplier: {suppliers.find(s => s.id === po.supplier)?.supplierName}
                        </p>
                      </div>
                      <Badge className={getStatusColor(po.status)}>
                        {po.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Order Date:</span>
                        <p>{new Date(po.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Expected Delivery:</span>
                        <p>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Items:</span>
                        <p>{po.items.length} items</p>
                      </div>
                      <div>
                        <span className="font-medium">Total Amount:</span>
                        <p className="font-bold">₹{po.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Order Items:</h4>
                      <div className="space-y-1">
                        {po.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.itemName} (Qty: {item.quantity})</span>
                            <span>₹{item.totalCost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      {po.status === 'draft' && (
                        <Button size="sm" variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="stock-requests" className="space-y-4">
          <div className="space-y-4">
            {stockRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">Request #{request.requestNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          Requested by: {request.requestedByName} ({request.department})
                        </p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Request Date:</span>
                        <p>{new Date(request.requestDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Required Date:</span>
                        <p>{new Date(request.requiredDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Items:</span>
                        <p>{request.items.length} items</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Requested Items:</h4>
                      <div className="space-y-1">
                        {request.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.itemName}</span>
                            <span>Qty: {item.requestedQuantity}</span>
                          </div>
                        ))}
                      </div>
                      {request.remarks && (
                        <div className="mt-2 pt-2 border-t text-sm">
                          <span className="font-medium">Remarks: </span>
                          {request.remarks}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{supplier.supplierName}</h3>
                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                      </div>
                      <Badge className={getStatusColor(supplier.status)}>
                        {supplier.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Contact Person:</span>
                        <p>{supplier.contactPerson}</p>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>
                        <p>{supplier.email}</p>
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p>{supplier.phone}</p>
                      </div>
                      <div>
                        <span className="font-medium">Payment Terms:</span>
                        <p>{supplier.paymentTerms}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Rating:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < supplier.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
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
        
        <TabsContent value="uom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Units of Measurement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Name</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Base Unit</TableHead>
                      <TableHead>Conversion Factor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unitsOfMeasurement.map((uom) => (
                      <TableRow key={uom.id}>
                        <TableCell className="font-medium">{uom.unitName}</TableCell>
                        <TableCell className="font-mono">{uom.unitSymbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{uom.unitType}</Badge>
                        </TableCell>
                        <TableCell>{uom.baseUnit || '-'}</TableCell>
                        <TableCell>{uom.conversionFactor || '-'}</TableCell>
                        <TableCell>
                          <Badge className={uom.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {uom.isActive ? 'Active' : 'Inactive'}
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
      </Tabs>
    </div>
  );
}