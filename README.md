# E-Siddhi Vidyalay - School Management System

A comprehensive school management system built with React, TypeScript, and PostgreSQL.
Original Figma design: https://www.figma.com/design/9l2U5itiq4x3UzKlKjobgF/Homepage-Design

## 🚀 Quick Start

```powershell
# Windows PowerShell - Complete Setup
.\setup-project.ps1

# Or manual setup:
npm install
npm install bcryptjs jsonwebtoken multer json2csv exceljs pdfkit nodemailer express-rate-limit
npm install -D nodemon concurrently
```

## 🎯 All Issues Fixed

✅ **Profile Settings** - System Setting Error resolved  
✅ **Students Module**
   - Fixed "*6 students" display issue
   - Added smooth scroll for Add Student
   - Enabled class binding to available classes
   - Academic Year selection working
   - Refresh button reloads data from database
   - Full CRUD operations implemented

✅ **Staff Module**
   - Apply Leave with authentication
   - Refresh button working
   - Calendar display and sync
   - Staff Directory data fetch

✅ **Export Feature** - CSV/Excel/PDF export working  
✅ **Admissions** - Refresh button functional  
✅ **Classes** - Refresh button functional  
✅ **Subjects** - All action buttons working  
✅ **Assignments** - Add/View/Delete functionality  
✅ **Loading States** - Added across all modules  
✅ **Authentication** - JWT-based auth with rate limiting  

## 📋 Features

- **Student Management** - Complete student lifecycle management
- **Staff Management** - Employee records and leave management
- **Class Management** - Class/section organization
- **Subject Management** - Curriculum management
- **Assignment Management** - Create, submit, grade assignments
- **Admission Processing** - Online applications
- **Fee Management** - Payment tracking
- **Attendance Tracking** - Daily attendance
- **Events Calendar** - School events management
- **Data Export** - CSV, Excel, PDF formats
- **Authentication** - Secure JWT-based auth
- **Rate Limiting** - Protection against abuse

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Auth**: JWT, bcrypt
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Export**: json2csv, ExcelJS, PDFKit

## 💾 Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE e_siddhi_school;"

# Run setup script
psql -U postgres -d e_siddhi_school -f database-setup.sql

# Create admin user
node create-admin.js
```

## 🚀 Running the Application

### Development
```bash
# Option 1: Run both together
npm start

# Option 2: Run separately
npm run server  # Terminal 1
npm run dev     # Terminal 2

# Option 3: Windows
run-dev.bat
```

### Production
```bash
npm run build
NODE_ENV=production node enhanced-server.js
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/change-password` - Change password

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/analytics` - Analytics data
- `POST /api/students/bulk-upload` - Bulk import

### Staff
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff
- `POST /api/staff/leave` - Apply for leave

### Classes & Subjects
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `GET /api/subjects` - List subjects
- `POST /api/subjects` - Create subject

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `POST /api/assignments/:id/submit` - Submit assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Other
- `POST /api/export` - Export data
- `GET /api/events` - List events
- `GET /api/dashboard/stats` - Dashboard stats
- `GET /api/settings` - System settings

## 🔒 Security Features

- **Rate Limiting**:
  - General: 100 requests/15 min/IP
  - Auth: 5 attempts/15 min/IP
  - Registration: 3 attempts/hour/IP
- **JWT Authentication** with 24hr expiry
- **Bcrypt** password hashing
- **CORS** protection
- **Input validation**
- **SQL injection protection**

## 📁 Project Structure

```
Homepage Design/
├── src/
│   ├── components/
│   │   ├── modules/     # Feature modules
│   │   └── ui/          # UI components
│   └── utils/           # Utilities
├── enhanced-server.js   # Backend server
├── database-setup.sql   # DB schema
├── setup-project.ps1    # Setup script
└── package.json
```

## 🐛 Troubleshooting

### Database Connection
```bash
# Check PostgreSQL service
sc query postgresql-x64-14

# Test connection
psql -U postgres -d e_siddhi_school
```

### Port Issues
```bash
# Find process on port 3005
netstat -ano | findstr :3005

# Kill process
taskkill /PID <pid> /F
```

### Module Errors
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

```env
VITE_DATABASE_URL=postgresql://postgres:root@localhost:5432/e_siddhi_school
PORT=3005
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 👤 Default Credentials

- **Email**: admin@esiddhividyalay.edu
- **Password**: admin123

## 📞 Support

For issues or questions:
- Email: support@esiddhividyalay.edu
- Create an issue on GitHub

## 📄 License

Proprietary - E-Siddhi Vidyalay © 2024
