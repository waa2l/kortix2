// Arabic number conversion utilities
const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toArabicNumbers(num: number | string): string {
  const str = String(num);
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = englishNumbers.indexOf(char);
    result += index !== -1 ? arabicNumbers[index] : char;
  }
  return result;
}

export function toEnglishNumbers(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = arabicNumbers.indexOf(char);
    result += index !== -1 ? englishNumbers[index] : char;
  }
  return result;
}

export function formatArabicDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('ar-EG', options);
}

export function formatArabicTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  return date.toLocaleTimeString('ar-EG', options);
}

export function formatArabicDateTime(date: Date): string {
  return `${formatArabicDate(date)} ${formatArabicTime(date)}`
}

// Arabic text utilities
export const arabicDays = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const arabicMonths = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const chronicDiseases = [
  'السكري',
  'ارتفاع ضغط الدم',
  'الأورام',
  'أمراض الكبد',
  'أمراض الكلى',
  'أخرى',
];

export const leaveRequestTypes = [
  { value: 'annual', label: 'إجازة اعتيادية' },
  { value: 'emergency', label: 'إجازة عارضة' },
  { value: 'rest_day', label: 'بدل راحة' },
  { value: 'mission', label: 'مأمورية' },
  { value: 'morning_permission', label: 'إذن صباحي' },
  { value: 'evening_permission', label: 'إذن مسائي' },
  { value: 'training_mission', label: 'مأمورية تدريب' },
  { value: 'sick', label: 'إجازة مرضية' },
  { value: 'insurance', label: 'تأمين صحي' },
  { value: 'travel_permit', label: 'خط سير' },
  { value: 'other', label: 'أخرى' },
];

export const genderOptions = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
  { value: 'child', label: 'طفل' },
];

export const shiftOptions = [
  { value: 'morning', label: 'صباحي (8 ص - 2 م)' },
  { value: 'evening', label: 'مسائي (2 م - 8 م)' },
  { value: 'both', label: 'كلا الشيفتين' },
];

export const workStatusOptions = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'on_leave', label: 'في إجازة' },
];

export const appointmentStatusOptions = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغى' },
];

export const complaintTypeOptions = [
  { value: 'complaint', label: 'شكوى' },
  { value: 'suggestion', label: 'اقتراح' },
];

export const familyMembersOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i,
  label: toArabicNumbers(i),
}));
