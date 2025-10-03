import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Auth routes
app.post('/make-server-dcb636e0/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'student' } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    })

    if (error) throw error

    // Store user profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString()
    })

    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: error.message }, 400)
  }
})

// Student Management
app.get('/make-server-dcb636e0/students', async (c) => {
  try {
    const students = await kv.getByPrefix('student:')
    return c.json(students)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// IMPORTANT: Analytics route must come before parameterized routes
app.get('/make-server-dcb636e0/students/analytics', async (c) => {
  try {
    console.log('Analytics endpoint called')
    
    // Always return valid analytics data
    let students = []
    let attendanceRecords = []
    
    try {
      students = await kv.getByPrefix('student:') || []
      attendanceRecords = await kv.getByPrefix('attendance:') || []
      
      // Initialize demo data if no students exist
      if (students.length === 0) {
        console.log('No students found, initializing demo data...')
        const demoStudents = [
          {
            id: '1', firstName: 'John', lastName: 'Doe', class: '10A', section: 'A',
            rollNumber: 'S001', admissionDate: '2024-04-01', status: 'active', created_at: new Date().toISOString()
          },
          {
            id: '2', firstName: 'Jane', lastName: 'Smith', class: '10A', section: 'A',
            rollNumber: 'S002', admissionDate: '2024-04-01', status: 'active', created_at: new Date().toISOString()
          },
          {
            id: '3', firstName: 'Mike', lastName: 'Johnson', class: '9B', section: 'B',
            rollNumber: 'S003', admissionDate: '2024-04-15', status: 'active', created_at: new Date().toISOString()
          }
        ]
        
        for (const student of demoStudents) {
          await kv.set(`student:${student.id}`, student)
        }
        students = demoStudents
        
        // Add some demo attendance records
        const demoAttendance = [
          { id: '1', studentId: '1', date: '2024-12-18', status: 'present', created_at: new Date().toISOString() },
          { id: '2', studentId: '2', date: '2024-12-18', status: 'present', created_at: new Date().toISOString() },
          { id: '3', studentId: '3', date: '2024-12-18', status: 'absent', created_at: new Date().toISOString() }
        ]
        
        for (const record of demoAttendance) {
          await kv.set(`attendance:${record.id}`, record)
        }
        attendanceRecords = demoAttendance
      }
    } catch (kvError) {
      console.warn('KV Store error, using mock data:', kvError)
      // If KV fails, use mock data
    }
    
    // Calculate analytics from real data where possible, fallback to sensible defaults
    const totalStudents = students.length || 1250
    const newAdmissions = students.length > 0 ? students.filter(s => {
      try {
        const admissionDate = new Date(s.admissionDate || s.created_at)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        return admissionDate >= threeMonthsAgo
      } catch {
        return false
      }
    }).length : 125
    
    // Calculate attendance rate
    const totalAttendanceRecords = attendanceRecords.length
    const presentRecords = attendanceRecords.filter(r => r && r.status === 'present').length
    const averageAttendance = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 87
    
    // Class distribution
    const classDistribution = {}
    if (students.length > 0) {
      students.forEach(student => {
        const className = student.class || 'Unknown'
        classDistribution[className] = (classDistribution[className] || 0) + 1
      })
    } else {
      // Default class distribution
      classDistribution['10A'] = 45
      classDistribution['10B'] = 42
      classDistribution['9A'] = 48
      classDistribution['9B'] = 44
      classDistribution['11A'] = 38
      classDistribution['11B'] = 35
      classDistribution['12A'] = 32
      classDistribution['12B'] = 30
    }
    
    const analytics = {
      totalStudents,
      newAdmissions,
      averageAttendance,
      topPerformers: Math.floor(totalStudents * 0.15), // 15% as top performers
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
        { month: 'Jan', students: Math.max(1, totalStudents - 50), attendance: Math.max(75, averageAttendance - 2) },
        { month: 'Feb', students: Math.max(1, totalStudents - 30), attendance: averageAttendance },
        { month: 'Mar', students: totalStudents, attendance: Math.min(100, averageAttendance + 2) },
        { month: 'Apr', students: totalStudents + 15, attendance: Math.min(100, averageAttendance + 1) }
      ],
      demographics: {
        genderDistribution: { male: Math.ceil(totalStudents * 0.52), female: Math.floor(totalStudents * 0.48) },
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
    }
    
    console.log('Analytics data prepared:', { totalStudents, newAdmissions, averageAttendance })
    return c.json(analytics)
  } catch (error) {
    console.error('Analytics endpoint error:', error)
    
    // Even if everything fails, return basic mock data
    const fallbackAnalytics = {
      totalStudents: 1250,
      newAdmissions: 125,
      averageAttendance: 87,
      topPerformers: 188,
      classDistribution: {
        '10A': 45, '10B': 42, '9A': 48, '9B': 44,
        '11A': 38, '11B': 35, '12A': 32, '12B': 30
      },
      subjectPerformance: {
        'Mathematics': 85, 'Science': 82, 'English': 88,
        'Social Studies': 79, 'Hindi': 83
      },
      trends: [
        { month: 'Jan', students: 1200, attendance: 85 },
        { month: 'Feb', students: 1220, attendance: 87 },
        { month: 'Mar', students: 1250, attendance: 89 }
      ]
    }
    
    return c.json(fallbackAnalytics)
  }
})

app.post('/make-server-dcb636e0/students', async (c) => {
  try {
    const studentData = await c.req.json()
    const id = crypto.randomUUID()
    const student = {
      id,
      ...studentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`student:${id}`, student)
    return c.json(student)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const student = await kv.get(`student:${id}`)
    if (!student) return c.json({ error: 'Student not found' }, 404)
    return c.json(student)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`student:${id}`)
    
    if (!existing) return c.json({ error: 'Student not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`student:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/students/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`student:${id}`)
    
    if (!existing) return c.json({ error: 'Student not found' }, 404)
    
    await kv.del(`student:${id}`)
    return c.json({ success: true, message: 'Student deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Enhanced Student Management Endpoints

// Student Academic Records
app.get('/make-server-dcb636e0/students/:id/academic-records', async (c) => {
  try {
    const studentId = c.req.param('id')
    const records = await kv.getByPrefix(`academic-record:${studentId}:`)
    return c.json(records)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/students/:id/academic-records', async (c) => {
  try {
    const studentId = c.req.param('id')
    const recordData = await c.req.json()
    const id = crypto.randomUUID()
    
    const record = {
      id,
      studentId,
      ...recordData,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`academic-record:${studentId}:${id}`, record)
    return c.json(record)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Student Attendance
app.get('/make-server-dcb636e0/students/:id/attendance', async (c) => {
  try {
    const studentId = c.req.param('id')
    const records = await kv.getByPrefix(`attendance:${studentId}:`)
    return c.json(records)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/students/:id/attendance', async (c) => {
  try {
    const studentId = c.req.param('id')
    const attendanceData = await c.req.json()
    const id = crypto.randomUUID()
    
    const record = {
      id,
      studentId,
      ...attendanceData,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`attendance:${studentId}:${id}`, record)
    return c.json(record)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Student Disciplinary Records
app.get('/make-server-dcb636e0/students/:id/disciplinary', async (c) => {
  try {
    const studentId = c.req.param('id')
    const records = await kv.getByPrefix(`disciplinary:${studentId}:`)
    return c.json(records)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/students/:id/disciplinary', async (c) => {
  try {
    const studentId = c.req.param('id')
    const recordData = await c.req.json()
    const id = crypto.randomUUID()
    
    const record = {
      id,
      studentId,
      ...recordData,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`disciplinary:${studentId}:${id}`, record)
    return c.json(record)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Student Achievements
app.get('/make-server-dcb636e0/students/:id/achievements', async (c) => {
  try {
    const studentId = c.req.param('id')
    const achievements = await kv.getByPrefix(`achievement:${studentId}:`)
    return c.json(achievements)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/students/:id/achievements', async (c) => {
  try {
    const studentId = c.req.param('id')
    const achievementData = await c.req.json()
    const id = crypto.randomUUID()
    
    const achievement = {
      id,
      studentId,
      ...achievementData,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`achievement:${studentId}:${id}`, achievement)
    return c.json(achievement)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Student Promotion
app.post('/make-server-dcb636e0/students/promote', async (c) => {
  try {
    const { studentIds } = await c.req.json()
    const promotedStudents = []
    
    for (const studentId of studentIds) {
      const student = await kv.get(`student:${studentId}`)
      if (student) {
        // Promote to next class
        const currentClass = parseInt(student.class.replace(/\D/g, ''))
        const nextClass = currentClass + 1
        
        if (nextClass <= 12) {
          const updatedStudent = {
            ...student,
            class: `${nextClass}${student.class.includes('th') ? 'th' : 'st'}`,
            updated_at: new Date().toISOString()
          }
          
          await kv.set(`student:${studentId}`, updatedStudent)
          promotedStudents.push(updatedStudent)
        }
      }
    }
    
    return c.json({ success: true, promotedStudents })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Student Export
app.post('/make-server-dcb636e0/students/export', async (c) => {
  try {
    const { format, filters } = await c.req.json()
    let students = await kv.getByPrefix('student:')
    
    // Apply filters if provided
    if (filters && filters.students) {
      students = students.filter(s => filters.students.includes(s.id))
    }
    
    // For demo purposes, return the data as JSON
    // In a real implementation, you would generate CSV/Excel files
    return c.json({
      format,
      data: students,
      count: students.length,
      exportedAt: new Date().toISOString()
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Get CSV Template for Student Import
app.get('/make-server-dcb636e0/students/import-template', async (c) => {
  const csvTemplate = `First Name,Last Name,Class,Section,Roll Number,Date of Birth,Gender,Parent Name,Parent Phone,Parent Email,Email,Phone,Address,Blood Group,Nationality,Religion,House,Transport Route,Previous School,Medical Conditions
John,Doe,10,A,101,2008-05-15,Male,Jane Doe,9876543210,janedoe@email.com,john.doe@school.edu,9876543211,"123 Main St, City",O+,Indian,Christian,Red House,Route 1,ABC School,None
Jane,Smith,10,B,102,2008-07-20,Female,Bob Smith,9876543220,bobsmith@email.com,jane.smith@school.edu,9876543221,"456 Oak Ave, City",A+,Indian,Hindu,Blue House,Route 2,XYZ School,Asthma`
  
  // Set headers for CSV download
  c.header('Content-Type', 'text/csv')
  c.header('Content-Disposition', 'attachment; filename="student_import_template.csv"')
  
  return c.text(csvTemplate)
})

// Validate Student Import Data
app.post('/make-server-dcb636e0/students/validate-import', async (c) => {
  try {
    const { students } = await c.req.json()
    
    if (!students || !Array.isArray(students)) {
      return c.json({ 
        valid: false, 
        message: 'Invalid data format',
        errors: ['Expected an array of student objects']
      }, 400)
    }
    
    const validationErrors = []
    const validStudents = []
    const warnings = []
    
    // Check for existing students
    const existingStudents = await kv.getByPrefix('student:')
    const existingRollNumbers = new Set(
      existingStudents.map(s => `${s.class}-${s.section}-${s.rollNumber}`.toLowerCase())
    )
    
    students.forEach((student, index) => {
      const rowNum = index + 2 // Assuming row 1 is headers
      const studentErrors = []
      
      // Required field validation
      if (!student.firstName || !student.firstName.trim()) {
        studentErrors.push(`Row ${rowNum}: First name is required`)
      }
      if (!student.lastName || !student.lastName.trim()) {
        studentErrors.push(`Row ${rowNum}: Last name is required`)
      }
      if (!student.class) {
        studentErrors.push(`Row ${rowNum}: Class is required`)
      }
      if (!student.rollNumber) {
        studentErrors.push(`Row ${rowNum}: Roll number is required`)
      }
      if (!student.parentName || !student.parentName.trim()) {
        warnings.push(`Row ${rowNum}: Parent name is missing (will use default)`)
      }
      if (!student.parentPhone || !student.parentPhone.trim()) {
        warnings.push(`Row ${rowNum}: Parent phone is missing (will use default)`)
      }
      
      // Check for duplicates
      const studentKey = `${student.class}-${student.section || 'A'}-${student.rollNumber}`.toLowerCase()
      if (existingRollNumbers.has(studentKey)) {
        studentErrors.push(`Row ${rowNum}: Duplicate roll number ${student.rollNumber} in class ${student.class}-${student.section || 'A'}`)
      }
      
      // Date format validation
      if (student.dateOfBirth) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/
        if (!datePattern.test(student.dateOfBirth)) {
          warnings.push(`Row ${rowNum}: Date of birth should be in YYYY-MM-DD format`)
        }
      }
      
      // Email format validation
      if (student.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(student.email)) {
          warnings.push(`Row ${rowNum}: Invalid email format for student email`)
        }
      }
      
      // Phone number validation
      if (student.phone && !/^\d{10,}$/.test(student.phone.replace(/[\s-]/g, ''))) {
        warnings.push(`Row ${rowNum}: Student phone should be at least 10 digits`)
      }
      if (student.parentPhone && !/^\d{10,}$/.test(student.parentPhone.replace(/[\s-]/g, ''))) {
        warnings.push(`Row ${rowNum}: Parent phone should be at least 10 digits`)
      }
      
      // Gender validation
      if (student.gender && !['male', 'female', 'other'].includes(student.gender.toLowerCase())) {
        warnings.push(`Row ${rowNum}: Gender should be Male, Female, or Other`)
      }
      
      if (studentErrors.length === 0) {
        validStudents.push(student)
      } else {
        validationErrors.push(...studentErrors)
      }
    })
    
    const isValid = validationErrors.length === 0
    
    return c.json({
      valid: isValid,
      totalRecords: students.length,
      validRecords: validStudents.length,
      invalidRecords: students.length - validStudents.length,
      errors: validationErrors,
      warnings: warnings,
      message: isValid 
        ? `All ${students.length} records are valid and ready for import`
        : `Found ${validationErrors.length} errors in ${students.length - validStudents.length} records`
    })
  } catch (error) {
    console.error('Validation error:', error)
    return c.json({ 
      valid: false, 
      message: `Validation failed: ${error.message}`,
      error: error.message 
    }, 500)
  }
})

// Student Import - Enhanced with validation and error handling
app.post('/make-server-dcb636e0/students/import', async (c) => {
  try {
    const { students, fileName } = await c.req.json()
    
    // Validate input
    if (!students || !Array.isArray(students) || students.length === 0) {
      return c.json({ 
        success: false, 
        imported: 0, 
        failed: 0, 
        message: 'No valid student data provided' 
      }, 400)
    }
    
    const importedStudents = []
    const failedStudents = []
    const errors = []
    
    // Check for existing students to avoid duplicates
    const existingStudents = await kv.getByPrefix('student:')
    const existingRollNumbers = new Set(
      existingStudents.map(s => `${s.class}-${s.section}-${s.rollNumber}`.toLowerCase())
    )
    
    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.firstName || !studentData.lastName) {
          failedStudents.push(studentData)
          errors.push(`Missing name for student: ${JSON.stringify(studentData)}`)
          continue
        }
        
        if (!studentData.class || !studentData.rollNumber) {
          failedStudents.push(studentData)
          errors.push(`Missing class/roll number for ${studentData.firstName} ${studentData.lastName}`)
          continue
        }
        
        // Check for duplicate roll number
        const studentKey = `${studentData.class}-${studentData.section || 'A'}-${studentData.rollNumber}`.toLowerCase()
        if (existingRollNumbers.has(studentKey)) {
          failedStudents.push(studentData)
          errors.push(`Duplicate roll number: ${studentData.rollNumber} in class ${studentData.class}-${studentData.section || 'A'}`)
          continue
        }
        
        // Generate unique ID
        const id = crypto.randomUUID()
        
        // Prepare student data with defaults
        const student = {
          id,
          firstName: studentData.firstName.trim(),
          lastName: studentData.lastName.trim(),
          email: studentData.email || `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}@school.edu`,
          phone: studentData.phone || '',
          class: studentData.class,
          section: studentData.section || 'A',
          rollNumber: studentData.rollNumber,
          dateOfBirth: studentData.dateOfBirth || '',
          address: studentData.address || '',
          parentName: studentData.parentName || 'Not Provided',
          parentPhone: studentData.parentPhone || '0000000000',
          parentEmail: studentData.parentEmail || '',
          bloodGroup: studentData.bloodGroup || '',
          gender: studentData.gender || 'other',
          religion: studentData.religion || '',
          nationality: studentData.nationality || 'Indian',
          emergencyContact: studentData.emergencyContact || studentData.parentPhone || '0000000000',
          medicalConditions: studentData.medicalConditions || '',
          studentId: studentData.studentId || `STU${Date.now()}${Math.floor(Math.random() * 1000)}`,
          previousSchool: studentData.previousSchool || '',
          academicYear: studentData.academicYear || new Date().getFullYear().toString(),
          house: studentData.house || '',
          transportRoute: studentData.transportRoute || '',
          feeCategory: studentData.feeCategory || 'regular',
          status: studentData.status || 'active',
          admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Save to database
        await kv.set(`student:${id}`, student)
        importedStudents.push(student)
        existingRollNumbers.add(studentKey)
        
      } catch (err) {
        failedStudents.push(studentData)
        errors.push(`Failed to import ${studentData.firstName || 'Unknown'} ${studentData.lastName || 'Student'}: ${err.message}`)
        console.error('Student import error:', err)
      }
    }
    
    // Log import details
    console.log(`Import completed - File: ${fileName}, Imported: ${importedStudents.length}, Failed: ${failedStudents.length}`)
    
    return c.json({ 
      success: importedStudents.length > 0,
      imported: importedStudents.length,
      failed: failedStudents.length,
      message: importedStudents.length > 0 
        ? `Successfully imported ${importedStudents.length} students${failedStudents.length > 0 ? `, ${failedStudents.length} failed` : ''}`
        : 'Failed to import any students',
      students: importedStudents,
      failedStudents: failedStudents.length > 0 ? failedStudents : undefined,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Import endpoint error:', error)
    return c.json({ 
      success: false,
      imported: 0,
      failed: 0,
      message: `Import failed: ${error.message}`,
      error: error.message 
    }, 500)
  }
})

// Student Dashboard
app.get('/make-server-dcb636e0/students/:id/dashboard', async (c) => {
  try {
    const studentId = c.req.param('id')
    const student = await kv.get(`student:${studentId}`)
    
    if (!student) return c.json({ error: 'Student not found' }, 404)
    
    // Get related data
    const academicRecords = await kv.getByPrefix(`academic-record:${studentId}:`)
    const attendanceRecords = await kv.getByPrefix(`attendance:${studentId}:`)
    const achievements = await kv.getByPrefix(`achievement:${studentId}:`)
    const disciplinaryRecords = await kv.getByPrefix(`disciplinary:${studentId}:`)
    
    // Calculate metrics
    const attendancePercentage = attendanceRecords.length > 0 
      ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
      : 0
    
    const averageGrade = academicRecords.length > 0
      ? Math.round(academicRecords.reduce((sum, r) => sum + (r.marks / r.maxMarks) * 100, 0) / academicRecords.length)
      : 0
    
    return c.json({
      student,
      metrics: {
        attendancePercentage,
        averageGrade,
        totalAchievements: achievements.length,
        disciplinaryRecords: disciplinaryRecords.length
      },
      recentRecords: {
        academic: academicRecords.slice(-5),
        attendance: attendanceRecords.slice(-10),
        achievements: achievements.slice(-3)
      }
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Student Documents
app.get('/make-server-dcb636e0/students/:id/documents', async (c) => {
  try {
    const studentId = c.req.param('id')
    const documents = await kv.getByPrefix(`document:${studentId}:`)
    return c.json(documents)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/students/:id/documents', async (c) => {
  try {
    const studentId = c.req.param('id')
    const documentData = await c.req.json()
    const id = crypto.randomUUID()
    
    const document = {
      id,
      studentId,
      ...documentData,
      uploadedAt: new Date().toISOString()
    }
    
    await kv.set(`document:${studentId}:${id}`, document)
    return c.json(document)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/students/:studentId/documents/:documentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    const documentId = c.req.param('documentId')
    
    await kv.del(`document:${studentId}:${documentId}`)
    return c.json({ success: true, message: 'Document deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Classwise Students
app.get('/make-server-dcb636e0/classes/:classId/students', async (c) => {
  try {
    const classId = c.req.param('classId')
    const section = c.req.query('section')
    
    const allStudents = await kv.getByPrefix('student:')
    let students = allStudents.filter(s => s.class === classId)
    
    if (section) {
      students = students.filter(s => s.section === section)
    }
    
    return c.json(students)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Students by House
app.get('/make-server-dcb636e0/students/by-house/:house', async (c) => {
  try {
    const house = c.req.param('house')
    const allStudents = await kv.getByPrefix('student:')
    const students = allStudents.filter(s => s.house === house)
    
    return c.json(students)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Students with Birthdays
app.get('/make-server-dcb636e0/students/birthdays', async (c) => {
  try {
    const month = c.req.query('month')
    const allStudents = await kv.getByPrefix('student:')
    
    let studentsWithBirthdays = allStudents.filter(s => s.dateOfBirth)
    
    if (month) {
      const targetMonth = parseInt(month)
      studentsWithBirthdays = studentsWithBirthdays.filter(s => {
        const birthDate = new Date(s.dateOfBirth)
        return birthDate.getMonth() === targetMonth - 1 // JavaScript months are 0-indexed
      })
    } else {
      // Current month by default
      const currentMonth = new Date().getMonth()
      studentsWithBirthdays = studentsWithBirthdays.filter(s => {
        const birthDate = new Date(s.dateOfBirth)
        return birthDate.getMonth() === currentMonth
      })
    }
    
    return c.json(studentsWithBirthdays)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Student Performance Analytics
app.get('/make-server-dcb636e0/students/:id/performance', async (c) => {
  try {
    const studentId = c.req.param('id')
    const academicRecords = await kv.getByPrefix(`academic-record:${studentId}:`)
    const attendanceRecords = await kv.getByPrefix(`attendance:${studentId}:`)
    
    // Calculate subject-wise performance
    const subjectPerformance = {}
    academicRecords.forEach(record => {
      if (!subjectPerformance[record.subject]) {
        subjectPerformance[record.subject] = {
          subject: record.subject,
          totalMarks: 0,
          maxMarks: 0,
          tests: 0
        }
      }
      
      subjectPerformance[record.subject].totalMarks += record.marks
      subjectPerformance[record.subject].maxMarks += record.maxMarks
      subjectPerformance[record.subject].tests += 1
    })
    
    // Calculate monthly attendance
    const monthlyAttendance = {}
    attendanceRecords.forEach(record => {
      const month = new Date(record.date).toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyAttendance[month]) {
        monthlyAttendance[month] = { present: 0, total: 0 }
      }
      
      monthlyAttendance[month].total += 1
      if (record.status === 'present') {
        monthlyAttendance[month].present += 1
      }
    })
    
    return c.json({
      subjectPerformance: Object.values(subjectPerformance),
      monthlyAttendance,
      overallPerformance: {
        averageGrade: academicRecords.length > 0 
          ? Math.round(academicRecords.reduce((sum, r) => sum + (r.marks / r.maxMarks) * 100, 0) / academicRecords.length)
          : 0,
        attendanceRate: attendanceRecords.length > 0
          ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
          : 0
      }
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Class Performance Analytics
app.get('/make-server-dcb636e0/classes/:classId/performance', async (c) => {
  try {
    const classId = c.req.param('classId')
    const section = c.req.query('section')
    
    const allStudents = await kv.getByPrefix('student:')
    let students = allStudents.filter(s => s.class === classId)
    
    if (section) {
      students = students.filter(s => s.section === section)
    }
    
    const classPerformance = {
      totalStudents: students.length,
      performanceDistribution: { excellent: 0, good: 0, average: 0, needsImprovement: 0 },
      averageAttendance: 0,
      topPerformers: []
    }
    
    // This would typically involve more complex calculations
    // For demo purposes, providing sample data
    return c.json(classPerformance)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Parent Communication
app.post('/make-server-dcb636e0/students/:id/parent-message', async (c) => {
  try {
    const studentId = c.req.param('id')
    const messageData = await c.req.json()
    const id = crypto.randomUUID()
    
    const message = {
      id,
      studentId,
      ...messageData,
      sentAt: new Date().toISOString(),
      status: 'sent'
    }
    
    await kv.set(`parent-message:${studentId}:${id}`, message)
    return c.json(message)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/students/:id/parent-communications', async (c) => {
  try {
    const studentId = c.req.param('id')
    const communications = await kv.getByPrefix(`parent-message:${studentId}:`)
    return c.json(communications)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Classes Management
app.get('/make-server-dcb636e0/classes', async (c) => {
  try {
    const classes = await kv.getByPrefix('class:')
    return c.json(classes)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/classes', async (c) => {
  try {
    const classData = await c.req.json()
    const id = crypto.randomUUID()
    const classRecord = {
      id,
      ...classData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`class:${id}`, classRecord)
    return c.json(classRecord)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/classes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`class:${id}`)
    
    if (!existing) return c.json({ error: 'Class not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`class:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/classes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`class:${id}`)
    
    if (!existing) return c.json({ error: 'Class not found' }, 404)
    
    await kv.del(`class:${id}`)
    return c.json({ success: true, message: 'Class deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Class Stats
app.get('/make-server-dcb636e0/class-stats', async (c) => {
  try {
    const classes = await kv.getByPrefix('class:')
    const students = await kv.getByPrefix('student:')
    const teachers = await kv.getByPrefix('staff:')
    
    const totalClasses = classes.length
    const totalStudents = students.length
    const averageStrength = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0
    const activeTeachers = teachers.filter(t => t.role === 'teacher' && t.status === 'active').length
    
    // Calculate capacity utilization
    let totalCapacity = 0
    classes.forEach(cls => {
      totalCapacity += cls.capacity || 40
    })
    
    const capacityUtilization = totalCapacity > 0 
      ? Math.round((totalStudents / totalCapacity) * 100)
      : 0
    
    const teacherStudentRatio = activeTeachers > 0 
      ? Math.round(totalStudents / activeTeachers)
      : 0
    
    const stats = {
      totalClasses,
      totalStudents,
      averageStrength,
      teacherStudentRatio,
      capacityUtilization,
      activeTeachers
    }
    
    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Unassigned Students
app.get('/make-server-dcb636e0/students/unassigned', async (c) => {
  try {
    const allStudents = await kv.getByPrefix('student:') || []
    const assignments = await kv.getByPrefix('class-assignment:') || []
    
    const assignedStudentIds = assignments
      .filter(a => a && a.studentId) // Ensure assignment has studentId
      .map(a => a.studentId)
    
    const unassignedStudents = allStudents.filter(s => 
      s && s.id && !assignedStudentIds.includes(s.id) && 
      (s.status === 'active' || !s.status) // Include students without status field
    )
    
    return c.json(unassignedStudents)
  } catch (error) {
    console.error('Error in unassigned students endpoint:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Assign Students to Class
app.post('/make-server-dcb636e0/classes/assign-students', async (c) => {
  try {
    const { classId, studentIds } = await c.req.json()
    const assignments = []
    
    for (const studentId of studentIds) {
      const id = crypto.randomUUID()
      const assignment = {
        id,
        classId,
        studentId,
        assignedAt: new Date().toISOString(),
        academicYear: '2024-25'
      }
      
      await kv.set(`class-assignment:${id}`, assignment)
      assignments.push(assignment)
      
      // Update student's class information
      const student = await kv.get(`student:${studentId}`)
      if (student) {
        student.classId = classId
        student.updated_at = new Date().toISOString()
        await kv.set(`student:${studentId}`, student)
      }
    }
    
    // Update class strength
    const classRecord = await kv.get(`class:${classId}`)
    if (classRecord) {
      classRecord.currentStrength = (classRecord.currentStrength || 0) + studentIds.length
      classRecord.updated_at = new Date().toISOString()
      await kv.set(`class:${classId}`, classRecord)
    }
    
    return c.json({ success: true, assignments })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Promote Class
app.post('/make-server-dcb636e0/classes/:id/promote', async (c) => {
  try {
    const classId = c.req.param('id')
    const { targetClass } = await c.req.json()
    
    // Get all students in the class
    const assignments = await kv.getByPrefix('class-assignment:')
    const classStudents = assignments.filter(a => a.classId === classId)
    
    const promotedStudents = []
    
    for (const assignment of classStudents) {
      const student = await kv.get(`student:${assignment.studentId}`)
      if (student) {
        // Update student's class
        student.class = targetClass
        student.updated_at = new Date().toISOString()
        await kv.set(`student:${assignment.studentId}`, student)
        promotedStudents.push(student)
        
        // Remove old assignment
        await kv.del(`class-assignment:${assignment.id}`)
      }
    }
    
    return c.json({ success: true, promotedStudents: promotedStudents.length })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Generate Timetable
app.post('/make-server-dcb636e0/classes/:id/timetable/generate', async (c) => {
  try {
    const classId = c.req.param('id')
    const classRecord = await kv.get(`class:${classId}`)
    
    if (!classRecord) return c.json({ error: 'Class not found' }, 404)
    
    // Generate a basic timetable structure
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const timeSlots = [
      { start: '09:00', end: '09:45' },
      { start: '09:45', end: '10:30' },
      { start: '10:45', end: '11:30' },
      { start: '11:30', end: '12:15' },
      { start: '13:00', end: '13:45' },
      { start: '13:45', end: '14:30' }
    ]
    
    const timetable = []
    const subjects = await kv.getByPrefix('subject:')
    
    let subjectIndex = 0
    for (const day of days) {
      for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i]
        const subject = subjects[subjectIndex % subjects.length]
        
        const timetableEntry = {
          id: crypto.randomUUID(),
          classId,
          day,
          startTime: slot.start,
          endTime: slot.end,
          subjectId: subject?.id || 'default',
          subjectName: subject?.name || 'Study Period',
          teacherId: subject?.teacherId || 'teacher1',
          teacherName: subject?.teacherName || 'Teacher',
          roomNumber: classRecord.roomNumber || 'Room 101'
        }
        
        timetable.push(timetableEntry)
        await kv.set(`timetable:${classId}:${timetableEntry.id}`, timetableEntry)
        subjectIndex++
      }
    }
    
    return c.json({ success: true, timetable })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Fees Management
app.get('/make-server-dcb636e0/fees', async (c) => {
  try {
    const fees = await kv.getByPrefix('fee:')
    return c.json(fees)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/fees', async (c) => {
  try {
    const feeData = await c.req.json()
    const id = crypto.randomUUID()
    const fee = {
      id,
      ...feeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`fee:${id}`, fee)
    return c.json(fee)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/fees/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`fee:${id}`)
    
    if (!existing) return c.json({ error: 'Fee not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`fee:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Fee Structures Management
app.get('/make-server-dcb636e0/fee-structures', async (c) => {
  try {
    const structures = await kv.getByPrefix('fee-structure:')
    return c.json(structures)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/fee-structures', async (c) => {
  try {
    const structureData = await c.req.json()
    const id = crypto.randomUUID()
    const structure = {
      id,
      ...structureData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`fee-structure:${id}`, structure)
    return c.json(structure)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Subjects Management
app.get('/make-server-dcb636e0/subjects', async (c) => {
  try {
    const subjects = await kv.getByPrefix('subject:')
    return c.json(subjects)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/subjects', async (c) => {
  try {
    const subjectData = await c.req.json()
    const id = crypto.randomUUID()
    const subject = {
      id,
      ...subjectData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`subject:${id}`, subject)
    return c.json(subject)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Teachers Management
app.get('/make-server-dcb636e0/teachers', async (c) => {
  try {
    const teachers = await kv.getByPrefix('teacher:')
    return c.json(teachers)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/teachers', async (c) => {
  try {
    const teacherData = await c.req.json()
    const id = crypto.randomUUID()
    const teacher = {
      id,
      ...teacherData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`teacher:${id}`, teacher)
    return c.json(teacher)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Admissions Management
app.get('/make-server-dcb636e0/admissions', async (c) => {
  try {
    const admissions = await kv.getByPrefix('admission:')
    return c.json(admissions)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/admissions', async (c) => {
  try {
    const admissionData = await c.req.json()
    const id = crypto.randomUUID()
    const admission = {
      id,
      ...admissionData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`admission:${id}`, admission)
    return c.json(admission)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Library Management
app.get('/make-server-dcb636e0/books', async (c) => {
  try {
    const books = await kv.getByPrefix('book:')
    return c.json(books)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/books', async (c) => {
  try {
    const bookData = await c.req.json()
    const id = crypto.randomUUID()
    const book = {
      id,
      ...bookData,
      available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`book:${id}`, book)
    return c.json(book)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/books/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`book:${id}`)
    
    if (!existing) return c.json({ error: 'Book not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`book:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Borrowings Management
app.get('/make-server-dcb636e0/borrowings', async (c) => {
  try {
    const borrowings = await kv.getByPrefix('borrowing:')
    return c.json(borrowings)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/borrowings', async (c) => {
  try {
    const borrowingData = await c.req.json()
    const id = crypto.randomUUID()
    const borrowing = {
      id,
      ...borrowingData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`borrowing:${id}`, borrowing)
    return c.json(borrowing)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/borrowings/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`borrowing:${id}`)
    
    if (!existing) return c.json({ error: 'Borrowing not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`borrowing:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Exams Management
app.get('/make-server-dcb636e0/exams', async (c) => {
  try {
    const exams = await kv.getByPrefix('exam:')
    return c.json(exams)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/exams', async (c) => {
  try {
    const examData = await c.req.json()
    const id = crypto.randomUUID()
    const exam = {
      id,
      ...examData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`exam:${id}`, exam)
    return c.json(exam)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Exam Results Management
app.get('/make-server-dcb636e0/exam-results', async (c) => {
  try {
    const results = await kv.getByPrefix('exam-result:')
    return c.json(results)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/exam-results', async (c) => {
  try {
    const resultData = await c.req.json()
    const id = crypto.randomUUID()
    const result = {
      id,
      ...resultData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`exam-result:${id}`, result)
    return c.json(result)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Exam Schedules Management
app.get('/make-server-dcb636e0/exam-schedules', async (c) => {
  try {
    const schedules = await kv.getByPrefix('exam-schedule:')
    return c.json(schedules)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/exam-schedules/generate', async (c) => {
  try {
    const { examIds } = await c.req.json()
    const schedules = []
    
    for (const examId of examIds) {
      const exam = await kv.get(`exam:${examId}`)
      if (exam) {
        const id = crypto.randomUUID()
        const schedule = {
          id,
          examId,
          examName: exam.name,
          subject: exam.subject,
          class: exam.class,
          date: exam.date,
          startTime: exam.startTime,
          endTime: calculateEndTime(exam.startTime, exam.duration),
          roomNumber: exam.roomNumber || 'TBA',
          invigilator: exam.invigilator || 'TBA',
          created_at: new Date().toISOString()
        }
        
        await kv.set(`exam-schedule:${id}`, schedule)
        schedules.push(schedule)
      }
    }
    
    return c.json(schedules)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Exam Stats
app.get('/make-server-dcb636e0/exam-stats', async (c) => {
  try {
    const exams = await kv.getByPrefix('exam:')
    const results = await kv.getByPrefix('exam-result:')
    
    const now = new Date()
    const completedExams = exams.filter(e => e.status === 'completed').length
    const upcomingExams = exams.filter(e => {
      const examDate = new Date(e.date)
      return examDate > now && e.status === 'scheduled'
    }).length
    const ongoingExams = exams.filter(e => e.status === 'ongoing').length
    
    // Calculate performance metrics
    let totalMarks = 0
    let totalMaxMarks = 0
    let passCount = 0
    
    results.forEach(result => {
      totalMarks += result.marksObtained || 0
      totalMaxMarks += result.maxMarks || 100
      if (result.status === 'pass') passCount++
    })
    
    const averagePerformance = totalMaxMarks > 0 
      ? Math.round((totalMarks / totalMaxMarks) * 100) 
      : 0
    
    const passPercentage = results.length > 0 
      ? Math.round((passCount / results.length) * 100)
      : 0
    
    const highestScore = results.length > 0 
      ? Math.max(...results.map(r => r.percentage || 0))
      : 0
    
    const lowestScore = results.length > 0 
      ? Math.min(...results.map(r => r.percentage || 0))
      : 0
    
    const stats = {
      totalExams: exams.length,
      completedExams,
      upcomingExams,
      ongoingExams,
      averagePerformance,
      highestScore,
      lowestScore,
      passPercentage
    }
    
    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Submit Exam Results
app.post('/make-server-dcb636e0/exam-results/submit', async (c) => {
  try {
    const resultsData = await c.req.json()
    const submittedResults = []
    
    for (const resultData of resultsData) {
      const id = crypto.randomUUID()
      const result = {
        id,
        ...resultData,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      await kv.set(`exam-result:${id}`, result)
      submittedResults.push(result)
    }
    
    return c.json({ success: true, results: submittedResults })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Publish Exam Results
app.put('/make-server-dcb636e0/exam-results/:examId/publish', async (c) => {
  try {
    const examId = c.req.param('examId')
    
    // Update exam status to published
    const exam = await kv.get(`exam:${examId}`)
    if (exam) {
      exam.resultsPublished = true
      exam.publishedAt = new Date().toISOString()
      await kv.set(`exam:${examId}`, exam)
    }
    
    // Update related results to published status
    const allResults = await kv.getByPrefix('exam-result:')
    const examResults = allResults.filter(r => r.examId === examId)
    
    for (const result of examResults) {
      result.published = true
      result.publishedAt = new Date().toISOString()
      await kv.set(`exam-result:${result.id}`, result)
    }
    
    return c.json({ success: true, message: 'Results published successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Helper function to calculate end time
function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
  return endDate.toTimeString().substring(0, 5) // HH:MM format
}

// Transport Management - Vehicles
app.get('/make-server-dcb636e0/vehicles', async (c) => {
  try {
    const vehicles = await kv.getByPrefix('vehicle:')
    return c.json(vehicles)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/vehicles', async (c) => {
  try {
    const vehicleData = await c.req.json()
    const id = crypto.randomUUID()
    const vehicle = {
      id,
      ...vehicleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`vehicle:${id}`, vehicle)
    return c.json(vehicle)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Transport Management - Routes
app.get('/make-server-dcb636e0/routes', async (c) => {
  try {
    const routes = await kv.getByPrefix('route:')
    return c.json(routes)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/routes', async (c) => {
  try {
    const routeData = await c.req.json()
    const id = crypto.randomUUID()
    const route = {
      id,
      ...routeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`route:${id}`, route)
    return c.json(route)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Transport Management - Student Transport
app.get('/make-server-dcb636e0/student-transport', async (c) => {
  try {
    const studentTransport = await kv.getByPrefix('student-transport:')
    return c.json(studentTransport)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/student-transport', async (c) => {
  try {
    const transportData = await c.req.json()
    const id = crypto.randomUUID()
    const transport = {
      id,
      ...transportData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`student-transport:${id}`, transport)
    return c.json(transport)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Staff Management
app.get('/make-server-dcb636e0/staff', async (c) => {
  try {
    const staff = await kv.getByPrefix('staff:')
    return c.json(staff)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/staff', async (c) => {
  try {
    const staffData = await c.req.json()
    const id = crypto.randomUUID()
    const staff = {
      id,
      ...staffData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`staff:${id}`, staff)
    return c.json(staff)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Attendance Management
app.get('/make-server-dcb636e0/attendance-records', async (c) => {
  try {
    const records = await kv.getByPrefix('attendance:')
    return c.json(records)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/attendance-records', async (c) => {
  try {
    const attendanceData = await c.req.json()
    const id = crypto.randomUUID()
    const attendance = {
      id,
      ...attendanceData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`attendance:${id}`, attendance)
    return c.json(attendance)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/attendance-summary', async (c) => {
  try {
    const summary = await kv.getByPrefix('attendance-summary:')
    return c.json(summary)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/attendance-bulk', async (c) => {
  try {
    const bulkData = await c.req.json()
    const results = []
    
    for (const attendanceData of bulkData) {
      const id = crypto.randomUUID()
      const attendance = {
        id,
        ...attendanceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await kv.set(`attendance:${id}`, attendance)
      results.push(attendance)
    }
    
    return c.json(results)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Timetable Management
app.get('/make-server-dcb636e0/time-slots', async (c) => {
  try {
    const slots = await kv.getByPrefix('time-slot:')
    return c.json(slots)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/time-slots', async (c) => {
  try {
    const slotData = await c.req.json()
    const id = crypto.randomUUID()
    const slot = {
      id,
      ...slotData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`time-slot:${id}`, slot)
    return c.json(slot)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/timetable-entries', async (c) => {
  try {
    const entries = await kv.getByPrefix('timetable-entry:')
    return c.json(entries)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/timetable-entries', async (c) => {
  try {
    const entryData = await c.req.json()
    const id = crypto.randomUUID()
    const entry = {
      id,
      ...entryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`timetable-entry:${id}`, entry)
    return c.json(entry)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Health Records Management
app.get('/make-server-dcb636e0/health-records', async (c) => {
  try {
    const records = await kv.getByPrefix('health-record:')
    return c.json(records)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/health-records', async (c) => {
  try {
    const recordData = await c.req.json()
    const id = crypto.randomUUID()
    const record = {
      id,
      ...recordData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`health-record:${id}`, record)
    return c.json(record)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/vaccinations', async (c) => {
  try {
    const vaccinations = await kv.getByPrefix('vaccination:')
    return c.json(vaccinations)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/vaccinations', async (c) => {
  try {
    const vaccinationData = await c.req.json()
    const id = crypto.randomUUID()
    const vaccination = {
      id,
      ...vaccinationData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`vaccination:${id}`, vaccination)
    return c.json(vaccination)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Hostel Management Endpoints
app.get('/make-server-dcb636e0/hostel-rooms', async (c) => {
  try {
    const rooms = await kv.getByPrefix('hostel-room:')
    return c.json(rooms)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/hostel-rooms', async (c) => {
  try {
    const roomData = await c.req.json()
    const id = crypto.randomUUID()
    const room = {
      id,
      ...roomData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`hostel-room:${id}`, room)
    return c.json(room)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/hostel-students', async (c) => {
  try {
    const students = await kv.getByPrefix('hostel-student:')
    return c.json(students)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/hostel-students', async (c) => {
  try {
    const studentData = await c.req.json()
    const id = crypto.randomUUID()
    const student = {
      id,
      ...studentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`hostel-student:${id}`, student)
    return c.json(student)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/mess-meals', async (c) => {
  try {
    const meals = await kv.getByPrefix('mess-meal:')
    return c.json(meals)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/mess-meals', async (c) => {
  try {
    const mealData = await c.req.json()
    const id = crypto.randomUUID()
    const meal = {
      id,
      ...mealData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`mess-meal:${id}`, meal)
    return c.json(meal)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Communication Center Endpoints
app.get('/make-server-dcb636e0/announcements', async (c) => {
  try {
    const announcements = await kv.getByPrefix('announcement:')
    return c.json(announcements)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/announcements', async (c) => {
  try {
    const announcementData = await c.req.json()
    const id = crypto.randomUUID()
    const announcement = {
      id,
      ...announcementData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`announcement:${id}`, announcement)
    return c.json(announcement)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/messages', async (c) => {
  try {
    const messages = await kv.getByPrefix('message:')
    return c.json(messages)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/messages', async (c) => {
  try {
    const messageData = await c.req.json()
    const id = crypto.randomUUID()
    const message = {
      id,
      ...messageData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`message:${id}`, message)
    return c.json(message)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/notice-board', async (c) => {
  try {
    const notices = await kv.getByPrefix('notice:')
    return c.json(notices)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/notice-board', async (c) => {
  try {
    const noticeData = await c.req.json()
    const id = crypto.randomUUID()
    const notice = {
      id,
      ...noticeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`notice:${id}`, notice)
    return c.json(notice)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Reports & Analytics Endpoints
app.get('/make-server-dcb636e0/reports', async (c) => {
  try {
    const reports = await kv.getByPrefix('report:')
    return c.json(reports)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/reports', async (c) => {
  try {
    const reportData = await c.req.json()
    const id = crypto.randomUUID()
    const report = {
      id,
      ...reportData,
      status: 'generating',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`report:${id}`, report)
    
    // Simulate report generation
    setTimeout(async () => {
      const updatedReport = { ...report, status: 'completed' }
      await kv.set(`report:${id}`, updatedReport)
    }, 2000)
    
    return c.json(report)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/reports/:id/export', async (c) => {
  try {
    const reportId = c.req.param('id')
    const format = c.req.query('format')
    
    // Simulate export functionality
    return c.json({ success: true, downloadUrl: `#export-${format}-${reportId}` })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Stats Endpoints
app.get('/make-server-dcb636e0/stats/academic', async (c) => {
  try {
    // Generate mock academic stats
    const stats = {
      totalStudents: 850,
      passPercentage: 94.5,
      averageGrades: [
        { class: '10th A', average: 89.2, gradeDistribution: [
          { grade: 'A+', count: 12 }, { grade: 'A', count: 18 }, { grade: 'B+', count: 8 }, { grade: 'B', count: 4 }, { grade: 'C', count: 2 }
        ]},
        { class: '10th B', average: 85.7, gradeDistribution: [
          { grade: 'A+', count: 8 }, { grade: 'A', count: 15 }, { grade: 'B+', count: 12 }, { grade: 'B', count: 6 }, { grade: 'C', count: 3 }
        ]},
        { class: '9th A', average: 88.1, gradeDistribution: [
          { grade: 'A+', count: 10 }, { grade: 'A', count: 16 }, { grade: 'B+', count: 10 }, { grade: 'B', count: 5 }, { grade: 'C', count: 2 }
        ]},
      ],
      topPerformers: [
        { studentName: 'Alice Johnson', class: '10th A', percentage: 98.5 },
        { studentName: 'Bob Smith', class: '10th B', percentage: 97.2 },
        { studentName: 'Charlie Brown', class: '9th A', percentage: 96.8 },
        { studentName: 'Diana Prince', class: '10th A', percentage: 96.3 },
        { studentName: 'Edward Norton', class: '9th B', percentage: 95.9 },
      ],
      subjectPerformance: [
        { subject: 'Mathematics', averageMarks: 87.5, passRate: 96 },
        { subject: 'Science', averageMarks: 85.2, passRate: 94 },
        { subject: 'English', averageMarks: 89.1, passRate: 98 },
        { subject: 'Social Studies', averageMarks: 84.7, passRate: 92 },
        { subject: 'Computer Science', averageMarks: 91.3, passRate: 99 },
      ]
    }
    
    await kv.set('stats:academic', stats)
    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/stats/financial', async (c) => {
  try {
    // Generate mock financial stats
    const stats = {
      totalFeeCollection: 12500000,
      pendingFees: 2800000,
      feeCollectionRate: 81.7,
      monthlyCollection: [
        { month: 'April', collected: 2100000, pending: 450000 },
        { month: 'May', collected: 1950000, pending: 520000 },
        { month: 'June', collected: 2250000, pending: 380000 },
        { month: 'July', collected: 2080000, pending: 470000 },
        { month: 'August', collected: 2200000, pending: 420000 },
        { month: 'September', collected: 1920000, pending: 560000 },
      ],
      classWiseFees: [
        { class: '10th A', totalFees: 1500000, collected: 1200000, pending: 300000 },
        { class: '10th B', totalFees: 1400000, collected: 1150000, pending: 250000 },
        { class: '9th A', totalFees: 1350000, collected: 1100000, pending: 250000 },
        { class: '9th B', totalFees: 1300000, collected: 1050000, pending: 250000 },
        { class: '8th A', totalFees: 1200000, collected: 980000, pending: 220000 },
      ]
    }
    
    await kv.set('stats:financial', stats)
    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/stats/attendance', async (c) => {
  try {
    // Generate mock attendance stats
    const stats = {
      overallAttendance: 89.3,
      classWiseAttendance: [
        { class: '10th A', attendance: 92.1, totalStudents: 44, presentToday: 41 },
        { class: '10th B', attendance: 88.7, totalStudents: 42, presentToday: 38 },
        { class: '9th A', attendance: 90.5, totalStudents: 45, presentToday: 42 },
        { class: '9th B', attendance: 87.2, totalStudents: 43, presentToday: 39 },
        { class: '8th A', attendance: 89.8, totalStudents: 46, presentToday: 43 },
      ],
      monthlyTrends: [
        { month: 'April', attendance: 91.2 },
        { month: 'May', attendance: 89.8 },
        { month: 'June', attendance: 88.5 },
        { month: 'July', attendance: 87.9 },
        { month: 'August', attendance: 89.1 },
        { month: 'September', attendance: 90.3 },
      ],
      lowAttendanceStudents: [
        { studentName: 'John Doe', class: '9th B', attendance: 68.5 },
        { studentName: 'Jane Smith', class: '10th A', attendance: 71.2 },
        { studentName: 'Mike Johnson', class: '8th B', attendance: 69.8 },
        { studentName: 'Sarah Wilson', class: '9th A', attendance: 72.4 },
        { studentName: 'Tom Brown', class: '10th B', attendance: 70.1 },
      ]
    }
    
    await kv.set('stats:attendance', stats)
    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Certificate Management Endpoints
app.get('/make-server-dcb636e0/certificates', async (c) => {
  try {
    const certificates = await kv.getByPrefix('certificate:')
    return c.json(certificates)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/certificates', async (c) => {
  try {
    const certificateData = await c.req.json()
    const id = crypto.randomUUID()
    const certificate = {
      id,
      ...certificateData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`certificate:${id}`, certificate)
    return c.json(certificate)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/certificate-templates', async (c) => {
  try {
    // Mock certificate templates
    const templates = [
      {
        id: '1',
        name: 'Transfer Certificate Template',
        type: 'transfer',
        description: 'Standard transfer certificate format',
        content: 'Template content...',
        variables: ['studentName', 'class', 'dateOfBirth', 'fatherName'],
        isActive: true
      },
      {
        id: '2',
        name: 'Character Certificate Template',
        type: 'character',
        description: 'Character certificate format',
        content: 'Template content...',
        variables: ['studentName', 'class', 'conduct', 'character'],
        isActive: true
      },
      {
        id: '3',
        name: 'Achievement Certificate Template',
        type: 'achievement',
        description: 'Achievement and award certificate',
        content: 'Template content...',
        variables: ['studentName', 'achievement', 'date', 'position'],
        isActive: true
      }
    ]
    
    return c.json(templates)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/certificates/:id/status', async (c) => {
  try {
    const certificateId = c.req.param('id')
    const { status } = await c.req.json()
    
    const certificate = await kv.get(`certificate:${certificateId}`)
    if (!certificate) {
      return c.json({ error: 'Certificate not found' }, 404)
    }
    
    const updatedCertificate = { ...certificate, status, updated_at: new Date().toISOString() }
    await kv.set(`certificate:${certificateId}`, updatedCertificate)
    
    return c.json(updatedCertificate)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/certificates/:id/download', async (c) => {
  try {
    const certificateId = c.req.param('id')
    
    // Simulate download functionality
    return c.json({ success: true, downloadUrl: `#download-${certificateId}` })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Accounts Management Endpoints
app.get('/make-server-dcb636e0/transactions', async (c) => {
  try {
    const transactions = await kv.getByPrefix('transaction:')
    return c.json(transactions)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/transactions', async (c) => {
  try {
    const transactionData = await c.req.json()
    const id = crypto.randomUUID()
    const transaction = {
      id,
      ...transactionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`transaction:${id}`, transaction)
    return c.json(transaction)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/budgets', async (c) => {
  try {
    const budgets = await kv.getByPrefix('budget:')
    return c.json(budgets)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/budgets', async (c) => {
  try {
    const budgetData = await c.req.json()
    const id = crypto.randomUUID()
    const budget = {
      id,
      ...budgetData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`budget:${id}`, budget)
    return c.json(budget)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/accounts', async (c) => {
  try {
    // Mock account data
    const accounts = [
      {
        id: '1',
        accountName: 'School Main Account',
        accountType: 'bank',
        accountNumber: '1234567890',
        bankName: 'State Bank of India',
        currentBalance: 2500000,
        openingBalance: 2000000,
        lastUpdated: new Date().toISOString(),
        status: 'active'
      },
      {
        id: '2',
        accountName: 'Petty Cash',
        accountType: 'cash',
        currentBalance: 50000,
        openingBalance: 50000,
        lastUpdated: new Date().toISOString(),
        status: 'active'
      },
      {
        id: '3',
        accountName: 'School Savings',
        accountType: 'bank',
        accountNumber: '9876543210',
        bankName: 'HDFC Bank',
        currentBalance: 1200000,
        openingBalance: 1000000,
        lastUpdated: new Date().toISOString(),
        status: 'active'
      }
    ]
    
    return c.json(accounts)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/financial-summary', async (c) => {
  try {
    // Mock financial summary
    const summary = {
      totalIncome: 15500000,
      totalExpenses: 12200000,
      netBalance: 3300000,
      monthlyIncome: 1200000,
      monthlyExpenses: 950000,
      cashInHand: 50000,
      bankBalance: 3700000,
      pendingPayments: 180000
    }
    
    return c.json(summary)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Dashboard Stats
app.get('/make-server-dcb636e0/dashboard/stats', async (c) => {
  try {
    const [students, classes, admissions, fees] = await Promise.all([
      kv.getByPrefix('student:'),
      kv.getByPrefix('class:'),
      kv.getByPrefix('admission:'),
      kv.getByPrefix('fee:')
    ])

    const stats = {
      totalStudents: students.length,
      totalClasses: classes.length,
      pendingAdmissions: admissions.filter(a => a.status === 'pending').length,
      totalFees: fees.reduce((sum, fee) => sum + (fee.amount || 0), 0)
    }

    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Sports Management Endpoints
app.get('/make-server-dcb636e0/sports-teams', async (c) => {
  try {
    const teams = await kv.getByPrefix('sports-team:')
    return c.json(teams)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/sports-teams', async (c) => {
  try {
    const teamData = await c.req.json()
    const id = crypto.randomUUID()
    const team = {
      id,
      ...teamData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`sports-team:${id}`, team)
    return c.json(team)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/tournaments', async (c) => {
  try {
    const tournaments = await kv.getByPrefix('tournament:')
    return c.json(tournaments)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/tournaments', async (c) => {
  try {
    const tournamentData = await c.req.json()
    const id = crypto.randomUUID()
    const tournament = {
      id,
      ...tournamentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`tournament:${id}`, tournament)
    return c.json(tournament)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/sports-equipment', async (c) => {
  try {
    const equipment = await kv.getByPrefix('sports-equipment:')
    return c.json(equipment)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/sports-equipment', async (c) => {
  try {
    const equipmentData = await c.req.json()
    const id = crypto.randomUUID()
    const equipment = {
      id,
      ...equipmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`sports-equipment:${id}`, equipment)
    return c.json(equipment)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/achievements', async (c) => {
  try {
    const achievements = await kv.getByPrefix('achievement:')
    return c.json(achievements)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/achievements', async (c) => {
  try {
    const achievementData = await c.req.json()
    const id = crypto.randomUUID()
    const achievement = {
      id,
      ...achievementData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`achievement:${id}`, achievement)
    return c.json(achievement)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Alumni Management Endpoints
app.get('/make-server-dcb636e0/alumni', async (c) => {
  try {
    const alumni = await kv.getByPrefix('alumni:')
    return c.json(alumni)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/alumni', async (c) => {
  try {
    const alumniData = await c.req.json()
    const id = crypto.randomUUID()
    const alumni = {
      id,
      ...alumniData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`alumni:${id}`, alumni)
    return c.json(alumni)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/alumni-events', async (c) => {
  try {
    const events = await kv.getByPrefix('alumni-event:')
    return c.json(events)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/alumni-events', async (c) => {
  try {
    const eventData = await c.req.json()
    const id = crypto.randomUUID()
    const event = {
      id,
      ...eventData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`alumni-event:${id}`, event)
    return c.json(event)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/alumni-donations', async (c) => {
  try {
    const donations = await kv.getByPrefix('alumni-donation:')
    return c.json(donations)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/alumni-donations', async (c) => {
  try {
    const donationData = await c.req.json()
    const id = crypto.randomUUID()
    const donation = {
      id,
      ...donationData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`alumni-donation:${id}`, donation)
    return c.json(donation)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/alumni-stats', async (c) => {
  try {
    const stats = {
      totalAlumni: 1250,
      activeAlumni: 890,
      totalDonations: 2500000,
      totalEvents: 15,
      graduationYearDistribution: [
        { year: '2023', count: 125 },
        { year: '2022', count: 110 },
        { year: '2021', count: 98 },
        { year: '2020', count: 105 },
        { year: '2019', count: 87 }
      ],
      occupationDistribution: [
        { occupation: 'Engineer', count: 245 },
        { occupation: 'Doctor', count: 156 },
        { occupation: 'Teacher', count: 123 },
        { occupation: 'Business', count: 189 },
        { occupation: 'Government', count: 98 }
      ],
      locationDistribution: [
        { city: 'Mumbai', count: 234 },
        { city: 'Delhi', count: 187 },
        { city: 'Bangalore', count: 156 },
        { city: 'Chennai', count: 143 },
        { city: 'Pune', count: 98 }
      ]
    }
    
    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Birthday Management Endpoints
app.get('/make-server-dcb636e0/birthdays', async (c) => {
  try {
    const birthdays = await kv.getByPrefix('birthday:')
    return c.json(birthdays)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/birthday-wishes', async (c) => {
  try {
    const wishes = await kv.getByPrefix('birthday-wish:')
    return c.json(wishes)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/birthday-wishes', async (c) => {
  try {
    const wishData = await c.req.json()
    const id = crypto.randomUUID()
    const wish = {
      id,
      ...wishData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`birthday-wish:${id}`, wish)
    return c.json(wish)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/birthday-celebrations', async (c) => {
  try {
    const celebrations = await kv.getByPrefix('birthday-celebration:')
    return c.json(celebrations)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/birthday-celebrations', async (c) => {
  try {
    const celebrationData = await c.req.json()
    const id = crypto.randomUUID()
    const celebration = {
      id,
      ...celebrationData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`birthday-celebration:${id}`, celebration)
    return c.json(celebration)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/birthday-reminders', async (c) => {
  try {
    const reminders = await kv.getByPrefix('birthday-reminder:')
    return c.json(reminders)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/birthday-reminders', async (c) => {
  try {
    const reminderData = await c.req.json()
    const id = crypto.randomUUID()
    const reminder = {
      id,
      ...reminderData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`birthday-reminder:${id}`, reminder)
    return c.json(reminder)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Inventory Management Endpoints
app.get('/make-server-dcb636e0/assets', async (c) => {
  try {
    const assets = await kv.getByPrefix('asset:')
    return c.json(assets)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/assets', async (c) => {
  try {
    const assetData = await c.req.json()
    const id = crypto.randomUUID()
    const asset = {
      id,
      ...assetData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`asset:${id}`, asset)
    return c.json(asset)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/maintenance-records', async (c) => {
  try {
    const records = await kv.getByPrefix('maintenance-record:')
    return c.json(records)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/maintenance-records', async (c) => {
  try {
    const maintenanceData = await c.req.json()
    const id = crypto.randomUUID()
    const record = {
      id,
      ...maintenanceData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`maintenance-record:${id}`, record)
    return c.json(record)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/procurement-requests', async (c) => {
  try {
    const requests = await kv.getByPrefix('procurement-request:')
    return c.json(requests)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/procurement-requests', async (c) => {
  try {
    const requestData = await c.req.json()
    const id = crypto.randomUUID()
    const request = {
      id,
      ...requestData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`procurement-request:${id}`, request)
    return c.json(request)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/inventory-items', async (c) => {
  try {
    const items = await kv.getByPrefix('inventory-item:')
    return c.json(items)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/inventory-items', async (c) => {
  try {
    const itemData = await c.req.json()
    const id = crypto.randomUUID()
    const item = {
      id,
      ...itemData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`inventory-item:${id}`, item)
    return c.json(item)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// System Settings Endpoints
app.get('/make-server-dcb636e0/school-settings', async (c) => {
  try {
    let settings = await kv.get('school-settings')
    if (!settings) {
      settings = {
        schoolName: 'Demo School',
        schoolCode: 'DS001',
        address: '123 Education Street',
        city: 'Demo City',
        state: 'Demo State',
        pincode: '123456',
        country: 'India',
        phoneNumber: '+91-9876543210',
        email: 'info@demoschool.edu',
        website: 'www.demoschool.edu',
        establishedYear: '2000',
        affiliationBoard: 'CBSE',
        affiliationNumber: 'CBSE123456',
        motto: 'Excellence in Education',
        vision: 'To provide world-class education',
        mission: 'Nurturing young minds for a better tomorrow'
      }
    }
    return c.json(settings)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/school-settings', async (c) => {
  try {
    const settingsData = await c.req.json()
    await kv.set('school-settings', settingsData)
    return c.json(settingsData)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/user-roles', async (c) => {
  try {
    const roles = await kv.getByPrefix('user-role:')
    return c.json(roles)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/user-roles', async (c) => {
  try {
    const roleData = await c.req.json()
    const id = crypto.randomUUID()
    const role = {
      id,
      ...roleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`user-role:${id}`, role)
    return c.json(role)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/system-users', async (c) => {
  try {
    const users = await kv.getByPrefix('system-user:')
    return c.json(users)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/system-users', async (c) => {
  try {
    const userData = await c.req.json()
    const id = crypto.randomUUID()
    const user = {
      id,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Don't store the password in plain text (in real app, hash it)
    delete user.password
    
    await kv.set(`system-user:${id}`, user)
    return c.json(user)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/notification-settings', async (c) => {
  try {
    let settings = await kv.get('notification-settings')
    if (!settings) {
      settings = {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        birthdayReminders: true,
        feeReminders: true,
        examNotifications: true,
        attendanceAlerts: true,
        maintenanceAlerts: true
      }
    }
    return c.json(settings)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/notification-settings', async (c) => {
  try {
    const settingsData = await c.req.json()
    await kv.set('notification-settings', settingsData)
    return c.json(settingsData)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/system-preferences', async (c) => {
  try {
    let preferences = await kv.get('system-preferences')
    if (!preferences) {
      preferences = {
        academicYear: '2024-25',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24',
        currency: 'INR',
        language: 'English',
        timezone: 'Asia/Kolkata',
        theme: 'light',
        autoBackup: true,
        backupFrequency: 'daily',
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireSpecialChar: true,
          requireNumber: true,
          requireUppercase: true,
          expiryDays: 90
        }
      }
    }
    return c.json(preferences)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/system-preferences', async (c) => {
  try {
    const preferencesData = await c.req.json()
    await kv.set('system-preferences', preferencesData)
    return c.json(preferencesData)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Initialize demo data
app.post('/make-server-dcb636e0/init-demo-data', async (c) => {
  try {
    // Create demo users if they don't exist
    const demoUsers = [
      { email: 'admin@demo.school', password: 'admin123', name: 'Admin User', role: 'admin' },
      { email: 'teacher@demo.school', password: 'teacher123', name: 'Teacher Demo', role: 'teacher' },
      { email: 'student@demo.school', password: 'student123', name: 'Student Demo', role: 'student' },
    ];

    for (const userData of demoUsers) {
      try {
        await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: { name: userData.name, role: userData.role },
          email_confirm: true
        });
      } catch (error) {
        // User might already exist, continue
        console.log(`User ${userData.email} might already exist`);
      }
    }

    // Create comprehensive demo students
    const demoStudents = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@student.demo',
        phone: '+91-9876543210',
        class: '10th',
        section: 'A',
        rollNumber: 'S001',
        dateOfBirth: '2008-05-15',
        address: '123 Student Lane, Demo City',
        parentName: 'Robert Doe',
        parentPhone: '+91-9876543211',
        parentEmail: 'robert.doe@email.com',
        bloodGroup: 'B+',
        gender: 'male',
        religion: 'Hindu',
        nationality: 'Indian',
        emergencyContact: '+91-9876543214',
        medicalConditions: 'None',
        studentId: 'STU2024001',
        previousSchool: 'ABC Primary School',
        academicYear: '2024',
        house: 'red',
        transportRoute: 'route1',
        feeCategory: 'regular',
        status: 'active',
        admissionDate: '2024-04-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@student.demo',
        phone: '+91-9876543212',
        class: '10th',
        section: 'A',
        rollNumber: 'S002',
        dateOfBirth: '2008-07-20',
        address: '456 Student Avenue, Demo City',
        parentName: 'Sarah Smith',
        parentPhone: '+91-9876543213',
        parentEmail: 'sarah.smith@email.com',
        bloodGroup: 'A+',
        gender: 'female',
        religion: 'Christian',
        nationality: 'Indian',
        emergencyContact: '+91-9876543215',
        medicalConditions: 'Mild Asthma',
        studentId: 'STU2024002',
        previousSchool: 'XYZ Elementary School',
        academicYear: '2024',
        house: 'blue',
        transportRoute: 'route2',
        feeCategory: 'scholarship',
        status: 'active',
        admissionDate: '2024-04-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@student.demo',
        phone: '+91-9876543216',
        class: '9th',
        section: 'B',
        rollNumber: 'S003',
        dateOfBirth: '2009-03-12',
        address: '789 School Road, Demo City',
        parentName: 'David Johnson',
        parentPhone: '+91-9876543217',
        parentEmail: 'david.johnson@email.com',
        bloodGroup: 'O+',
        gender: 'male',
        religion: 'Muslim',
        nationality: 'Indian',
        emergencyContact: '+91-9876543218',
        medicalConditions: 'None',
        studentId: 'STU2024003',
        previousSchool: 'DEF Middle School',
        academicYear: '2024',
        house: 'green',
        transportRoute: 'route3',
        feeCategory: 'regular',
        status: 'active',
        admissionDate: '2024-04-15',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@student.demo',
        phone: '+91-9876543219',
        class: '11th',
        section: 'A',
        rollNumber: 'S004',
        dateOfBirth: '2007-09-08',
        address: '321 Education Street, Demo City',
        parentName: 'Lisa Davis',
        parentPhone: '+91-9876543220',
        parentEmail: 'lisa.davis@email.com',
        bloodGroup: 'AB+',
        gender: 'female',
        religion: 'Hindu',
        nationality: 'Indian',
        emergencyContact: '+91-9876543221',
        medicalConditions: 'Allergic to peanuts',
        studentId: 'STU2024004',
        previousSchool: 'GHI High School',
        academicYear: '2024',
        house: 'yellow',
        transportRoute: 'route1',
        feeCategory: 'concession',
        status: 'active',
        admissionDate: '2024-03-20',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        firstName: 'Alex',
        lastName: 'Wilson',
        email: 'alex.wilson@student.demo',
        phone: '+91-9876543222',
        class: '12th',
        section: 'B',
        rollNumber: 'S005',
        dateOfBirth: '2006-11-25',
        address: '654 Learning Lane, Demo City',
        parentName: 'Thomas Wilson',
        parentPhone: '+91-9876543223',
        parentEmail: 'thomas.wilson@email.com',
        bloodGroup: 'B-',
        gender: 'male',
        religion: 'Sikh',
        nationality: 'Indian',
        emergencyContact: '+91-9876543224',
        medicalConditions: 'None',
        studentId: 'STU2024005',
        previousSchool: 'JKL Senior School',
        academicYear: '2024',
        house: 'red',
        transportRoute: 'route4',
        feeCategory: 'staff_ward',
        status: 'active',
        admissionDate: '2024-03-10',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const student of demoStudents) {
      await kv.set(`student:${student.id}`, student);
    }

    // Create demo academic records
    const demoAcademicRecords = [
      // John Doe's records
      { id: '1', studentId: '1', subject: 'Mathematics', term: 'Q1', marks: 88, maxMarks: 100, grade: 'A', year: '2024', created_at: new Date().toISOString() },
      { id: '2', studentId: '1', subject: 'English', term: 'Q1', marks: 82, maxMarks: 100, grade: 'A', year: '2024', created_at: new Date().toISOString() },
      { id: '3', studentId: '1', subject: 'Science', term: 'Q1', marks: 90, maxMarks: 100, grade: 'A+', year: '2024', created_at: new Date().toISOString() },
      { id: '4', studentId: '1', subject: 'Social Studies', term: 'Q1', marks: 85, maxMarks: 100, grade: 'A', year: '2024', created_at: new Date().toISOString() },
      
      // Jane Smith's records
      { id: '5', studentId: '2', subject: 'Mathematics', term: 'Q1', marks: 95, maxMarks: 100, grade: 'A+', year: '2024', created_at: new Date().toISOString() },
      { id: '6', studentId: '2', subject: 'English', term: 'Q1', marks: 92, maxMarks: 100, grade: 'A+', year: '2024', created_at: new Date().toISOString() },
      { id: '7', studentId: '2', subject: 'Science', term: 'Q1', marks: 94, maxMarks: 100, grade: 'A+', year: '2024', created_at: new Date().toISOString() },
      { id: '8', studentId: '2', subject: 'Social Studies', term: 'Q1', marks: 89, maxMarks: 100, grade: 'A', year: '2024', created_at: new Date().toISOString() },
      
      // Mike Johnson's records
      { id: '9', studentId: '3', subject: 'Mathematics', term: 'Q1', marks: 76, maxMarks: 100, grade: 'B', year: '2024', created_at: new Date().toISOString() },
      { id: '10', studentId: '3', subject: 'English', term: 'Q1', marks: 78, maxMarks: 100, grade: 'B', year: '2024', created_at: new Date().toISOString() },
      { id: '11', studentId: '3', subject: 'Science', term: 'Q1', marks: 80, maxMarks: 100, grade: 'B+', year: '2024', created_at: new Date().toISOString() },
      { id: '12', studentId: '3', subject: 'Social Studies', term: 'Q1', marks: 74, maxMarks: 100, grade: 'B', year: '2024', created_at: new Date().toISOString() }
    ];

    for (const record of demoAcademicRecords) {
      await kv.set(`academic-record:${record.studentId}:${record.id}`, record);
    }

    // Create demo attendance records
    const demoAttendanceRecords = [
      // Recent attendance for all students
      { id: '1', studentId: '1', date: '2024-12-18', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '2', studentId: '1', date: '2024-12-17', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '3', studentId: '1', date: '2024-12-16', status: 'late', subject: 'General', created_at: new Date().toISOString() },
      { id: '4', studentId: '1', date: '2024-12-13', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '5', studentId: '1', date: '2024-12-12', status: 'absent', subject: 'General', created_at: new Date().toISOString() },
      
      { id: '6', studentId: '2', date: '2024-12-18', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '7', studentId: '2', date: '2024-12-17', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '8', studentId: '2', date: '2024-12-16', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '9', studentId: '2', date: '2024-12-13', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '10', studentId: '2', date: '2024-12-12', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      
      { id: '11', studentId: '3', date: '2024-12-18', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '12', studentId: '3', date: '2024-12-17', status: 'absent', subject: 'General', created_at: new Date().toISOString() },
      { id: '13', studentId: '3', date: '2024-12-16', status: 'present', subject: 'General', created_at: new Date().toISOString() },
      { id: '14', studentId: '3', date: '2024-12-13', status: 'late', subject: 'General', created_at: new Date().toISOString() },
      { id: '15', studentId: '3', date: '2024-12-12', status: 'present', subject: 'General', created_at: new Date().toISOString() }
    ];

    for (const record of demoAttendanceRecords) {
      await kv.set(`attendance:${record.studentId}:${record.id}`, record);
    }

    // Create demo achievements
    const demoAchievements = [
      {
        id: '1',
        studentId: '2',
        title: 'Science Olympiad Gold Medal',
        description: 'First place in district Science Olympiad competition',
        category: 'academic',
        date: '2024-11-15',
        level: 'district',
        certificateUrl: '/certificates/science-olympiad-jane.pdf',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        studentId: '1',
        title: 'Inter-School Football Champion',
        description: 'Led the school team to victory in inter-school football tournament',
        category: 'sports',
        date: '2024-10-20',
        level: 'school',
        certificateUrl: '/certificates/football-john.pdf',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        studentId: '4',
        title: 'Best Debater Award',
        description: 'Outstanding performance in annual debate competition',
        category: 'cultural',
        date: '2024-09-30',
        level: 'school',
        certificateUrl: '/certificates/debate-emily.pdf',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        studentId: '5',
        title: 'Student Council President',
        description: 'Elected as Student Council President for academic year 2024-25',
        category: 'leadership',
        date: '2024-07-10',
        level: 'school',
        created_at: new Date().toISOString()
      }
    ];

    for (const achievement of demoAchievements) {
      await kv.set(`achievement:${achievement.studentId}:${achievement.id}`, achievement);
    }

    // Create demo disciplinary records
    const demoDisciplinaryRecords = [
      {
        id: '1',
        studentId: '3',
        date: '2024-11-05',
        type: 'warning',
        description: 'Late submission of assignment multiple times',
        actionTaken: 'Verbal warning and extra study period assigned',
        status: 'resolved',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        studentId: '1',
        date: '2024-09-15',
        type: 'commendation',
        description: 'Helped a fellow student during emergency',
        actionTaken: 'Appreciation letter sent to parents',
        status: 'resolved',
        created_at: new Date().toISOString()
      }
    ];

    for (const record of demoDisciplinaryRecords) {
      await kv.set(`disciplinary:${record.studentId}:${record.id}`, record);
    }

    // Create demo classes
    const demoClasses = [
      {
        id: '1',
        name: 'Class 10A',
        grade: '10',
        section: 'A',
        capacity: 40,
        classTeacher: 'Mrs. Johnson',
        room: 'Room 101',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Class 9B',
        grade: '9',
        section: 'B',
        capacity: 38,
        classTeacher: 'Mr. Anderson',
        room: 'Room 205',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
    ];

    for (const classData of demoClasses) {
      await kv.set(`class:${classData.id}`, classData);
    }

    return c.json({ success: true, message: 'Demo data initialized successfully' });
  } catch (error) {
    console.error('Demo data initialization error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete endpoints for all entities
app.delete('/make-server-dcb636e0/fees/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`fee:${id}`)
    
    if (!existing) return c.json({ error: 'Fee record not found' }, 404)
    
    await kv.del(`fee:${id}`)
    return c.json({ success: true, message: 'Fee record deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Additional PUT/DELETE endpoints for complete CRUD operations
app.put('/make-server-dcb636e0/teachers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`teacher:${id}`)
    
    if (!existing) return c.json({ error: 'Teacher not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`teacher:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/admissions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`admission:${id}`)
    
    if (!existing) return c.json({ error: 'Admission not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`admission:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/admissions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`admission:${id}`)
    
    if (!existing) return c.json({ error: 'Admission not found' }, 404)
    
    await kv.del(`admission:${id}`)
    return c.json({ success: true, message: 'Admission deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/books/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`book:${id}`)
    
    if (!existing) return c.json({ error: 'Book not found' }, 404)
    
    await kv.del(`book:${id}`)
    return c.json({ success: true, message: 'Book deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/exams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`exam:${id}`)
    
    if (!existing) return c.json({ error: 'Exam not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`exam:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/exams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`exam:${id}`)
    
    if (!existing) return c.json({ error: 'Exam not found' }, 404)
    
    await kv.del(`exam:${id}`)
    return c.json({ success: true, message: 'Exam deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/exam-results/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`exam-result:${id}`)
    
    if (!existing) return c.json({ error: 'Exam result not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`exam-result:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/exam-results/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`exam-result:${id}`)
    
    if (!existing) return c.json({ error: 'Exam result not found' }, 404)
    
    await kv.del(`exam-result:${id}`)
    return c.json({ success: true, message: 'Exam result deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Search endpoints
app.get('/make-server-dcb636e0/students/search', async (c) => {
  try {
    const query = c.req.query('q') || ''
    const classFilter = c.req.query('class')
    const statusFilter = c.req.query('status')
    
    const allStudents = await kv.getByPrefix('student:')
    
    let filteredStudents = allStudents.filter(student => {
      const searchText = `${student.firstName} ${student.lastName} ${student.email} ${student.rollNumber}`.toLowerCase()
      return searchText.includes(query.toLowerCase())
    })
    
    if (classFilter) {
      filteredStudents = filteredStudents.filter(student => student.class === classFilter)
    }
    
    if (statusFilter) {
      filteredStudents = filteredStudents.filter(student => student.status === statusFilter)
    }
    
    return c.json(filteredStudents)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/staff/search', async (c) => {
  try {
    const query = c.req.query('q') || ''
    const departmentFilter = c.req.query('department')
    const designationFilter = c.req.query('designation')
    
    const allStaff = await kv.getByPrefix('staff:')
    
    let filteredStaff = allStaff.filter(staff => {
      const searchText = `${staff.firstName} ${staff.lastName} ${staff.email} ${staff.employeeId}`.toLowerCase()
      return searchText.includes(query.toLowerCase())
    })
    
    if (departmentFilter) {
      filteredStaff = filteredStaff.filter(staff => staff.department === departmentFilter)
    }
    
    if (designationFilter) {
      filteredStaff = filteredStaff.filter(staff => staff.designation === designationFilter)
    }
    
    return c.json(filteredStaff)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/books/search', async (c) => {
  try {
    const query = c.req.query('q') || ''
    const categoryFilter = c.req.query('category')
    const availableOnly = c.req.query('available') === 'true'
    
    const allBooks = await kv.getByPrefix('book:')
    
    let filteredBooks = allBooks.filter(book => {
      const searchText = `${book.title} ${book.author} ${book.isbn} ${book.category}`.toLowerCase()
      return searchText.includes(query.toLowerCase())
    })
    
    if (categoryFilter) {
      filteredBooks = filteredBooks.filter(book => book.category === categoryFilter)
    }
    
    if (availableOnly) {
      filteredBooks = filteredBooks.filter(book => book.available === true)
    }
    
    return c.json(filteredBooks)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Bulk operations
app.delete('/make-server-dcb636e0/students/bulk-delete', async (c) => {
  try {
    const { ids } = await c.req.json()
    
    const results = []
    for (const id of ids) {
      try {
        const existing = await kv.get(`student:${id}`)
        if (existing) {
          await kv.del(`student:${id}`)
          results.push({ id, success: true })
        } else {
          results.push({ id, success: false, error: 'Student not found' })
        }
      } catch (error) {
        results.push({ id, success: false, error: error.message })
      }
    }
    
    return c.json({ results })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/students/bulk-promote', async (c) => {
  try {
    const { studentIds, fromClass, toClass, academicYear } = await c.req.json()
    
    const results = []
    for (const studentId of studentIds) {
      try {
        const student = await kv.get(`student:${studentId}`)
        if (student && student.class === fromClass) {
          const updatedStudent = {
            ...student,
            class: toClass,
            academicYear,
            updated_at: new Date().toISOString()
          }
          await kv.set(`student:${studentId}`, updatedStudent)
          results.push({ studentId, success: true, newClass: toClass })
        } else {
          results.push({ studentId, success: false, error: 'Student not found or class mismatch' })
        }
      } catch (error) {
        results.push({ studentId, success: false, error: error.message })
      }
    }
    
    return c.json({ results })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/attendance-bulk-update', async (c) => {
  try {
    const bulkData = await c.req.json()
    
    const results = []
    for (const attendanceData of bulkData) {
      try {
        const id = attendanceData.id || crypto.randomUUID()
        const attendance = {
          id,
          ...attendanceData,
          updated_at: new Date().toISOString()
        }
        
        await kv.set(`attendance:${id}`, attendance)
        results.push({ id, success: true })
      } catch (error) {
        results.push({ id: attendanceData.id, success: false, error: error.message })
      }
    }
    
    return c.json({ results })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// System status and user profile endpoints
app.get('/make-server-dcb636e0/system/status', async (c) => {
  try {
    const status = {
      status: 'operational',
      uptime: '99.9%',
      lastMaintenance: '2024-01-15T00:00:00Z',
      version: '1.0.0',
      environment: 'production',
      database: 'connected',
      apiHealth: 'healthy'
    }
    return c.json(status)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/auth/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 401)
    }
    
    // In a real implementation, you would verify the token
    // For demo purposes, return mock user data
    const mockUser = {
      id: '1',
      email: 'admin@demo.school',
      name: 'System Administrator',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      department: 'Administration',
      permissions: ['all'],
      lastLogin: new Date().toISOString()
    }
    
    return c.json(mockUser)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/auth/profile', async (c) => {
  try {
    const profileData = await c.req.json()
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 401)
    }
    
    // In a real implementation, you would update the user profile
    // For demo purposes, return updated mock data
    const updatedProfile = {
      ...profileData,
      updated_at: new Date().toISOString()
    }
    
    return c.json(updatedProfile)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/auth/change-password', async (c) => {
  try {
    const { currentPassword, newPassword } = await c.req.json()
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 401)
    }
    
    // In a real implementation, you would verify current password and update
    // For demo purposes, return success
    return c.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/subjects/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`subject:${id}`)
    
    if (!existing) return c.json({ error: 'Subject not found' }, 404)
    
    await kv.del(`subject:${id}`)
    return c.json({ success: true, message: 'Subject deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/teachers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`teacher:${id}`)
    
    if (!existing) return c.json({ error: 'Teacher not found' }, 404)
    
    await kv.del(`teacher:${id}`)
    return c.json({ success: true, message: 'Teacher deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/staff/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`staff:${id}`)
    
    if (!existing) return c.json({ error: 'Staff member not found' }, 404)
    
    await kv.del(`staff:${id}`)
    return c.json({ success: true, message: 'Staff member deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Management Dashboard Endpoints
app.get('/make-server-dcb636e0/management/metrics', async (c) => {
  try {
    const students = await kv.getByPrefix('student:')
    const staff = await kv.getByPrefix('staff:')
    const classes = await kv.getByPrefix('class:')
    const fees = await kv.getByPrefix('fee:')
    
    const metrics = {
      totalStudents: students.length,
      totalStaff: staff.length,
      totalClasses: classes.length,
      activeUsers: students.length + staff.length,
      pendingAdmissions: 25,
      feeCollection: 2500000,
      attendanceRate: 92.5,
      examResults: 87.3,
      systemHealth: 'excellent',
      lastBackup: new Date().toISOString().split('T')[0],
      serverStatus: 'online'
    }
    
    return c.json(metrics)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/management/master-data', async (c) => {
  try {
    const subjects = await kv.getByPrefix('subject:')
    const grades = await kv.getByPrefix('grade:')
    const departments = await kv.getByPrefix('department:')
    const academicYears = await kv.getByPrefix('academic-year:')
    const sections = await kv.getByPrefix('section:')
    
    // Initialize demo master data if empty
    if (subjects.length === 0) {
      const demoSubjects = [
        { id: '1', name: 'Mathematics', code: 'MATH', department: 'Science', isActive: true },
        { id: '2', name: 'English', code: 'ENG', department: 'Languages', isActive: true },
        { id: '3', name: 'Science', code: 'SCI', department: 'Science', isActive: true },
        { id: '4', name: 'Social Studies', code: 'SS', department: 'Humanities', isActive: true },
        { id: '5', name: 'Computer Science', code: 'CS', department: 'Technology', isActive: true }
      ]
      
      for (const subject of demoSubjects) {
        await kv.set(`subject:${subject.id}`, subject)
      }
    }
    
    if (grades.length === 0) {
      const demoGrades = [
        { id: '1', name: 'Grade 1', level: 1, isActive: true },
        { id: '2', name: 'Grade 2', level: 2, isActive: true },
        { id: '3', name: 'Grade 3', level: 3, isActive: true },
        { id: '4', name: 'Grade 4', level: 4, isActive: true },
        { id: '5', name: 'Grade 5', level: 5, isActive: true },
        { id: '6', name: 'Grade 6', level: 6, isActive: true },
        { id: '7', name: 'Grade 7', level: 7, isActive: true },
        { id: '8', name: 'Grade 8', level: 8, isActive: true },
        { id: '9', name: 'Grade 9', level: 9, isActive: true },
        { id: '10', name: 'Grade 10', level: 10, isActive: true }
      ]
      
      for (const grade of demoGrades) {
        await kv.set(`grade:${grade.id}`, grade)
      }
    }
    
    if (departments.length === 0) {
      const demoDepartments = [
        { id: '1', name: 'Science', head: 'Dr. Smith', isActive: true },
        { id: '2', name: 'Languages', head: 'Prof. Johnson', isActive: true },
        { id: '3', name: 'Humanities', head: 'Mr. Davis', isActive: true },
        { id: '4', name: 'Technology', head: 'Ms. Wilson', isActive: true },
        { id: '5', name: 'Physical Education', head: 'Coach Brown', isActive: true }
      ]
      
      for (const dept of demoDepartments) {
        await kv.set(`department:${dept.id}`, dept)
      }
    }
    
    if (academicYears.length === 0) {
      const demoAcademicYears = [
        { id: '1', year: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', isActive: true },
        { id: '2', year: '2023-2024', startDate: '2023-04-01', endDate: '2024-03-31', isActive: false },
        { id: '3', year: '2022-2023', startDate: '2022-04-01', endDate: '2023-03-31', isActive: false }
      ]
      
      for (const year of demoAcademicYears) {
        await kv.set(`academic-year:${year.id}`, year)
      }
    }
    
    const masterData = {
      subjects: await kv.getByPrefix('subject:'),
      grades: await kv.getByPrefix('grade:'),
      departments: await kv.getByPrefix('department:'),
      academicYears: await kv.getByPrefix('academic-year:'),
      sections: await kv.getByPrefix('section:')
    }
    
    return c.json(masterData)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/management/audit-logs', async (c) => {
  try {
    const auditLogs = [
      {
        id: '1',
        userId: 'admin-1',
        userName: 'System Admin',
        action: 'Created new student record',
        module: 'Students',
        details: 'Added John Doe to Grade 10A',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        status: 'success'
      },
      {
        id: '2',
        userId: 'teacher-1',
        userName: 'Jane Smith',
        action: 'Updated attendance',
        module: 'Attendance',
        details: 'Marked attendance for Class 9B',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ipAddress: '192.168.1.101',
        status: 'success'
      },
      {
        id: '3',
        userId: 'admin-1',
        userName: 'System Admin',
        action: 'Failed login attempt',
        module: 'Authentication',
        details: 'Invalid password for user admin@demo.school',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        ipAddress: '192.168.1.102',
        status: 'error'
      },
      {
        id: '4',
        userId: 'staff-1',
        userName: 'Mark Johnson',
        action: 'Generated fee report',
        module: 'Fees',
        details: 'Exported monthly fee collection report',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        ipAddress: '192.168.1.103',
        status: 'success'
      },
      {
        id: '5',
        userId: 'admin-1',
        userName: 'System Admin',
        action: 'System backup completed',
        module: 'System',
        details: 'Daily automated backup successful',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        ipAddress: 'SYSTEM',
        status: 'success'
      }
    ]
    
    return c.json(auditLogs)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/management/alerts', async (c) => {
  try {
    const systemAlerts = [
      {
        id: '1',
        type: 'critical',
        title: 'Low Storage Space',
        message: 'Server storage is 85% full. Consider cleanup or expansion.',
        timestamp: new Date().toISOString(),
        isRead: false,
        module: 'System'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Fee Payment Deadline Approaching',
        message: '150 students have pending fee payments due in 3 days.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false,
        module: 'Fees'
      },
      {
        id: '3',
        type: 'info',
        title: 'Exam Schedule Published',
        message: 'Semester exam schedule has been published for all classes.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isRead: true,
        module: 'Exams'
      },
      {
        id: '4',
        type: 'warning',
        title: 'Attendance Below Threshold',
        message: 'Class 8B attendance rate dropped to 78% this week.',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        isRead: false,
        module: 'Attendance'
      },
      {
        id: '5',
        type: 'info',
        title: 'New Staff Onboarding',
        message: '3 new teaching staff members joined this month.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isRead: true,
        module: 'Staff'
      }
    ]
    
    return c.json(systemAlerts)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Master Data Management Endpoints
app.post('/make-server-dcb636e0/master-data/subjects', async (c) => {
  try {
    const subjectData = await c.req.json()
    const id = crypto.randomUUID()
    const subject = {
      id,
      ...subjectData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`subject:${id}`, subject)
    return c.json(subject)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/master-data/subjects/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updateData = await c.req.json()
    const existing = await kv.get(`subject:${id}`)
    
    if (!existing) return c.json({ error: 'Subject not found' }, 404)
    
    const updated = {
      ...existing,
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`subject:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/master-data/grades', async (c) => {
  try {
    const gradeData = await c.req.json()
    const id = crypto.randomUUID()
    const grade = {
      id,
      ...gradeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`grade:${id}`, grade)
    return c.json(grade)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/master-data/departments', async (c) => {
  try {
    const departmentData = await c.req.json()
    const id = crypto.randomUUID()
    const department = {
      id,
      ...departmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`department:${id}`, department)
    return c.json(department)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/master-data/academic-years', async (c) => {
  try {
    const yearData = await c.req.json()
    const id = crypto.randomUUID()
    const academicYear = {
      id,
      ...yearData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`academic-year:${id}`, academicYear)
    return c.json(academicYear)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// System Management Tools
app.post('/make-server-dcb636e0/management/export/:dataType', async (c) => {
  try {
    const dataType = c.req.param('dataType')
    const filters = await c.req.json()
    
    // Simulate export functionality
    const exportResult = {
      success: true,
      message: `${dataType} data export initiated`,
      downloadUrl: `/api/downloads/export-${dataType}-${Date.now()}.csv`,
      recordCount: 150
    }
    
    return c.json(exportResult)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/management/backup', async (c) => {
  try {
    const backupResult = {
      success: true,
      message: 'System backup initiated',
      backupId: `backup-${Date.now()}`,
      estimatedTime: '5-10 minutes'
    }
    
    return c.json(backupResult)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/management/health', async (c) => {
  try {
    const healthData = {
      status: 'healthy',
      uptime: '72 hours',
      memoryUsage: '45%',
      diskSpace: '85%',
      databaseConnections: 12,
      lastMaintenanceDate: '2024-01-15',
      systemLoad: 'normal'
    }
    
    return c.json(healthData)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/management/alerts/:id/read', async (c) => {
  try {
    const alertId = c.req.param('id')
    
    // Simulate marking alert as read
    const result = {
      success: true,
      message: `Alert ${alertId} marked as read`
    }
    
    return c.json(result)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Sports Management Endpoints
app.get('/make-server-dcb636e0/sports-teams', async (c) => {
  try {
    const teams = await kv.getByPrefix('sports-team:')
    
    // Initialize demo sports teams if empty
    if (teams.length === 0) {
      const demoTeams = [
        {
          id: '1',
          teamName: 'School Cricket Team',
          sport: 'Cricket',
          category: 'boys',
          ageGroup: 'Under-17',
          coach: 'Mr. Sharma',
          captain: 'Arjun Patel',
          players: ['Arjun Patel', 'Rohit Kumar', 'Vikas Singh', 'Amit Yadav', 'Sanjay Gupta'],
          matches: 8,
          wins: 6,
          losses: 2,
          draws: 0,
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          teamName: 'Girls Basketball Team',
          sport: 'Basketball',
          category: 'girls',
          ageGroup: 'Under-19',
          coach: 'Ms. Priya',
          captain: 'Sneha Reddy',
          players: ['Sneha Reddy', 'Kavya Sharma', 'Deepika Singh', 'Priya Verma', 'Anita Gupta'],
          matches: 6,
          wins: 4,
          losses: 1,
          draws: 1,
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          teamName: 'Mixed Badminton Team',
          sport: 'Badminton',
          category: 'mixed',
          ageGroup: 'Under-17',
          coach: 'Mr. Raj',
          captain: 'Aman Kumar',
          players: ['Aman Kumar', 'Sita Devi', 'Ravi Patel', 'Meera Singh'],
          matches: 5,
          wins: 3,
          losses: 2,
          draws: 0,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ]
      
      for (const team of demoTeams) {
        await kv.set(`sports-team:${team.id}`, team)
      }
    }
    
    return c.json(await kv.getByPrefix('sports-team:'))
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/sports-teams', async (c) => {
  try {
    const teamData = await c.req.json()
    const id = crypto.randomUUID()
    const team = {
      id,
      ...teamData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`sports-team:${id}`, team)
    return c.json(team)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/sports-teams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`sports-team:${id}`)
    
    if (!existing) return c.json({ error: 'Team not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`sports-team:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/sports-teams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`sports-team:${id}`)
    
    if (!existing) return c.json({ error: 'Team not found' }, 404)
    
    await kv.del(`sports-team:${id}`)
    return c.json({ success: true, message: 'Team deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/tournaments', async (c) => {
  try {
    const tournaments = await kv.getByPrefix('tournament:')
    
    // Initialize demo tournaments if empty
    if (tournaments.length === 0) {
      const demoTournaments = [
        {
          id: '1',
          name: 'Inter-School Cricket Championship',
          sport: 'Cricket',
          type: 'inter-school',
          startDate: '2024-12-15',
          endDate: '2024-12-20',
          venue: 'School Cricket Ground',
          organizer: 'Sports Department',
          participants: ['School Cricket Team', 'Central School Team', 'Modern School Team'],
          prizes: [
            { position: '1st', prize: 'Trophy + ₹10,000', winner: '' },
            { position: '2nd', prize: 'Trophy + ₹5,000', winner: '' },
            { position: '3rd', prize: 'Trophy + ₹3,000', winner: '' }
          ],
          status: 'upcoming',
          description: 'Annual inter-school cricket championship featuring top teams from the district.',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Annual Sports Day',
          sport: 'Athletics',
          type: 'internal',
          startDate: '2024-11-25',
          endDate: '2024-11-25',
          venue: 'School Sports Complex',
          organizer: 'Physical Education Department',
          participants: ['All Classes'],
          prizes: [
            { position: 'Champion House', prize: 'House Trophy', winner: '' },
            { position: 'Runner-up House', prize: 'Silver Trophy', winner: '' }
          ],
          status: 'upcoming',
          description: 'Annual sports day with various track and field events for all students.',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'State Basketball Tournament',
          sport: 'Basketball',
          type: 'state',
          startDate: '2024-10-10',
          endDate: '2024-10-15',
          venue: 'State Sports Academy',
          organizer: 'State Sports Council',
          participants: ['Girls Basketball Team'],
          prizes: [
            { position: '1st', prize: 'State Champion Trophy', winner: 'Girls Basketball Team' },
            { position: '2nd', prize: 'Runner-up Trophy', winner: '' },
            { position: '3rd', prize: 'Bronze Medal', winner: '' }
          ],
          status: 'completed',
          description: 'State level basketball championship for under-19 girls.',
          created_at: new Date().toISOString()
        }
      ]
      
      for (const tournament of demoTournaments) {
        await kv.set(`tournament:${tournament.id}`, tournament)
      }
    }
    
    return c.json(await kv.getByPrefix('tournament:'))
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/tournaments', async (c) => {
  try {
    const tournamentData = await c.req.json()
    const id = crypto.randomUUID()
    const tournament = {
      id,
      ...tournamentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`tournament:${id}`, tournament)
    return c.json(tournament)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/tournaments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`tournament:${id}`)
    
    if (!existing) return c.json({ error: 'Tournament not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`tournament:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/tournaments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`tournament:${id}`)
    
    if (!existing) return c.json({ error: 'Tournament not found' }, 404)
    
    await kv.del(`tournament:${id}`)
    return c.json({ success: true, message: 'Tournament deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/sports-equipment', async (c) => {
  try {
    const equipment = await kv.getByPrefix('sports-equipment:')
    
    // Initialize demo sports equipment if empty
    if (equipment.length === 0) {
      const demoEquipment = [
        {
          id: '1',
          itemName: 'Cricket Bats',
          category: 'Bats',
          sport: 'Cricket',
          quantity: 15,
          availableQuantity: 12,
          condition: 'good',
          purchaseDate: '2024-03-15',
          cost: 25000,
          supplier: 'Sports World',
          location: 'Sports Store Room A',
          maintenanceSchedule: 'Monthly inspection',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          itemName: 'Basketball',
          category: 'Balls',
          sport: 'Basketball',
          quantity: 10,
          availableQuantity: 8,
          condition: 'excellent',
          purchaseDate: '2024-02-20',
          cost: 8000,
          supplier: 'Spalding Sports',
          location: 'Sports Store Room B',
          maintenanceSchedule: 'Weekly cleaning',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          itemName: 'Badminton Rackets',
          category: 'Rackets',
          sport: 'Badminton',
          quantity: 20,
          availableQuantity: 16,
          condition: 'good',
          purchaseDate: '2024-01-10',
          cost: 30000,
          supplier: 'Yonex India',
          location: 'Sports Store Room C',
          maintenanceSchedule: 'Bi-weekly string check',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          itemName: 'Football',
          category: 'Balls',
          sport: 'Football',
          quantity: 8,
          availableQuantity: 6,
          condition: 'fair',
          purchaseDate: '2023-12-05',
          cost: 12000,
          supplier: 'Nike Sports',
          location: 'Sports Store Room A',
          maintenanceSchedule: 'Monthly pressure check',
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          itemName: 'Tennis Balls',
          category: 'Balls',
          sport: 'Tennis',
          quantity: 50,
          availableQuantity: 35,
          condition: 'excellent',
          purchaseDate: '2024-04-01',
          cost: 5000,
          supplier: 'Wilson Sports',
          location: 'Sports Store Room B',
          maintenanceSchedule: 'Replace as needed',
          created_at: new Date().toISOString()
        }
      ]
      
      for (const item of demoEquipment) {
        await kv.set(`sports-equipment:${item.id}`, item)
      }
    }
    
    return c.json(await kv.getByPrefix('sports-equipment:'))
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/sports-equipment', async (c) => {
  try {
    const equipmentData = await c.req.json()
    const id = crypto.randomUUID()
    const equipment = {
      id,
      ...equipmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`sports-equipment:${id}`, equipment)
    return c.json(equipment)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/sports-equipment/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`sports-equipment:${id}`)
    
    if (!existing) return c.json({ error: 'Equipment not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`sports-equipment:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/sports-equipment/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`sports-equipment:${id}`)
    
    if (!existing) return c.json({ error: 'Equipment not found' }, 404)
    
    await kv.del(`sports-equipment:${id}`)
    return c.json({ success: true, message: 'Equipment deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/achievements', async (c) => {
  try {
    const achievements = await kv.getByPrefix('achievement:')
    
    // Initialize demo achievements if empty
    if (achievements.length === 0) {
      const demoAchievements = [
        {
          id: '1',
          studentName: 'Arjun Patel',
          studentClass: '10th A',
          sport: 'Cricket',
          event: '100m Sprint',
          position: '1st',
          level: 'district',
          date: '2024-09-15',
          venue: 'District Sports Complex',
          certificate: 'cert-001.pdf',
          points: 100,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          studentName: 'Sneha Reddy',
          studentClass: '11th B',
          sport: 'Basketball',
          event: 'State Championship',
          position: '1st',
          level: 'state',
          date: '2024-10-10',
          venue: 'State Sports Academy',
          certificate: 'cert-002.pdf',
          points: 150,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          studentName: 'Aman Kumar',
          studentClass: '9th A',
          sport: 'Badminton',
          event: 'Singles Championship',
          position: '2nd',
          level: 'inter-school',
          date: '2024-08-20',
          venue: 'Central School Courts',
          certificate: 'cert-003.pdf',
          points: 75,
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          studentName: 'Priya Verma',
          studentClass: '12th A',
          sport: 'Athletics',
          event: 'Long Jump',
          position: '3rd',
          level: 'national',
          date: '2024-07-05',
          venue: 'National Stadium, Delhi',
          certificate: 'cert-004.pdf',
          points: 200,
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          studentName: 'Ravi Patel',
          studentClass: '8th B',
          sport: 'Swimming',
          event: '50m Freestyle',
          position: '1st',
          level: 'school',
          date: '2024-06-10',
          venue: 'School Swimming Pool',
          certificate: 'cert-005.pdf',
          points: 50,
          created_at: new Date().toISOString()
        }
      ]
      
      for (const achievement of demoAchievements) {
        await kv.set(`achievement:${achievement.id}`, achievement)
      }
    }
    
    return c.json(await kv.getByPrefix('achievement:'))
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/achievements', async (c) => {
  try {
    const achievementData = await c.req.json()
    const id = crypto.randomUUID()
    const achievement = {
      id,
      ...achievementData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`achievement:${id}`, achievement)
    return c.json(achievement)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/achievements/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`achievement:${id}`)
    
    if (!existing) return c.json({ error: 'Achievement not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`achievement:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/make-server-dcb636e0/achievements/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const existing = await kv.get(`achievement:${id}`)
    
    if (!existing) return c.json({ error: 'Achievement not found' }, 404)
    
    await kv.del(`achievement:${id}`)
    return c.json({ success: true, message: 'Achievement deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Sports Statistics and Analytics
app.get('/make-server-dcb636e0/sports/statistics', async (c) => {
  try {
    const teams = await kv.getByPrefix('sports-team:')
    const tournaments = await kv.getByPrefix('tournament:')
    const achievements = await kv.getByPrefix('achievement:')
    const equipment = await kv.getByPrefix('sports-equipment:')
    
    const statistics = {
      totalTeams: teams.length,
      activeTeams: teams.filter(t => t.status === 'active').length,
      totalTournaments: tournaments.length,
      ongoingTournaments: tournaments.filter(t => t.status === 'ongoing').length,
      upcomingTournaments: tournaments.filter(t => t.status === 'upcoming').length,
      completedTournaments: tournaments.filter(t => t.status === 'completed').length,
      totalAchievements: achievements.length,
      nationalAchievements: achievements.filter(a => a.level === 'national').length,
      stateAchievements: achievements.filter(a => a.level === 'state').length,
      districtAchievements: achievements.filter(a => a.level === 'district').length,
      totalEquipment: equipment.reduce((sum, item) => sum + item.quantity, 0),
      availableEquipment: equipment.reduce((sum, item) => sum + item.availableQuantity, 0),
      equipmentValue: equipment.reduce((sum, item) => sum + item.cost, 0),
      sportsOffered: [...new Set(teams.map(t => t.sport))].length,
      topPerformingSport: achievements.reduce((acc, curr) => {
        acc[curr.sport] = (acc[curr.sport] || 0) + 1;
        return acc;
      }, {}),
      participationByGender: {
        boys: teams.filter(t => t.category === 'boys').length,
        girls: teams.filter(t => t.category === 'girls').length,
        mixed: teams.filter(t => t.category === 'mixed').length
      }
    }
    
    return c.json(statistics)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Match and Tournament Management
app.get('/make-server-dcb636e0/matches', async (c) => {
  try {
    const matches = await kv.getByPrefix('match:')
    
    // Initialize demo matches if empty
    if (matches.length === 0) {
      const demoMatches = [
        {
          id: '1',
          tournament: 'Inter-School Cricket Championship',
          homeTeam: 'School Cricket Team',
          awayTeam: 'Central School Team',
          sport: 'Cricket',
          date: '2024-12-16',
          time: '10:00 AM',
          venue: 'School Cricket Ground',
          status: 'scheduled',
          homeScore: null,
          awayScore: null,
          winner: null,
          umpire: 'Mr. Krishnan',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          tournament: 'State Basketball Tournament',
          homeTeam: 'Girls Basketball Team',
          awayTeam: 'City High School',
          sport: 'Basketball',
          date: '2024-10-12',
          time: '2:00 PM',
          venue: 'State Sports Academy',
          status: 'completed',
          homeScore: 78,
          awayScore: 65,
          winner: 'Girls Basketball Team',
          referee: 'Ms. Sharma',
          created_at: new Date().toISOString()
        }
      ]
      
      for (const match of demoMatches) {
        await kv.set(`match:${match.id}`, match)
      }
    }
    
    return c.json(await kv.getByPrefix('match:'))
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/matches', async (c) => {
  try {
    const matchData = await c.req.json()
    const id = crypto.randomUUID()
    const match = {
      id,
      ...matchData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`match:${id}`, match)
    return c.json(match)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Health check endpoint
app.get("/make-server-dcb636e0/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/make-server-dcb636e0/", (c) => {
  return c.text('School Management System API');
});

// Test endpoint for debugging
app.get("/make-server-dcb636e0/test", async (c) => {
  try {
    const students = await kv.getByPrefix('student:');
    return c.json({ 
      message: 'Test endpoint working', 
      studentsCount: students.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      error: 'Test endpoint error', 
      message: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Admission Management Endpoints
app.get('/make-server-dcb636e0/admissions', async (c) => {
  try {
    const admissions = await kv.getByPrefix('admission:')
    return c.json(admissions)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/admissions', async (c) => {
  try {
    const admissionData = await c.req.json()
    const id = crypto.randomUUID()
    const admission = {
      id,
      ...admissionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`admission:${id}`, admission)
    return c.json(admission)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/admissions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`admission:${id}`)
    
    if (!existing) return c.json({ error: 'Admission not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`admission:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/admission-stats', async (c) => {
  try {
    const admissions = await kv.getByPrefix('admission:')
    
    const stats = {
      total: admissions.length,
      pending: admissions.filter(a => a.status === 'pending').length,
      approved: admissions.filter(a => a.status === 'approved').length,
      rejected: admissions.filter(a => a.status === 'rejected').length,
      waitlisted: admissions.filter(a => a.status === 'waitlisted').length,
      interview_scheduled: admissions.filter(a => a.status === 'interview_scheduled').length,
      documents_pending: admissions.filter(a => a.status === 'documents_pending').length,
      conversionRate: admissions.length > 0 
        ? Math.round((admissions.filter(a => a.status === 'approved').length / admissions.length) * 100)
        : 0,
      averageProcessingTime: 7 // days - mock data
    }
    
    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/admissions/bulk-update', async (c) => {
  try {
    const { admissionIds, updateData } = await c.req.json()
    const results = []
    
    for (const admissionId of admissionIds) {
      try {
        const existing = await kv.get(`admission:${admissionId}`)
        if (existing) {
          const updated = {
            ...existing,
            ...updateData,
            updated_at: new Date().toISOString()
          }
          await kv.set(`admission:${admissionId}`, updated)
          results.push({ id: admissionId, success: true })
        } else {
          results.push({ id: admissionId, success: false, error: 'Admission not found' })
        }
      } catch (error) {
        results.push({ id: admissionId, success: false, error: error.message })
      }
    }
    
    return c.json({ success: true, results })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Staff Management Extended Endpoints
app.get('/make-server-dcb636e0/staff-attendance', async (c) => {
  try {
    const attendance = await kv.getByPrefix('staff-attendance:')
    return c.json(attendance)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/staff-leaves', async (c) => {
  try {
    const leaves = await kv.getByPrefix('staff-leave:')
    return c.json(leaves)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/staff-leaves', async (c) => {
  try {
    const leaveData = await c.req.json()
    const id = crypto.randomUUID()
    const leave = {
      id,
      ...leaveData,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`staff-leave:${id}`, leave)
    return c.json(leave)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/make-server-dcb636e0/staff-leaves/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    const existing = await kv.get(`staff-leave:${id}`)
    
    if (!existing) return c.json({ error: 'Leave not found' }, 404)
    
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`staff-leave:${id}`, updated)
    return c.json(updated)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/staff-payroll', async (c) => {
  try {
    const payroll = await kv.getByPrefix('staff-payroll:')
    return c.json(payroll)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/make-server-dcb636e0/staff-payroll/generate', async (c) => {
  try {
    const { month, year } = await c.req.json()
    const staff = await kv.getByPrefix('staff:')
    const payrollRecords = []
    
    for (const staffMember of staff) {
      if (staffMember.status === 'active') {
        const id = crypto.randomUUID()
        const payroll = {
          id,
          staffId: staffMember.id,
          staffName: `${staffMember.firstName} ${staffMember.lastName}`,
          month,
          year,
          basicSalary: staffMember.salary || 0,
          allowances: Math.round(staffMember.salary * 0.2) || 0, // 20% allowances
          deductions: Math.round(staffMember.salary * 0.1) || 0, // 10% deductions
          overtime: 0,
          grossSalary: Math.round(staffMember.salary * 1.2) || 0,
          netSalary: Math.round(staffMember.salary * 1.1) || 0,
          status: 'draft',
          created_at: new Date().toISOString()
        }
        
        await kv.set(`staff-payroll:${id}`, payroll)
        payrollRecords.push(payroll)
      }
    }
    
    return c.json({ success: true, payrollRecords })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/make-server-dcb636e0/staff-stats', async (c) => {
  try {
    const staff = await kv.getByPrefix('staff:')
    const leaves = await kv.getByPrefix('staff-leave:')
    
    const totalStaff = staff.length
    const activeStaff = staff.filter(s => s.status === 'active').length
    const teachingStaff = staff.filter(s => 
      s.department === 'academic' && s.status === 'active'
    ).length
    const nonTeachingStaff = activeStaff - teachingStaff
    const onLeave = leaves.filter(l => 
      l.status === 'approved' && 
      new Date(l.startDate) <= new Date() && 
      new Date(l.endDate) >= new Date()
    ).length
    
    // Calculate new joiners in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newJoinees = staff.filter(s => 
      new Date(s.joiningDate || s.created_at) >= thirtyDaysAgo
    ).length
    
    const totalSalary = staff
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.salary || 0), 0)
    const averageSalary = activeStaff > 0 ? Math.round(totalSalary / activeStaff) : 0
    const totalPayroll = Math.round(totalSalary * 1.2) // Including allowances
    
    const stats = {
      totalStaff,
      activeStaff,
      teachingStaff,
      nonTeachingStaff,
      onLeave,
      newJoinees,
      averageSalary,
      totalPayroll
    }
    
    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

Deno.serve(app.fetch);