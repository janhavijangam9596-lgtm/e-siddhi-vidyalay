-- E-Siddhi Vidyalay Database Setup
-- PostgreSQL Database Schema

-- Create database if not exists
-- CREATE DATABASE e_siddhi_school;

-- Use the database
-- \c e_siddhi_school;

-- Drop existing tables to start fresh (be careful in production!)
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS leave_applications CASCADE;
DROP TABLE IF EXISTS fee_payments CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admissions CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Create Users table (for authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    avatar VARCHAR(500),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    academic_year VARCHAR(20),
    class_teacher_id UUID,
    room_number VARCHAR(20),
    capacity INTEGER DEFAULT 40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 1,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Students table
CREATE TABLE students (
    id UUID PRIMARY KEY,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    parent_name VARCHAR(200) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(255),
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    section VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    admission_date DATE,
    academic_year VARCHAR(20),
    blood_group VARCHAR(10),
    religion VARCHAR(50),
    nationality VARCHAR(50),
    emergency_contact VARCHAR(200),
    medical_conditions TEXT,
    previous_school VARCHAR(255),
    house VARCHAR(50),
    transport_route VARCHAR(100),
    fee_category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    joining_date DATE,
    department VARCHAR(100),
    designation VARCHAR(100),
    employment_type VARCHAR(50),
    salary DECIMAL(10, 2),
    qualification TEXT,
    experience INTEGER,
    subjects_taught TEXT[],
    classes_assigned TEXT[],
    blood_group VARCHAR(10),
    marital_status VARCHAR(20),
    reporting_manager VARCHAR(200),
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    aadhar_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID,
    due_date DATE,
    total_marks INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assignment Submissions table
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    submission_text TEXT,
    submission_file VARCHAR(500),
    submitted_at TIMESTAMP,
    marks_obtained INTEGER,
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Leave Applications table
CREATE TABLE leave_applications (
    id UUID PRIMARY KEY,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    leave_type VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by UUID,
    approved_date TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Fee Payments table
CREATE TABLE fee_payments (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    fee_type VARCHAR(100),
    academic_year VARCHAR(20),
    month VARCHAR(20),
    status VARCHAR(20) DEFAULT 'completed',
    receipt_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Events table
CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    type VARCHAR(50),
    location VARCHAR(255),
    created_by UUID,
    participants TEXT[],
    status VARCHAR(20) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Admissions table
CREATE TABLE admissions (
    id UUID PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    parent_name VARCHAR(200) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(255),
    previous_school VARCHAR(255),
    class_applied_for VARCHAR(50),
    entrance_test_score INTEGER,
    interview_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create System Settings table
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    school_name VARCHAR(255),
    school_code VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    principal_name VARCHAR(200),
    principal_email VARCHAR(255),
    established_year VARCHAR(10),
    affiliation VARCHAR(255),
    logo VARCHAR(500),
    academic_year_start VARCHAR(20),
    academic_year_end VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignments_subject ON assignments(subject_id);
CREATE INDEX idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_admissions_status ON admissions(status);

-- Insert default system settings
INSERT INTO system_settings (
    school_name, school_code, established_year, email
) VALUES (
    'E-Siddhi Vidyalay', 'ESV001', '2020', 'info@esiddhividyalay.edu'
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (
    id, email, password_hash, name, role
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@esiddhividyalay.edu',
    '$2a$10$YourHashedPasswordHere', -- You'll need to generate this
    'Admin User',
    'admin'
);

-- Insert sample classes
INSERT INTO classes (id, name, section, academic_year, room_number, capacity) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '1st', 'A', '2024-25', '101', 30),
    ('550e8400-e29b-41d4-a716-446655440002', '2nd', 'A', '2024-25', '102', 30),
    ('550e8400-e29b-41d4-a716-446655440003', '3rd', 'A', '2024-25', '201', 35),
    ('550e8400-e29b-41d4-a716-446655440004', '4th', 'A', '2024-25', '202', 35),
    ('550e8400-e29b-41d4-a716-446655440005', '5th', 'A', '2024-25', '301', 40),
    ('550e8400-e29b-41d4-a716-446655440006', '6th', 'A', '2024-25', '302', 40),
    ('550e8400-e29b-41d4-a716-446655440007', '7th', 'A', '2024-25', '401', 40),
    ('550e8400-e29b-41d4-a716-446655440008', '8th', 'A', '2024-25', '402', 40),
    ('550e8400-e29b-41d4-a716-446655440009', '9th', 'A', '2024-25', '501', 45),
    ('550e8400-e29b-41d4-a716-446655440010', '10th', 'A', '2024-25', '502', 45);

-- Insert sample subjects
INSERT INTO subjects (id, name, code, description, department) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'MATH-01', 'Basic and Advanced Mathematics', 'Mathematics'),
    ('650e8400-e29b-41d4-a716-446655440002', 'Science', 'SCI-01', 'General Science', 'Science'),
    ('650e8400-e29b-41d4-a716-446655440003', 'English', 'ENG-01', 'English Language and Literature', 'Languages'),
    ('650e8400-e29b-41d4-a716-446655440004', 'Hindi', 'HIN-01', 'Hindi Language and Literature', 'Languages'),
    ('650e8400-e29b-41d4-a716-446655440005', 'Social Studies', 'SOC-01', 'History, Geography, Civics', 'Social Sciences'),
    ('650e8400-e29b-41d4-a716-446655440006', 'Computer Science', 'CS-01', 'Basic Computer Education', 'Technology'),
    ('650e8400-e29b-41d4-a716-446655440007', 'Physical Education', 'PE-01', 'Sports and Physical Activities', 'Sports'),
    ('650e8400-e29b-41d4-a716-446655440008', 'Art & Craft', 'ART-01', 'Drawing, Painting, Craft', 'Arts');

-- Insert sample staff
INSERT INTO staff (
    id, employee_id, first_name, last_name, email, phone,
    department, designation, employment_type, joining_date, status
) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', 'EMP001', 'John', 'Smith', 'john.smith@school.edu', '9876543210',
     'Teaching', 'Senior Teacher', 'full-time', '2020-04-01', 'active'),
    ('750e8400-e29b-41d4-a716-446655440002', 'EMP002', 'Sarah', 'Johnson', 'sarah.j@school.edu', '9876543211',
     'Teaching', 'Teacher', 'full-time', '2021-06-15', 'active'),
    ('750e8400-e29b-41d4-a716-446655440003', 'EMP003', 'Michael', 'Brown', 'michael.b@school.edu', '9876543212',
     'Administration', 'Office Manager', 'full-time', '2020-01-10', 'active');

-- Insert sample students
INSERT INTO students (
    id, roll_number, first_name, last_name, email, phone,
    parent_name, parent_phone, class_id, section, status,
    admission_date, academic_year
) VALUES
    ('850e8400-e29b-41d4-a716-446655440001', '2024001', 'Raj', 'Kumar', 'raj.kumar@student.edu', '9876543220',
     'Mr. Kumar Singh', '9876543221', '550e8400-e29b-41d4-a716-446655440010', 'A', 'active',
     '2024-04-01', '2024-25'),
    ('850e8400-e29b-41d4-a716-446655440002', '2024002', 'Priya', 'Sharma', 'priya.s@student.edu', '9876543222',
     'Mr. Sharma', '9876543223', '550e8400-e29b-41d4-a716-446655440010', 'A', 'active',
     '2024-04-01', '2024-25'),
    ('850e8400-e29b-41d4-a716-446655440003', '2024003', 'Amit', 'Patel', 'amit.p@student.edu', '9876543224',
     'Mr. Patel', '9876543225', '550e8400-e29b-41d4-a716-446655440009', 'A', 'active',
     '2024-04-01', '2024-25');

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

COMMENT ON TABLE users IS 'User authentication and profile information';
COMMENT ON TABLE students IS 'Student records and information';
COMMENT ON TABLE staff IS 'Staff and teacher records';
COMMENT ON TABLE classes IS 'Class/grade information';
COMMENT ON TABLE subjects IS 'Subject/course information';
COMMENT ON TABLE assignments IS 'Student assignments and homework';
COMMENT ON TABLE admissions IS 'Admission applications and processing';
COMMENT ON TABLE system_settings IS 'School-wide system configuration';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
-- SELECT 'Database setup completed successfully!' as message;