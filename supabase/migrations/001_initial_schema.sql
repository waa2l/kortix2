-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Centers Table
CREATE TABLE IF NOT EXISTS centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  news_ticker TEXT DEFAULT 'أهلا وسهلا بكم في المركز الطبي',
  ticker_speed INTEGER DEFAULT 30,
  alert_duration INTEGER DEFAULT 5,
  speech_speed FLOAT DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Screens Table
CREATE TABLE IF NOT EXISTS screens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  screen_number INTEGER NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(center_id, screen_number)
);

-- Clinics Table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  clinic_number INTEGER NOT NULL,
  screen_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  password VARCHAR(255) NOT NULL,
  current_number INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  last_call_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(center_id, clinic_number)
);

-- Queue Calls Table
CREATE TABLE IF NOT EXISTS queue_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_number INTEGER NOT NULL,
  called_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_emergency BOOLEAN DEFAULT FALSE,
  transferred_to_clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'called', 'completed', 'transferred')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  doctor_number VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  national_id VARCHAR(20) NOT NULL UNIQUE,
  specialty VARCHAR(255) NOT NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  work_days TEXT[] DEFAULT ARRAY['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']::TEXT[],
  work_status VARCHAR(50) DEFAULT 'active' CHECK (work_status IN ('active', 'inactive', 'on_leave')),
  shift VARCHAR(50) DEFAULT 'both' CHECK (shift IN ('morning', 'evening', 'both')),
  check_in_time TIME,
  check_out_time TIME,
  annual_leave_balance INTEGER DEFAULT 30,
  emergency_leave_balance INTEGER DEFAULT 3,
  absence_days INTEGER DEFAULT 0,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(center_id, doctor_number)
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  visit_reason TEXT NOT NULL,
  shift VARCHAR(50) NOT NULL CHECK (shift IN ('morning', 'evening')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(20) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'child')),
  family_members INTEGER DEFAULT 1,
  chronic_diseases TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_pregnant BOOLEAN DEFAULT FALSE,
  is_breastfeeding BOOLEAN DEFAULT FALSE,
  previous_surgeries TEXT,
  drug_allergies TEXT,
  current_medications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  specialty_required VARCHAR(255) NOT NULL,
  complaint_text TEXT NOT NULL,
  current_symptoms TEXT NOT NULL,
  weight_kg DECIMAL(5, 2),
  height_cm DECIMAL(5, 2),
  blood_pressure VARCHAR(50),
  temperature DECIMAL(4, 1),
  pulse INTEGER,
  response_text TEXT,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  patient_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  type VARCHAR(50) NOT NULL CHECK (type IN ('complaint', 'suggestion')),
  message TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('annual', 'emergency', 'rest_day', 'mission', 'morning_permission', 'evening_permission', 'training_mission', 'sick', 'insurance', 'travel_permit', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  acting_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status VARCHAR(50) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'on_leave')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, date)
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL,
  recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('admin', 'doctor', 'patient')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'alert', 'request', 'approval', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_screens_center_id ON screens(center_id);
CREATE INDEX idx_clinics_center_id ON clinics(center_id);
CREATE INDEX idx_queue_calls_clinic_id ON queue_calls(clinic_id);
CREATE INDEX idx_queue_calls_created_at ON queue_calls(created_at);
CREATE INDEX idx_doctors_center_id ON doctors(center_id);
CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX idx_appointments_center_id ON appointments(center_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_patients_center_id ON patients(center_id);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_complaints_center_id ON complaints(center_id);
CREATE INDEX idx_leave_requests_doctor_id ON leave_requests(doctor_id);
CREATE INDEX idx_attendance_records_doctor_id ON attendance_records(doctor_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);
CREATE INDEX idx_admin_users_center_id ON admin_users(center_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);

-- Enable Row Level Security (RLS)
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Allow all for now - configure based on your auth setup)
CREATE POLICY "Allow all access to centers" ON centers FOR ALL USING (true);
CREATE POLICY "Allow all access to screens" ON screens FOR ALL USING (true);
CREATE POLICY "Allow all access to clinics" ON clinics FOR ALL USING (true);
CREATE POLICY "Allow all access to queue_calls" ON queue_calls FOR ALL USING (true);
CREATE POLICY "Allow all access to doctors" ON doctors FOR ALL USING (true);
CREATE POLICY "Allow all access to appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all access to patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all access to consultations" ON consultations FOR ALL USING (true);
CREATE POLICY "Allow all access to complaints" ON complaints FOR ALL USING (true);
CREATE POLICY "Allow all access to leave_requests" ON leave_requests FOR ALL USING (true);
CREATE POLICY "Allow all access to attendance_records" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Allow all access to admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Allow all access to notifications" ON notifications FOR ALL USING (true);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Updated At Trigger to All Tables
CREATE TRIGGER update_centers_updated_at BEFORE UPDATE ON centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_screens_updated_at BEFORE UPDATE ON screens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_queue_calls_updated_at BEFORE UPDATE ON queue_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
