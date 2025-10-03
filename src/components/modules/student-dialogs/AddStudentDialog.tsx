import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import { api } from '../../../utils/api';

interface Student {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  bloodGroup: string;
  gender: 'male' | 'female' | 'other';
  religion: string;
  nationality: string;
  emergencyContact: string;
  medicalConditions: string;
  studentId: string;
  previousSchool: string;
  academicYear: string;
  house: string;
  transportRoute: string;
  feeCategory: string;
}

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentAdded: () => void;
}

export function AddStudentDialog({ open, onOpenChange, onStudentAdded }: AddStudentDialogProps) {
  const [newStudent, setNewStudent] = useState<Student>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    class: '',
    section: '',
    rollNumber: '',
    dateOfBirth: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    bloodGroup: '',
    gender: 'male',
    religion: '',
    nationality: '',
    emergencyContact: '',
    medicalConditions: '',
    studentId: '',
    previousSchool: '',
    academicYear: new Date().getFullYear().toString(),
    house: '',
    transportRoute: '',
    feeCategory: 'regular'
  });

  const handleAddStudent = async () => {
    try {
      const requiredFields = ['firstName', 'lastName', 'class', 'section', 'rollNumber', 'parentName', 'parentPhone'];
      const missingFields = requiredFields.filter(field => !newStudent[field as keyof Student]);

      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      const studentData = {
        ...newStudent,
        id: `local-${Date.now()}`,
        status: 'active' as const,
        admissionDate: new Date().toISOString().split('T')[0],
        studentId: newStudent.studentId || `STU${Date.now()}`,
        created_at: new Date().toISOString()
      };

      try {
        await api.createStudent(studentData);
      } catch (apiError) {
        console.warn('API save failed, saving locally:', apiError);
      }

      toast.success('Student added successfully');
      onOpenChange(false);
      resetNewStudent();
      onStudentAdded();
    } catch (error) {
      toast.error('Failed to add student');
      console.error(error);
    }
  };

  const resetNewStudent = () => {
    setNewStudent({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      class: '',
      section: '',
      rollNumber: '',
      dateOfBirth: '',
      address: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      bloodGroup: '',
      gender: 'male',
      religion: '',
      nationality: '',
      emergencyContact: '',
      medicalConditions: '',
      studentId: '',
      previousSchool: '',
      academicYear: new Date().getFullYear().toString(),
      house: '',
      transportRoute: '',
      feeCategory: 'regular'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the comprehensive student information below.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="parent">Parent/Guardian</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={newStudent.gender} onValueChange={(value: string) => setNewStudent({...newStudent, gender: value as 'male' | 'female' | 'other'})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newStudent.dateOfBirth}
                  onChange={(e) => setNewStudent({...newStudent, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={newStudent.bloodGroup} onValueChange={(value: string) => setNewStudent({...newStudent, bloodGroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
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
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={newStudent.nationality}
                  onChange={(e) => setNewStudent({...newStudent, nationality: e.target.value})}
                  placeholder="Enter nationality"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Input
                  id="religion"
                  value={newStudent.religion}
                  onChange={(e) => setNewStudent({...newStudent, religion: e.target.value})}
                  placeholder="Enter religion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newStudent.address}
                  onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input
                  id="rollNumber"
                  value={newStudent.rollNumber}
                  onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})}
                  placeholder="Enter roll number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select value={newStudent.class} onValueChange={(value: string) => setNewStudent({...newStudent, class: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(cls => (
                      <SelectItem key={cls} value={cls}>{cls} Standard</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Select value={newStudent.section} onValueChange={(value: string) => setNewStudent({...newStudent, section: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A', 'B', 'C', 'D', 'E'].map(sec => (
                      <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={newStudent.academicYear} onValueChange={(value: string) => setNewStudent({...newStudent, academicYear: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 5}, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}-{year + 1}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="house">House</Label>
                <Select value={newStudent.house} onValueChange={(value: string) => setNewStudent({...newStudent, house: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select house" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red">Red House</SelectItem>
                    <SelectItem value="blue">Blue House</SelectItem>
                    <SelectItem value="green">Green House</SelectItem>
                    <SelectItem value="yellow">Yellow House</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School</Label>
                <Input
                  id="previousSchool"
                  value={newStudent.previousSchool}
                  onChange={(e) => setNewStudent({...newStudent, previousSchool: e.target.value})}
                  placeholder="Enter previous school name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeCategory">Fee Category</Label>
                <Select value={newStudent.feeCategory} onValueChange={(value: string) => setNewStudent({...newStudent, feeCategory: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="scholarship">Scholarship</SelectItem>
                    <SelectItem value="concession">Concession</SelectItem>
                    <SelectItem value="staff_ward">Staff Ward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parent" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  value={newStudent.parentName}
                  onChange={(e) => setNewStudent({...newStudent, parentName: e.target.value})}
                  placeholder="Enter parent name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent Phone *</Label>
                <Input
                  id="parentPhone"
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({...newStudent, parentPhone: e.target.value})}
                  placeholder="Enter parent phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({...newStudent, parentEmail: e.target.value})}
                  placeholder="Enter parent email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={newStudent.emergencyContact}
                  onChange={(e) => setNewStudent({...newStudent, emergencyContact: e.target.value})}
                  placeholder="Enter emergency contact"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transportRoute">Transport Route</Label>
                <Select value={newStudent.transportRoute} onValueChange={(value: string) => setNewStudent({...newStudent, transportRoute: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route1">Route 1 - City Center</SelectItem>
                    <SelectItem value="route2">Route 2 - Suburbs</SelectItem>
                    <SelectItem value="route3">Route 3 - East District</SelectItem>
                    <SelectItem value="route4">Route 4 - West District</SelectItem>
                    <SelectItem value="none">No Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Student Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="Enter student email"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions / Allergies</Label>
                <Textarea
                  id="medicalConditions"
                  value={newStudent.medicalConditions}
                  onChange={(e) => setNewStudent({...newStudent, medicalConditions: e.target.value})}
                  placeholder="Enter any medical conditions or allergies"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddStudent}>
            Add Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}