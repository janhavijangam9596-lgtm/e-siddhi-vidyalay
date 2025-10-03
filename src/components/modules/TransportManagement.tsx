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
import { api } from '../../utils/api';
import { 
  Plus, Search, Eye, Edit, Trash2, Bus, MapPin, 
  Clock, Route, Users, Fuel, Settings, AlertTriangle,
  Download, Upload, RefreshCw, Filter, Navigation,
  Phone, User, Calendar, Activity, BarChart3
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Bus {
  id: string;
  busNumber: string;
  capacity: number;
  currentStudents: number;
  driverId: string;
  driverName: string;
  attendantId?: string;
  attendantName?: string;
  routeId: string;
  routeName: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastService: string;
  nextService: string;
  fuelEfficiency: number;
  gpsEnabled: boolean;
  created_at: string;
}

interface Route {
  id: string;
  routeName: string;
  routeCode: string;
  startLocation: string;
  endLocation: string;
  totalDistance: number;
  estimatedTime: number;
  stops: BusStop[];
  busId?: string;
  busNumber?: string;
  fare: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface BusStop {
  id: string;
  stopName: string;
  location: string;
  pickupTime: string;
  dropTime: string;
  students: number;
  landmark?: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email?: string;
  experience: number;
  busAssigned?: string;
  status: 'active' | 'inactive' | 'on_leave';
  joiningDate: string;
  created_at: string;
}

interface StudentTransport {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  routeId: string;
  routeName: string;
  stopId: string;
  stopName: string;
  pickupTime: string;
  dropTime: string;
  monthlyFee: number;
  status: 'active' | 'inactive' | 'suspended';
  parentPhone: string;
  created_at: string;
}

interface TransportStats {
  totalBuses: number;
  activeBuses: number;
  totalStudents: number;
  totalRoutes: number;
  averageOccupancy: number;
  maintenanceDue: number;
  totalDistance: number;
  fuelConsumption: number;
}

export function TransportManagement() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [studentTransport, setStudentTransport] = useState<StudentTransport[]>([]);
  const [stats, setStats] = useState<TransportStats>({
    totalBuses: 0,
    activeBuses: 0,
    totalStudents: 0,
    totalRoutes: 0,
    averageOccupancy: 0,
    maintenanceDue: 0,
    totalDistance: 0,
    fuelConsumption: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddBusDialogOpen, setIsAddBusDialogOpen] = useState(false);
  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false);
  const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
  const [isAssignStudentDialogOpen, setIsAssignStudentDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [newBus, setNewBus] = useState({
    busNumber: '',
    capacity: '40',
    driverId: '',
    attendantId: '',
    routeId: '',
    fuelEfficiency: '12',
    gpsEnabled: true
  });

  const [newRoute, setNewRoute] = useState({
    routeName: '',
    routeCode: '',
    startLocation: '',
    endLocation: '',
    totalDistance: '',
    estimatedTime: '',
    fare: '',
    stops: [
      { stopName: '', location: '', pickupTime: '', dropTime: '', landmark: '' }
    ]
  });

  const [newDriver, setNewDriver] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    experience: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  const [assignStudentForm, setAssignStudentForm] = useState({
    studentId: '',
    routeId: '',
    stopId: '',
    monthlyFee: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [busesData, routesData, driversData, studentsData, statsData] = await Promise.all([
        api.getBuses(),
        api.getRoutes(),
        api.getDrivers(),
        api.getStudentTransport(),
        api.getTransportStats()
      ]);
      
      setBuses(busesData);
      setRoutes(routesData);
      setDrivers(driversData);
      setStudentTransport(studentsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load transport data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async () => {
    try {
      const busData = {
        ...newBus,
        capacity: parseInt(newBus.capacity),
        fuelEfficiency: parseFloat(newBus.fuelEfficiency),
        currentStudents: 0,
        status: 'active',
        lastService: new Date().toISOString(),
        nextService: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      await api.createBus(busData);
      toast.success('Bus added successfully');
      setIsAddBusDialogOpen(false);
      resetBusForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add bus');
      console.error(error);
    }
  };

  const handleAddRoute = async () => {
    try {
      const routeData = {
        ...newRoute,
        totalDistance: parseFloat(newRoute.totalDistance),
        estimatedTime: parseInt(newRoute.estimatedTime),
        fare: parseFloat(newRoute.fare),
        status: 'active'
      };
      
      await api.createRoute(routeData);
      toast.success('Route created successfully');
      setIsAddRouteDialogOpen(false);
      resetRouteForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create route');
      console.error(error);
    }
  };

  const handleAddDriver = async () => {
    try {
      const driverData = {
        ...newDriver,
        experience: parseInt(newDriver.experience),
        status: 'active'
      };
      
      await api.createDriver(driverData);
      toast.success('Driver added successfully');
      setIsAddDriverDialogOpen(false);
      resetDriverForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add driver');
      console.error(error);
    }
  };

  const handleAssignStudent = async () => {
    try {
      const assignmentData = {
        ...assignStudentForm,
        monthlyFee: parseFloat(assignStudentForm.monthlyFee),
        status: 'active'
      };
      
      await api.assignStudentTransport(assignmentData);
      toast.success('Student assigned to transport successfully');
      setIsAssignStudentDialogOpen(false);
      resetAssignStudentForm();
      loadData();
    } catch (error) {
      toast.error('Failed to assign student to transport');
      console.error(error);
    }
  };

  const resetBusForm = () => {
    setNewBus({
      busNumber: '',
      capacity: '40',
      driverId: '',
      attendantId: '',
      routeId: '',
      fuelEfficiency: '12',
      gpsEnabled: true
    });
  };

  const resetRouteForm = () => {
    setNewRoute({
      routeName: '',
      routeCode: '',
      startLocation: '',
      endLocation: '',
      totalDistance: '',
      estimatedTime: '',
      fare: '',
      stops: [
        { stopName: '', location: '', pickupTime: '', dropTime: '', landmark: '' }
      ]
    });
  };

  const resetDriverForm = () => {
    setNewDriver({
      name: '',
      licenseNumber: '',
      phone: '',
      email: '',
      experience: '',
      joiningDate: new Date().toISOString().split('T')[0]
    });
  };

  const resetAssignStudentForm = () => {
    setAssignStudentForm({
      studentId: '',
      routeId: '',
      stopId: '',
      monthlyFee: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addRouteStop = () => {
    setNewRoute({
      ...newRoute,
      stops: [...newRoute.stops, { stopName: '', location: '', pickupTime: '', dropTime: '', landmark: '' }]
    });
  };

  const removeRouteStop = (index: number) => {
    const updatedStops = newRoute.stops.filter((_, i) => i !== index);
    setNewRoute({ ...newRoute, stops: updatedStops });
  };

  const updateRouteStop = (index: number, field: string, value: string) => {
    const updatedStops = [...newRoute.stops];
    updatedStops[index] = { ...updatedStops[index], [field]: value };
    setNewRoute({ ...newRoute, stops: updatedStops });
  };

  const filteredBuses = buses.filter(bus => {
    return (
      (bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       bus.driverName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || bus.status === statusFilter) &&
      (routeFilter === '' || bus.routeId === routeFilter)
    );
  });

  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  const paginatedBuses = filteredBuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Transport Management</h1>
          <p className="text-muted-foreground">
            Manage school buses, routes, and student transportation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAssignStudentDialogOpen} onOpenChange={setIsAssignStudentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Assign Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Student to Transport</DialogTitle>
                <DialogDescription>
                  Assign a student to a bus route
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assignStudent">Student</Label>
                  <Select value={assignStudentForm.studentId} onValueChange={(value) => setAssignStudentForm({...assignStudentForm, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student1">John Doe - Class 5A</SelectItem>
                      <SelectItem value="student2">Jane Smith - Class 6B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="assignRoute">Route</Label>
                  <Select value={assignStudentForm.routeId} onValueChange={(value) => setAssignStudentForm({...assignStudentForm, routeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.routeName} - {route.routeCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="assignStop">Bus Stop</Label>
                  <Select value={assignStudentForm.stopId} onValueChange={(value) => setAssignStudentForm({...assignStudentForm, stopId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bus stop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stop1">Main Gate</SelectItem>
                      <SelectItem value="stop2">Park Avenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="monthlyFee">Monthly Fee</Label>
                  <Input
                    id="monthlyFee"
                    type="number"
                    value={assignStudentForm.monthlyFee}
                    onChange={(e) => setAssignStudentForm({...assignStudentForm, monthlyFee: e.target.value})}
                    placeholder="Enter monthly transport fee"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAssignStudentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignStudent}>
                  Assign Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>
                  Add a new bus driver to the system
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="driverName">Full Name</Label>
                  <Input
                    id="driverName"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                    placeholder="Enter driver's full name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={newDriver.licenseNumber}
                      onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                      placeholder="Enter license number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driverPhone">Phone</Label>
                    <Input
                      id="driverPhone"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="driverEmail">Email (Optional)</Label>
                    <Input
                      id="driverEmail"
                      type="email"
                      value={newDriver.email}
                      onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={newDriver.experience}
                      onChange={(e) => setNewDriver({...newDriver, experience: e.target.value})}
                      placeholder="Years of experience"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={newDriver.joiningDate}
                    onChange={(e) => setNewDriver({...newDriver, joiningDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDriverDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDriver}>
                  Add Driver
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddRouteDialogOpen} onOpenChange={setIsAddRouteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Route className="mr-2 h-4 w-4" />
                Add Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Route</DialogTitle>
                <DialogDescription>
                  Define a new bus route with stops and timings
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routeName">Route Name</Label>
                    <Input
                      id="routeName"
                      value={newRoute.routeName}
                      onChange={(e) => setNewRoute({...newRoute, routeName: e.target.value})}
                      placeholder="Enter route name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routeCode">Route Code</Label>
                    <Input
                      id="routeCode"
                      value={newRoute.routeCode}
                      onChange={(e) => setNewRoute({...newRoute, routeCode: e.target.value})}
                      placeholder="e.g., R001"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startLocation">Start Location</Label>
                    <Input
                      id="startLocation"
                      value={newRoute.startLocation}
                      onChange={(e) => setNewRoute({...newRoute, startLocation: e.target.value})}
                      placeholder="Enter starting point"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endLocation">End Location</Label>
                    <Input
                      id="endLocation"
                      value={newRoute.endLocation}
                      onChange={(e) => setNewRoute({...newRoute, endLocation: e.target.value})}
                      placeholder="Enter destination"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalDistance">Total Distance (km)</Label>
                    <Input
                      id="totalDistance"
                      type="number"
                      value={newRoute.totalDistance}
                      onChange={(e) => setNewRoute({...newRoute, totalDistance: e.target.value})}
                      placeholder="Enter distance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={newRoute.estimatedTime}
                      onChange={(e) => setNewRoute({...newRoute, estimatedTime: e.target.value})}
                      placeholder="Enter time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routeFare">Monthly Fare</Label>
                    <Input
                      id="routeFare"
                      type="number"
                      value={newRoute.fare}
                      onChange={(e) => setNewRoute({...newRoute, fare: e.target.value})}
                      placeholder="Enter fare"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Bus Stops</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addRouteStop}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Stop
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {newRoute.stops.map((stop, index) => (
                      <div key={index} className="grid grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                        <div>
                          <Label>Stop Name</Label>
                          <Input
                            value={stop.stopName}
                            onChange={(e) => updateRouteStop(index, 'stopName', e.target.value)}
                            placeholder="Stop name"
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={stop.location}
                            onChange={(e) => updateRouteStop(index, 'location', e.target.value)}
                            placeholder="Address"
                          />
                        </div>
                        <div>
                          <Label>Pickup Time</Label>
                          <Input
                            type="time"
                            value={stop.pickupTime}
                            onChange={(e) => updateRouteStop(index, 'pickupTime', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Drop Time</Label>
                          <Input
                            type="time"
                            value={stop.dropTime}
                            onChange={(e) => updateRouteStop(index, 'dropTime', e.target.value)}
                          />
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRouteStop(index)}
                            disabled={newRoute.stops.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddRouteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRoute}>
                  Create Route
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddBusDialogOpen} onOpenChange={setIsAddBusDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Bus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Bus</DialogTitle>
                <DialogDescription>
                  Register a new bus in the fleet
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="busNumber">Bus Number</Label>
                    <Input
                      id="busNumber"
                      value={newBus.busNumber}
                      onChange={(e) => setNewBus({...newBus, busNumber: e.target.value})}
                      placeholder="Enter bus number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newBus.capacity}
                      onChange={(e) => setNewBus({...newBus, capacity: e.target.value})}
                      placeholder="Enter seating capacity"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="busDriver">Driver</Label>
                  <Select value={newBus.driverId} onValueChange={(value) => setNewBus({...newBus, driverId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.filter(d => d.status === 'active').map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.licenseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="busAttendant">Attendant (Optional)</Label>
                  <Select value={newBus.attendantId} onValueChange={(value) => setNewBus({...newBus, attendantId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attendant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendant1">Mary Johnson</SelectItem>
                      <SelectItem value="attendant2">Sarah Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="busRoute">Assigned Route</Label>
                  <Select value={newBus.routeId} onValueChange={(value) => setNewBus({...newBus, routeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.routeName} - {route.routeCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="fuelEfficiency">Fuel Efficiency (km/l)</Label>
                  <Input
                    id="fuelEfficiency"
                    type="number"
                    step="0.1"
                    value={newBus.fuelEfficiency}
                    onChange={(e) => setNewBus({...newBus, fuelEfficiency: e.target.value})}
                    placeholder="Enter fuel efficiency"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gpsEnabled"
                    checked={newBus.gpsEnabled}
                    onCheckedChange={(checked) => setNewBus({...newBus, gpsEnabled: !!checked})}
                  />
                  <Label htmlFor="gpsEnabled">GPS Tracking Enabled</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddBusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBus}>
                  Add Bus
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
                <p className="text-sm text-muted-foreground">Total Buses</p>
                <p className="text-2xl font-bold">{stats.totalBuses}</p>
                <p className="text-xs text-muted-foreground">{stats.activeBuses} active</p>
              </div>
              <Bus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Students Using Transport</p>
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
                <p className="text-sm text-muted-foreground">Average Occupancy</p>
                <p className="text-2xl font-bold">{stats.averageOccupancy}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={stats.averageOccupancy} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Maintenance Due</p>
                <p className="text-2xl font-bold">{stats.maintenanceDue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="buses" className="w-full">
        <TabsList>
          <TabsTrigger value="buses">Bus Fleet</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="students">Student Transport</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buses" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search buses..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={routeFilter} onValueChange={setRouteFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routes</SelectItem>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.routeName}
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
          
          {/* Buses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bus Fleet Management</CardTitle>
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
                        <TableHead>Bus Number</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Occupancy</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Next Service</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBuses.map((bus) => (
                        <TableRow key={bus.id}>
                          <TableCell className="font-bold">{bus.busNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bus.routeName}</div>
                              {bus.gpsEnabled && (
                                <Badge variant="outline" className="text-xs">
                                  GPS Enabled
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bus.driverName}</div>
                              {bus.attendantName && (
                                <div className="text-sm text-muted-foreground">
                                  Attendant: {bus.attendantName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{bus.capacity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{bus.currentStudents}/{bus.capacity}</span>
                              <Progress 
                                value={(bus.currentStudents / bus.capacity) * 100} 
                                className="w-16 h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(bus.status)}>
                              {bus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(bus.nextService).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Navigation className="h-4 w-4" />
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
                  {Math.min(currentPage * itemsPerPage, filteredBuses.length)} of{' '}
                  {filteredBuses.length} buses
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
        
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bus Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.map((route) => (
                  <Card key={route.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{route.routeName}</h3>
                          <p className="text-sm text-muted-foreground">{route.routeCode}</p>
                        </div>
                        <Badge className={getStatusColor(route.status)}>
                          {route.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Distance:</span>
                          <span>{route.totalDistance} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{route.estimatedTime} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stops:</span>
                          <span>{route.stops.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Fare:</span>
                          <span className="font-medium">₹{route.fare}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <MapPin className="mr-2 h-4 w-4" />
                          View Map
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Bus Assigned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell className="font-mono">{driver.licenseNumber}</TableCell>
                        <TableCell>{driver.phone}</TableCell>
                        <TableCell>{driver.experience} years</TableCell>
                        <TableCell>
                          {driver.busAssigned ? (
                            <Badge variant="outline">{driver.busAssigned}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(driver.status)}>
                            {driver.status.replace('_', ' ')}
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
        
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Transport Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Bus Stop</TableHead>
                      <TableHead>Pickup Time</TableHead>
                      <TableHead>Monthly Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentTransport.slice(0, 10).map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.studentName}</div>
                            <div className="text-sm text-muted-foreground">{student.studentClass}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.routeName}</TableCell>
                        <TableCell>{student.stopName}</TableCell>
                        <TableCell>{student.pickupTime}</TableCell>
                        <TableCell>₹{student.monthlyFee}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
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
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Distance Covered</span>
                    <span className="font-bold">{stats.totalDistance.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fuel Consumption</span>
                    <span className="font-bold">{stats.fuelConsumption.toLocaleString()} L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Occupancy</span>
                    <span className="font-bold">{stats.averageOccupancy}%</span>
                  </div>
                  <Progress value={stats.averageOccupancy} className="w-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{stats.activeBuses}</div>
                      <div className="text-xs text-muted-foreground">Active Buses</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{stats.maintenanceDue}</div>
                      <div className="text-xs text-muted-foreground">Maintenance Due</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{stats.totalRoutes}</div>
                    <div className="text-xs text-muted-foreground">Active Routes</div>
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