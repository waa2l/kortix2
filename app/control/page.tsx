'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  ChevronUp,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Phone,
  ArrowRight,
  LogOut,
  Loader2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  X
} from 'lucide-react'
import { toArabicNumbers } from '@/utils/arabic'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface Clinic {
  id: string
  name: string
  password: string
  current_number: number
  clinic_number: number
  is_active: boolean
}

export default function ControlPage() {
  const router = useRouter()
  const [step, setStep] = useState<'clinic-select' | 'control'>('clinic-select')
  const [selectedClinicId, setSelectedClinicId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Data States
  const [clinicsList, setClinicsList] = useState<Clinic[]>([])
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(null)
  const [specificNumber, setSpecificNumber] = useState('')
  
  // Transfer Modal State
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferTargetId, setTransferTargetId] = useState('')

  // 1. Fetch Clinics for Dropdown
  useEffect(() => {
    const fetchClinics = async () => {
      const { data } = await supabase.from('clinics').select('*').order('clinic_number', { ascending: true })
      if (data) setClinicsList(data)
    }
    fetchClinics()
  }, [])

  // 2. Realtime Subscription for Active Clinic
  useEffect(() => {
    if (!activeClinic?.id) return

    const channel = supabase
      .channel(`control_clinic_${activeClinic.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clinics', filter: `id=eq.${activeClinic.id}` },
        (payload) => {
          setActiveClinic(payload.new as Clinic)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeClinic?.id])

  const handleClinicSelect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const clinic = clinicsList.find((c) => c.id === selectedClinicId)
      
      if (!clinic) {
        setError('العيادة غير موجودة')
        return
      }

      if (password !== clinic.password) {
        setError('كلمة المرور غير صحيحة')
        return
      }

      setActiveClinic(clinic)
      setStep('control')
      toast.success('تم تسجيل الدخول بنجاح')
    } catch (err) {
      setError('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const updateQueue = async (newNumber: number, status: string = 'called', isEmergency: boolean = false) => {
    if (!activeClinic) return

    try {
      const { error: updateErr } = await (supabase.from('clinics') as any)
        .update({ current_number: newNumber })
        .eq('id', activeClinic.id)

      if (updateErr) throw updateErr

      const { error: insertErr } = await (supabase.from('queue_calls') as any).insert({
        clinic_id: activeClinic.id,
        patient_number: newNumber,
        status: status,
        is_emergency: isEmergency,
        called_at: new Date().toISOString()
      })

      if (insertErr) throw insertErr

    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث الطابور')
    }
  }

  const handleNextPatient = () => {
    if (!activeClinic) return
    if (!activeClinic.is_active) {
        toast.error('العيادة متوقفة حالياً')
        return
    }
    const newNumber = (activeClinic.current_number || 0) + 1
    updateQueue(newNumber)
    toast.success(`تم استدعاء العميل رقم ${toArabicNumbers(newNumber)}`)
  }

  const handlePreviousPatient = () => {
    if (!activeClinic || activeClinic.current_number <= 0) return
    const newNumber = activeClinic.current_number - 1
    updateQueue(newNumber)
    toast.success(`تم الرجوع للعميل رقم ${toArabicNumbers(newNumber)}`)
  }

  const handleCallSpecific = () => {
    if (specificNumber) {
      const num = parseInt(specificNumber)
      updateQueue(num)
      toast.success(`تم استدعاء العميل رقم ${toArabicNumbers(num)}`)
      setSpecificNumber('')
    }
  }

  const handleReset = async () => {
    if (confirm('هل تريد تصفير العيادة؟')) {
      if (!activeClinic) return
      try {
        const { error } = await (supabase.from('clinics') as any)
          .update({ current_number: 0 })
          .eq('id', activeClinic.id)
        if (error) throw error
        toast.success('تم تصفير العيادة')
      } catch (e) {
        toast.error('فشل التصفير')
      }
    }
  }

  // ---- 1. تفعيل زر الطوارئ ----
  const handleEmergency = async () => {
    if (!activeClinic) return
    try {
        // إرسال نداء طوارئ بدون تغيير الرقم الحالي (أو يمكن استخدام 0 كرمز للطوارئ العامة)
        const { error } = await (supabase.from('queue_calls') as any).insert({
            clinic_id: activeClinic.id,
            patient_number: activeClinic.current_number, 
            is_emergency: true,
            status: 'called',
            called_at: new Date().toISOString()
        })
        if (error) throw error
        toast.success('🚨 تم إرسال نداء الطوارئ وتشغيل الصفارات')
    } catch (e) {
        toast.error('فشل إرسال الطوارئ')
    }
  }

  // ---- 2. تفعيل زر تنبيه الطبيب ----
  const handleDoctorAlert = async () => {
    if (!activeClinic) return
    try {
        // إرسال إشعار في جدول notifications
        // سنفترض أن المستقبل هو الأدمن أو نظام العرض
        const { error } = await (supabase.from('notifications') as any).insert({
            recipient_id: activeClinic.id, // استخدام معرف العيادة كمستقبل
            recipient_type: 'admin',
            title: 'تنبيه من العيادة',
            message: `الطبيب في ${activeClinic.name} يطلب المساعدة`,
            type: 'alert',
            is_read: false
        })
        if (error) throw error
        toast.success('تم إرسال التنبيه للإدارة')
    } catch (e) {
        toast.error('فشل إرسال التنبيه')
    }
  }

  // ---- 3. تفعيل زر إيقاف/تشغيل العيادة ----
  const handleToggleClinic = async () => {
    if (!activeClinic) return
    try {
        const newStatus = !activeClinic.is_active
        const { error } = await (supabase.from('clinics') as any)
            .update({ is_active: newStatus })
            .eq('id', activeClinic.id)
        
        if (error) throw error
        toast.success(newStatus ? 'تم تفعيل العيادة' : 'تم إيقاف العيادة')
    } catch (e) {
        toast.error('فشل تغيير حالة العيادة')
    }
  }

  // ---- 4. تفعيل زر التحويل ----
  const handleTransfer = async () => {
    if (!activeClinic || !transferTargetId) return
    
    try {
        // إضافة سجل في قائمة الانتظار للعيادة الجديدة
        // يمكننا إضافة المريض برقم جديد أو نفس الرقم، سنفترض نفس الرقم الحالي
        const { error } = await (supabase.from('queue_calls') as any).insert({
            clinic_id: transferTargetId,
            patient_number: activeClinic.current_number,
            status: 'transferred',
            transferred_to_clinic_id: transferTargetId,
            called_at: new Date().toISOString()
        })

        if (error) throw error
        toast.success('تم تحويل المريض للعيادة المختارة')
        setShowTransfer(false)
        setTransferTargetId('')
    } catch (e) {
        toast.error('فشل التحويل')
    }
  }

  const handleLogout = () => {
    setStep('clinic-select')
    setSelectedClinicId('')
    setPassword('')
    setActiveClinic(null)
    toast.success('تم تسجيل الخروج')
  }

  if (step === 'clinic-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader><CardTitle>لوحة التحكم بالعيادة</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleClinicSelect} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر العيادة</label>
                  <Select value={selectedClinicId} onChange={(e) => setSelectedClinicId(e.target.value)} disabled={loading}>
                    <option value="">-- اختر العيادة --</option>
                    {clinicsList.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <Input type="password" placeholder="أدخل كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'دخول'}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/')}>العودة</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-6 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-medical-900">{activeClinic?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
                <span className={`w-3 h-3 rounded-full ${activeClinic?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="text-medical-600">{activeClinic?.is_active ? 'العيادة تعمل' : 'العيادة متوقفة'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" /> خروج
          </Button>
        </div>

        {/* Current Number */}
        <Card className={`mb-8 border-0 text-white transition-colors duration-300 ${activeClinic?.is_active ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gray-500'}`}>
          <CardContent className="pt-8">
            <div className="text-center">
              <p className="text-lg text-primary-100 mb-2">الرقم الحالي</p>
              <p className="text-7xl font-bold">{toArabicNumbers(activeClinic?.current_number || 0)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Main Controls */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Button onClick={handleNextPatient} disabled={!activeClinic?.is_active} className="h-24 text-lg gap-2 bg-success-500 hover:bg-success-600">
            <ChevronUp className="w-6 h-6" /> التالي
          </Button>

          <Button onClick={handlePreviousPatient} disabled={!activeClinic?.is_active} variant="outline" className="h-24 text-lg gap-2">
            <ChevronDown className="w-6 h-6" /> السابق
          </Button>

          <Button onClick={handleReset} variant="outline" className="h-24 text-lg gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <RotateCcw className="w-6 h-6" /> تصفير
          </Button>

          <Button onClick={handleEmergency} className="h-24 text-lg gap-2 bg-red-600 hover:bg-red-700 text-white md:col-span-2 animate-pulse">
            <AlertTriangle className="w-6 h-6" /> تنبيه طوارئ (تشغيل الصوت)
          </Button>

          <Button onClick={handleDoctorAlert} variant="outline" className="h-24 text-lg gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50">
            <Phone className="w-6 h-6" /> تنبيه طبيب
          </Button>
        </div>

        {/* Specific Call */}
        <Card className="mb-8">
          <CardHeader><CardTitle>استدعاء عميل معين</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input type="number" placeholder="رقم العميل" value={specificNumber} onChange={(e) => setSpecificNumber(e.target.value)} className="flex-1" />
              <Button onClick={handleCallSpecific} disabled={!activeClinic?.is_active} className="gap-2"><Phone className="w-4 h-4" /> استدعاء</Button>
            </div>
          </CardContent>
        </Card>

        {/* Extra Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => setShowTransfer(true)} className="h-16 text-base gap-2">
            <ArrowRight className="w-5 h-5" /> تحويل إلى عيادة أخرى
          </Button>

          <Button 
            variant={activeClinic?.is_active ? "outline" : "default"} 
            onClick={handleToggleClinic} 
            className={`h-16 text-base gap-2 ${activeClinic?.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {activeClinic?.is_active ? <><PauseCircle className="w-5 h-5" /> إيقاف العيادة</> : <><PlayCircle className="w-5 h-5" /> تشغيل العيادة</>}
          </Button>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md animate-slide-in-up">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>تحويل المريض</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowTransfer(false)}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">اختر العيادة المراد تحويل المريض الحالي ({toArabicNumbers(activeClinic?.current_number || 0)}) إليها:</p>
                    <Select value={transferTargetId} onChange={(e) => setTransferTargetId(e.target.value)}>
                        <option value="">-- اختر العيادة --</option>
                        {clinicsList.filter(c => c.id !== activeClinic?.id).map((clinic) => (
                            <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                        ))}
                    </Select>
                    <Button onClick={handleTransfer} disabled={!transferTargetId} className="w-full">تأكيد التحويل</Button>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  )
}
