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
  Plus, Search, Eye, Edit, Trash2, Heart, Activity, 
  Calendar as CalendarIcon, Clock, AlertTriangle, FileText,
  Download, Upload, RefreshCw, Filter, Stethoscope,
  Thermometer, Weight, Ruler, Pill, Syringe, ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface HealthRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  rollNumber: string;
  bloodGroup: string;
  height: number;
  weight: number;
  bmi: number;
  allergies: string[];
  medicalConditions: string[];
  medications: Medication[];
  vaccinations: Vaccination[];
  checkups: HealthCheckup[];
  emergencyContacts: EmergencyContact[];
  created_at: string;
  updated_at?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

interface Vaccination {
  id: string;
  vaccineName: string;
  dateGiven: string;
  nextDue?: string;
  givenBy: string;
  batchNumber?: string;
  reactions?: string;
}

interface HealthCheckup {
  id: string;
  date: string;
  type: 'routine' | 'dental' | 'vision' | 'emergency' | 'follow_up';
  conductedBy: string;
  findings: string;
  recommendations: string;
  nextCheckupDate?: string;
  attachments: string[];
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

interface HealthIncident {
  id: string;
  studentId: string;
  studentName: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  treatmentGiven: string;
  treatedBy: string;
  parentNotified: boolean;
  hospitalRequired: boolean;
  followUpRequired: boolean;
  status: 'resolved' | 'ongoing' | 'monitoring';
}

interface HealthStats {
  totalStudents: number;
  studentsWithAllergies: number;
  studentsOnMedication: number;
  recentIncidents: number;
  overdueMedicals: number;
  vaccinationCompliance: number;
  avgBMI: number;
  healthAlerts: number;
}

export function HealthRecords() {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);
  const [stats, setStats] = useState<HealthStats>({
    totalStudents: 0,
    studentsWithAllergies: 0,
    studentsOnMedication: 0,
    recentIncidents: 0,
    overdueMedicals: 0,
    vaccinationCompliance: 0,
    avgBMI: 0,
    healthAlerts: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isAddRecordDialogOpen, setIsAddRecordDialogOpen] = useState(false);
  const [isAddIncidentDialogOpen, setIsAddIncidentDialogOpen] = useState(false);
  const [isViewRecordDialogOpen, setIsViewRecordDialogOpen] = useState(false);
  const [isAddCheckupDialogOpen, setIsAddCheckupDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [healthStatusFilter, setHealthStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [newRecord, setNewRecord] = useState({
    studentId: '',
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: '',
    medicalConditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  const [newIncident, setNewIncident] = useState({
    studentId: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '',
    location: '',
    description: '',
    severity: 'minor',
    treatmentGiven: '',
    treatedBy: '',
    parentNotified: false,
    hospitalRequired: false,
    followUpRequired: false
  });

  const [newCheckup, setNewCheckup] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'routine',
    conductedBy: '',
    findings: '',
    recommendations: '',
    nextCheckupDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsData, incidentsData, statsData] = await Promise.all([
        api.getHealthRecords().catch(() => []),
        api.getHealthIncidents().catch(() => []),
        api.getHealthStats().catch(() => ({
          totalStudents: 0,
          studentsWithAllergies: 0,
          studentsOnMedication: 0,
          recentIncidents: 0,
          overdueMedicals: 0,
          vaccinationCompliance: 0,
          avgBMI: 0,
          healthAlerts: 0
        }))
      ]);
      
      setHealthRecords(recordsData || []);
      setIncidents(incidentsData || []);
      setStats(statsData || {
        totalStudents: 0,
        studentsWithAllergies: 0,
        studentsOnMedication: 0,
        recentIncidents: 0,
        overdueMedicals: 0,
        vaccinationCompliance: 0,
        avgBMI: 0,
        healthAlerts: 0
      });
      
      if (!recordsData || recordsData.length === 0) {
        toast.info('No health records found. Mock data loaded.');
      }
    } catch (error) {
      toast.error('Failed to load health records');
      console.error(error);
      // Set default empty values
      setHealthRecords([]);
      setIncidents([]);
      setStats({
        totalStudents: 0,
        studentsWithAllergies: 0,
        studentsOnMedication: 0,
        recentIncidents: 0,
        overdueMedicals: 0,
        vaccinationCompliance: 0,
        avgBMI: 0,
        healthAlerts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    try {
      const recordData = {
        ...newRecord,
        height: parseFloat(newRecord.height),
        weight: parseFloat(newRecord.weight),
        bmi: calculateBMI(parseFloat(newRecord.height), parseFloat(newRecord.weight)),
        allergies: newRecord.allergies.split(',').map(a => a.trim()).filter(a => a),
        medicalConditions: newRecord.medicalConditions.split(',').map(c => c.trim()).filter(c => c),
        medications: [],
        vaccinations: [],
        checkups: [],
        emergencyContacts: [{
          id: `emergency_${Date.now()}`,
          name: newRecord.emergencyContactName,
          phone: newRecord.emergencyContactPhone,
          relationship: newRecord.emergencyContactRelation,
          isPrimary: true
        }]
      };
      
      await api.createHealthRecord(recordData);
      toast.success('Health record created successfully');
      setIsAddRecordDialogOpen(false);
      resetRecordForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create health record');
      console.error(error);
    }
  };

  const handleAddIncident = async () => {
    try {
      await api.createHealthIncident({
        ...newIncident,
        status: 'ongoing'
      });
      toast.success('Health incident recorded successfully');
      setIsAddIncidentDialogOpen(false);
      resetIncidentForm();
      loadData();
    } catch (error) {
      toast.error('Failed to record health incident');
      console.error(error);
    }
  };

  const handleAddCheckup = async () => {
    try {
      await api.addHealthCheckup(newCheckup);
      toast.success('Health checkup added successfully');
      setIsAddCheckupDialogOpen(false);
      resetCheckupForm();
      loadData();
    } catch (error) {
      toast.error('Failed to add health checkup');
      console.error(error);
    }
  };

  const calculateBMI = (height: number, weight: number): number => {
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetRecordForm = () => {
    setNewRecord({
      studentId: '',
      bloodGroup: '',
      height: '',
      weight: '',
      allergies: '',
      medicalConditions: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: ''
    });
  };

  const resetIncidentForm = () => {
    setNewIncident({
      studentId: '',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentTime: '',
      location: '',
      description: '',
      severity: 'minor',
      treatmentGiven: '',
      treatedBy: '',
      parentNotified: false,
      hospitalRequired: false,
      followUpRequired: false
    });
  };

  const resetCheckupForm = () => {
    setNewCheckup({
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      type: 'routine',
      conductedBy: '',
      findings: '',
      recommendations: '',
      nextCheckupDate: ''
    });
  };

  const filteredRecords = (healthRecords || []).filter(record => {
    if (!record) return false;
    return (
      ((record.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (record.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (classFilter === '' || classFilter === 'all' || record.studentClass === classFilter)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Health Records</h1>
          <p className="text-muted-foreground">
            Manage student health records and medical information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddCheckupDialogOpen} onOpenChange={setIsAddCheckupDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Stethoscope className="mr-2 h-4 w-4" />
                Add Checkup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Health Checkup</DialogTitle>
                <DialogDescription>
                  Record a new health checkup for a student
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="checkupStudent">Student</Label>
                  <Select value={newCheckup.studentId} onValueChange={(value) => setNewCheckup({...newCheckup, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {healthRecords.map((record) => (
                        <SelectItem key={record.studentId} value={record.studentId}>
                          {record.studentName} - {record.rollNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkupDate">Date</Label>
                    <Input
                      id="checkupDate"
                      type="date"
                      value={newCheckup.date}
                      onChange={(e) => setNewCheckup({...newCheckup, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkupType">Type</Label>
                    <Select value={newCheckup.type} onValueChange={(value) => setNewCheckup({...newCheckup, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine Checkup</SelectItem>
                        <SelectItem value="dental">Dental Checkup</SelectItem>
                        <SelectItem value="vision">Vision Test</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="conductedBy">Conducted By</Label>
                  <Input
                    id="conductedBy"
                    value={newCheckup.conductedBy}
                    onChange={(e) => setNewCheckup({...newCheckup, conductedBy: e.target.value})}
                    placeholder="Enter doctor/nurse name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    value={newCheckup.findings}
                    onChange={(e) => setNewCheckup({...newCheckup, findings: e.target.value})}
                    placeholder="Enter checkup findings"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    value={newCheckup.recommendations}
                    onChange={(e) => setNewCheckup({...newCheckup, recommendations: e.target.value})}
                    placeholder="Enter recommendations"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nextCheckupDate">Next Checkup Date (Optional)</Label>
                  <Input
                    id="nextCheckupDate"
                    type="date"
                    value={newCheckup.nextCheckupDate}
                    onChange={(e) => setNewCheckup({...newCheckup, nextCheckupDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddCheckupDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCheckup}>
                  Add Checkup
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddIncidentDialogOpen} onOpenChange={setIsAddIncidentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report Health Incident</DialogTitle>
                <DialogDescription>
                  Record a health incident or injury
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="incidentStudent">Student</Label>
                  <Select value={newIncident.studentId} onValueChange={(value) => setNewIncident({...newIncident, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {healthRecords.map((record) => (
                        <SelectItem key={record.studentId} value={record.studentId}>
                          {record.studentName} - {record.rollNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incidentDate">Date</Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={newIncident.incidentDate}
                      onChange={(e) => setNewIncident({...newIncident, incidentDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="incidentTime">Time</Label>
                    <Input
                      id="incidentTime"
                      type="time"
                      value={newIncident.incidentTime}
                      onChange={(e) => setNewIncident({...newIncident, incidentTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newIncident.location}
                      onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
                      placeholder="Where did it happen?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={newIncident.severity} onValueChange={(value) => setNewIncident({...newIncident, severity: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="incidentDescription">Description</Label>
                  <Textarea
                    id="incidentDescription"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                    placeholder="Describe what happened"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="treatmentGiven">Treatment Given</Label>
                  <Textarea
                    id="treatmentGiven"
                    value={newIncident.treatmentGiven}
                    onChange={(e) => setNewIncident({...newIncident, treatmentGiven: e.target.value})}
                    placeholder="What treatment was provided?"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="treatedBy">Treated By</Label>
                  <Input
                    id="treatedBy"
                    value={newIncident.treatedBy}
                    onChange={(e) => setNewIncident({...newIncident, treatedBy: e.target.value})}
                    placeholder="Who provided the treatment?"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parentNotified"
                      checked={newIncident.parentNotified}
                      onCheckedChange={(checked) => setNewIncident({...newIncident, parentNotified: !!checked})}
                    />
                    <Label htmlFor="parentNotified">Parent/Guardian notified</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hospitalRequired"
                      checked={newIncident.hospitalRequired}
                      onCheckedChange={(checked) => setNewIncident({...newIncident, hospitalRequired: !!checked})}
                    />
                    <Label htmlFor="hospitalRequired">Hospital treatment required</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="followUpRequired"
                      checked={newIncident.followUpRequired}
                      onCheckedChange={(checked) => setNewIncident({...newIncident, followUpRequired: !!checked})}
                    />
                    <Label htmlFor="followUpRequired">Follow-up required</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddIncidentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddIncident}>
                  Record Incident
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddRecordDialogOpen} onOpenChange={setIsAddRecordDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Health Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Health Record</DialogTitle>
                <DialogDescription>
                  Create a new health record for a student
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <Select value={newRecord.studentId} onValueChange={(value) => setNewRecord({...newRecord, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Students would be populated from API */}
                      <SelectItem value="student1">John Doe - 001</SelectItem>
                      <SelectItem value="student2">Jane Smith - 002</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select value={newRecord.bloodGroup} onValueChange={(value) => setNewRecord({...newRecord, bloodGroup: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={newRecord.height}
                      onChange={(e) => setNewRecord({...newRecord, height: e.target.value})}
                      placeholder="Enter height"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={newRecord.weight}
                      onChange={(e) => setNewRecord({...newRecord, weight: e.target.value})}
                      placeholder="Enter weight"
                    />
                  </div>
                </div>
                
                {newRecord.height && newRecord.weight && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">BMI:</span>
                      <span className={`font-bold ${getBMIColor(calculateBMI(parseFloat(newRecord.height), parseFloat(newRecord.weight)))}`}>
                        {calculateBMI(parseFloat(newRecord.height), parseFloat(newRecord.weight))} - {getBMICategory(calculateBMI(parseFloat(newRecord.height), parseFloat(newRecord.weight)))}
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                  <Input
                    id="allergies"
                    value={newRecord.allergies}
                    onChange={(e) => setNewRecord({...newRecord, allergies: e.target.value})}
                    placeholder="e.g., Peanuts, Shellfish, Pollen"
                  />
                </div>
                
                <div>
                  <Label htmlFor="medicalConditions">Medical Conditions (comma-separated)</Label>
                  <Input
                    id="medicalConditions"
                    value={newRecord.medicalConditions}
                    onChange={(e) => setNewRecord({...newRecord, medicalConditions: e.target.value})}
                    placeholder="e.g., Asthma, Diabetes, Epilepsy"
                  />
                </div>
                
                <Separator />
                
                <h4 className="font-medium">Emergency Contact</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={newRecord.emergencyContactName}
                      onChange={(e) => setNewRecord({...newRecord, emergencyContactName: e.target.value})}
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelation">Relationship</Label>
                    <Input
                      id="emergencyContactRelation"
                      value={newRecord.emergencyContactRelation}
                      onChange={(e) => setNewRecord({...newRecord, emergencyContactRelation: e.target.value})}
                      placeholder="e.g., Mother, Father"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={newRecord.emergencyContactPhone}
                    onChange={(e) => setNewRecord({...newRecord, emergencyContactPhone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddRecordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRecord}>
                  Create Record
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
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Students with Allergies</p>
                <p className="text-2xl font-bold">{stats.studentsWithAllergies}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">On Medication</p>
                <p className="text-2xl font-bold">{stats.studentsOnMedication}</p>
              </div>
              <Pill className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Recent Incidents</p>
                <p className="text-2xl font-bold">{stats.recentIncidents}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList>
          <TabsTrigger value="records">Health Records</TabsTrigger>
          <TabsTrigger value="incidents">Health Incidents</TabsTrigger>
          <TabsTrigger value="checkups">Medical Checkups</TabsTrigger>
          <TabsTrigger value="analytics">Health Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="5">Class 5</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Health Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Health Records</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>BMI</TableHead>
                        <TableHead>Allergies</TableHead>
                        <TableHead>Medical Conditions</TableHead>
                        <TableHead>Emergency Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{record.studentName}</div>
                              <div className="text-sm text-muted-foreground">
                                {record.studentClass} - {record.rollNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.bloodGroup}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className={`font-medium ${getBMIColor(record.bmi)}`}>
                                {record.bmi}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getBMICategory(record.bmi)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.allergies.length > 0 ? (
                              <div className="space-y-1">
                                {record.allergies.slice(0, 2).map((allergy, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {allergy}
                                  </Badge>
                                ))}
                                {record.allergies.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{record.allergies.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.medicalConditions.length > 0 ? (
                              <div className="space-y-1">
                                {record.medicalConditions.slice(0, 2).map((condition, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))}
                                {record.medicalConditions.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{record.medicalConditions.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.emergencyContacts.length > 0 && (
                              <div className="text-sm">
                                <div>{record.emergencyContacts[0].name}</div>
                                <div className="text-muted-foreground">
                                  {record.emergencyContacts[0].phone}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setIsViewRecordDialogOpen(true);
                                }}
                              >
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
              )}
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of{' '}
                  {filteredRecords.length} records
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
        
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Health Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.slice(0, 10).map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(incident.incidentDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {incident.incidentTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{incident.studentName}</div>
                        </TableCell>
                        <TableCell>{incident.location}</TableCell>
                        <TableCell>
                          <div className="max-w-48 truncate" title={incident.description}>
                            {incident.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getIncidentSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-32 truncate" title={incident.treatmentGiven}>
                            {incident.treatmentGiven}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={incident.status === 'resolved' ? 'default' : 'secondary'}>
                            {incident.status}
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
        
        <TabsContent value="checkups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Checkups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Medical checkups history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average BMI</span>
                    <span className="font-bold">{stats.avgBMI}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Vaccination Compliance</span>
                    <span className="font-bold">{stats.vaccinationCompliance}%</span>
                  </div>
                  <Progress value={stats.vaccinationCompliance} className="w-full" />
                  <div className="flex justify-between items-center">
                    <span>Health Alerts</span>
                    <Badge variant={stats.healthAlerts > 0 ? "destructive" : "default"}>
                      {stats.healthAlerts}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Medical Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">{stats.studentsWithAllergies}</div>
                      <div className="text-xs text-muted-foreground">With Allergies</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{stats.studentsOnMedication}</div>
                      <div className="text-xs text-muted-foreground">On Medication</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">{stats.overdueMedicals}</div>
                    <div className="text-xs text-muted-foreground">Overdue Medical Checkups</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Health Record Dialog */}
      <Dialog open={isViewRecordDialogOpen} onOpenChange={setIsViewRecordDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Health Record Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedRecord.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class:</span>
                      <span>{selectedRecord.studentClass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roll Number:</span>
                      <span>{selectedRecord.rollNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Group:</span>
                      <Badge variant="outline">{selectedRecord.bloodGroup}</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Physical Measurements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Height:</span>
                      <span>{selectedRecord.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{selectedRecord.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BMI:</span>
                      <span className={getBMIColor(selectedRecord.bmi)}>
                        {selectedRecord.bmi} - {getBMICategory(selectedRecord.bmi)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Allergies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecord.allergies.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRecord.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="mr-2">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No known allergies</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecord.medicalConditions.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRecord.medicalConditions.map((condition, index) => (
                          <Badge key={index} variant="secondary" className="mr-2">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No medical conditions</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedRecord.emergencyContacts.map((contact) => (
                      <div key={contact.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">{contact.relationship}</div>
                            <div className="text-sm">{contact.phone}</div>
                            {contact.email && (
                              <div className="text-sm text-muted-foreground">{contact.email}</div>
                            )}
                          </div>
                          {contact.isPrimary && (
                            <Badge variant="default">Primary</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Record
                </Button>
                <Button variant="outline">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Add Checkup
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Record
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}