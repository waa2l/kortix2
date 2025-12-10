export type Database = {
  public: {
    Tables: {
      centers: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          address: string | null
          phone: string | null
          email: string | null
          news_ticker: string
          ticker_speed: number
          alert_duration: number
          speech_speed: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['centers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['centers']['Insert']>
      }
      screens: {
        Row: {
          id: string
          center_id: string
          screen_number: number
          password: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['screens']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['screens']['Insert']>
      }
      clinics: {
        Row: {
          id: string
          center_id: string
          name: string
          clinic_number: number
          screen_ids: number[]
          password: string
          current_number: number
          is_active: boolean
          last_call_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clinics']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clinics']['Insert']>
      }
      queue_calls: {
        Row: {
          id: string
          clinic_id: string
          patient_number: number
          called_at: string
          is_emergency: boolean
          transferred_to_clinic_id: string | null
          status: 'pending' | 'called' | 'completed' | 'transferred'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['queue_calls']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['queue_calls']['Insert']>
      }
      doctors: {
        Row: {
          id: string
          center_id: string
          doctor_number: string
          name: string
          phone: string
          national_id: string
          specialty: string
          clinic_id: string
          work_days: string[]
          work_status: 'active' | 'inactive' | 'on_leave'
          shift: 'morning' | 'evening' | 'both'
          check_in_time: string | null
          check_out_time: string | null
          annual_leave_balance: number
          emergency_leave_balance: number
          absence_days: number
          notes: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['doctors']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['doctors']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          center_id: string
          clinic_id: string
          patient_name: string
          national_id: string
          phone: string
          appointment_date: string
          appointment_time: string
          visit_reason: string
          shift: 'morning' | 'evening'
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      patients: {
        Row: {
          id: string
          center_id: string
          full_name: string
          national_id: string
          phone: string
          email: string | null
          gender: 'male' | 'female' | 'child'
          family_members: number
          chronic_diseases: string[]
          is_pregnant: boolean
          is_breastfeeding: boolean
          previous_surgeries: string | null
          drug_allergies: string | null
          current_medications: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['patients']['Insert']>
      }
      consultations: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          specialty_required: string
          complaint_text: string
          current_symptoms: string
          weight_kg: number | null
          height_cm: number | null
          blood_pressure: string | null
          temperature: number | null
          pulse: number | null
          response_text: string | null
          status: 'open' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['consultations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['consultations']['Insert']>
      }
      complaints: {
        Row: {
          id: string
          center_id: string
          patient_name: string | null
          phone: string | null
          email: string | null
          type: 'complaint' | 'suggestion'
          message: string
          notes: string | null
          status: 'new' | 'reviewed' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['complaints']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['complaints']['Insert']>
      }
      leave_requests: {
        Row: {
          id: string
          doctor_id: string
          request_type: 'annual' | 'emergency' | 'rest_day' | 'mission' | 'morning_permission' | 'evening_permission' | 'training_mission' | 'sick' | 'insurance' | 'travel_permit' | 'other'
          start_date: string
          end_date: string
          acting_doctor_id: string | null
          notes: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leave_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leave_requests']['Insert']>
      }
      attendance_records: {
        Row: {
          id: string
          doctor_id: string
          date: string
          check_in_time: string | null
          check_out_time: string | null
          status: 'present' | 'absent' | 'late' | 'on_leave'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendance_records']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['attendance_records']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          center_id: string
          email: string
          password_hash: string
          full_name: string
          role: 'super_admin' | 'admin' | 'manager'
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          recipient_type: 'admin' | 'doctor' | 'patient'
          title: string
          message: string
          type: 'call' | 'alert' | 'request' | 'approval' | 'system'
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
