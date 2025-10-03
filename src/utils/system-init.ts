import { api } from './api';
import { toast } from 'sonner@2.0.3';

export interface SystemInitProgress {
  step: string;
  progress: number;
  total: number;
  isComplete: boolean;
}

export class SystemInitializer {
  private progressCallback?: (progress: SystemInitProgress) => void;

  constructor(progressCallback?: (progress: SystemInitProgress) => void) {
    this.progressCallback = progressCallback;
  }

  private updateProgress(step: string, progress: number, total: number = 100) {
    if (this.progressCallback) {
      this.progressCallback({
        step,
        progress,
        total,
        isComplete: progress >= total
      });
    }
  }

  async initializeSystem(): Promise<boolean> {
    try {
      this.updateProgress('Starting system initialization...', 0, 100);

      // Step 1: Initialize demo users (10%)
      this.updateProgress('Creating demo users...', 10);
      await this.initializeDemoUsers();

      // Step 2: Initialize academic structure (25%)
      this.updateProgress('Setting up academic structure...', 25);
      await this.initializeAcademicStructure();

      // Step 3: Initialize student data (40%)
      this.updateProgress('Creating student records...', 40);
      await this.initializeStudentData();

      // Step 4: Initialize staff data (55%)
      this.updateProgress('Creating staff records...', 55);
      await this.initializeStaffData();

      // Step 5: Initialize academic data (70%)
      this.updateProgress('Setting up classes and subjects...', 70);
      await this.initializeAcademicData();

      // Step 6: Initialize fee structure (85%)
      this.updateProgress('Creating fee structures...', 85);
      await this.initializeFeeData();

      // Step 7: Initialize library data (95%)
      this.updateProgress('Setting up library...', 95);
      await this.initializeLibraryData();

      // Step 8: Complete (100%)
      this.updateProgress('System initialization complete!', 100);
      
      return true;
    } catch (error) {
      console.error('System initialization failed:', error);
      toast.error('System initialization failed. Please try again.');
      return false;
    }
  }

  private async initializeDemoUsers() {
    const demoUsers = [
      { email: 'admin@demo.school', password: 'admin123', name: 'System Admin', role: 'admin' },
      { email: 'principal@demo.school', password: 'principal123', name: 'Dr. Sarah Johnson', role: 'principal' },
      { email: 'teacher1@demo.school', password: 'teacher123', name: 'Prof. Michael Davis', role: 'teacher' },
      { email: 'teacher2@demo.school', password: 'teacher123', name: 'Mrs. Emily Wilson', role: 'teacher' },
      { email: 'accountant@demo.school', password: 'account123', name: 'Mr. Robert Brown', role: 'accountant' },
      { email: 'librarian@demo.school', password: 'library123', name: 'Ms. Lisa Anderson', role: 'librarian' },
    ];

    for (const user of demoUsers) {
      try {
        await api.signup(user);
      } catch (error) {
        // User might already exist, continue
        console.log(`User ${user.email} might already exist`);
      }
    }
  }

  private async initializeAcademicStructure() {
    // Create academic years
    const academicYears = [
      { year: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', isActive: true },
      { year: '2023-2024', startDate: '2023-04-01', endDate: '2024-03-31', isActive: false },
    ];

    for (const year of academicYears) {
      try {
        await api.createAcademicYear(year);
      } catch (error) {
        console.log('Academic year might already exist');
      }
    }

    // Create departments
    const departments = [
      { name: 'Science', head: 'Dr. Smith', description: 'Mathematics, Physics, Chemistry, Biology' },
      { name: 'Languages', head: 'Prof. Johnson', description: 'English, Hindi, Regional Languages' },
      { name: 'Humanities', head: 'Mr. Davis', description: 'History, Geography, Civics' },
      { name: 'Arts', head: 'Ms. Wilson', description: 'Drawing, Music, Dance' },
      { name: 'Physical Education', head: 'Coach Brown', description: 'Sports and Physical Training' },
    ];

    for (const dept of departments) {
      try {
        await api.createDepartment(dept);
      } catch (error) {
        console.log('Department might already exist');
      }
    }

    // Create subjects
    const subjects = [
      { name: 'Mathematics', code: 'MATH', department: 'Science', isActive: true },
      { name: 'English', code: 'ENG', department: 'Languages', isActive: true },
      { name: 'Science', code: 'SCI', department: 'Science', isActive: true },
      { name: 'Social Studies', code: 'SS', department: 'Humanities', isActive: true },
      { name: 'Computer Science', code: 'CS', department: 'Science', isActive: true },
      { name: 'Hindi', code: 'HIN', department: 'Languages', isActive: true },
      { name: 'Physical Education', code: 'PE', department: 'Physical Education', isActive: true },
      { name: 'Art', code: 'ART', department: 'Arts', isActive: true },
    ];

    for (const subject of subjects) {
      try {
        await api.createSubject(subject);
      } catch (error) {
        console.log('Subject might already exist');
      }
    }
  }

  private async initializeStudentData() {
    const demoStudents = [
      {
        firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.sharma@student.demo',
        phone: '+91-9876543210', class: '10A', section: 'A', rollNumber: 'S001',
        dateOfBirth: '2008-05-15', address: '123 MG Road, Mumbai, Maharashtra',
        parentName: 'Rajesh Sharma', parentPhone: '+91-9876543211', status: 'active'
      },
      {
        firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@student.demo',
        phone: '+91-9876543212', class: '10A', section: 'A', rollNumber: 'S002',
        dateOfBirth: '2008-07-20', address: '456 Park Street, Delhi, Delhi',
        parentName: 'Amit Patel', parentPhone: '+91-9876543213', status: 'active'
      },
      {
        firstName: 'Arjun', lastName: 'Singh', email: 'arjun.singh@student.demo',
        phone: '+91-9876543214', class: '10B', section: 'B', rollNumber: 'S003',
        dateOfBirth: '2008-03-10', address: '789 Brigade Road, Bangalore, Karnataka',
        parentName: 'Vikram Singh', parentPhone: '+91-9876543215', status: 'active'
      },
      {
        firstName: 'Ananya', lastName: 'Reddy', email: 'ananya.reddy@student.demo',
        phone: '+91-9876543216', class: '9A', section: 'A', rollNumber: 'S004',
        dateOfBirth: '2009-08-25', address: '321 Anna Salai, Chennai, Tamil Nadu',
        parentName: 'Suresh Reddy', parentPhone: '+91-9876543217', status: 'active'
      },
      {
        firstName: 'Karan', lastName: 'Gupta', email: 'karan.gupta@student.demo',
        phone: '+91-9876543218', class: '9B', section: 'B', rollNumber: 'S005',
        dateOfBirth: '2009-12-05', address: '654 Salt Lake, Kolkata, West Bengal',
        parentName: 'Rohit Gupta', parentPhone: '+91-9876543219', status: 'active'
      },
    ];

    for (const student of demoStudents) {
      try {
        await api.createStudent(student);
      } catch (error) {
        console.log('Student might already exist');
      }
    }
  }

  private async initializeStaffData() {
    const demoStaff = [
      {
        firstName: 'Dr. Sarah', lastName: 'Johnson', email: 'sarah.johnson@staff.demo',
        phone: '+91-9876543220', employeeId: 'T001', designation: 'Principal',
        department: 'Administration', subject: 'Administration', dateOfJoining: '2020-01-01',
        qualification: 'Ph.D. in Education', experience: '15 years', status: 'active'
      },
      {
        firstName: 'Prof. Michael', lastName: 'Davis', email: 'michael.davis@staff.demo',
        phone: '+91-9876543221', employeeId: 'T002', designation: 'Senior Teacher',
        department: 'Science', subject: 'Mathematics', dateOfJoining: '2021-06-15',
        qualification: 'M.Sc. Mathematics', experience: '10 years', status: 'active'
      },
      {
        firstName: 'Mrs. Emily', lastName: 'Wilson', email: 'emily.wilson@staff.demo',
        phone: '+91-9876543222', employeeId: 'T003', designation: 'Teacher',
        department: 'Languages', subject: 'English', dateOfJoining: '2022-04-01',
        qualification: 'M.A. English', experience: '8 years', status: 'active'
      },
      {
        firstName: 'Mr. Robert', lastName: 'Brown', email: 'robert.brown@staff.demo',
        phone: '+91-9876543223', employeeId: 'A001', designation: 'Accountant',
        department: 'Administration', subject: 'Accounts', dateOfJoining: '2021-08-15',
        qualification: 'M.Com, CA', experience: '12 years', status: 'active'
      },
    ];

    for (const staff of demoStaff) {
      try {
        await api.createStaff(staff);
      } catch (error) {
        console.log('Staff might already exist');
      }
    }
  }

  private async initializeAcademicData() {
    const demoClasses = [
      {
        name: 'Class 10A', grade: '10', section: 'A', capacity: 40,
        classTeacher: 'Prof. Michael Davis', room: 'Room 101',
        subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi']
      },
      {
        name: 'Class 10B', grade: '10', section: 'B', capacity: 38,
        classTeacher: 'Mrs. Emily Wilson', room: 'Room 102',
        subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi']
      },
      {
        name: 'Class 9A', grade: '9', section: 'A', capacity: 42,
        classTeacher: 'Dr. Sarah Johnson', room: 'Room 201',
        subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi']
      },
      {
        name: 'Class 9B', grade: '9', section: 'B', capacity: 40,
        classTeacher: 'Mr. Robert Brown', room: 'Room 202',
        subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi']
      },
    ];

    for (const classData of demoClasses) {
      try {
        await api.createClass(classData);
      } catch (error) {
        console.log('Class might already exist');
      }
    }
  }

  private async initializeFeeData() {
    const feeStructures = [
      {
        name: 'Grade 10 Annual Fees',
        class: '10',
        academicYear: '2024-2025',
        tuitionFee: 50000,
        developmentFee: 10000,
        examFee: 5000,
        libraryFee: 2000,
        sportsFee: 3000,
        total: 70000,
        installments: 4,
        dueDate: '2024-04-30'
      },
      {
        name: 'Grade 9 Annual Fees',
        class: '9',
        academicYear: '2024-2025',
        tuitionFee: 45000,
        developmentFee: 10000,
        examFee: 5000,
        libraryFee: 2000,
        sportsFee: 3000,
        total: 65000,
        installments: 4,
        dueDate: '2024-04-30'
      },
    ];

    for (const feeStructure of feeStructures) {
      try {
        await api.createFeeStructure(feeStructure);
      } catch (error) {
        console.log('Fee structure might already exist');
      }
    }
  }

  private async initializeLibraryData() {
    const demoBooks = [
      {
        title: 'NCERT Mathematics Class 10',
        author: 'NCERT',
        isbn: '9788174506481',
        category: 'Mathematics',
        publisher: 'NCERT',
        edition: '2024',
        totalCopies: 50,
        availableCopies: 45,
        location: 'Section A1'
      },
      {
        title: 'NCERT Science Class 10',
        author: 'NCERT',
        isbn: '9788174506498',
        category: 'Science',
        publisher: 'NCERT',
        edition: '2024',
        totalCopies: 50,
        availableCopies: 42,
        location: 'Section A2'
      },
      {
        title: 'English Literature Anthology',
        author: 'Various Authors',
        isbn: '9788174506504',
        category: 'English',
        publisher: 'Oxford Publications',
        edition: '2023',
        totalCopies: 30,
        availableCopies: 28,
        location: 'Section B1'
      },
      {
        title: 'Indian History and Culture',
        author: 'Dr. R.C. Majumdar',
        isbn: '9788174506511',
        category: 'History',
        publisher: 'Bharatiya Vidya Bhavan',
        edition: '2023',
        totalCopies: 25,
        availableCopies: 23,
        location: 'Section C1'
      },
    ];

    for (const book of demoBooks) {
      try {
        await api.createBook(book);
      } catch (error) {
        console.log('Book might already exist');
      }
    }
  }

  async checkSystemStatus(): Promise<{
    hasData: boolean;
    studentCount: number;
    staffCount: number;
    classCount: number;
  }> {
    try {
      const stats = await api.getDashboardStats();
      return {
        hasData: stats.totalStudents > 0 || stats.totalClasses > 0,
        studentCount: stats.totalStudents,
        staffCount: 0, // Add staff count to API if needed
        classCount: stats.totalClasses
      };
    } catch (error) {
      return {
        hasData: false,
        studentCount: 0,
        staffCount: 0,
        classCount: 0
      };
    }
  }
}