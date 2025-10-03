# E-Siddhi Vidyalay Setup Script
# PowerShell script to install dependencies and set up the project

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  E-Siddhi Vidyalay Project Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nNode.js version:" -ForegroundColor Green
node --version

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host "npm version:" -ForegroundColor Green
npm --version

# Check if PostgreSQL is installed (psql command)
$psqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlInstalled) {
    Write-Host "`nWarning: PostgreSQL (psql) not found in PATH." -ForegroundColor Yellow
    Write-Host "Please ensure PostgreSQL is installed and added to PATH." -ForegroundColor Yellow
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
} else {
    Write-Host "`nPostgreSQL (psql) found." -ForegroundColor Green
}

# Install project dependencies
Write-Host "`n==== Installing Project Dependencies ====" -ForegroundColor Cyan

Write-Host "`n1. Installing existing package.json dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n2. Installing server dependencies..." -ForegroundColor Yellow
npm install bcryptjs jsonwebtoken multer json2csv exceljs pdfkit nodemailer express-rate-limit

Write-Host "`n3. Installing development tools..." -ForegroundColor Yellow
npm install -D nodemon concurrently

# Create necessary directories
Write-Host "`n==== Creating Project Directories ====" -ForegroundColor Cyan

$directories = @(
    "uploads",
    "uploads/students",
    "uploads/staff",
    "uploads/assignments",
    "uploads/certificates",
    "logs",
    "backups"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "Directory exists: $dir" -ForegroundColor Gray
    }
}

# Create environment file
Write-Host "`n==== Setting up Environment Variables ====" -ForegroundColor Cyan

$envFile = ".env"
if (-not (Test-Path $envFile)) {
    $envContent = @"
# Database Configuration
VITE_DATABASE_URL=postgresql://postgres:root@localhost:5432/e_siddhi_school
DATABASE_URL=postgresql://postgres:root@localhost:5432/e_siddhi_school

# Server Configuration
PORT=3005
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-$(Get-Random)

# Email Configuration (Update with your email settings)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads

# Frontend URL
FRONTEND_URL=http://localhost:5173

# API URL
VITE_API_URL=http://localhost:3005/api
"@
    Set-Content -Path $envFile -Value $envContent
    Write-Host "Created .env file with default configuration" -ForegroundColor Green
    Write-Host "Please update the .env file with your actual credentials!" -ForegroundColor Yellow
} else {
    Write-Host ".env file already exists" -ForegroundColor Gray
}

# Database Setup
Write-Host "`n==== Database Setup ====" -ForegroundColor Cyan

if ($psqlInstalled) {
    $setupDB = Read-Host "Do you want to set up the PostgreSQL database now? (y/n)"
    if ($setupDB -eq 'y') {
        Write-Host "`nPlease enter PostgreSQL credentials:" -ForegroundColor Yellow
        $pgUser = Read-Host "PostgreSQL username (default: postgres)"
        if ([string]::IsNullOrEmpty($pgUser)) { $pgUser = "postgres" }
        
        Write-Host "`nCreating database and tables..." -ForegroundColor Yellow
        
        # First create the database if it doesn't exist
        psql -U $pgUser -c "CREATE DATABASE e_siddhi_school;" 2>$null
        
        # Then run the setup script
        psql -U $pgUser -d e_siddhi_school -f database-setup.sql
        
        if ($?) {
            Write-Host "Database setup completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Database setup encountered errors. Please check and run manually if needed." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`nSkipping database setup (PostgreSQL not found)" -ForegroundColor Yellow
    Write-Host "To set up the database later, run:" -ForegroundColor Gray
    Write-Host "  psql -U postgres -d e_siddhi_school -f database-setup.sql" -ForegroundColor Gray
}

# Create a test admin user script
Write-Host "`n==== Creating Helper Scripts ====" -ForegroundColor Cyan

$createAdminScript = @"
// create-admin.js
// Script to create an admin user with hashed password

import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/e_siddhi_school'
});

async function createAdmin() {
  try {
    const email = 'admin@esiddhividyalay.edu';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role) 
       VALUES ('550e8400-e29b-41d4-a716-446655440000', `$1, `$2, 'Admin User', 'admin')
       ON CONFLICT (id) DO UPDATE 
       SET password_hash = `$2`,
           updated_at = NOW()`,
      [email, hashedPassword]
    );
    
    console.log('Admin user created/updated successfully!');
    console.log('Email: admin@esiddhividyalay.edu');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
"@

Set-Content -Path "create-admin.js" -Value $createAdminScript
Write-Host "Created create-admin.js script" -ForegroundColor Green

# Create run scripts
$runDevScript = @"
@echo off
echo Starting E-Siddhi Vidyalay Development Environment...
echo.
echo Starting backend server on http://localhost:3005
start cmd /k "npm run server"
echo.
timeout /t 3 /nobreak > nul
echo Starting frontend on http://localhost:5173
npm run dev
"@

Set-Content -Path "run-dev.bat" -Value $runDevScript
Write-Host "Created run-dev.bat script for Windows" -ForegroundColor Green

# Summary
Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Update the .env file with your actual credentials" -ForegroundColor White
Write-Host "2. Ensure PostgreSQL is running" -ForegroundColor White
Write-Host "3. Create an admin user: node create-admin.js" -ForegroundColor White
Write-Host "4. Start the development environment:" -ForegroundColor White
Write-Host "   - Option 1: npm start (runs both server and frontend)" -ForegroundColor Gray
Write-Host "   - Option 2: run-dev.bat (Windows)" -ForegroundColor Gray
Write-Host "   - Option 3: Run separately:" -ForegroundColor Gray
Write-Host "     Terminal 1: npm run server" -ForegroundColor Gray
Write-Host "     Terminal 2: npm run dev" -ForegroundColor Gray

Write-Host "`nDefault Admin Credentials (after running create-admin.js):" -ForegroundColor Yellow
Write-Host "  Email: admin@esiddhividyalay.edu" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White

Write-Host "`nAccess the application at:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API: http://localhost:3005/api" -ForegroundColor White

Write-Host "`n==============================================" -ForegroundColor Cyan