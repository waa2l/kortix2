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
      // 1. Update Clinic Current Number
      const { error: updateErr } = await (supabase.from('clinics') as any)
        .update({ current_number: newNumber })
        .eq('id', activeClinic.id)

      if (updateErr) throw updateErr

      // 2. Insert Call Record
      const { error: insertErr } = await (supabase.from('queue_calls') as any).insert({
        clinic_id: activeClinic.id,
        patient_number: newNumber,
        status: status,
        is_emergency: isEmergency,
        called_at: new Date().toISOString()
      })

      if (insertErr) throw insertErr

      // Optimistic Update is handled by Realtime subscription, but we can set it locally too
      setActiveClinic({ ...activeClinic, current_number: newNumber })

    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث الطابور')
    }
  }

  const handleNextPatient = () => {
    if (!activeClinic) return
    const newNumber = (activeClinic.current_number || 0) + 1
    updateQueue(newNumber)
    toast.success(`تم استدعاء العميل رقم ${toArabicNumbers(newNumber)}`)
  }

  const handlePreviousPatient = () => {
    if (!activeClinic || activeClinic.current_number <= 0) return
    const newNumber = activeClinic.current_number - 1
    // We update the number but maybe don't insert a new "call" record, or we do. Let's insert for history.
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

  const handleEmergency = () => {
    // Usually emergency doesn't change the current number sequence but alerts screens
    if (!activeClinic) return
    // We can use a special number or just flag the current/next one.
    // Let's assume emergency just alerts for the *current* number or a specific logic.
    // For now, we will just insert an emergency record without changing the number
    
    const sendEmergency = async () => {
        try {
            const { error } = await (supabase.from('queue_calls') as any).insert({
                clinic_id: activeClinic.id,
                patient_number: activeClinic.current_number, // Alert for current patient? or generic?
                is_emergency: true,
                status: 'called'
            })
            if (error) throw error
            toast.success('تم إرسال نداء طوارئ')
        } catch (e) {
            toast.error('فشل إرسال الطوارئ')
        }
    }
    sendEmergency()
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
            <CardHeader>
              <CardTitle>لوحة التحكم بالعيادة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClinicSelect} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر العيادة</label>
                  <Select
                    value={selectedClinicId}
                    onChange={(e) => setSelectedClinicId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- اختر العيادة --</option>
                    {clinicsList.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    'دخول'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  العودة
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-medical-900">{activeClinic?.name}</h1>
            <p className="text-medical-600">الرقم الحالي: {toArabicNumbers(activeClinic?.current_number || 0)}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </Button>
        </div>

        {/* Current Number Display */}
        <Card className="mb-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <CardContent className="pt-8">
            <div className="text-center">
              <p className="text-lg text-primary-100 mb-2">الرقم الحالي</p>
              <p className="text-7xl font-bold">{toArabicNumbers(activeClinic?.current_number || 0)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handleNextPatient}
            className="h-24 text-lg gap-2 bg-success-500 hover:bg-success-600"
          >
            <ChevronUp className="w-6 h-6" />
            العميل التالي
          </Button>

          <Button
            onClick={handlePreviousPatient}
            variant="outline"
            className="h-24 text-lg gap-2"
          >
            <ChevronDown className="w-6 h-6" />
            العميل السابق
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="h-24 text-lg gap-2"
          >
            <RotateCcw className="w-6 h-6" />
            تصفير
          </Button>

          <Button
            onClick={handleEmergency}
            className="h-24 text-lg gap-2 bg-danger-500 hover:bg-danger-600 md:col-span-2"
          >
            <AlertTriangle className="w-6 h-6" />
            تنبيه طوارئ
          </Button>

          <Button
            variant="outline"
            className="h-24 text-lg gap-2"
          >
            <Phone className="w-6 h-6" />
            تنبيه طبيب
          </Button>
        </div>

        {/* Specific Patient Call */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>استدعاء عميل معين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="أدخل رقم العميل"
                value={specificNumber}
                onChange={(e) => setSpecificNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCallSpecific}
                className="gap-2"
              >
                <Phone className="w-4 h-4" />
                استدعاء
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16 text-base gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            تحويل إلى عيادة أخرى
          </Button>

          <Button
            variant="outline"
            className="h-16 text-base gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            إيقاف العيادة
          </Button>
        </div>
      </div>
    </div>
  )
}
