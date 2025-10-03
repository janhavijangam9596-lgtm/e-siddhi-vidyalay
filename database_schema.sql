-- eSiddhi Vidyalay Database Schema
-- Database: e_siddhi_school

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- CORE TABLES
-- ===========================================

-- Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    head VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id UUID REFERENCES departments(id),
    teacher_id UUID, -- Will reference staff later
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff/Teachers
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    designation VARCHAR(100),
    department_id UUID REFERENCES departments(id),
    subject_id UUID REFERENCES subjects(id),
    date_of_joining DATE,
    qualification VARCHAR(200),
    experience VARCHAR(50),
    salary DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update subjects to reference staff
ALTER TABLE subjects ADD CONSTRAINT fk_subjects_teacher
FOREIGN KEY (teacher_id) REFERENCES staff(id);

-- Classes
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    section VARCHAR(5) NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id),
    class_teacher_id UUID REFERENCES staff(id),
    capacity INTEGER DEFAULT 40,
    room_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, academic_year_id)
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(15),
    parent_email VARCHAR(100),
    class_id UUID REFERENCES classes(id),
    status VARCHAR(20) DEFAULT 'active',
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- ACADEMIC MANAGEMENT
-- ===========================================

-- Class Subjects (Many-to-Many relationship)
CREATE TABLE class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES staff(id),
    periods_per_week INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id)
);

-- Timetable
CREATE TABLE timetable_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES staff(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    period_number INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, day_of_week, period_number)
);

-- Attendance
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'present', -- present, absent, late, excused
    check_in_time TIME,
    check_out_time TIME,
    marked_by UUID REFERENCES staff(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, date)
);

-- Exams
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    exam_type VARCHAR(50) NOT NULL, -- midterm, final, quiz, assignment
    total_marks DECIMAL(5,2) NOT NULL,
    passing_marks DECIMAL(5,2),
    exam_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    room_number VARCHAR(20),
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Results
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2) NOT NULL,
    grade VARCHAR(5),
    remarks TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_id)
);

-- ===========================================
-- FINANCIAL MANAGEMENT
-- ===========================================

-- Fee Structures
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id),
    class_id UUID REFERENCES classes(id),
    tuition_fee DECIMAL(10,2) DEFAULT 0,
    development_fee DECIMAL(10,2) DEFAULT 0,
    exam_fee DECIMAL(10,2) DEFAULT 0,
    library_fee DECIMAL(10,2) DEFAULT 0,
    sports_fee DECIMAL(10,2) DEFAULT 0,
    transport_fee DECIMAL(10,2) DEFAULT 0,
    other_fees DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    installments INTEGER DEFAULT 1,
    due_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fee Payments
CREATE TABLE fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES fee_structures(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50), -- cash, online, cheque, card
    transaction_id VARCHAR(100),
    installment_number INTEGER,
    academic_year_id UUID REFERENCES academic_years(id),
    collected_by UUID REFERENCES staff(id),
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'paid', -- paid, pending, failed, refunded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts/Charts of Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number VARCHAR(50) UNIQUE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- asset, liability, equity, income, expense
    category VARCHAR(50), -- current_asset, fixed_asset, current_liability, etc.
    balance DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT true,
    parent_account_id UUID REFERENCES accounts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- income, expense, transfer
    category VARCHAR(50),
    account_id UUID NOT NULL REFERENCES accounts(id),
    reference_account_id UUID REFERENCES accounts(id), -- for transfers
    payment_method VARCHAR(50), -- cash, bank_transfer, cheque, card, online
    transaction_id VARCHAR(100), -- bank transaction ID
    recorded_by UUID REFERENCES staff(id),
    attachments TEXT[], -- file paths/URLs
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- LIBRARY MANAGEMENT
-- ===========================================

-- Books
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    category VARCHAR(50),
    publisher VARCHAR(100),
    edition VARCHAR(50),
    publication_year INTEGER,
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    location VARCHAR(50), -- shelf/section location
    price DECIMAL(8,2),
    condition VARCHAR(20) DEFAULT 'good', -- excellent, good, fair, poor
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Borrowings
CREATE TABLE book_borrowings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'borrowed', -- borrowed, returned, overdue, lost
    issued_by UUID REFERENCES staff(id),
    returned_to UUID REFERENCES staff(id),
    fine_amount DECIMAL(6,2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK ((student_id IS NOT NULL AND staff_id IS NULL) OR (student_id IS NULL AND staff_id IS NOT NULL))
);

-- ===========================================
-- TRANSPORT MANAGEMENT
-- ===========================================

-- Routes
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(100) NOT NULL,
    route_code VARCHAR(20) UNIQUE,
    start_location VARCHAR(100) NOT NULL,
    end_location VARCHAR(100) NOT NULL,
    total_distance DECIMAL(6,2), -- in km
    estimated_time INTEGER, -- in minutes
    fare DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route Stops
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    pickup_time TIME,
    drop_time TIME,
    landmark VARCHAR(200),
    stop_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_id, stop_order)
);

-- Vehicles/Buses
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) DEFAULT 'bus',
    capacity INTEGER NOT NULL,
    current_students INTEGER DEFAULT 0,
    driver_id UUID REFERENCES staff(id),
    attendant_id UUID REFERENCES staff(id),
    route_id UUID REFERENCES routes(id),
    status VARCHAR(20) DEFAULT 'active', -- active, maintenance, inactive
    gps_enabled BOOLEAN DEFAULT false,
    last_service_date DATE,
    next_service_date DATE,
    fuel_efficiency DECIMAL(4,2), -- km per liter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Transport Assignments
CREATE TABLE student_transport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES routes(id),
    stop_id UUID REFERENCES route_stops(id),
    vehicle_id UUID REFERENCES vehicles(id),
    pickup_time TIME,
    drop_time TIME,
    monthly_fee DECIMAL(8,2),
    fee_status VARCHAR(20) DEFAULT 'pending', -- paid, pending, overdue
    parent_contact VARCHAR(15),
    emergency_contact VARCHAR(15),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id)
);

-- ===========================================
-- HOSTEL MANAGEMENT
-- ===========================================

-- Hostels
CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_name VARCHAR(100) NOT NULL,
    hostel_type VARCHAR(20) NOT NULL, -- boys, girls, mixed
    address TEXT NOT NULL,
    contact_number VARCHAR(15),
    email VARCHAR(100),
    warden_id UUID REFERENCES staff(id),
    total_rooms INTEGER NOT NULL,
    occupied_rooms INTEGER DEFAULT 0,
    total_beds INTEGER NOT NULL,
    occupied_beds INTEGER DEFAULT 0,
    facilities TEXT[], -- array of facilities
    rules TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Rooms
CREATE TABLE hostel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    floor_number INTEGER,
    room_type VARCHAR(50), -- single, double, triple, dormitory
    capacity INTEGER NOT NULL,
    occupied INTEGER DEFAULT 0,
    facilities TEXT[],
    monthly_rent DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'available', -- available, occupied, maintenance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hostel_id, room_number)
);

-- Hostel Allocations
CREATE TABLE hostel_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    hostel_id UUID NOT NULL REFERENCES hostels(id),
    room_id UUID NOT NULL REFERENCES hostel_rooms(id),
    allocation_date DATE DEFAULT CURRENT_DATE,
    expected_checkout DATE,
    actual_checkout DATE,
    security_deposit DECIMAL(8,2),
    monthly_rent DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'active', -- active, checked_out, terminated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, allocation_date)
);

-- ===========================================
-- COMMUNICATION MANAGEMENT
-- ===========================================

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general', -- general, urgent, event, holiday, exam
    audience VARCHAR(50) DEFAULT 'all', -- all, students, parents, staff, specific
    target_groups UUID[], -- array of group IDs if audience is specific
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    publish_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    attachments TEXT[], -- file paths/URLs
    status VARCHAR(20) DEFAULT 'published', -- draft, published, expired
    created_by UUID REFERENCES staff(id),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES staff(id),
    recipient_ids UUID[], -- array of recipient IDs
    recipient_type VARCHAR(50) DEFAULT 'individual', -- individual, group, class, all
    message_type VARCHAR(20) DEFAULT 'email', -- email, sms, push, text
    status VARCHAR(20) DEFAULT 'sent', -- draft, sent, delivered, failed
    scheduled_time TIMESTAMP,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message Templates
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'announcement', -- announcement, message, notification
    category VARCHAR(50) DEFAULT 'general',
    variables TEXT[], -- array of variable names
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- HEALTH & MEDICAL RECORDS
-- ===========================================

-- Health Records
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    record_date DATE DEFAULT CURRENT_DATE,
    record_type VARCHAR(50) NOT NULL, -- checkup, illness, injury, vaccination
    description TEXT,
    diagnosis TEXT,
    treatment TEXT,
    prescribed_medication TEXT,
    doctor_name VARCHAR(100),
    hospital_name VARCHAR(100),
    follow_up_date DATE,
    attachments TEXT[],
    recorded_by UUID REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vaccinations
CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    vaccination_name VARCHAR(100) NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    batch_number VARCHAR(50),
    administered_by VARCHAR(100),
    side_effects TEXT,
    status VARCHAR(20) DEFAULT 'completed', -- scheduled, completed, missed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- SPORTS MANAGEMENT
-- ===========================================

-- Sports
CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- indoor, outdoor, team, individual
    team_size INTEGER,
    equipment TEXT[],
    season VARCHAR(50), -- all_year, winter, summer, monsoon
    coach_id UUID REFERENCES staff(id),
    description TEXT,
    rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sports Teams
CREATE TABLE sports_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    team_name VARCHAR(100) NOT NULL,
    coach_id UUID REFERENCES staff(id),
    captain_id UUID REFERENCES students(id),
    max_players INTEGER,
    current_players INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Players
CREATE TABLE team_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES sports_teams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    position VARCHAR(50),
    jersey_number INTEGER,
    joined_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, student_id)
);

-- Sports Events/Tournaments
CREATE TABLE sports_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    sport_id UUID NOT NULL REFERENCES sports(id),
    event_type VARCHAR(50) DEFAULT 'tournament', -- tournament, match, practice, championship
    venue VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE,
    registration_deadline DATE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
    prizes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sports Achievements
CREATE TABLE sports_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id),
    event_id UUID REFERENCES sports_events(id),
    achievement VARCHAR(200) NOT NULL, -- e.g., "Gold Medal", "Best Player"
    position INTEGER, -- 1 for first, 2 for second, etc.
    level VARCHAR(50), -- school, district, state, national, international
    date DATE NOT NULL,
    points INTEGER DEFAULT 0,
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INVENTORY MANAGEMENT
-- ===========================================

-- Inventory Items
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(100) NOT NULL,
    item_code VARCHAR(50) UNIQUE,
    category VARCHAR(50),
    description TEXT,
    unit_of_measurement VARCHAR(20), -- pieces, kg, liters, etc.
    minimum_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    unit_price DECIMAL(8,2),
    supplier_id UUID, -- Will reference suppliers table
    location VARCHAR(100), -- storage location
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, discontinued, out_of_stock
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(15),
    address TEXT,
    gst_number VARCHAR(20),
    payment_terms VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update inventory items to reference suppliers
ALTER TABLE inventory_items ADD CONSTRAINT fk_inventory_supplier
FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

-- Stock Transactions
CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- in (purchase/receipt), out (issue/consumption), adjustment
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(8,2),
    total_value DECIMAL(10,2),
    reference_number VARCHAR(100), -- PO number, invoice number, etc.
    supplier_id UUID REFERENCES suppliers(id),
    department_id UUID REFERENCES departments(id),
    requested_by UUID REFERENCES staff(id),
    approved_by UUID REFERENCES staff(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    total_amount DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, ordered, received, cancelled
    requested_by UUID REFERENCES staff(id),
    approved_by UUID REFERENCES staff(id),
    received_by UUID REFERENCES staff(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, received, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- CERTIFICATE MANAGEMENT
-- ===========================================

-- Certificate Templates
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- academic, sports, conduct, etc.
    content TEXT NOT NULL, -- HTML/template content
    background_image VARCHAR(500), -- image URL/path
    signature_fields JSONB, -- JSON array of signature positions
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates Issued
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    template_id UUID NOT NULL REFERENCES certificate_templates(id),
    student_id UUID REFERENCES students(id),
    staff_id UUID REFERENCES staff(id),
    issue_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    issued_by UUID NOT NULL REFERENCES staff(id),
    authorized_by UUID REFERENCES staff(id),
    certificate_data JSONB, -- dynamic data for template
    status VARCHAR(20) DEFAULT 'active', -- active, revoked, expired
    download_count INTEGER DEFAULT 0,
    qr_code VARCHAR(500), -- QR code URL for verification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK ((student_id IS NOT NULL AND staff_id IS NULL) OR (student_id IS NULL AND staff_id IS NOT NULL))
);

-- ===========================================
-- ALUMNI MANAGEMENT
-- ===========================================

-- Alumni Records
CREATE TABLE alumni (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id), -- link to original student record
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(15),
    graduation_year INTEGER,
    course VARCHAR(100),
    current_occupation VARCHAR(100),
    current_organization VARCHAR(100),
    location VARCHAR(100),
    linkedin_profile VARCHAR(200),
    achievements TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alumni Jobs/Opportunities
CREATE TABLE alumni_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    job_type VARCHAR(50), -- full_time, part_time, internship, contract
    salary_range VARCHAR(50),
    description TEXT,
    requirements TEXT,
    application_deadline DATE,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(15),
    posted_by UUID REFERENCES alumni(id),
    status VARCHAR(20) DEFAULT 'active', -- active, filled, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- BIRTHDAY MANAGEMENT
-- ===========================================

-- Birthday Events
CREATE TABLE birthday_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_type VARCHAR(20) NOT NULL, -- student, staff, parent
    person_id UUID NOT NULL, -- references students(id) or staff(id)
    event_date DATE NOT NULL,
    event_type VARCHAR(50) DEFAULT 'birthday', -- birthday, work_anniversary
    celebration_date DATE,
    theme VARCHAR(100),
    venue VARCHAR(100),
    budget DECIMAL(8,2),
    organized_by UUID REFERENCES staff(id),
    status VARCHAR(20) DEFAULT 'planned', -- planned, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Birthday Wishes
CREATE TABLE birthday_wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES birthday_events(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL, -- references students(id) or staff(id)
    sender_type VARCHAR(20) NOT NULL, -- student, staff
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- SYSTEM MANAGEMENT
-- ===========================================

-- Users (for authentication - separate from staff/students)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- admin, teacher, student, accountant, librarian
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles (extends users table)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(15),
    avatar VARCHAR(500), -- image URL
    preferences JSONB, -- user preferences/settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    category VARCHAR(50),
    is_system BOOLEAN DEFAULT false, -- system settings cannot be deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- table name
    entity_id UUID, -- record ID
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===========================================
-- INITIAL DATA
-- ===========================================

-- Insert default academic year
INSERT INTO academic_years (year, start_date, end_date, is_active) VALUES
('2024-2025', '2024-04-01', '2025-03-31', true);

-- Insert default departments
INSERT INTO departments (name, head, description) VALUES
('Science', 'Dr. Smith', 'Mathematics, Physics, Chemistry, Biology'),
('Languages', 'Prof. Johnson', 'English, Hindi, Regional Languages'),
('Humanities', 'Mr. Davis', 'History, Geography, Civics'),
('Arts', 'Ms. Wilson', 'Drawing, Music, Dance'),
('Physical Education', 'Coach Brown', 'Sports and Physical Training');

-- Insert default admin user
INSERT INTO users (email, password_hash, role) VALUES
('admin@e-siddhi.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'); -- password: admin123

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, is_system) VALUES
('school_name', 'eSiddhi Vidyalay', 'string', 'general', true),
('school_address', 'Mumbai, Maharashtra, India', 'string', 'general', true),
('academic_year_start', 'April', 'string', 'academic', true),
('currency', 'INR', 'string', 'financial', true),
('timezone', 'Asia/Kolkata', 'string', 'system', true);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(class_teacher_id);

-- Academic indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance_records(class_id, date);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_date ON fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);

-- Library indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_book_borrowings_student ON book_borrowings(student_id);
CREATE INDEX IF NOT EXISTS idx_book_borrowings_book ON book_borrowings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_borrowings_status ON book_borrowings(status);

-- Transport indexes
CREATE INDEX IF NOT EXISTS idx_student_transport_student ON student_transport(student_id);
CREATE INDEX IF NOT EXISTS idx_student_transport_route ON student_transport(route_id);

-- Communication indexes
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON announcements(publish_date);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Health indexes
CREATE INDEX IF NOT EXISTS idx_health_records_student ON health_records(student_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date);
CREATE INDEX IF NOT EXISTS idx_vaccinations_student ON vaccinations(student_id);

-- Sports indexes
CREATE INDEX IF NOT EXISTS idx_team_players_team ON team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_team_players_student ON team_players(student_id);
CREATE INDEX IF NOT EXISTS idx_sports_achievements_student ON sports_achievements(student_id);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_item ON stock_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(transaction_date);

-- Certificate indexes
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_template ON certificates(template_id);

-- System indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

COMMIT;