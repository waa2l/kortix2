// Validation utilities

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation (Egyptian format)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+20|0)?1[0-2]\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// National ID validation (Egyptian format - 14 digits)
export function validateNationalId(id: string): boolean {
  const idRegex = /^\d{14}$/
  return idRegex.test(id)
}

// Password validation
export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

// Arabic text validation
export function validateArabicText(text: string, minLength: number = 1, maxLength: number = 1000): boolean {
  const arabicRegex = /^[\u0600-\u06FF\s\d\-.,!?()]*$/
  return arabicRegex.test(text) && text.length >= minLength && text.length <= maxLength
}

// Name validation
export function validateName(name: string, minLength: number = 2, maxLength: number = 255): boolean {
  return name.length >= minLength && name.length <= maxLength && /^[\u0600-\u06FF\s\-']*$/.test(name)
}

// Date validation
export function validateDate(date: string): boolean {
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj.getTime())
}

// Future date validation
export function validateFutureDate(date: string): boolean {
  const dateObj = new Date(date)
  return validateDate(date) && dateObj > new Date()
}

// Time validation (HH:MM format)
export function validateTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

// Number validation
export function validateNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Form validation helpers
export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!email) {
    errors.push({ field: 'email', message: 'البريد الإلكتروني مطلوب' })
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'البريد الإلكتروني غير صحيح' })
  }

  if (!password) {
    errors.push({ field: 'password', message: 'كلمة المرور مطلوبة' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateClinicForm(name: string, clinicNumber: number, password: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!name || !validateName(name)) {
    errors.push({ field: 'name', message: 'اسم العيادة غير صحيح' })
  }

  if (!validateNumber(clinicNumber, 1)) {
    errors.push({ field: 'clinicNumber', message: 'رقم العيادة غير صحيح' })
  }

  if (!password || password.length < 4) {
    errors.push({ field: 'password', message: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateDoctorForm(
  name: string,
  phone: string,
  nationalId: string,
  specialty: string
): ValidationResult {
  const errors: ValidationError[] = []

  if (!name || !validateName(name)) {
    errors.push({ field: 'name', message: 'اسم الطبيب غير صحيح' })
  }

  if (!phone || !validatePhone(phone)) {
    errors.push({ field: 'phone', message: 'رقم الهاتف غير صحيح' })
  }

  if (!nationalId || !validateNationalId(nationalId)) {
    errors.push({ field: 'nationalId', message: 'الرقم القومي يجب أن يكون 14 رقم' })
  }

  if (!specialty || !validateArabicText(specialty, 2, 100)) {
    errors.push({ field: 'specialty', message: 'التخصص غير صحيح' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateAppointmentForm(
  patientName: string,
  nationalId: string,
  phone: string,
  appointmentDate: string,
  appointmentTime: string,
  visitReason: string
): ValidationResult {
  const errors: ValidationError[] = []

  if (!patientName || !validateName(patientName)) {
    errors.push({ field: 'patientName', message: 'اسم المريض غير صحيح' })
  }

  if (!nationalId || !validateNationalId(nationalId)) {
    errors.push({ field: 'nationalId', message: 'الرقم القومي يجب أن يكون 14 رقم' })
  }

  if (!phone || !validatePhone(phone)) {
    errors.push({ field: 'phone', message: 'رقم الهاتف غير صحيح' })
  }

  if (!appointmentDate || !validateFutureDate(appointmentDate)) {
    errors.push({ field: 'appointmentDate', message: 'التاريخ يجب أن يكون في المستقبل' })
  }

  if (!appointmentTime || !validateTime(appointmentTime)) {
    errors.push({ field: 'appointmentTime', message: 'الوقت غير صحيح' })
  }

  if (!visitReason || !validateArabicText(visitReason, 5, 500)) {
    errors.push({ field: 'visitReason', message: 'سبب الزيارة غير صحيح' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateComplaintForm(
  type: string,
  message: string,
  phone?: string,
  email?: string
): ValidationResult {
  const errors: ValidationError[] = []

  if (!type || !['complaint', 'suggestion'].includes(type)) {
    errors.push({ field: 'type', message: 'نوع الشكوى غير صحيح' })
  }

  if (!message || !validateArabicText(message, 140, 1000)) {
    errors.push({ field: 'message', message: 'النص يجب أن يكون بين 140 و 1000 حرف' })
  }

  if (phone && !validatePhone(phone)) {
    errors.push({ field: 'phone', message: 'رقم الهاتف غير صحيح' })
  }

  if (email && !validateEmail(email)) {
    errors.push({ field: 'email', message: 'البريد الإلكتروني غير صحيح' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateConsultationForm(
  complaintText: string,
  currentSymptoms: string,
  specialtyRequired: string
): ValidationResult {
  const errors: ValidationError[] = []

  if (!complaintText || !validateArabicText(complaintText, 10, 1000)) {
    errors.push({ field: 'complaintText', message: 'نص الشكوى غير صحيح' })
  }

  if (!currentSymptoms || !validateArabicText(currentSymptoms, 10, 1000)) {
    errors.push({ field: 'currentSymptoms', message: 'الأعراض الحالية غير صحيحة' })
  }

  if (!specialtyRequired || !validateArabicText(specialtyRequired, 2, 100)) {
    errors.push({ field: 'specialtyRequired', message: 'التخصص المطلوب غير صحيح' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePatientRegistrationForm(
  fullName: string,
  nationalId: string,
  phone: string,
  gender: string,
  familyMembers: number
): ValidationResult {
  const errors: ValidationError[] = []

  if (!fullName || !validateName(fullName, 4, 50)) {
    errors.push({ field: 'fullName', message: 'الاسم الرباعي غير صحيح' })
  }

  if (!nationalId || !validateNationalId(nationalId)) {
    errors.push({ field: 'nationalId', message: 'الرقم القومي يجب أن يكون 14 رقم' })
  }

  if (!phone || !validatePhone(phone)) {
    errors.push({ field: 'phone', message: 'رقم الهاتف يجب أن يكون 11 رقم' })
  }

  if (!gender || !['male', 'female', 'child'].includes(gender)) {
    errors.push({ field: 'gender', message: 'النوع غير صحيح' })
  }

  if (!validateNumber(familyMembers, 0, 10)) {
    errors.push({ field: 'familyMembers', message: 'عدد أفراد الأسرة غير صحيح' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}


