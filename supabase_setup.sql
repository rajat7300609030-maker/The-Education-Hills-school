-- SQL Setup for School Management System
-- Run this in your Supabase SQL Editor

-- 1. Create Students Table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT,
    "parentName" TEXT,
    phone TEXT,
    email TEXT,
    "enrollmentDate" TEXT,
    session TEXT,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    "deletedAt" TEXT,
    photo TEXT,
    dob TEXT,
    address TEXT,
    "totalAgreedFees" NUMERIC,
    "backLogs" NUMERIC
);

-- 2. Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    salary NUMERIC,
    phone TEXT,
    email TEXT,
    "joiningDate" TEXT,
    status TEXT,
    photo TEXT,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    "deletedAt" TEXT,
    session TEXT
);

-- 3. Create Fees Table
CREATE TABLE IF NOT EXISTS fees (
    id TEXT PRIMARY KEY,
    "studentId" TEXT,
    amount NUMERIC,
    date TEXT,
    type TEXT,
    status TEXT,
    "paymentMethod" TEXT,
    description TEXT,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    "deletedAt" TEXT,
    session TEXT
);

-- 4. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC,
    date TEXT,
    category TEXT,
    "paymentMethod" TEXT,
    description TEXT,
    "employeeId" TEXT,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    "deletedAt" TEXT,
    session TEXT
);

-- 5. Create Config Table
CREATE TABLE IF NOT EXISTS config (
    id BIGINT PRIMARY KEY,
    school_profile JSONB,
    user_profile JSONB,
    settings JSONB,
    classes JSONB,
    fee_categories JSONB,
    updated_at TEXT,
    last_sync_date TEXT
);

-- 6. Create Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    color TEXT,
    "isPinned" BOOLEAN DEFAULT FALSE,
    "createdAt" TEXT
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 8. Create Policies (Allow all for now - Harden these later)
CREATE POLICY "Allow all access to students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to fees" ON fees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to config" ON config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to notes" ON notes FOR ALL USING (true) WITH CHECK (true);
