import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import {
  Plus, Calendar as CalendarIcon, Clock, MapPin, Users,
  Bell, Edit, Trash2, ChevronLeft, ChevronRight,
  Download, Upload, RefreshCw, Filter, Star,
  Video, FileText, AlertCircle, CheckCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'academic' | 'holiday' | 'exam' | 'meeting' | 'sports' | 'cultural' | 'other';
  location: string;
  organizer: string;
  participants: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isImportant: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  reminder?: boolean;
  attachments?: string[];
}

export function CalendarManagement() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterType, setFilterType] = useState('all');
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    type: 'academic' as Event['type'],
    location: '',
    organizer: '',
    participants: [],
    isImportant: false,
    isRecurring: false,
    reminder: true
  });

  // Sample events data
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Annual Sports Day',
      description: 'School annual sports competition',
      date: new Date(2024, 0, 15),
      startTime: '08:00',
      endTime: '16:00',
      type: 'sports',
      location: 'School Ground',
      organizer: 'Sports Department',
      participants: ['All Students'],
      status: 'upcoming',
      isImportant: true,
      isRecurring: false,
      reminder: true
    },
    {
      id: '2',
      title: 'Parent Teacher Meeting',
      description: 'Monthly PTM for Class X',
      date: new Date(2024, 0, 20),
      startTime: '10:00',
      endTime: '13:00',
      type: 'meeting',
      location: 'Conference Hall',
      organizer: 'Academic Department',
      participants: ['Parents', 'Teachers'],
      status: 'upcoming',
      isImportant: false,
      isRecurring: true,
      recurringPattern: 'Monthly',
      reminder: true
    },
    {
      id: '3',
      title: 'Mid-Term Examinations',
      description: 'Mid-term exams for all classes',
      date: new Date(2024, 0, 25),
      startTime: '09:00',
      endTime: '12:00',
      type: 'exam',
      location: 'Examination Hall',
      organizer: 'Examination Cell',
      participants: ['All Students'],
      status: 'upcoming',
      isImportant: true,
      isRecurring: false,
      reminder: true
    },
    {
      id: '4',
      title: 'Republic Day Celebration',
      description: 'National holiday celebration',
      date: new Date(2024, 0, 26),
      startTime: '08:00',
      endTime: '10:00',
      type: 'holiday',
      location: 'School Assembly Ground',
      organizer: 'School Administration',
      participants: ['All Students', 'All Staff'],
      status: 'upcoming',
      isImportant: true,
      isRecurring: false,
      reminder: false
    }
  ]);

  const getEventTypeColor = (type: Event['type']) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      holiday: 'bg-red-100 text-red-800',
      exam: 'bg-yellow-100 text-yellow-800',
      meeting: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      cultural: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getEventTypeIcon = (type: Event['type']) => {
    switch(type) {
      case 'academic': return FileText;
      case 'holiday': return Star;
      case 'exam': return AlertCircle;
      case 'meeting': return Video;
      case 'sports': return Users;
      case 'cultural': return Star;
      default: return CalendarIcon;
    }
  };

  const handleAddEvent = () => {
    // API call to add event
    toast.success('Event added successfully');
    setIsAddEventOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    // API call to delete event
    toast.success('Event deleted successfully');
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Academic Calendar</h1>
          <p className="text-muted-foreground">Manage school events and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Title</Label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <Label>Event Type</Label>
                    <Select value={newEvent.type} onValueChange={(value: Event['type']) => setNewEvent({...newEvent, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="exam">Examination</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Event location"
                    />
                  </div>
                  <div>
                    <Label>Organizer</Label>
                    <Input
                      value={newEvent.organizer}
                      onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                      placeholder="Event organizer"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent}>Add Event</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.status === 'upcoming').length}
            </div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Important</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.isImportant).length}
            </div>
            <p className="text-xs text-muted-foreground">Marked events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Holidays</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.type === 'holiday').length}
            </div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Calendar View</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView('month')}
                    className={view === 'month' ? 'bg-accent' : ''}
                  >
                    Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView('week')}
                    className={view === 'week' ? 'bg-accent' : ''}
                  >
                    Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView('day')}
                    className={view === 'day' ? 'bg-accent' : ''}
                  >
                    Day
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView('list')}
                    className={view === 'list' ? 'bg-accent' : ''}
                  >
                    List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border w-full"
                  components={{
                    DayContent: ({ date }) => {
                      const dayEvents = getEventsForDate(date);
                      return (
                        <div className="relative w-full h-full p-1">
                          <div>{date.getDate()}</div>
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                              <div className="flex gap-0.5">
                                {dayEvents.slice(0, 3).map((event, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-1 h-1 rounded-full ${
                                      event.type === 'holiday' ? 'bg-red-500' :
                                      event.type === 'exam' ? 'bg-yellow-500' :
                                      'bg-blue-500'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="holiday">Holidays</SelectItem>
                  <SelectItem value="exam">Examinations</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredEvents.map((event) => {
                    const Icon = getEventTypeIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md ${getEventTypeColor(event.type)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{event.title}</h4>
                                {event.isImportant && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {event.date.toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {event.startTime} - {event.endTime}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {event.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedEvent.title}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Badge className={getEventTypeColor(selectedEvent.type)}>
                  {selectedEvent.type}
                </Badge>
                {selectedEvent.isImportant && (
                  <Badge variant="outline" className="ml-2">
                    <Star className="h-3 w-3 mr-1" />
                    Important
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{selectedEvent.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <p className="font-medium">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Organizer:</span>
                  <p className="font-medium">{selectedEvent.organizer}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Description:</span>
                <p className="text-sm mt-1">{selectedEvent.description}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Participants:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedEvent.participants.map((participant, idx) => (
                    <Badge key={idx} variant="secondary">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedEvent.isRecurring && (
                <div>
                  <span className="text-sm text-muted-foreground">Recurring:</span>
                  <p className="text-sm mt-1">{selectedEvent.recurringPattern}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}