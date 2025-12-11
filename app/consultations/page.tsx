'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function ConsultationsPage() {
  const [step, setStep] = useState<'register' | 'consult'>('register')
  const [patientId, setPatientId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    phone: '',
    gender: '',
    familyMembers: '',
    chronicDiseases: [] as string[],
    isPregnant: false,
    isBreastfeeding: false,
    previousSurgeries: '',
    drugAllergies: '',
    currentMedications: '',
  })

  const [consultData, setConsultData] = useState({
    phone: '',
    email: '',
    specialty: '',
    complaint: '',
    symptoms: '',
    weight: '',
    height: '',
    bp: '',
    temp: '',
    pulse: ''
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const chronicDiseaseOptions = [
    'السكري',
    'ارتفاع ضغط الدم',
    'الأورام',
    'أمراض الكبد',
    'أمراض الكلى',
    'أخرى',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleConsultChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConsultData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDiseaseChange = (disease: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.includes(disease)
        ? prev.chronicDiseases.filter((d) => d !== disease)
        : [...prev.chronicDiseases, disease],
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.fullName || !formData.nationalId || !formData.phone || !formData.gender) {
        toast.error('يرجى ملء جميع الحقول المطلوبة')
        setLoading(false)
        return
      }

      // Get Center ID
      const { data: centers } = await supabase.from('centers').select('id').limit(1)
      // استخدام as any هنا أيضاً لتجنب مشاكل مشابهة
      const centerId = (centers as any)?.[0]?.id

      if (!centerId) {
        toast.error('خطأ: لا يوجد مركز معرف')
        setLoading(false)
        return
      }

      // Check if patient exists (by national_id)
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('national_id', formData.nationalId)
        .single()

      if (existingPatient) {
        // Fix: استخدام as any لتجاوز خطأ Type error
        setPatientId((existingPatient as any).id)
        toast.success('تم العثور على بياناتك السابقة')
      } else {
        // Insert new patient
        const { data: newPatient, error } = await (supabase.from('patients') as any)
          .insert({
            center_id: centerId,
            full_name: formData.fullName,
            national_id: formData.nationalId,
            phone: formData.phone,
            gender: formData.gender,
            family_members: parseInt(formData.familyMembers) || 0,
            chronic_diseases: formData.chronicDiseases,
            is_pregnant: formData.isPregnant,
            is_breastfeeding: formData.isBreastfeeding,
            previous_surgeries: formData.previousSurgeries,
            drug_allergies: formData.drugAllergies,
            current_medications: formData.currentMedications
          })
          .select()
          .single()

        if (error) throw error
        setPatientId((newPatient as any).id)
        toast.success('تم التسجيل بنجاح')
      }

      setStep('consult')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!patientId) {
        toast.error('خطأ: لم يتم التعرف على المريض')
        return
      }

      const { error } = await (supabase.from('consultations') as any).insert({
        patient_id: patientId,
        specialty_required: consultData.specialty,
        complaint_text: consultData.complaint,
        current_symptoms: consultData.symptoms,
        weight_kg: parseFloat(consultData.weight) || null,
        height_cm: parseFloat(consultData.height) || null,
        blood_pressure: consultData.bp,
        temperature: parseFloat(consultData.temp) || null,
        pulse: parseInt(consultData.pulse) || null,
        status: 'open'
      })

      if (error) throw error

      toast.success('تم إرسال الاستشارة بنجاح')
      setSubmitted(true)

      setTimeout(() => {
        setSubmitted(false)
        setStep('register') // Reset to start
      }, 3000)
    } catch (err: any) {
      console.error(err)
      toast.error('حدث خطأ أثناء الإرسال')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-success-500">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-medical-900 mb-2">تم الإرسال بنجاح</h2>
            <p className="text-medical-600 mb-6">سيتم الرد على استشارتك قريباً من قبل الطبيب المختص</p>
            <Link href="/">
              <Button className="w-full">العودة للصفحة الرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">الاستشارات الطبية</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {step === 'register' ? (
          <Card>
            <CardHeader>
              <CardTitle>التسجيل الأول</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الرباعي (50 حرف)</label>
                  <Input type="text" name="fullName" placeholder="أدخل الاسم الرباعي" value={formData.fullName} onChange={handleChange} disabled={loading} maxLength={50} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الرقم القومي (14 رقم)</label>
                  <Input type="text" name="nationalId" placeholder="14 رقم" value={formData.nationalId} onChange={handleChange} disabled={loading} maxLength={14} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف (11 رقم)</label>
                  <Input type="tel" name="phone" placeholder="01xxxxxxxxx" value={formData.phone} onChange={handleChange} disabled={loading} maxLength={11} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">النوع</label>
                  <Select name="gender" value={formData.gender} onChange={handleChange} disabled={loading}>
                    <option value="">-- اختر --</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                    <option value="child">طفل</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">عدد أفراد الأسرة (0-10)</label>
                  <Input type="number" name="familyMembers" placeholder="0" value={formData.familyMembers} onChange={handleChange} disabled={loading} min="0" max="10" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الأمراض المزمنة</label>
                  <div className="space-y-2">
                    {chronicDiseaseOptions.map((disease) => (
                      <label key={disease} className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.chronicDiseases.includes(disease)} onChange={() => handleDiseaseChange(disease)} disabled={loading} className="w-4 h-4" />
                        <span className="text-sm">{disease}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isPregnant" checked={formData.isPregnant} onChange={handleChange} disabled={loading} className="w-4 h-4" />
                  <span className="text-sm">وجود حمل</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isBreastfeeding" checked={formData.isBreastfeeding} onChange={handleChange} disabled={loading} className="w-4 h-4" />
                  <span className="text-sm">وجود رضاعة</span>
                </label>

                <div className="space-y-2">
                  <label className="text-sm font-medium">عمليات سابقة</label>
                  <Textarea name="previousSurgeries" placeholder="أدخل تفاصيل العمليات السابقة" value={formData.previousSurgeries} onChange={handleChange} disabled={loading} rows={3} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">حساسية من أدوية</label>
                  <Textarea name="drugAllergies" placeholder="أدخل الأدوية التي تسبب حساسية" value={formData.drugAllergies} onChange={handleChange} disabled={loading} rows={3} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الأدوية الحالية</label>
                  <Textarea name="currentMedications" placeholder="أدخل الأدوية التي تتناولها حالياً" value={formData.currentMedications} onChange={handleChange} disabled={loading} rows={3} />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> جاري التسجيل...</> : 'التسجيل والمتابعة'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          // Consultation Form
          <Card>
            <CardHeader>
              <CardTitle>تقديم استشارة طبية</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConsultation} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف للتواصل</label>
                  <Input type="tel" name="phone" value={consultData.phone} onChange={handleConsultChange} placeholder="01xxxxxxxxx" disabled={loading} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input type="email" name="email" value={consultData.email} onChange={handleConsultChange} placeholder="your@email.com" disabled={loading} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">التخصص المطلوب</label>
                  <Select name="specialty" value={consultData.specialty} onChange={handleConsultChange} disabled={loading}>
                    <option value="">-- اختر التخصص --</option>
                    <option>طب الأسرة</option>
                    <option>الأسنان</option>
                    <option>العيون</option>
                    <option>الجلدية</option>
                    <option>الأطفال</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نص الشكوى</label>
                  <Textarea name="complaint" value={consultData.complaint} onChange={handleConsultChange} placeholder="أدخل شكواك بالتفصيل" disabled={loading} rows={4} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الأعراض الحالية</label>
                  <Textarea name="symptoms" value={consultData.symptoms} onChange={handleConsultChange} placeholder="أدخل الأعراض التي تشعر بها" disabled={loading} rows={4} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الوزن (كجم)</label>
                    <Input type="number" name="weight" value={consultData.weight} onChange={handleConsultChange} placeholder="0" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الطول (سم)</label>
                    <Input type="number" name="height" value={consultData.height} onChange={handleConsultChange} placeholder="0" disabled={loading} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ضغط الدم</label>
                    <Input name="bp" value={consultData.bp} onChange={handleConsultChange} placeholder="120/80" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">درجة الحرارة</label>
                    <Input type="number" name="temp" value={consultData.temp} onChange={handleConsultChange} placeholder="37" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">النبض</label>
                    <Input type="number" name="pulse" value={consultData.pulse} onChange={handleConsultChange} placeholder="0" disabled={loading} />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> جاري الإرسال...</> : 'إرسال الاستشارة'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
