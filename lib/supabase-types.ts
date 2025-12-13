// lib/supabase-types.ts
import { Database } from '@/types/supabase'

// Helper types for cleaner code
export type Center = Database['public']['Tables']['centers']['Row']
export type Screen = Database['public']['Tables']['screens']['Row']
export type Clinic = Database['public']['Tables']['clinics']['Row']
export type QueueCall = Database['public']['Tables']['queue_calls']['Row']
export type Doctor = Database['public']['Tables']['doctors']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type Patient = Database['public']['Tables']['patients']['Row']
export type Consultation = Database['public']['Tables']['consultations']['Row']
export type Complaint = Database['public']['Tables']['complaints']['Row']
export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']
export type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Insert types
export type CenterInsert = Database['public']['Tables']['centers']['Insert']
export type ScreenInsert = Database['public']['Tables']['screens']['Insert']
export type ClinicInsert = Database['public']['Tables']['clinics']['Insert']
export type QueueCallInsert = Database['public']['Tables']['queue_calls']['Insert']
export type DoctorInsert = Database['public']['Tables']['doctors']['Insert']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']
export type ComplaintInsert = Database['public']['Tables']['complaints']['Insert']

// Update types
export type CenterUpdate = Database['public']['Tables']['centers']['Update']
export type ScreenUpdate = Database['public']['Tables']['screens']['Update']
export type ClinicUpdate = Database['public']['Tables']['clinics']['Update']
export type QueueCallUpdate = Database['public']['Tables']['queue_calls']['Update']
export type DoctorUpdate = Database['public']['Tables']['doctors']['Update']

// Extended types with relations
export type DoctorWithClinic = Doctor & {
  clinic: { name: string } | null
}

export type ConsultationWithPatient = Consultation & {
  patients: Patient | null
  doctors: Doctor | null
}

export type ClinicWithRelations = Clinic & {
  center?: Center
  doctors?: Doctor[]
}
