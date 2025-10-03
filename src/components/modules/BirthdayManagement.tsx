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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { api } from '../../utils/api';
import { 
  Plus, Search, Eye, Edit, Trash2, Calendar as CalendarIcon,
  Gift, Cake, Users, Heart, Star, Send, Bell,
  Download, Upload, RefreshCw, Filter, PartyPopper,
  MessageSquare, Phone, Mail, MapPin, Clock
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BirthdayPerson {
  id: string;
  name: string;
  type: 'student' | 'staff' | 'parent';
  dateOfBirth: string;
  age: number;
  class?: string;
  rollNumber?: string;
  department?: string;
  designation?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  photo?: string;
  relationship?: string; // for parents
  guardianOf?: string; // for parents
  status: 'active' | 'inactive';
  created_at: string;
}

interface BirthdayEvent {
  id: string;
  personId: string;
  personName: string;
  personType: 'student' | 'staff' | 'parent';
  birthdayDate: string;
  age: number;
  celebrationPlanned: boolean;
  celebrationType: 'simple' | 'party' | 'special';
  venue?: string;
  celebrationDate?: string;
  celebrationTime?: string;
  budget?: number;
  organizedBy?: string;
  guestList: string[];
  gifts: BirthdayGift[];
  wishes: BirthdayWish[];
  photos: string[];
  status: 'upcoming' | 'celebrated' | 'missed';
  created_at: string;
}

interface BirthdayGift {
  id: string;
  giftName: string;
  giftType: 'physical' | 'monetary' | 'voucher';
  amount?: number;
  givenBy: string;
  givenByType: 'school' | 'class' | 'individual';
  date: string;
}

interface BirthdayWish {
  id: string;
  wishText: string;
  wisherName: string;
  wisherType: 'student' | 'staff' | 'parent' | 'admin';
  date: string;
  isPublic: boolean;
}

interface BirthdayStats {
  todaysBirthdays: number;
  thisWeekBirthdays: number;
  thisMonthBirthdays: number;
  totalCelebrations: number;
  studentsThisMonth: number;
  staffThisMonth: number;
  parentsThisMonth: number;
  upcomingCelebrations: number;
}

export function BirthdayManagement() {
  const [birthdays, setBirthdays] = useState<BirthdayPerson[]>([]);
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [stats, setStats] = useState<BirthdayStats>({
    todaysBirthdays: 0,
    thisWeekBirthdays: 0,
    thisMonthBirthdays: 0,
    totalCelebrations: 0,
    studentsThisMonth: 0,
    staffThisMonth: 0,
    parentsThisMonth: 0,
    upcomingCelebrations: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddBirthdayDialogOpen, setIsAddBirthdayDialogOpen] = useState(false);
  const [isPlanCelebrationDialogOpen, setIsPlanCelebrationDialogOpen] = useState(false);
  const [isSendWishesDialogOpen, setIsSendWishesDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [newBirthday, setNewBirthday] = useState({
    name: '',
    type: 'student',
    dateOfBirth: '',
    class: '',
    rollNumber: '',
    department: '',
    designation: '',
    contactNumber: '',
    email: '',
    address: '',
    relationship: '',
    guardianOf: ''
  });

  const [newCelebration, setNewCelebration] = useState({
    personId: '',
    celebrationType: 'simple',
    venue: '',
    celebrationDate: '',
    celebrationTime: '',
    budget: '',
    organizedBy: '',
    guestList: '',
    specialRequests: ''
  });

  const [newWish, setNewWish] = useState({
    personId: '',
    wishText: '',
    isPublic: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [birthdaysData, eventsData, statsData] = await Promise.all([
        api.getBirthdays(),
        api.getBirthdayEvents(),
        api.getBirthdayStats()
      ]);
      
      setBirthdays(birthdaysData);
      setEvents(eventsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load birthday data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBirthday = async () => {
    try {
      const birthdayData = {
        ...newBirthday,
        age: new Date().getFullYear() - new Date(newBirthday.dateOfBirth).getFullYear(),
        status: 'active'
      };
      
      await api.createBirthday(birthdayData);
      toast.success('Birthday added successfully');
      setIsAddBirthdayDialogOpen(false);
      resetBirthdayForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add birthday');
      console.error(error);
    }
  };

  const handlePlanCelebration = async () => {
    try {
      const celebrationData = {
        ...newCelebration,
        budget: parseFloat(newCelebration.budget) || 0,
        guestList: newCelebration.guestList.split(',').map(g => g.trim()).filter(g => g),
        celebrationPlanned: true,
        gifts: [],
        wishes: [],
        photos: [],
        status: 'upcoming'
      };
      
      await api.createBirthdayCelebration(celebrationData);
      toast.success('Celebration planned successfully');
      setIsPlanCelebrationDialogOpen(false);
      resetCelebrationForm();
      loadData();
    } catch (error) {
      toast.error('Failed to plan celebration');
      console.error(error);
    }
  };

  const handleSendWish = async () => {
    try {
      const wishData = {
        ...newWish,
        wisherName: 'Current User',
        wisherType: 'admin',
        date: new Date().toISOString()
      };
      
      await api.sendBirthdayWish(wishData);
      toast.success('Birthday wish sent successfully');
      setIsSendWishesDialogOpen(false);
      resetWishForm();
      loadData();
    } catch (error) {
      toast.error('Failed to send wish');
      console.error(error);
    }
  };

  const resetBirthdayForm = () => {
    setNewBirthday({
      name: '',
      type: 'student',
      dateOfBirth: '',
      class: '',
      rollNumber: '',
      department: '',
      designation: '',
      contactNumber: '',
      email: '',
      address: '',
      relationship: '',
      guardianOf: ''
    });
  };

  const resetCelebrationForm = () => {
    setNewCelebration({
      personId: '',
      celebrationType: 'simple',
      venue: '',
      celebrationDate: '',
      celebrationTime: '',
      budget: '',
      organizedBy: '',
      guestList: '',
      specialRequests: ''
    });
  };

  const resetWishForm = () => {
    setNewWish({
      personId: '',
      wishText: '',
      isPublic: true
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'celebrated': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCelebrationTypeColor = (type: string) => {
    switch (type) {
      case 'simple': return 'bg-blue-100 text-blue-800';
      case 'party': return 'bg-purple-100 text-purple-800';
      case 'special': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isBirthdayToday = (dateOfBirth: string) => {
    const today = new Date();
    const birthday = new Date(dateOfBirth);
    return today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate();
  };

  const isBirthdayThisWeek = (dateOfBirth: string) => {
    const today = new Date();
    const birthday = new Date(dateOfBirth);
    birthday.setFullYear(today.getFullYear());
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return birthday >= startOfWeek && birthday <= endOfWeek;
  };

  const filteredBirthdays = birthdays.filter(birthday => {
    return (
      birthday.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === '' || birthday.type === typeFilter) &&
      (statusFilter === '' || birthday.status === statusFilter) &&
      (monthFilter === '' || new Date(birthday.dateOfBirth).getMonth() === parseInt(monthFilter))
    );
  });

  const todaysBirthdays = birthdays.filter(b => isBirthdayToday(b.dateOfBirth));
  const thisWeekBirthdays = birthdays.filter(b => isBirthdayThisWeek(b.dateOfBirth));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Birthday Management</h1>
          <p className="text-muted-foreground">
            Celebrate and manage birthdays for students, staff, and parents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isSendWishesDialogOpen} onOpenChange={setIsSendWishesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Heart className="mr-2 h-4 w-4" />
                Send Wishes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Birthday Wishes</DialogTitle>
                <DialogDescription>
                  Send personalized birthday wishes
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wishPerson">Select Person</Label>
                  <Select value={newWish.personId} onValueChange={(value) => setNewWish({...newWish, personId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {todaysBirthdays.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name} ({person.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="wishText">Birthday Message</Label>
                  <Textarea
                    id="wishText"
                    value={newWish.wishText}
                    onChange={(e) => setNewWish({...newWish, wishText: e.target.value})}
                    placeholder="Write a heartfelt birthday message..."
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newWish.isPublic}
                    onChange={(e) => setNewWish({...newWish, isPublic: e.target.checked})}
                  />
                  <Label htmlFor="isPublic">Make this wish public</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsSendWishesDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendWish}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Wishes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isPlanCelebrationDialogOpen} onOpenChange={setIsPlanCelebrationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PartyPopper className="mr-2 h-4 w-4" />
                Plan Celebration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Plan Birthday Celebration</DialogTitle>
                <DialogDescription>
                  Organize a special birthday celebration
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="celebrationPerson">Select Person</Label>
                  <Select value={newCelebration.personId} onValueChange={(value) => setNewCelebration({...newCelebration, personId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {birthdays.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name} ({person.type}) - {new Date(person.dateOfBirth).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="celebrationType">Celebration Type</Label>
                    <Select value={newCelebration.celebrationType} onValueChange={(value) => setNewCelebration({...newCelebration, celebrationType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple Celebration</SelectItem>
                        <SelectItem value="party">Birthday Party</SelectItem>
                        <SelectItem value="special">Special Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={newCelebration.venue}
                      onChange={(e) => setNewCelebration({...newCelebration, venue: e.target.value})}
                      placeholder="Enter venue"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="celebrationDate">Celebration Date</Label>
                    <Input
                      id="celebrationDate"
                      type="date"
                      value={newCelebration.celebrationDate}
                      onChange={(e) => setNewCelebration({...newCelebration, celebrationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="celebrationTime">Time</Label>
                    <Input
                      id="celebrationTime"
                      type="time"
                      value={newCelebration.celebrationTime}
                      onChange={(e) => setNewCelebration({...newCelebration, celebrationTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newCelebration.budget}
                      onChange={(e) => setNewCelebration({...newCelebration, budget: e.target.value})}
                      placeholder="Enter budget amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizedBy">Organized By</Label>
                    <Input
                      id="organizedBy"
                      value={newCelebration.organizedBy}
                      onChange={(e) => setNewCelebration({...newCelebration, organizedBy: e.target.value})}
                      placeholder="Who is organizing?"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="guestList">Guest List</Label>
                  <Textarea
                    id="guestList"
                    value={newCelebration.guestList}
                    onChange={(e) => setNewCelebration({...newCelebration, guestList: e.target.value})}
                    placeholder="Enter guest names (comma-separated)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={newCelebration.specialRequests}
                    onChange={(e) => setNewCelebration({...newCelebration, specialRequests: e.target.value})}
                    placeholder="Any special arrangements or requests..."
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsPlanCelebrationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePlanCelebration}>
                  <PartyPopper className="mr-2 h-4 w-4" />
                  Plan Celebration
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddBirthdayDialogOpen} onOpenChange={setIsAddBirthdayDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Birthday
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Birthday</DialogTitle>
                <DialogDescription>
                  Add birthday information for students, staff, or parents
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newBirthday.name}
                      onChange={(e) => setNewBirthday({...newBirthday, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newBirthday.type} onValueChange={(value) => setNewBirthday({...newBirthday, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newBirthday.dateOfBirth}
                    onChange={(e) => setNewBirthday({...newBirthday, dateOfBirth: e.target.value})}
                  />
                </div>
                
                {newBirthday.type === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="class">Class</Label>
                      <Input
                        id="class"
                        value={newBirthday.class}
                        onChange={(e) => setNewBirthday({...newBirthday, class: e.target.value})}
                        placeholder="Enter class"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        value={newBirthday.rollNumber}
                        onChange={(e) => setNewBirthday({...newBirthday, rollNumber: e.target.value})}
                        placeholder="Enter roll number"
                      />
                    </div>
                  </div>
                )}
                
                {newBirthday.type === 'staff' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newBirthday.department}
                        onChange={(e) => setNewBirthday({...newBirthday, department: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={newBirthday.designation}
                        onChange={(e) => setNewBirthday({...newBirthday, designation: e.target.value})}
                        placeholder="Enter designation"
                      />
                    </div>
                  </div>
                )}
                
                {newBirthday.type === 'parent' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="relationship">Relationship</Label>
                      <Select value={newBirthday.relationship} onValueChange={(value) => setNewBirthday({...newBirthday, relationship: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="father">Father</SelectItem>
                          <SelectItem value="mother">Mother</SelectItem>
                          <SelectItem value="guardian">Guardian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="guardianOf">Guardian Of</Label>
                      <Input
                        id="guardianOf"
                        value={newBirthday.guardianOf}
                        onChange={(e) => setNewBirthday({...newBirthday, guardianOf: e.target.value})}
                        placeholder="Student name"
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={newBirthday.contactNumber}
                      onChange={(e) => setNewBirthday({...newBirthday, contactNumber: e.target.value})}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newBirthday.email}
                      onChange={(e) => setNewBirthday({...newBirthday, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newBirthday.address}
                    onChange={(e) => setNewBirthday({...newBirthday, address: e.target.value})}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddBirthdayDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBirthday}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Birthday
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
                <p className="text-sm text-muted-foreground">Today's Birthdays</p>
                <p className="text-2xl font-bold">{stats.todaysBirthdays}</p>
                <p className="text-xs text-muted-foreground">Celebrate today!</p>
              </div>
              <Cake className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.thisWeekBirthdays}</p>
                <p className="text-xs text-muted-foreground">Upcoming celebrations</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats.thisMonthBirthdays}</p>
                <div className="text-xs text-muted-foreground">
                  <span>Students: {stats.studentsThisMonth}</span> | 
                  <span> Staff: {stats.staffThisMonth}</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Celebrations</p>
                <p className="text-2xl font-bold">{stats.totalCelebrations}</p>
                <p className="text-xs text-muted-foreground">{stats.upcomingCelebrations} upcoming</p>
              </div>
              <PartyPopper className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today's Birthdays</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Birthdays</TabsTrigger>
          <TabsTrigger value="celebrations">Celebrations</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          {todaysBirthdays.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Cake className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Birthdays Today</h3>
                <p className="text-muted-foreground">Check back tomorrow for more celebrations!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaysBirthdays.map((person) => (
                <Card key={person.id} className="overflow-hidden border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={person.photo} />
                          <AvatarFallback className="bg-pink-100 text-pink-600">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Cake className="h-5 w-5 text-pink-600" />
                            <span className="text-sm font-medium text-pink-600">Happy Birthday!</span>
                          </div>
                          <h3 className="font-semibold text-lg">{person.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Turning {person.age} today
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Badge className={getTypeColor(person.type)}>
                          {person.type}
                        </Badge>
                        
                        {person.type === 'student' && (
                          <div className="text-sm text-muted-foreground">
                            Class: {person.class} | Roll: {person.rollNumber}
                          </div>
                        )}
                        
                        {person.type === 'staff' && (
                          <div className="text-sm text-muted-foreground">
                            {person.designation} - {person.department}
                          </div>
                        )}
                        
                        {person.contactNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            <span>{person.contactNumber}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-pink-600 hover:bg-pink-700">
                          <Heart className="mr-2 h-4 w-4" />
                          Send Wishes
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Gift className="mr-2 h-4 w-4" />
                          Plan Party
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thisWeekBirthdays.filter(b => !isBirthdayToday(b.dateOfBirth)).map((person) => (
              <Card key={person.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={person.photo} />
                        <AvatarFallback>
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{person.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(person.dateOfBirth).toLocaleDateString()} (Age {person.age + 1})
                        </p>
                      </div>
                      <Badge className={getTypeColor(person.type)}>
                        {person.type}
                      </Badge>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      {person.type === 'student' && (
                        <div>Class: {person.class} | Roll: {person.rollNumber}</div>
                      )}
                      {person.type === 'staff' && (
                        <div>{person.designation} - {person.department}</div>
                      )}
                      {person.contactNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{person.contactNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Bell className="mr-2 h-4 w-4" />
                        Set Reminder
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <PartyPopper className="mr-2 h-4 w-4" />
                        Plan Ahead
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search birthdays..."
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
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="0">January</SelectItem>
                    <SelectItem value="1">February</SelectItem>
                    <SelectItem value="2">March</SelectItem>
                    <SelectItem value="3">April</SelectItem>
                    <SelectItem value="4">May</SelectItem>
                    <SelectItem value="5">June</SelectItem>
                    <SelectItem value="6">July</SelectItem>
                    <SelectItem value="7">August</SelectItem>
                    <SelectItem value="8">September</SelectItem>
                    <SelectItem value="9">October</SelectItem>
                    <SelectItem value="10">November</SelectItem>
                    <SelectItem value="11">December</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Birthdays Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Birthdays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBirthdays.slice(0, 20).map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={person.photo} />
                              <AvatarFallback>
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{person.name}</div>
                              {isBirthdayToday(person.dateOfBirth) && (
                                <div className="flex items-center gap-1 text-xs text-pink-600">
                                  <Cake className="h-3 w-3" />
                                  Birthday Today!
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(person.type)}>
                            {person.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(person.dateOfBirth).toLocaleDateString()}</TableCell>
                        <TableCell>{person.age}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {person.type === 'student' && `${person.class} - ${person.rollNumber}`}
                            {person.type === 'staff' && `${person.designation}`}
                            {person.type === 'parent' && `${person.relationship} of ${person.guardianOf}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {person.contactNumber && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{person.contactNumber}</span>
                              </div>
                            )}
                            {person.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-32">{person.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(person.status)}>
                            {person.status}
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
                              <Heart className="h-4 w-4" />
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
        
        <TabsContent value="celebrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{event.personName}'s Birthday</h3>
                        <p className="text-sm text-muted-foreground">
                          Celebrating {event.age} years
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCelebrationTypeColor(event.celebrationType)}>
                          {event.celebrationType}
                        </Badge>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {event.celebrationDate ? 
                            `${new Date(event.celebrationDate).toLocaleDateString()} at ${event.celebrationTime}` :
                            new Date(event.birthdayDate).toLocaleDateString()
                          }
                        </span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                      {event.organizedBy && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Organized by {event.organizedBy}</span>
                        </div>
                      )}
                      {event.budget && event.budget > 0 && (
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-muted-foreground" />
                          <span>Budget: ₹{event.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Guests:</span>
                        <span className="font-medium">{event.guestList.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Gifts:</span>
                        <span className="font-medium">{event.gifts.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Wishes:</span>
                        <span className="font-medium">{event.wishes.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Event
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Birthday Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  Birthdays on {selectedDate.toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {birthdays
                    .filter(b => {
                      const birthday = new Date(b.dateOfBirth);
                      return birthday.getMonth() === selectedDate.getMonth() && 
                             birthday.getDate() === selectedDate.getDate();
                    })
                    .map((person) => (
                      <div key={person.id} className="flex items-center gap-3 p-2 border rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={person.photo} />
                          <AvatarFallback>
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{person.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {person.type} • Age {person.age}
                          </div>
                        </div>
                        <Cake className="h-4 w-4 text-pink-600" />
                      </div>
                    ))}
                  
                  {birthdays.filter(b => {
                    const birthday = new Date(b.dateOfBirth);
                    return birthday.getMonth() === selectedDate.getMonth() && 
                           birthday.getDate() === selectedDate.getDate();
                  }).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Cake className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No birthdays on this date</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}