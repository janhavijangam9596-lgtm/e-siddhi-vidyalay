import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import crypto from 'crypto';

const app = express();
const port = process.env.PORT || 3002;

// Database connection
const pool = new Pool({
  connectionString: process.env.VITE_DATABASE_URL || 'postgresql://postgres:root@localhost:5432/e_siddhi_school',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Database connected successfully');
    release();
  }
});

// Helper function to generate UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Helper function to convert snake_case to camelCase
function snakeToCamel(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  const camelObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = snakeToCamel(obj[key]);
    }
  }
  return camelObj;
}

// Students API
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseRows = result.rows.map(row => snakeToCamel(row));
    res.json(camelCaseRows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Handle special endpoints that come through this route
    if (id === 'analytics') {
      return res.redirect('/api/students/analytics');
    }
    if (id === 'unassigned') {
      return res.redirect('/api/students/unassigned');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseStudent = snakeToCamel(result.rows[0]);
    res.json(camelCaseStudent);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const studentData = req.body;
    const id = generateUUID();

    const query = `
      INSERT INTO students (
        id, roll_number, first_name, last_name, email, phone, date_of_birth,
        gender, address, city, state, pincode, parent_name, parent_phone,
        parent_email, class_id, status, admission_date, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, NOW(), NOW()
      ) RETURNING *
    `;

    const values = [
      id,
      studentData.rollNumber || studentData.roll_number || '000',
      studentData.firstName || studentData.first_name || 'Unknown',
      studentData.lastName || studentData.last_name || 'Unknown',
      studentData.email || '',
      studentData.phone || '',
      studentData.dateOfBirth || studentData.date_of_birth || null,
      studentData.gender || 'other',
      studentData.address || '',
      studentData.city || '',
      studentData.state || '',
      studentData.pincode || '',
      studentData.parentName || studentData.parent_name || 'Unknown Parent',
      studentData.parentPhone || studentData.parent_phone || '0000000000',
      studentData.parentEmail || studentData.parent_email || '',
      null, // class_id - will be set later if needed
      studentData.status || 'active',
      studentData.admissionDate || studentData.admission_date || new Date().toISOString().split('T')[0]
    ];

    const result = await pool.query(query, values);
    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseStudent = snakeToCamel(result.rows[0]);
    res.json({
      success: true,
      message: 'Student created successfully',
      student: camelCaseStudent
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      // Convert camelCase to snake_case for database
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      fields.push(`${dbKey} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    });

    values.push(id); // Add ID at the end

    const query = `
      UPDATE students
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseStudent = snakeToCamel(result.rows[0]);
    res.json(camelCaseStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
});

// Classes API
app.get('/api/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update class statistics
app.put('/api/classes/stats', async (req, res) => {
  try {
    const statsData = req.body;
    // For now, we'll just acknowledge the update
    // In a real implementation, you might store this in a statistics table
    console.log('Updating class stats:', statsData);
    res.json({ success: true, message: 'Class statistics updated' });
  } catch (error) {
    console.error('Error updating class stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update student statistics
app.put('/api/students/stats', async (req, res) => {
  try {
    const statsData = req.body;
    console.log('Updating student stats:', statsData);
    res.json({ success: true, message: 'Student statistics updated' });
  } catch (error) {
    console.error('Error updating student stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update fee statistics
app.put('/api/fees/stats', async (req, res) => {
  try {
    const statsData = req.body;
    console.log('Updating fee stats:', statsData);
    res.json({ success: true, message: 'Fee statistics updated' });
  } catch (error) {
    console.error('Error updating fee stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update teacher statistics
app.put('/api/teachers/stats', async (req, res) => {
  try {
    const statsData = req.body;
    console.log('Updating teacher stats:', statsData);
    res.json({ success: true, message: 'Teacher statistics updated' });
  } catch (error) {
    console.error('Error updating teacher stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update library statistics
app.put('/api/library/stats', async (req, res) => {
  try {
    const statsData = req.body;
    console.log('Updating library stats:', statsData);
    res.json({ success: true, message: 'Library statistics updated' });
  } catch (error) {
    console.error('Error updating library stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subjects API
app.get('/api/subjects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Class Stats API
app.get('/api/class-stats', async (req, res) => {
  try {
    const stats = {
      totalClasses: 0,
      averageStrength: 0,
      teacherStudentRatio: 0,
      capacityUtilization: 0
    };

    try {
      const classResult = await pool.query('SELECT COUNT(*) as count FROM classes');
      stats.totalClasses = parseInt(classResult.rows[0].count);
    } catch (error) {
      console.warn('Classes table not available');
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching class stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unassigned Students API
app.get('/api/students/unassigned', async (req, res) => {
  try {
    // For now, return empty array since we don't have class assignments table
    res.json([]);
  } catch (error) {
    console.error('Error fetching unassigned students:', error);
    res.status(500).json({ error: error.message });
  }
});

// Timetable API
app.get('/api/timetable', async (req, res) => {
  try {
    // Return mock timetable data for now
    const mockTimetable = [];
    res.json(mockTimetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: error.message });
  }
});

// Timetable Templates API
app.get('/api/timetable-templates', async (req, res) => {
  try {
    // Return mock templates
    const mockTemplates = [
      {
        id: '1',
        name: 'Standard Template',
        periodsPerDay: 8,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    ];
    res.json(mockTemplates);
  } catch (error) {
    console.error('Error fetching timetable templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Teacher Schedules API
app.get('/api/teacher-schedules', async (req, res) => {
  try {
    // Return mock teacher schedules
    const mockSchedules = [];
    res.json(mockSchedules);
  } catch (error) {
    console.error('Error fetching teacher schedules:', error);
    res.status(500).json({ error: error.message });
  }
});

// Timetable Conflicts API
app.get('/api/timetable-conflicts', async (req, res) => {
  try {
    // Return mock conflicts
    const mockConflicts = [];
    res.json(mockConflicts);
  } catch (error) {
    console.error('Error fetching timetable conflicts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Timetable Stats API
app.get('/api/timetable-stats', async (req, res) => {
  try {
    const stats = {
      totalEntries: 0,
      conflicts: 0,
      utilizationRate: 0
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching timetable stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Analytics
app.get('/api/students/analytics', async (req, res) => {
  try {
    // Get basic student count
    let totalStudents = 0;
    try {
      const studentResult = await pool.query('SELECT COUNT(*) as count FROM students');
      totalStudents = parseInt(studentResult.rows[0].count);
    } catch (error) {
      console.warn('Students table not available for analytics');
    }

    // Get class distribution (simplified)
    const classDistribution = {};
    try {
      const classDist = await pool.query(`
        SELECT grade as class, COUNT(*) as count
        FROM students
        WHERE grade IS NOT NULL
        GROUP BY grade
        ORDER BY grade
      `);
      classDist.rows.forEach(row => {
        classDistribution[row.class] = parseInt(row.count);
      });
    } catch (error) {
      console.warn('Class distribution query failed');
      // Provide default class distribution
      classDistribution['10'] = totalStudents || 1;
    }

    // Mock data for other analytics
    const analytics = {
      totalStudents,
      newAdmissions: Math.floor(totalStudents * 0.3), // 30% new admissions
      averageAttendance: 87,
      topPerformers: Math.floor(totalStudents * 0.15),
      classDistribution,
      subjectPerformance: {
        'Mathematics': 85,
        'Science': 82,
        'English': 88,
        'Social Studies': 79,
        'Hindi': 83,
        'Physics': 80,
        'Chemistry': 78,
        'Biology': 84
      },
      trends: [
        { month: 'Jan', students: Math.max(1, totalStudents - 50), attendance: 85 },
        { month: 'Feb', students: Math.max(1, totalStudents - 30), attendance: 87 },
        { month: 'Mar', students: totalStudents, attendance: 89 },
        { month: 'Apr', students: totalStudents + 15, attendance: 88 }
      ],
      demographics: {
        genderDistribution: {
          male: Math.ceil(totalStudents * 0.52),
          female: Math.floor(totalStudents * 0.48)
        },
        ageGroups: {
          '5-8': Math.floor(totalStudents * 0.25),
          '9-12': Math.floor(totalStudents * 0.35),
          '13-16': Math.floor(totalStudents * 0.30),
          '17-18': Math.floor(totalStudents * 0.10)
        }
      },
      performance: {
        excellent: Math.floor(totalStudents * 0.20),
        good: Math.floor(totalStudents * 0.35),
        average: Math.floor(totalStudents * 0.30),
        needsImprovement: Math.floor(totalStudents * 0.15)
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Get basic stats from database with error handling for missing tables
    let studentCount = 0;
    let classCount = 0;
    let teacherCount = 0;
    let feeTotal = 0;

    try {
      const studentResult = await pool.query('SELECT COUNT(*) as count FROM students');
      studentCount = parseInt(studentResult.rows[0].count);
    } catch (error) {
      console.warn('Students table not available, using 0');
    }

    try {
      const classResult = await pool.query('SELECT COUNT(*) as count FROM classes');
      classCount = parseInt(classResult.rows[0].count);
    } catch (error) {
      console.warn('Classes table not available, using 0');
    }

    try {
      const teacherResult = await pool.query('SELECT COUNT(*) as count FROM staff');
      teacherCount = parseInt(teacherResult.rows[0].count);
    } catch (error) {
      console.warn('Staff table not available, using 0');
    }

    try {
      const feeResult = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM fee_payments');
      feeTotal = parseFloat(feeResult.rows[0].total);
    } catch (error) {
      console.warn('Fee payments table not available, using 0');
    }

    const stats = {
      totalStudents: studentCount,
      totalClasses: classCount,
      totalTeachers: teacherCount,
      totalFees: feeTotal,
      pendingAdmissions: 0, // This would need a proper admissions table
      activeTeachers: teacherCount,
      totalBooks: 0, // This would need a library table
      attendanceRate: 87, // Mock data
      feesCollectionRate: 85, // Mock data
      monthlyRevenue: 25000, // Mock data
      totalExpenses: 18000, // Mock data
      newAdmissions: 25, // Mock data
      graduatedStudents: 15 // Mock data
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff API
app.get('/api/staff', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff ORDER BY created_at DESC');
    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseRows = result.rows.map(row => snakeToCamel(row));
    res.json(camelCaseRows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid staff ID format' });
    }

    const result = await pool.query('SELECT * FROM staff WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseStaff = snakeToCamel(result.rows[0]);
    res.json(camelCaseStaff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const staffData = req.body;
    const id = generateUUID();

    const query = `
      INSERT INTO staff (
        id, employee_id, first_name, last_name, email, phone, alternate_phone,
        date_of_birth, gender, address, city, state, pincode, emergency_contact,
        emergency_phone, joining_date, department, designation, employment_type,
        salary, qualification, experience, subjects_taught, classes_assigned,
        blood_group, marital_status, reporting_manager, bank_account_number,
        ifsc_code, pan_number, aadhar_number, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, NOW(), NOW()
      ) RETURNING *
    `;

    const values = [
      id,
      staffData.employeeId || staffData.employee_id || `EMP${Date.now()}`,
      staffData.firstName || staffData.first_name,
      staffData.lastName || staffData.last_name,
      staffData.email,
      staffData.phone,
      staffData.alternatePhone || staffData.alternate_phone || '',
      staffData.dateOfBirth || staffData.date_of_birth,
      staffData.gender,
      staffData.address,
      staffData.city || '',
      staffData.state || '',
      staffData.pincode || '',
      staffData.emergencyContact || staffData.emergency_contact,
      staffData.emergencyPhone || staffData.emergency_phone,
      staffData.joiningDate || staffData.joining_date,
      staffData.department,
      staffData.designation,
      staffData.employmentType || staffData.employment_type || 'full_time',
      staffData.salary,
      staffData.qualification || '',
      staffData.experience || 0,
      JSON.stringify(staffData.subjectsTaught || staffData.subjects_taught || []),
      JSON.stringify(staffData.classesAssigned || staffData.classes_assigned || []),
      staffData.bloodGroup || staffData.blood_group || '',
      staffData.maritalStatus || staffData.marital_status || 'single',
      staffData.reportingManager || staffData.reporting_manager || null,
      staffData.bankAccountNumber || staffData.bank_account_number || '',
      staffData.ifscCode || staffData.ifsc_code || '',
      staffData.panNumber || staffData.pan_number || '',
      staffData.aadharNumber || staffData.aadhar_number || '',
      staffData.status || 'active'
    ];

    const result = await pool.query(query, values);
    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseStaff = snakeToCamel(result.rows[0]);
    res.json(camelCaseStaff);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      // Convert camelCase to snake_case for database
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      fields.push(`${dbKey} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    });

    values.push(id); // Add ID at the end

    const query = `
      UPDATE staff
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseStaff = snakeToCamel(result.rows[0]);
    res.json(camelCaseStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM staff WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff Attendance API
app.get('/api/staff/attendance', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff_attendance ORDER BY date DESC');
    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseRows = result.rows.map(row => snakeToCamel(row));
    res.json(camelCaseRows);
  } catch (error) {
    console.error('Error fetching staff attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff Leaves API
app.get('/api/staff/leaves', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff_leaves ORDER BY applied_date DESC');
    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseRows = result.rows.map(row => snakeToCamel(row));
    res.json(camelCaseRows);
  } catch (error) {
    console.error('Error fetching staff leaves:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff Payroll API
app.get('/api/staff/payroll', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff_payroll ORDER BY created_at DESC');
    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseRows = result.rows.map(row => snakeToCamel(row));
    res.json(camelCaseRows);
  } catch (error) {
    console.error('Error fetching staff payroll:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff Stats API
app.get('/api/staff/stats', async (req, res) => {
  try {
    // Get basic staff stats from database with error handling for missing tables
    let totalStaff = 0;
    let activeStaff = 0;
    let teachingStaff = 0;
    let nonTeachingStaff = 0;
    let onLeave = 0;
    let newJoinees = 0;
    let averageSalary = 0;
    let totalPayroll = 0;

    try {
      const staffResult = await pool.query('SELECT COUNT(*) as count FROM staff');
      totalStaff = parseInt(staffResult.rows[0].count);
    } catch (error) {
      console.warn('Staff table not available, using 0');
    }

    try {
      const activeResult = await pool.query('SELECT COUNT(*) as count FROM staff WHERE status = $1', ['active']);
      activeStaff = parseInt(activeResult.rows[0].count);
    } catch (error) {
      console.warn('Active staff query failed');
    }

    try {
      const teachingResult = await pool.query('SELECT COUNT(*) as count FROM staff WHERE department = $1', ['academic']);
      teachingStaff = parseInt(teachingResult.rows[0].count);
    } catch (error) {
      console.warn('Teaching staff query failed');
    }

    try {
      const nonTeachingResult = await pool.query('SELECT COUNT(*) as count FROM staff WHERE department != $1', ['academic']);
      nonTeachingStaff = parseInt(nonTeachingResult.rows[0].count);
    } catch (error) {
      console.warn('Non-teaching staff query failed');
    }

    try {
      const leaveResult = await pool.query('SELECT COUNT(*) as count FROM staff WHERE status = $1', ['on_leave']);
      onLeave = parseInt(leaveResult.rows[0].count);
    } catch (error) {
      console.warn('On leave staff query failed');
    }

    try {
      const salaryResult = await pool.query('SELECT AVG(salary) as average FROM staff');
      averageSalary = parseFloat(salaryResult.rows[0].average) || 0;
    } catch (error) {
      console.warn('Average salary query failed');
    }

    const stats = {
      totalStaff,
      activeStaff,
      teachingStaff,
      nonTeachingStaff,
      onLeave,
      newJoinees: Math.floor(totalStaff * 0.1), // Mock data
      averageSalary,
      totalPayroll: averageSalary * totalStaff // Mock calculation
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update staff statistics
app.put('/api/staff/stats', async (req, res) => {
  try {
    const statsData = req.body;
    console.log('Updating staff stats:', statsData);
    res.json({ success: true, message: 'Staff statistics updated' });
  } catch (error) {
    console.error('Error updating staff stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply Leave API
app.post('/api/staff/leaves', async (req, res) => {
  try {
    const leaveData = req.body;
    const id = generateUUID();

    const query = `
      INSERT INTO staff_leaves (
        id, staff_id, leave_type, start_date, end_date, total_days,
        reason, status, applied_date, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
      ) RETURNING *
    `;

    const values = [
      id,
      leaveData.staffId || leaveData.staff_id,
      leaveData.leaveType || leaveData.leave_type,
      leaveData.startDate || leaveData.start_date,
      leaveData.endDate || leaveData.end_date,
      leaveData.totalDays || leaveData.total_days,
      leaveData.reason,
      leaveData.status || 'pending',
      leaveData.appliedDate || leaveData.applied_date || new Date().toISOString()
    ];

    const result = await pool.query(query, values);
    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseLeave = snakeToCamel(result.rows[0]);
    res.json(camelCaseLeave);
  } catch (error) {
    console.error('Error applying leave:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Leave Status API
app.put('/api/staff/leaves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedDate, remarks } = req.body;

    const query = `
      UPDATE staff_leaves
      SET status = $1, approved_date = $2, remarks = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [status, approvedDate, remarks, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave application not found' });
    }

    // Convert snake_case to camelCase for frontend compatibility
    const camelCaseLeave = snakeToCamel(result.rows[0]);
    res.json(camelCaseLeave);
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Payroll API
app.post('/api/staff/payroll/generate', async (req, res) => {
  try {
    const { month, year } = req.body;

    // This is a simplified payroll generation
    // In a real implementation, you would calculate based on attendance, leaves, etc.
    const staffResult = await pool.query('SELECT * FROM staff WHERE status = $1', ['active']);

    const payrollRecords = [];

    for (const staff of staffResult.rows) {
      const id = generateUUID();
      const basicSalary = staff.salary;
      const allowances = basicSalary * 0.2; // 20% allowances
      const deductions = basicSalary * 0.05; // 5% deductions
      const overtime = 0; // Simplified
      const grossSalary = basicSalary + allowances;
      const netSalary = grossSalary - deductions;

      const payrollQuery = `
        INSERT INTO staff_payroll (
          id, staff_id, month, year, basic_salary, allowances, deductions,
          overtime, gross_salary, net_salary, status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
        ) RETURNING *
      `;

      const payrollValues = [
        id, staff.id, month, year, basicSalary, allowances, deductions,
        overtime, grossSalary, netSalary, 'draft'
      ];

      const payrollResult = await pool.query(payrollQuery, payrollValues);
      payrollRecords.push(snakeToCamel(payrollResult.rows[0]));
    }

    res.json({
      success: true,
      message: `Payroll generated for ${payrollRecords.length} staff members`,
      records: payrollRecords
    });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM students');
    res.json({
      message: 'API server is running',
      database: 'connected',
      studentCount: parseInt(result.rows[0].count),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Local API server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Test endpoint: http://localhost:${port}/api/test`);
});

export default app;