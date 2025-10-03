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
  Plus, Search, Eye, Edit, Trash2, Clock, Calendar as CalendarIcon,
  Download, Upload, RefreshCw, Filter, Settings, Copy,
  RotateCcw, Shuffle, CheckCircle, AlertCircle, Users,
  BookOpen, MapPin, User, Save, Share, PrinterIcon
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TimeSlot {
  id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  section: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomId?: string;
  roomNumber?: string;
  isBreak: boolean;
  isLocked: boolean;
}

interface TimetableTemplate {
  id: string;
  name: string;
  description: string;
  periods: PeriodDefinition[];
  breaks: BreakDefinition[];
  workingDays: string[];
  academicYear: string;
  isActive: boolean;
  created_at: string;
}

interface PeriodDefinition {
  period: number;
  startTime: string;
  endTime: string;
  duration: number;
}

interface BreakDefinition {
  name: string;
  afterPeriod: number;
  duration: number;
}

interface TeacherSchedule {
  teacherId: string;
  teacherName: string;
  department: string;
  totalPeriods: number;
  assignedPeriods: number;
  freeSlots: TimeSlot[];
  conflicts: TimetableConflict[];
}

interface TimetableConflict {
  id: string;
  type: 'teacher_clash' | 'room_clash' | 'subject_overload' | 'no_break';
  description: string;
  affectedSlots: string[];
  severity: 'high' | 'medium' | 'low';
}

interface TimetableStats {
  totalClasses: number;
  completedTimetables: number;
  totalConflicts: number;
  teacherUtilization: number;
  roomUtilization: number;
  averagePeriodsPerDay: number;
}

export function TimetableManagement() {
  const [timetables, setTimetables] = useState<TimeSlot[]>([]);
  const [templates, setTemplates] = useState<TimetableTemplate[]>([]);
  const [teacherSchedules, setTeacherSchedules] = useState<TeacherSchedule[]>([]);
  const [conflicts, setConflicts] = useState<TimetableConflict[]>([]);
  const [stats, setStats] = useState<TimetableStats>({
    totalClasses: 0,
    completedTimetables: 0,
    totalConflicts: 0,
    teacherUtilization: 0,
    roomUtilization: 0,
    averagePeriodsPerDay: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isConflictsDialogOpen, setIsConflictsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newSlot, setNewSlot] = useState({
    classId: '',
    day: 'monday',
    period: 1,
    subjectId: '',
    teacherId: '',
    roomId: ''
  });

  const [generateForm, setGenerateForm] = useState({
    templateId: '',
    classes: [] as string[],
    constraints: {
      maxPeriodsPerDay: 8,
      minBreakDuration: 15,
      lunchBreakDuration: 45,
      avoidBackToBack: true,
      respectTeacherPreferences: true
    }
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    periods: [
      { period: 1, startTime: '09:00', endTime: '09:45', duration: 45 },
      { period: 2, startTime: '09:45', endTime: '10:30', duration: 45 },
      { period: 3, startTime: '10:45', endTime: '11:30', duration: 45 },
      { period: 4, startTime: '11:30', endTime: '12:15', duration: 45 },
      { period: 5, startTime: '13:00', endTime: '13:45', duration: 45 },
      { period: 6, startTime: '13:45', endTime: '14:30', duration: 45 }
    ],
    breaks: [
      { name: 'Short Break', afterPeriod: 2, duration: 15 },
      { name: 'Lunch Break', afterPeriod: 4, duration: 45 }
    ],
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const timeSlots = [
    { period: 1, time: '09:00-09:45' },
    { period: 2, time: '09:45-10:30' },
    { period: 3, time: '10:45-11:30' },
    { period: 4, time: '11:30-12:15' },
    { period: 5, time: '13:00-13:45' },
    { period: 6, time: '13:45-14:30' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedSection]);

  const loadData = async () => {
    try {
      const [timetableData, templatesData, teachersData, conflictsData, statsData] = await Promise.all([
        api.getTimetable({ class: selectedClass, section: selectedSection }),
        api.getTimetableTemplates(),
        api.getTeacherSchedules(),
        api.getTimetableConflicts(),
        api.getTimetableStats()
      ]);
      
      setTimetables(timetableData);
      setTemplates(templatesData);
      setTeacherSchedules(teachersData);
      setConflicts(conflictsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load timetable data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    try {
      await api.createTimetableSlot(newSlot);
      toast.success('Time slot added successfully');
      setIsAddSlotDialogOpen(false);
      resetSlotForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add time slot');
      console.error(error);
    }
  };

  const handleGenerateTimetable = async () => {
    try {
      await api.generateTimetable({
        templateId: generateForm.templateId,
        classes: generateForm.classes,
        constraints: generateForm.constraints
      });
      toast.success('Timetable generated successfully');
      setIsGenerateDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to generate timetable');
      console.error(error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await api.createTimetableTemplate(newTemplate);
      toast.success('Template saved successfully');
      setIsTemplateDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save template');
      console.error(error);
    }
  };

  const handleSwapSlots = async (slot1Id: string, slot2Id: string) => {
    try {
      await api.swapTimetableSlots(slot1Id, slot2Id);
      toast.success('Slots swapped successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to swap slots');
      console.error(error);
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: string) => {
    try {
      await api.resolveConflict(conflictId, resolution);
      toast.success('Conflict resolved successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to resolve conflict');
      console.error(error);
    }
  };

  const handleOptimizeTimetable = async () => {
    try {
      await api.optimizeTimetable({ class: selectedClass, section: selectedSection });
      toast.success('Timetable optimized successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to optimize timetable');
      console.error(error);
    }
  };

  const resetSlotForm = () => {
    setNewSlot({
      classId: '',
      day: 'monday',
      period: 1,
      subjectId: '',
      teacherId: '',
      roomId: ''
    });
  };

  const getSlotForDayPeriod = (day: string, period: number) => {
    return (timetables || []).find(slot => 
      slot.day.toLowerCase() === day.toLowerCase() && 
      slot.period === period &&
      slot.classId === selectedClass
    );
  };

  const getConflictSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Timetable Management</h1>
          <p className="text-muted-foreground">
            Create and manage class timetables and schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isConflictsDialogOpen} onOpenChange={setIsConflictsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertCircle className="mr-2 h-4 w-4" />
                Conflicts ({(conflicts || []).length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Timetable Conflicts</DialogTitle>
                <DialogDescription>
                  Review and resolve timetable conflicts
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {(conflicts || []).map((conflict) => (
                  <div key={conflict.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getConflictSeverityColor(conflict.severity)}>
                            {conflict.severity}
                          </Badge>
                          <span className="font-medium">{conflict.type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{conflict.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleResolveConflict(conflict.id, 'auto')}
                        >
                          Auto Resolve
                        </Button>
                        <Button size="sm" variant="outline">
                          Manual Fix
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(conflicts || []).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2 text-sm text-muted-foreground">No conflicts found</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Timetable Templates</DialogTitle>
                <DialogDescription>
                  Create and manage timetable templates
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="existing">
                <TabsList>
                  <TabsTrigger value="existing">Existing Templates</TabsTrigger>
                  <TabsTrigger value="create">Create New</TabsTrigger>
                </TabsList>
                
                <TabsContent value="existing" className="space-y-4">
                  {(templates || []).map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span>Periods: {(template.periods || []).length}</span>
                              <span>Days: {(template.workingDays || []).length}</span>
                              <Badge variant={template.isActive ? "default" : "secondary"}>
                                {template.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="create" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateDesc">Description</Label>
                      <Input
                        id="templateDesc"
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                        placeholder="Enter description"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Working Days</Label>
                    <div className="flex gap-2 mt-2">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={(newTemplate.workingDays || []).includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewTemplate({
                                  ...newTemplate,
                                  workingDays: [...newTemplate.workingDays, day]
                                });
                              } else {
                                setNewTemplate({
                                  ...newTemplate,
                                  workingDays: (newTemplate.workingDays || []).filter(d => d !== day)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={day} className="text-sm capitalize">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Period Structure</Label>
                    <div className="space-y-2 mt-2">
                      {(newTemplate.periods || []).map((period, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center">
                          <span className="text-sm">Period {period.period}</span>
                          <Input
                            type="time"
                            value={period.startTime}
                            onChange={(e) => {
                              const updatedPeriods = [...newTemplate.periods];
                              updatedPeriods[index].startTime = e.target.value;
                              setNewTemplate({...newTemplate, periods: updatedPeriods});
                            }}
                          />
                          <Input
                            type="time"
                            value={period.endTime}
                            onChange={(e) => {
                              const updatedPeriods = [...newTemplate.periods];
                              updatedPeriods[index].endTime = e.target.value;
                              setNewTemplate({...newTemplate, periods: updatedPeriods});
                            }}
                          />
                          <span className="text-sm text-muted-foreground">{period.duration}min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveTemplate}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Template
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shuffle className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Timetable</DialogTitle>
                <DialogDescription>
                  Automatically generate timetable using AI optimization
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select 
                    value={generateForm.templateId} 
                    onValueChange={(value) => setGenerateForm({...generateForm, templateId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {(templates || []).map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Classes to Generate</Label>
                  <div className="text-sm text-muted-foreground mb-2">
                    Select classes for which to generate timetables
                  </div>
                  {/* Class selection would be populated from API */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="class1a" />
                      <Label htmlFor="class1a">Class 1 - A</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="class1b" />
                      <Label htmlFor="class1b">Class 1 - B</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Generation Constraints</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxPeriods">Max Periods/Day</Label>
                      <Input
                        id="maxPeriods"
                        type="number"
                        value={generateForm.constraints.maxPeriodsPerDay}
                        onChange={(e) => setGenerateForm({
                          ...generateForm,
                          constraints: {
                            ...generateForm.constraints,
                            maxPeriodsPerDay: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minBreak">Min Break (minutes)</Label>
                      <Input
                        id="minBreak"
                        type="number"
                        value={generateForm.constraints.minBreakDuration}
                        onChange={(e) => setGenerateForm({
                          ...generateForm,
                          constraints: {
                            ...generateForm.constraints,
                            minBreakDuration: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="avoidBackToBack"
                        checked={generateForm.constraints.avoidBackToBack}
                        onCheckedChange={(checked) => setGenerateForm({
                          ...generateForm,
                          constraints: {
                            ...generateForm.constraints,
                            avoidBackToBack: !!checked
                          }
                        })}
                      />
                      <Label htmlFor="avoidBackToBack">Avoid back-to-back same subjects</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="teacherPrefs"
                        checked={generateForm.constraints.respectTeacherPreferences}
                        onCheckedChange={(checked) => setGenerateForm({
                          ...generateForm,
                          constraints: {
                            ...generateForm.constraints,
                            respectTeacherPreferences: !!checked
                          }
                        })}
                      />
                      <Label htmlFor="teacherPrefs">Respect teacher preferences</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateTimetable}>
                  Generate Timetable
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddSlotDialogOpen} onOpenChange={setIsAddSlotDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Time Slot</DialogTitle>
                <DialogDescription>
                  Add a new time slot to the timetable
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="slotClass">Class</Label>
                  <Select value={newSlot.classId} onValueChange={(value) => setNewSlot({...newSlot, classId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Classes would be populated from API */}
                      <SelectItem value="class1a">Class 1 - A</SelectItem>
                      <SelectItem value="class1b">Class 1 - B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slotDay">Day</Label>
                    <Select value={newSlot.day} onValueChange={(value) => setNewSlot({...newSlot, day: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="slotPeriod">Period</Label>
                    <Select value={newSlot.period.toString()} onValueChange={(value) => setNewSlot({...newSlot, period: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.period} value={slot.period.toString()}>
                            Period {slot.period} ({slot.time})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="slotSubject">Subject</Label>
                  <Select value={newSlot.subjectId} onValueChange={(value) => setNewSlot({...newSlot, subjectId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Subjects would be populated from API */}
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="slotTeacher">Teacher</Label>
                  <Select value={newSlot.teacherId} onValueChange={(value) => setNewSlot({...newSlot, teacherId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Teachers would be populated from API */}
                      <SelectItem value="teacher1">John Smith</SelectItem>
                      <SelectItem value="teacher2">Jane Doe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="slotRoom">Room (Optional)</Label>
                  <Select value={newSlot.roomId} onValueChange={(value) => setNewSlot({...newSlot, roomId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Rooms would be populated from API */}
                      <SelectItem value="room101">Room 101</SelectItem>
                      <SelectItem value="room102">Room 102</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddSlotDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSlot}>
                  Add Slot
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
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Completed Timetables</p>
                <p className="text-2xl font-bold">{stats.completedTimetables}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Conflicts</p>
                <p className="text-2xl font-bold">{stats.totalConflicts}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Teacher Utilization</p>
                <p className="text-2xl font-bold">{stats.teacherUtilization}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={stats.teacherUtilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Class and View Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label htmlFor="viewClass">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="1">Class 1</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="5">Class 5</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="viewSection">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="viewMode">View Mode</Label>
              <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOptimizeTimetable}>
                <Shuffle className="mr-2 h-4 w-4" />
                Optimize
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline">
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList>
          <TabsTrigger value="timetable">Timetable View</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Schedules</TabsTrigger>
          <TabsTrigger value="rooms">Room Allocation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timetable" className="space-y-4">
          {viewMode === 'grid' ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Weekly Timetable - {selectedClass && selectedSection ? `Class ${selectedClass}-${selectedSection}` : 'All Classes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Time</TableHead>
                        {daysOfWeek.map((day) => (
                          <TableHead key={day} className="text-center min-w-32">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.map((timeSlot) => (
                        <TableRow key={timeSlot.period}>
                          <TableCell className="font-medium">
                            <div className="text-xs">Period {timeSlot.period}</div>
                            <div className="text-xs text-muted-foreground">{timeSlot.time}</div>
                          </TableCell>
                          {daysOfWeek.map((day) => {
                            const slot = getSlotForDayPeriod(day, timeSlot.period);
                            return (
                              <TableCell key={`${day}-${timeSlot.period}`} className="p-2">
                                {slot ? (
                                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                                    <div className="font-medium text-blue-900">{slot.subjectName}</div>
                                    <div className="text-blue-700">{slot.teacherName}</div>
                                    {slot.roomNumber && (
                                      <div className="text-blue-600">Room {slot.roomNumber}</div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-center text-gray-400">
                                    Free
                                  </div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Timetable List View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(timetables || []).map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>{slot.day.charAt(0).toUpperCase() + slot.day.slice(1)}</TableCell>
                          <TableCell>{slot.period}</TableCell>
                          <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                          <TableCell>{slot.className} - {slot.section}</TableCell>
                          <TableCell>{slot.subjectName}</TableCell>
                          <TableCell>{slot.teacherName}</TableCell>
                          <TableCell>{slot.roomNumber || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {slot.isLocked ? (
                                <Badge variant="outline" className="text-xs">Locked</Badge>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
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
          )}
        </TabsContent>
        
        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(teacherSchedules || []).map((teacher) => (
                  <Card key={teacher.teacherId}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{teacher.teacherName}</h3>
                          <p className="text-sm text-muted-foreground">{teacher.department}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="font-medium">{teacher.assignedPeriods}</span>
                            <span className="text-muted-foreground">/{teacher.totalPeriods} periods</span>
                          </div>
                          <Progress 
                            value={(teacher.assignedPeriods / teacher.totalPeriods) * 100} 
                            className="w-24 h-2 mt-1"
                          />
                        </div>
                      </div>
                      
                      {(teacher.conflicts || []).length > 0 && (
                        <Alert className="mb-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {(teacher.conflicts || []).length} scheduling conflicts detected
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Free slots: {(teacher.freeSlots || []).length}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Schedule
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Room allocation view coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Utilization Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Teacher Utilization</span>
                      <span className="font-bold">{stats.teacherUtilization}%</span>
                    </div>
                    <Progress value={stats.teacherUtilization} className="w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Room Utilization</span>
                      <span className="font-bold">{stats.roomUtilization}%</span>
                    </div>
                    <Progress value={stats.roomUtilization} className="w-full" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{stats.averagePeriodsPerDay}</div>
                      <div className="text-xs text-muted-foreground">Avg Periods/Day</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{stats.completedTimetables}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Timetable Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Conflicts</span>
                    <Badge variant={stats.totalConflicts > 0 ? "destructive" : "default"}>
                      {stats.totalConflicts}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Completion Rate</span>
                    <span className="font-bold">
                      {Math.round((stats.completedTimetables / stats.totalClasses) * 100)}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={(stats.completedTimetables / stats.totalClasses) * 100} 
                    className="w-full"
                  />
                  
                  <div className="text-center mt-4">
                    {stats.totalConflicts === 0 ? (
                      <div className="text-green-600">
                        <CheckCircle className="mx-auto h-8 w-8" />
                        <p className="text-sm mt-1">All timetables are conflict-free</p>
                      </div>
                    ) : (
                      <div className="text-red-600">
                        <AlertCircle className="mx-auto h-8 w-8" />
                        <p className="text-sm mt-1">Conflicts need attention</p>
                      </div>
                    )}
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