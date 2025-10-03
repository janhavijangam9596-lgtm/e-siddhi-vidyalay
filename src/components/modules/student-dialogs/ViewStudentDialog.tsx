import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Award, Trophy, Shield, FileText, Camera, Phone, Mail } from 'lucide-react';

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

interface AcademicRecord {
  id: string;
  subject: string;
  term: string;
  marks: number;
  maxMarks: number;
  grade: string;
  percentage: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  subject?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  date: string;
}

interface DisciplinaryRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  actionTaken: string;
  status: string;
}

interface ViewStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  academicRecords: AcademicRecord[];
  attendanceRecords: AttendanceRecord[];
  achievements: Achievement[];
  disciplinaryRecords: DisciplinaryRecord[];
  onEdit: () => void;
}

export function ViewStudentDialog({
  open,
  onOpenChange,
  student,
  academicRecords,
  attendanceRecords,
  achievements,
  disciplinaryRecords,
  onEdit
}: ViewStudentDialogProps) {
  if (!student) return null;

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAttendancePercentage = () => {
    if (attendanceRecords.length === 0) return 0;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    return Math.round((presentDays / attendanceRecords.length) * 100);
  };

  const getAverageGrade = () => {
    if (academicRecords.length === 0) return 'N/A';
    const totalMarks = academicRecords.reduce((sum, r) => sum + r.percentage, 0);
    return Math.round(totalMarks / academicRecords.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              {student.firstName && student.lastName && (
                <span className="text-lg font-medium">
                  {student.firstName[0]}{student.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <div>{student.firstName} {student.lastName}</div>
              <div className="text-sm text-gray-500">
                {student.studentId} • {student.class}-{student.section}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Full Name</label>
                      <p className="font-medium">{student.firstName} {student.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Gender</label>
                      <p className="capitalize">{student.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Date of Birth</label>
                      <p>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Age</label>
                      <p>{calculateAge(student.dateOfBirth)} years</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Blood Group</label>
                      <p>{student.bloodGroup || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <p>{student.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  {student.address && (
                    <div>
                      <label className="text-sm text-gray-600">Address</label>
                      <p>{student.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parent/Guardian Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Parent/Guardian Name</label>
                    <p className="font-medium">{student.parentName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Parent Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p>{student.parentPhone}</p>
                    </div>
                  </div>
                  {student.parentEmail && (
                    <div>
                      <label className="text-sm text-gray-600">Parent Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p>{student.parentEmail}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Student ID</label>
                      <p className="font-medium">{student.studentId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Roll Number</label>
                      <p className="font-medium">{student.rollNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Class & Section</label>
                      <p>{student.class} - {student.section}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {student.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Average Grade</label>
                      <p className="text-2xl font-bold text-blue-600">{getAverageGrade()}%</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Attendance</label>
                      <p className="text-2xl font-bold text-green-600">{getAttendancePercentage()}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Academic Performance</span>
                        <span>{getAverageGrade()}%</span>
                      </div>
                      <Progress value={parseInt(getAverageGrade().toString())} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Attendance Rate</span>
                        <span>{getAttendancePercentage()}%</span>
                      </div>
                      <Progress value={getAttendancePercentage()} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {academicRecords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Academic Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicRecords.slice(0, 5).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.subject}</TableCell>
                          <TableCell>{record.term}</TableCell>
                          <TableCell>{record.marks}/{record.maxMarks}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.grade}</Badge>
                          </TableCell>
                          <TableCell>{record.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceRecords.filter(r => r.status === 'present').length}
                    </p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {attendanceRecords.filter(r => r.status === 'absent').length}
                    </p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {attendanceRecords.filter(r => r.status === 'late').length}
                    </p>
                    <p className="text-sm text-gray-600">Late</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{getAttendancePercentage()}%</p>
                    <p className="text-sm text-gray-600">Overall</p>
                  </div>
                </div>

                {attendanceRecords.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Subject</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.slice(0, 10).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.subject || 'General'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Student Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {achievement.category}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {achievement.level}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(achievement.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Award className="h-8 w-8 text-yellow-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>No achievements recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disciplinary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Disciplinary Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {disciplinaryRecords.length > 0 ? (
                  <div className="space-y-4">
                    {disciplinaryRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                className={
                                  record.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                  record.type === 'suspension' ? 'bg-red-100 text-red-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {record.type}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                              <Badge variant={record.status === 'resolved' ? 'default' : 'destructive'}>
                                {record.status}
                              </Badge>
                            </div>
                            <p className="font-medium mb-1">{record.description}</p>
                            <p className="text-sm text-gray-600">Action: {record.actionTaken}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>No disciplinary records</p>
                    <p className="text-sm">Student has a clean record</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Student Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">Profile Photo</span>
                    </div>
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                      <Camera className="h-8 w-8" />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">Transfer Certificate</span>
                    </div>
                    <p className="text-sm text-gray-500">Not uploaded</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Upload Document
                    </Button>
                    <Button variant="outline" size="sm">
                      Generate Report Card
                    </Button>
                    <Button variant="outline" size="sm">
                      Export Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onEdit}>
            Edit Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}