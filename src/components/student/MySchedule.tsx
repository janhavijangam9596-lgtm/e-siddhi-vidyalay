import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigation } from '../../hooks/useNavigation';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User,
  Download, Filter, BookOpen, AlertCircle, ChevronDown
} from 'lucide-react';

interface ClassSchedule {
  id: string;
  subject: string;
  code: string;
  teacher: string;
  time: string;
  duration: string;
  room: string;
  building: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar';
  day: string;
  color: string;
}

interface UpcomingClass {
  subject: string;
  time: string;
  room: string;
  teacher: string;
  type: string;
  startsIn: string;
}

export function MySchedule() {
  const { navigate } = useNavigation();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [viewType, setViewType] = useState('week');

  // Mock data
  const weekSchedule: ClassSchedule[] = [
    // Monday
    {
      id: '1',
      subject: 'Mathematics',
      code: 'MATH301',
      teacher: 'Dr. Sarah Johnson',
      time: '09:00',
      duration: '1h 30m',
      room: 'Room 204',
      building: 'Science Building',
      type: 'lecture',
      day: 'monday',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      subject: 'Physics Lab',
      code: 'PHY201L',
      teacher: 'Prof. Michael Brown',
      time: '11:00',
      duration: '2h',
      room: 'Lab 3',
      building: 'Physics Building',
      type: 'lab',
      day: 'monday',
      color: 'bg-green-500'
    },
    {
      id: '3',
      subject: 'English',
      code: 'ENG202',
      teacher: 'Ms. Emily Davis',
      time: '14:00',
      duration: '1h',
      room: 'Room 105',
      building: 'Arts Building',
      type: 'lecture',
      day: 'monday',
      color: 'bg-purple-500'
    },
    // Tuesday
    {
      id: '4',
      subject: 'Computer Science',
      code: 'CS301',
      teacher: 'Dr. James Wilson',
      time: '09:00',
      duration: '1h 30m',
      room: 'Room 301',
      building: 'Tech Building',
      type: 'lecture',
      day: 'tuesday',
      color: 'bg-indigo-500'
    },
    {
      id: '5',
      subject: 'Chemistry',
      code: 'CHEM201',
      teacher: 'Dr. Lisa Anderson',
      time: '11:00',
      duration: '1h 30m',
      room: 'Room 102',
      building: 'Science Building',
      type: 'lecture',
      day: 'tuesday',
      color: 'bg-yellow-500'
    },
    {
      id: '6',
      subject: 'Mathematics Tutorial',
      code: 'MATH301T',
      teacher: 'Dr. Sarah Johnson',
      time: '14:00',
      duration: '1h',
      room: 'Room 204',
      building: 'Science Building',
      type: 'tutorial',
      day: 'tuesday',
      color: 'bg-blue-500'
    },
    // Wednesday
    {
      id: '7',
      subject: 'Physics',
      code: 'PHY201',
      teacher: 'Prof. Michael Brown',
      time: '09:00',
      duration: '1h 30m',
      room: 'Room 203',
      building: 'Physics Building',
      type: 'lecture',
      day: 'wednesday',
      color: 'bg-green-500'
    },
    {
      id: '8',
      subject: 'History',
      code: 'HIST101',
      teacher: 'Prof. Robert Taylor',
      time: '11:00',
      duration: '1h',
      room: 'Room 110',
      building: 'Arts Building',
      type: 'lecture',
      day: 'wednesday',
      color: 'bg-orange-500'
    },
    {
      id: '9',
      subject: 'Computer Lab',
      code: 'CS301L',
      teacher: 'Dr. James Wilson',
      time: '14:00',
      duration: '2h',
      room: 'Lab 5',
      building: 'Tech Building',
      type: 'lab',
      day: 'wednesday',
      color: 'bg-indigo-500'
    },
    // Thursday
    {
      id: '10',
      subject: 'Mathematics',
      code: 'MATH301',
      teacher: 'Dr. Sarah Johnson',
      time: '09:00',
      duration: '1h 30m',
      room: 'Room 204',
      building: 'Science Building',
      type: 'lecture',
      day: 'thursday',
      color: 'bg-blue-500'
    },
    {
      id: '11',
      subject: 'Chemistry Lab',
      code: 'CHEM201L',
      teacher: 'Dr. Lisa Anderson',
      time: '11:00',
      duration: '2h',
      room: 'Lab 2',
      building: 'Science Building',
      type: 'lab',
      day: 'thursday',
      color: 'bg-yellow-500'
    },
    {
      id: '12',
      subject: 'English',
      code: 'ENG202',
      teacher: 'Ms. Emily Davis',
      time: '14:00',
      duration: '1h',
      room: 'Room 105',
      building: 'Arts Building',
      type: 'lecture',
      day: 'thursday',
      color: 'bg-purple-500'
    },
    // Friday
    {
      id: '13',
      subject: 'Computer Science',
      code: 'CS301',
      teacher: 'Dr. James Wilson',
      time: '09:00',
      duration: '1h 30m',
      room: 'Room 301',
      building: 'Tech Building',
      type: 'lecture',
      day: 'friday',
      color: 'bg-indigo-500'
    },
    {
      id: '14',
      subject: 'Physics',
      code: 'PHY201',
      teacher: 'Prof. Michael Brown',
      time: '11:00',
      duration: '1h 30m',
      room: 'Room 203',
      building: 'Physics Building',
      type: 'lecture',
      day: 'friday',
      color: 'bg-green-500'
    },
    {
      id: '15',
      subject: 'History',
      code: 'HIST101',
      teacher: 'Prof. Robert Taylor',
      time: '14:00',
      duration: '1h',
      room: 'Room 110',
      building: 'Arts Building',
      type: 'lecture',
      day: 'friday',
      color: 'bg-orange-500'
    }
  ];

  const upcomingClasses: UpcomingClass[] = [
    {
      subject: 'Mathematics',
      time: '09:00 AM',
      room: 'Room 204',
      teacher: 'Dr. Sarah Johnson',
      type: 'Lecture',
      startsIn: '2 hours'
    },
    {
      subject: 'Physics Lab',
      time: '11:00 AM',
      room: 'Lab 3',
      teacher: 'Prof. Michael Brown',
      type: 'Lab',
      startsIn: '4 hours'
    },
    {
      subject: 'English',
      time: '02:00 PM',
      room: 'Room 105',
      teacher: 'Ms. Emily Davis',
      type: 'Lecture',
      startsIn: '7 hours'
    }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getScheduleForDay = (day: string) => {
    return weekSchedule.filter(cls => cls.day === day);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-800';
      case 'lab': return 'bg-green-100 text-green-800';
      case 'tutorial': return 'bg-purple-100 text-purple-800';
      case 'seminar': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentDate = new Date();
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1 + (currentWeek * 7));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            <h1 className="text-2xl font-bold">My Schedule</h1>
            <p className="text-muted-foreground">View your class timetable</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3 lectures, 2 labs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Total classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Mathematics</div>
            <p className="text-xs text-muted-foreground">Starts in 2 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Free Periods</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule View */}
      <Tabs defaultValue="week" className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(currentWeek - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Week
            </Button>
            <h3 className="font-semibold">
              Week of {formatDate(weekStart)} - {formatDate(new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000))}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(currentWeek + 1)}
            >
              Next Week
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekly Schedule Grid */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                      {days.slice(0, 5).map(day => (
                        <th key={day} className="p-3 text-center text-sm font-medium capitalize">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time} className="border-b">
                        <td className="p-3 text-sm text-muted-foreground font-medium">
                          {time}
                        </td>
                        {days.slice(0, 5).map(day => {
                          const classAtTime = weekSchedule.find(
                            cls => cls.day === day && cls.time === time
                          );
                          return (
                            <td key={`${day}-${time}`} className="p-2 relative h-20">
                              {classAtTime && (
                                <div className={`${classAtTime.color} text-white rounded-lg p-2 text-xs cursor-pointer hover:opacity-90 transition-opacity`}>
                                  <div className="font-semibold">{classAtTime.code}</div>
                                  <div className="text-xs opacity-90">{classAtTime.room}</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          {/* Day Selector */}
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {days.map(day => (
                <SelectItem key={day} value={day} className="capitalize">
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Day Schedule */}
          <div className="space-y-3">
            {getScheduleForDay(selectedDay).length > 0 ? (
              getScheduleForDay(selectedDay).map(cls => (
                <Card key={cls.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`w-1 rounded-full ${cls.color}`} />
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold text-lg">{cls.subject}</h4>
                            <p className="text-sm text-muted-foreground">{cls.code}</p>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {cls.time} ({cls.duration})
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {cls.room}, {cls.building}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {cls.teacher}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className={getTypeColor(cls.type)}>
                        {cls.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No classes scheduled for {selectedDay}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingClasses.map((cls, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-semibold">
                        {cls.time.split(':')[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{cls.subject}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>{cls.room}</span>
                          <span>•</span>
                          <span>{cls.teacher}</span>
                          <span>•</span>
                          <span>{cls.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600">
                        {cls.startsIn}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tomorrow's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Computer Science</span>
                    <span className="text-sm text-muted-foreground">09:00 AM - Room 301</span>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Chemistry</span>
                    <span className="text-sm text-muted-foreground">11:00 AM - Room 102</span>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Mathematics Tutorial</span>
                    <span className="text-sm text-muted-foreground">02:00 PM - Room 204</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


