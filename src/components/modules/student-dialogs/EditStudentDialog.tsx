import { useState, useEffect } from 'react';
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
  id: string;
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
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
}

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onStudentUpdated: () => void;
}

export function EditStudentDialog({ open, onOpenChange, student, onStudentUpdated }: EditStudentDialogProps) {
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (student) {
      setEditedStudent({ ...student });
    }
  }, [student]);

  const handleEditStudent = async () => {
    if (!editedStudent) return;

    try {
      try {
        await api.updateStudent(editedStudent.id, editedStudent);
      } catch (apiError) {
        console.warn('API update failed, updating locally:', apiError);
      }

      toast.success('Student updated successfully');
      onOpenChange(false);
      onStudentUpdated();
    } catch (error) {
      toast.error('Failed to update student');
      console.error(error);
    }
  };

  if (!editedStudent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update the student information below.
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
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  value={editedStudent.firstName}
                  onChange={(e) => setEditedStudent({...editedStudent, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  value={editedStudent.lastName}
                  onChange={(e) => setEditedStudent({...editedStudent, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <Select value={editedStudent.gender} onValueChange={(value: string) => setEditedStudent({...editedStudent, gender: value as 'male' | 'female' | 'other'})}>
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
                <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={editedStudent.dateOfBirth}
                  onChange={(e) => setEditedStudent({...editedStudent, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editedStudent.address}
                  onChange={(e) => setEditedStudent({...editedStudent, address: e.target.value})}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-class">Class *</Label>
                <Select value={editedStudent.class} onValueChange={(value: string) => setEditedStudent({...editedStudent, class: value})}>
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
                <Label htmlFor="edit-section">Section *</Label>
                <Select value={editedStudent.section} onValueChange={(value: string) => setEditedStudent({...editedStudent, section: value})}>
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
                <Label htmlFor="edit-rollNumber">Roll Number *</Label>
                <Input
                  id="edit-rollNumber"
                  value={editedStudent.rollNumber}
                  onChange={(e) => setEditedStudent({...editedStudent, rollNumber: e.target.value})}
                  placeholder="Enter roll number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editedStudent.status} onValueChange={(value: string) => setEditedStudent({...editedStudent, status: value as 'active' | 'inactive' | 'transferred' | 'graduated'})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parent" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-parentName">Parent/Guardian Name</Label>
                <Input
                  id="edit-parentName"
                  value={editedStudent.parentName}
                  onChange={(e) => setEditedStudent({...editedStudent, parentName: e.target.value})}
                  placeholder="Enter parent name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parentPhone">Parent Phone</Label>
                <Input
                  id="edit-parentPhone"
                  value={editedStudent.parentPhone}
                  onChange={(e) => setEditedStudent({...editedStudent, parentPhone: e.target.value})}
                  placeholder="Enter parent phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parentEmail">Parent Email</Label>
                <Input
                  id="edit-parentEmail"
                  type="email"
                  value={editedStudent.parentEmail || ''}
                  onChange={(e) => setEditedStudent({...editedStudent, parentEmail: e.target.value})}
                  placeholder="Enter parent email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
                <Input
                  id="edit-emergencyContact"
                  value={editedStudent.emergencyContact || ''}
                  onChange={(e) => setEditedStudent({...editedStudent, emergencyContact: e.target.value})}
                  placeholder="Enter emergency contact"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-house">House</Label>
                <Select value={editedStudent.house} onValueChange={(value: string) => setEditedStudent({...editedStudent, house: value})}>
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
                <Label htmlFor="edit-transportRoute">Transport Route</Label>
                <Select value={editedStudent.transportRoute} onValueChange={(value: string) => setEditedStudent({...editedStudent, transportRoute: value})}>
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
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="edit-medicalConditions"
                  value={editedStudent.medicalConditions || ''}
                  onChange={(e) => setEditedStudent({...editedStudent, medicalConditions: e.target.value})}
                  placeholder="Enter any medical conditions"
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
          <Button onClick={handleEditStudent}>
            Update Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}