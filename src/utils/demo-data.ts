import { api } from './api';

export const initializeDemoData = async () => {
  try {
    // Initialize demo data via API
    await api.initializeDemoData();
    return { success: true, message: 'Demo data initialized successfully' };
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
    return { success: false, message: 'Failed to initialize demo data' };
  }
};

export const getDemoUsers = () => [
  { email: 'admin@demo.school', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'teacher@demo.school', password: 'teacher123', name: 'Teacher Demo', role: 'teacher' },
  { email: 'student@demo.school', password: 'student123', name: 'Student Demo', role: 'student' },
];

export const getDemoClasses = () => [
  { id: '1', name: 'Class 10A', grade: '10', section: 'A', capacity: 40, classTeacher: 'Mrs. Johnson', room: 'Room 101' },
  { id: '2', name: 'Class 9B', grade: '9', section: 'B', capacity: 38, classTeacher: 'Mr. Anderson', room: 'Room 205' },
  { id: '3', name: 'Class 8C', grade: '8', section: 'C', capacity: 35, classTeacher: 'Ms. Davis', room: 'Room 302' },
];

export const getDemoStudents = () => [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@student.demo',
    phone: '+91-9876543210',
    class: '10A',
    section: 'A',
    rollNumber: 'S001',
    dateOfBirth: '2008-05-15',
    address: '123 Student Lane, Demo City',
    parentName: 'Robert Doe',
    parentPhone: '+91-9876543211',
    status: 'active' as const,
    admissionDate: '2024-04-01',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@student.demo',
    phone: '+91-9876543212',
    class: '10A',
    section: 'A',
    rollNumber: 'S002',
    dateOfBirth: '2008-07-20',
    address: '456 Student Avenue, Demo City',
    parentName: 'Sarah Smith',
    parentPhone: '+91-9876543213',
    status: 'active' as const,
    admissionDate: '2024-04-01',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@student.demo',
    phone: '+91-9876543214',
    class: '9B',
    section: 'B',
    rollNumber: 'S003',
    dateOfBirth: '2009-03-10',
    address: '789 Student Road, Demo City',
    parentName: 'David Johnson',
    parentPhone: '+91-9876543215',
    status: 'active' as const,
    admissionDate: '2024-04-01',
  },
];