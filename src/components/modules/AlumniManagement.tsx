import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { api } from '../../utils/api';
import {
  Plus, Search, Eye, GraduationCap,
  Building2, MapPin, Mail, Calendar, Users,
  Download, RefreshCw, Filter, Trophy,
  Briefcase, Heart, Share2, MessageSquare, Network
} from 'lucide-react';
import { toast } from 'sonner';

interface Alumni {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  graduationYear: number;
  graduationClass: string;
  rollNumber: string;
  currentOccupation?: string;
  currentCompany?: string;
  currentPosition?: string;
  workExperience: number;
  location?: string;
  address?: string;
  achievements: string[];
  socialMedia: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
  mentorshipInterest: boolean;
  jobPostingInterest: boolean;
  donationHistory: AlumniDonation[];
  photo?: string;
  status: 'active' | 'inactive' | 'lost_contact';
  lastContact: string;
  created_at: string;
}

interface AlumniDonation {
  id: string;
  amount: number;
  purpose: string;
  date: string;
  status: 'completed' | 'pending';
}

interface AlumniEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  venue: string;
  type: 'reunion' | 'networking' | 'webinar' | 'celebration';
  organizerId: string;
  organizerName: string;
  registeredAlumni: string[];
  maxCapacity: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedById: string;
  postedByName: string;
  postedDate: string;
  applicationDeadline: string;
  applications: number;
  status: 'active' | 'closed' | 'filled';
  created_at: string;
}

interface AlumniStats {
  totalAlumni: number;
  activeAlumni: number;
  graduationYears: number;
  totalDonations: number;
  averageDonation: number;
  mentorsAvailable: number;
  jobsPosted: number;
  upcomingEvents: number;
  networkSize: number;
}

export function AlumniManagement() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<AlumniStats>({
    totalAlumni: 0,
    activeAlumni: 0,
    graduationYears: 0,
    totalDonations: 0,
    averageDonation: 0,
    mentorsAvailable: 0,
    jobsPosted: 0,
    upcomingEvents: 0,
    networkSize: 0
  });
  
  const [isAddAlumniDialogOpen, setIsAddAlumniDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [newAlumni, setNewAlumni] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    graduationYear: '',
    graduationClass: '',
    rollNumber: '',
    currentOccupation: '',
    currentCompany: '',
    currentPosition: '',
    workExperience: '',
    location: '',
    address: '',
    achievements: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    mentorshipInterest: false,
    jobPostingInterest: false
  });

  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    type: 'reunion',
    maxCapacity: ''
  });

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full_time',
    experience: '',
    salary: '',
    description: '',
    requirements: '',
    applicationDeadline: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alumniData, eventsData, jobsData, statsData] = await Promise.all([
        api.getAlumni(),
        api.getAlumniEvents(),
        api.getAlumniJobs(),
        api.getAlumniStats()
      ]);
      
      setAlumni(alumniData);
      setEvents(eventsData);
      setJobs(jobsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load alumni data');
      console.error(error);
    }
  };

  const handleAddAlumni = async () => {
    try {
      const alumniData = {
        ...newAlumni,
        fullName: `${newAlumni.firstName} ${newAlumni.lastName}`,
        graduationYear: parseInt(newAlumni.graduationYear),
        workExperience: parseInt(newAlumni.workExperience) || 0,
        achievements: newAlumni.achievements.split(',').map(a => a.trim()).filter(a => a),
        socialMedia: {
          linkedin: newAlumni.linkedin,
          facebook: newAlumni.facebook,
          twitter: newAlumni.twitter
        },
        donationHistory: [],
        status: 'active',
        lastContact: new Date().toISOString()
      };
      
      await api.createAlumni(alumniData);
      toast.success('Alumni added successfully');
      setIsAddAlumniDialogOpen(false);
      resetAlumniForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add alumni');
      console.error(error);
    }
  };

  const handleAddEvent = async () => {
    try {
      const eventData = {
        ...newEvent,
        organizerId: 'current_user',
        organizerName: 'Admin',
        registeredAlumni: [],
        maxCapacity: parseInt(newEvent.maxCapacity),
        status: 'upcoming'
      };
      
      await api.createAlumniEvent(eventData);
      toast.success('Event created successfully');
      setIsAddEventDialogOpen(false);
      resetEventForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create event');
      console.error(error);
    }
  };

  const handleAddJob = async () => {
    try {
      const jobData = {
        ...newJob,
        requirements: newJob.requirements.split(',').map(r => r.trim()).filter(r => r),
        postedById: 'current_user',
        postedByName: 'Admin',
        postedDate: new Date().toISOString(),
        applications: 0,
        status: 'active'
      };
      
      await api.createAlumniJob(jobData);
      toast.success('Job posted successfully');
      setIsAddJobDialogOpen(false);
      resetJobForm();
      loadData();
    } catch (error) {
      toast.error('Failed to post job');
      console.error(error);
    }
  };

  const resetAlumniForm = () => {
    setNewAlumni({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      graduationYear: '',
      graduationClass: '',
      rollNumber: '',
      currentOccupation: '',
      currentCompany: '',
      currentPosition: '',
      workExperience: '',
      location: '',
      address: '',
      achievements: '',
      linkedin: '',
      facebook: '',
      twitter: '',
      mentorshipInterest: false,
      jobPostingInterest: false
    });
  };

  const resetEventForm = () => {
    setNewEvent({
      name: '',
      description: '',
      date: '',
      venue: '',
      type: 'reunion',
      maxCapacity: ''
    });
  };

  const resetJobForm = () => {
    setNewJob({
      title: '',
      company: '',
      location: '',
      type: 'full_time',
      experience: '',
      salary: '',
      description: '',
      requirements: '',
      applicationDeadline: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'upcoming': case 'completed': return 'bg-green-100 text-green-800';
      case 'inactive': case 'closed': return 'bg-gray-100 text-gray-800';
      case 'lost_contact': case 'cancelled': return 'bg-red-100 text-red-800';
      case 'ongoing': case 'filled': case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reunion': case 'full_time': return 'bg-blue-100 text-blue-800';
      case 'networking': case 'part_time': return 'bg-purple-100 text-purple-800';
      case 'webinar': case 'contract': return 'bg-green-100 text-green-800';
      case 'celebration': case 'internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlumni = alumni.filter(alumnus => {
    return (
      (alumnus.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       alumnus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       alumnus.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (yearFilter === '' || alumnus.graduationYear.toString() === yearFilter) &&
      (statusFilter === '' || alumnus.status === statusFilter)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Alumni Management</h1>
          <p className="text-muted-foreground">
            Connect and engage with your school's alumni network
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddJobDialogOpen} onOpenChange={setIsAddJobDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Briefcase className="mr-2 h-4 w-4" />
                Post Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Post Job Opportunity</DialogTitle>
                <DialogDescription>
                  Share job opportunities with the alumni network
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newJob.company}
                      onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobLocation">Location</Label>
                    <Input
                      id="jobLocation"
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      placeholder="Enter job location"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select value={newJob.type} onValueChange={(value: 'full_time' | 'part_time' | 'contract' | 'internship') => setNewJob({...newJob, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience Required</Label>
                    <Input
                      id="experience"
                      value={newJob.experience}
                      onChange={(e) => setNewJob({...newJob, experience: e.target.value})}
                      placeholder="e.g., 2-5 years"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="salary">Salary (Optional)</Label>
                  <Input
                    id="salary"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    placeholder="Enter salary range"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Enter detailed job description"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                    placeholder="Enter requirements (comma-separated)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={newJob.applicationDeadline}
                    onChange={(e) => setNewJob({...newJob, applicationDeadline: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddJobDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddJob}>
                  Post Job
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Alumni Event</DialogTitle>
                <DialogDescription>
                  Organize events for your alumni community
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    placeholder="Enter event name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="eventDescription">Description</Label>
                  <Textarea
                    id="eventDescription"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Date</Label>
                    <Input
                      id="eventDate"
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={newEvent.type} onValueChange={(value: 'reunion' | 'networking' | 'webinar' | 'celebration') => setNewEvent({...newEvent, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reunion">Reunion</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="celebration">Celebration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                      placeholder="Enter venue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCapacity">Max Capacity</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={newEvent.maxCapacity}
                      onChange={(e) => setNewEvent({...newEvent, maxCapacity: e.target.value})}
                      placeholder="Enter maximum capacity"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddAlumniDialogOpen} onOpenChange={setIsAddAlumniDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Alumni
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Alumni</DialogTitle>
                <DialogDescription>
                  Add a new member to the alumni database
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newAlumni.firstName}
                      onChange={(e) => setNewAlumni({...newAlumni, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newAlumni.lastName}
                      onChange={(e) => setNewAlumni({...newAlumni, lastName: e.target.value})}
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
                      value={newAlumni.email}
                      onChange={(e) => setNewAlumni({...newAlumni, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newAlumni.phone}
                      onChange={(e) => setNewAlumni({...newAlumni, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={newAlumni.graduationYear}
                      onChange={(e) => setNewAlumni({...newAlumni, graduationYear: e.target.value})}
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationClass">Class</Label>
                    <Input
                      id="graduationClass"
                      value={newAlumni.graduationClass}
                      onChange={(e) => setNewAlumni({...newAlumni, graduationClass: e.target.value})}
                      placeholder="e.g., 12A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      value={newAlumni.rollNumber}
                      onChange={(e) => setNewAlumni({...newAlumni, rollNumber: e.target.value})}
                      placeholder="Enter roll number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentOccupation">Current Occupation</Label>
                    <Input
                      id="currentOccupation"
                      value={newAlumni.currentOccupation}
                      onChange={(e) => setNewAlumni({...newAlumni, currentOccupation: e.target.value})}
                      placeholder="Enter occupation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <Input
                      id="currentCompany"
                      value={newAlumni.currentCompany}
                      onChange={(e) => setNewAlumni({...newAlumni, currentCompany: e.target.value})}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentPosition">Current Position</Label>
                    <Input
                      id="currentPosition"
                      value={newAlumni.currentPosition}
                      onChange={(e) => setNewAlumni({...newAlumni, currentPosition: e.target.value})}
                      placeholder="Enter position"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workExperience">Work Experience (years)</Label>
                    <Input
                      id="workExperience"
                      type="number"
                      value={newAlumni.workExperience}
                      onChange={(e) => setNewAlumni({...newAlumni, workExperience: e.target.value})}
                      placeholder="Enter years of experience"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newAlumni.location}
                    onChange={(e) => setNewAlumni({...newAlumni, location: e.target.value})}
                    placeholder="Enter current location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="achievements">Achievements</Label>
                  <Textarea
                    id="achievements"
                    value={newAlumni.achievements}
                    onChange={(e) => setNewAlumni({...newAlumni, achievements: e.target.value})}
                    placeholder="Enter achievements (comma-separated)"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={newAlumni.linkedin}
                      onChange={(e) => setNewAlumni({...newAlumni, linkedin: e.target.value})}
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={newAlumni.facebook}
                      onChange={(e) => setNewAlumni({...newAlumni, facebook: e.target.value})}
                      placeholder="Facebook profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={newAlumni.twitter}
                      onChange={(e) => setNewAlumni({...newAlumni, twitter: e.target.value})}
                      placeholder="Twitter profile URL"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mentorshipInterest"
                    checked={newAlumni.mentorshipInterest}
                    onChange={(e) => setNewAlumni({...newAlumni, mentorshipInterest: e.target.checked})}
                  />
                  <Label htmlFor="mentorshipInterest">Interested in mentoring students</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="jobPostingInterest"
                    checked={newAlumni.jobPostingInterest}
                    onChange={(e) => setNewAlumni({...newAlumni, jobPostingInterest: e.target.checked})}
                  />
                  <Label htmlFor="jobPostingInterest">Interested in posting job opportunities</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddAlumniDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAlumni}>
                  Add Alumni
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
                <p className="text-sm text-muted-foreground">Total Alumni</p>
                <p className="text-2xl font-bold">{stats.totalAlumni}</p>
                <p className="text-xs text-muted-foreground">{stats.activeAlumni} active</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Network Size</p>
                <p className="text-2xl font-bold">{stats.networkSize}</p>
                <p className="text-xs text-muted-foreground">{stats.graduationYears} graduation years</p>
              </div>
              <Network className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Donations</p>
                <p className="text-2xl font-bold">₹{stats.totalDonations.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Avg: ₹{stats.averageDonation.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Mentors Available</p>
                <p className="text-2xl font-bold">{stats.mentorsAvailable}</p>
                <p className="text-xs text-muted-foreground">{stats.jobsPosted} jobs posted</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alumni" className="w-full">
        <TabsList>
          <TabsTrigger value="alumni">Alumni Directory</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="jobs">Job Board</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alumni" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alumni..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="lost_contact">Lost Contact</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Alumni Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alumnus) => (
              <Card key={alumnus.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={alumnus.photo} />
                        <AvatarFallback>
                          {(alumnus.firstName || '?')[0]}{(alumnus.lastName || '?')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{alumnus.fullName}</h3>
                        <p className="text-sm text-muted-foreground">Class of {alumnus.graduationYear}</p>
                        <Badge className={getStatusColor(alumnus.status)} variant="outline">
                          {alumnus.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {alumnus.currentPosition && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{alumnus.currentPosition}</span>
                        </div>
                      )}
                      {alumnus.currentCompany && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{alumnus.currentCompany}</span>
                        </div>
                      )}
                      {alumnus.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{alumnus.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{alumnus.email}</span>
                      </div>
                    </div>
                    
                    {alumnus.achievements.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Recent Achievements:</p>
                        <div className="flex flex-wrap gap-1">
                          {alumnus.achievements.slice(0, 2).map((achievement, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Trophy className="mr-1 h-3 w-3" />
                              {achievement}
                            </Badge>
                          ))}
                          {alumnus.achievements.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{alumnus.achievements.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      {alumnus.mentorshipInterest && (
                        <Badge className="bg-blue-100 text-blue-800" variant="outline">
                          <Users className="mr-1 h-3 w-3" />
                          Mentor
                        </Badge>
                      )}
                      {alumnus.jobPostingInterest && (
                        <Badge className="bg-green-100 text-green-800" variant="outline">
                          <Briefcase className="mr-1 h-3 w-3" />
                          Recruiter
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">{event.venue}</p>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">{event.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.registeredAlumni.length}/{event.maxCapacity}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={(event.registeredAlumni.length / event.maxCapacity) * 100} 
                      className="w-full"
                    />
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Users className="mr-2 h-4 w-4" />
                        Registrations
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4">
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-muted-foreground">{job.company} • {job.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getTypeColor(job.type)}>
                          {job.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm">{job.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Experience:</span>
                        <p>{job.experience}</p>
                      </div>
                      {job.salary && (
                        <div>
                          <span className="font-medium">Salary:</span>
                          <p>{job.salary}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Applications:</span>
                        <p>{job.applications}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Requirements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.requirements.slice(0, 5).map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requirements.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Posted by {job.postedByName}</span>
                      <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        View Applications
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="mentorship" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Mentors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alumni.filter(a => a.mentorshipInterest).slice(0, 5).map((mentor) => (
                    <div key={mentor.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mentor.photo} />
                        <AvatarFallback>
                          {(mentor.firstName || '?')[0]}{(mentor.lastName || '?')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{mentor.fullName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {mentor.currentPosition} at {mentor.currentCompany}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Class of {mentor.graduationYear} • {mentor.workExperience} years exp.
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Mentorship Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.mentorsAvailable}</div>
                    <div className="text-sm text-muted-foreground">Available Mentors</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">85</div>
                      <div className="text-xs text-muted-foreground">Active Connections</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">92%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Popular Industries</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Technology</span>
                        <Progress value={75} className="w-20 h-2" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Finance</span>
                        <Progress value={60} className="w-20 h-2" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Healthcare</span>
                        <Progress value={45} className="w-20 h-2" />
                      </div>
                    </div>
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