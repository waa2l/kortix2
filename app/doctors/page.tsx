'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { formatArabicDate } from '@/utils/arabic'

interface DoctorData {
  id: string
  name: string
  doctor_number: string
  specialty: string
  annual_leave_balance: number
  emergency_leave_balance: number
  absence_days: number
  work_status: string
  clinic: { name: string } | null
}

export default function DoctorsPage() {
  const [step, setStep] = useState<'login' | 'dashboard'>('login')
  const [activeTab, setActiveTab] = useState<'profile' | 'consultations'>('profile')
  
  // Login States
  const [doctorNumber, setDoctorNumber] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null)

  // Consultations States
  const [consultations, setConsultations] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')
  const [selectedConsultId, setSelectedConsultId] = useState<string | null>(null)

  useEffect(() => {
    const session = localStorage.getItem('doctorSession')
    if (session) {
      const { id } = JSON.parse(session)
      fetchDoctorData(id)
    }
  }, [])

  const fetchDoctorData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*, clinic:clinics(name)')
        .eq('id', id)
        .single()

      if (error) throw error
      const doctor = data as any
      setDoctorData({ ...doctor, clinic: doctor.clinic })
      setStep('dashboard')
      
      fetchConsultations(doctor.specialty)
    } catch (err) {
      console.error(err)
      localStorage.removeItem('doctorSession')
      setStep('login')
    }
  }

  const fetchConsultations = async (specialty: string) => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          patients (
            full_name,
            gender,
            chronic_diseases
          )
        `)
        .eq('specialty_required', specialty)
        .order('created_at', { ascending: false })

      if (error) throw error
      setConsultations(data || [])
    } catch (err) {
      console.error('Error fetching consultations:', err)
    }
  }

  const handleReply = async (consultId: string) => {
    if (!replyText) return toast.error('يرجى كتابة الرد')
    
    setLoading(true)
    try {
      const { error } = await (supabase.from('consultations') as any)
        .update({
          response_text: replyText,
          doctor_id: doctorData?.id,
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', consultId)

      if (error) throw error

      toast.success('تم إرسال الرد بنجاح')
      setReplyText('')
      setSelectedConsultId(null)
      if (doctorData) fetchConsultations(doctorData.specialty)
      
    } catch (err) {
      toast.error('حدث خطأ أثناء الرد')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('doctor_number', doctorNumber)
        .eq('national_id', nationalId)
        .single()

      if (error || !data) { setError('بيانات الدخول غير صحيحة'); setLoading(false); return }

      localStorage.setItem('doctorSession', JSON.stringify({ id: data.id, timestamp: Date.now() }))
      toast.success('تم تسجيل الدخول بنجاح')
      fetchDoctorData(data.id)
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال'); toast.error('فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('doctorSession')
    setStep('login')
    setDoctorNumber('')
    setNationalId('')
    setDoctorData(null)
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader><CardTitle>تسجيل دخول الأطباء</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (<div className="p-3 bg-danger-50 text-danger-700 rounded text-sm">{error}</div>)}
                <Input placeholder="كود الطبيب" value={doctorNumber} onChange={(e) => setDoctorNumber(e.target.value)} />
                <Input type="password" placeholder="الرقم القومي" value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'جاري التحميل...' : 'دخول'}</Button>
              </form>
            </CardContent>
          </Card>
          <div className="text-center mt-6"><Link href="/" className="text-primary-600">عودة للرئيسية</Link></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">بوابة الطبيب: {doctorData?.name}</h1>
          <Button variant="outline" onClick={handleLogout} className="gap-2">تسجيل خروج</Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button 
            variant={activeTab === 'profile' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('profile')}
          >
            الملف الشخصي
          </Button>
          <Button 
            variant={activeTab === 'consultations' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('consultations')}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            الاستشارات الطبية ({consultations.filter(c => c.status === 'open').length})
          </Button>
        </div>

        {activeTab === 'profile' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card><CardContent className="pt-6"><p className="text-sm text-medical-600">التخصص</p><p className="text-xl font-bold">{doctorData?.specialty}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-medical-600">الحالة</p><p className="text-xl font-bold text-success-600">{doctorData?.work_status === 'active' ? 'نشط' : 'غير نشط'}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-medical-600">العيادة</p><p className="text-xl font-bold">{doctorData?.clinic?.name}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>رصيد الإجازات</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                   <div className="bg-blue-50 p-4 rounded">
                     <p className="text-sm text-blue-600">اعتيادي</p>
                     <p className="text-2xl font-bold">{doctorData?.annual_leave_balance}</p>
                   </div>
                   <div className="bg-green-50 p-4 rounded">
                     <p className="text-sm text-green-600">عارضة</p>
                     <p className="text-2xl font-bold">{doctorData?.emergency_leave_balance}</p>
                   </div>
                   <div className="bg-orange-50 p-4 rounded">
                     <p className="text-sm text-orange-600">غياب</p>
                     <p className="text-2xl font-bold">{doctorData?.absence_days}</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <Card><CardContent className="pt-6 text-center text-medical-500">لا توجد استشارات لهذا التخصص حالياً</CardContent></Card>
            ) : (
              consultations.map((consult) => (
                <Card key={consult.id} className={`border-r-4 ${consult.status === 'open' ? 'border-r-yellow-500' : 'border-r-green-500'}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg">{consult.patients?.full_name}</p>
                        <p className="text-sm text-medical-500">
                          {consult.patients?.gender === 'male' ? 'ذكر' : 'أنثى'} - {formatArabicDate(new Date(consult.created_at))}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        consult.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {consult.status === 'open' ? 'جديد' : 'تم الرد'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-medical-50 p-3 rounded text-sm">
                        <div><span className="text-medical-500">الضغط:</span> {consult.blood_pressure || '-'}</div>
                        <div><span className="text-medical-500">النبض:</span> {consult.pulse || '-'}</div>
                        <div><span className="text-medical-500">الحرارة:</span> {consult.temperature || '-'}</div>
                        <div><span className="text-medical-500">الوزن:</span> {consult.weight_kg || '-'}</div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div>
                            <p className="text-sm font-bold text-medical-700">الشكوى:</p>
                            <p className="text-medical-900">{consult.complaint_text}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-medical-700">الأعراض:</p>
                            <p className="text-medical-900">{consult.current_symptoms}</p>
                        </div>
                        {consult.patients?.chronic_diseases && consult.patients.chronic_diseases.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-red-600">أمراض مزمنة:</p>
                                <p className="text-red-700">{consult.patients.chronic_diseases.join('، ')}</p>
                            </div>
                        )}
                    </div>

                    {consult.status === 'open' ? (
                      <div className="mt-4 border-t pt-4">
                        {selectedConsultId === consult.id ? (
                          <div className="space-y-3">
                            <Textarea 
                              placeholder="اكتب التشخيص والعلاج المقترح..." 
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => handleReply(consult.id)} disabled={loading} className="gap-2">
                                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Send className="w-4 h-4"/>} 
                                إرسال الرد
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedConsultId(null)}>إلغاء</Button>
                            </div>
                          </div>
                        ) : (
                          <Button onClick={() => { setSelectedConsultId(consult.id); setReplyText(''); }}>
                            الرد على الاستشارة
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 bg-green-50 p-3 rounded border border-green-100">
                        <p className="text-sm font-bold text-green-800 mb-1">الرد المرسل:</p>
                        <p className="text-medical-800">{consult.response_text}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
