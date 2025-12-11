'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, CheckCircle, Search, Clock, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { formatArabicDate } from '@/utils/arabic'

export default function ConsultationsPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'track'>('new')
  
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

  const [trackNationalId, setTrackNationalId] = useState('')
  const [myConsultations, setMyConsultations] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)

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
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
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
      const { data: centers } = await supabase.from('centers').select('id').limit(1)
      const centerId = (centers as any)?.[0]?.id
      if (!centerId) { toast.error('خطأ: لا يوجد مركز معرف'); setLoading(false); return }

      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('national_id', formData.nationalId)
        .single()

      if (existingPatient) {
        setPatientId((existingPatient as any).id)
        toast.success('تم العثور على بياناتك السابقة')
      } else {
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
      if (!patientId) { toast.error('خطأ: لم يتم التعرف على المريض'); return }

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
      setTimeout(() => { setSubmitted(false); setStep('register'); }, 3000)
    } catch (err: any) {
      console.error(err)
      toast.error('حدث خطأ أثناء الإرسال')
    } finally {
      setLoading(false)
    }
  }

  const handleTrackConsultations = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackNationalId || trackNationalId.length !== 14) {
      toast.error('يرجى إدخال رقم قومي صحيح (14 رقم)')
      return
    }
    
    setLoading(true)
    setHasSearched(true)
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('national_id', trackNationalId)
        .single()

      if (!patient) {
        setMyConsultations([])
        toast.error('لم يتم العثور على مريض بهذا الرقم')
        return
      }

      const { data: consults, error } = await supabase
        .from('consultations')
        .select('*, doctors(name)')
        .eq('patient_id', (patient as any).id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMyConsultations(consults || [])
      
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء البحث')
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
            <p className="text-medical-600 mb-6">سيتم الرد على استشارتك قريباً</p>
            <Button onClick={() => setSubmitted(false)} className="w-full">عودة</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">الاستشارات الطبية</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === 'new' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('new')}
            className="flex-1"
          >
            استشارة جديدة
          </Button>
          <Button 
            variant={activeTab === 'track' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('track')}
            className="flex-1"
          >
            متابعة استشاراتي
          </Button>
        </div>

        {activeTab === 'new' ? (
          <>
            {step === 'register' ? (
              <Card>
                <CardHeader><CardTitle>بيانات المريض</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الاسم الرباعي</label>
                      <Input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الرقم القومي</label>
                      <Input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} maxLength={14} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رقم الهاتف</label>
                      <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">النوع</label>
                      <Select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">-- اختر --</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                        <option value="child">طفل</option>
                      </Select>
                    </div>
                    
                    {/* تم استعادة قسم الأمراض المزمنة هنا */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">الأمراض المزمنة</label>
                        <div className="space-y-2">
                            {chronicDiseaseOptions.map((disease) => (
                            <label key={disease} className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={formData.chronicDiseases.includes(disease)} 
                                    onChange={() => handleDiseaseChange(disease)} 
                                    disabled={loading} 
                                    className="w-4 h-4" 
                                />
                                <span className="text-sm">{disease}</span>
                            </label>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'التالي'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader><CardTitle>تفاصيل الاستشارة</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleConsultation} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">التخصص</label>
                      <Select name="specialty" value={consultData.specialty} onChange={handleConsultChange} required>
                        <option value="">-- اختر --</option>
                        <option>طب الأسرة</option>
                        <option>الأسنان</option>
                        <option>العيون</option>
                        <option>الجلدية</option>
                        <option>الأطفال</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الشكوى</label>
                      <Textarea name="complaint" value={consultData.complaint} onChange={handleConsultChange} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الأعراض</label>
                      <Textarea name="symptoms" value={consultData.symptoms} onChange={handleConsultChange} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال الاستشارة'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>البحث عن استشارات سابقة</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleTrackConsultations} className="flex gap-2">
                  <Input 
                    placeholder="أدخل الرقم القومي" 
                    value={trackNationalId}
                    onChange={(e) => setTrackNationalId(e.target.value)}
                    maxLength={14}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {hasSearched && (
              <div className="space-y-4">
                {myConsultations.length === 0 ? (
                  <p className="text-center text-medical-600">لا توجد استشارات سابقة</p>
                ) : (
                  myConsultations.map((consult: any) => (
                    <Card key={consult.id} className="border-r-4 border-r-primary-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-bold text-lg text-medical-900">{consult.specialty_required}</p>
                            <p className="text-sm text-medical-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatArabicDate(new Date(consult.created_at))}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            consult.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {consult.status === 'open' ? 'قيد المراجعة' : 'تم الرد'}
                          </span>
                        </div>

                        <div className="bg-medical-50 p-3 rounded-lg mb-4">
                          <p className="text-sm font-bold text-medical-700 mb-1">الشكوى:</p>
                          <p className="text-sm text-medical-900">{consult.complaint_text}</p>
                        </div>

                        {consult.response_text && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-green-600" />
                              <p className="text-sm font-bold text-green-800">رد الطبيب ({consult.doctors?.name || 'طبيب مختص'}):</p>
                            </div>
                            <p className="text-sm text-medical-900">{consult.response_text}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
