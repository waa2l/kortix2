'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle,
  CheckCircle,
  Phone,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { toArabicNumbers } from '@/utils/arabic'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface Clinic {
  id: string
  name: string
  current_number: number
  clinic_number: number
}

export default function ClientPage() {
  const [step, setStep] = useState<'clinic-select' | 'ticket' | 'complaint'>('clinic-select')
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [ticketNumber, setTicketNumber] = useState('')
  const [currentNumber, setCurrentNumber] = useState(0)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [complaintType, setComplaintType] = useState('complaint')
  const [complaintText, setComplaintText] = useState('')
  const [loading, setLoading] = useState(false)
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // 1. Fetch Clinics
  useEffect(() => {
    const fetchClinics = async () => {
      const { data } = await supabase.from('clinics').select('id, name, current_number, clinic_number').order('clinic_number', { ascending: true })
      if (data) setClinics(data)
    }
    fetchClinics()
  }, [])

  // 2. Realtime Subscription for Selected Clinic
  useEffect(() => {
    if (!selectedClinic) return

    // Set initial number
    setCurrentNumber(selectedClinic.current_number)

    const channel = supabase
      .channel(`client_view_${selectedClinic.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clinics', filter: `id=eq.${selectedClinic.id}` },
        (payload) => {
          const newNumber = (payload.new as Clinic).current_number
          setCurrentNumber(newNumber)
          
          // تنبيه إذا اقترب الدور (مثال: إذا كان دور العميل هو الرقم المدخل)
          if (ticketNumber && parseInt(ticketNumber) === newNumber) {
             toast.success('حان دورك الآن!', { duration: 10000, icon: '🔔' })
             playNotificationSound()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedClinic, ticketNumber])

  const playNotificationSound = () => {
    const audio = new Audio('/audio/ding.mp3')
    audio.play().catch(e => console.error(e))
  }

  const handleClinicSelect = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId)
    if (clinic) {
        setSelectedClinic(clinic)
        setStep('ticket')
    }
  }

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!ticketNumber) {
        toast.error('أدخل رقم التذكرة')
        return
      }

      // محاكاة تسجيل التذكرة للمتابعة المحلية فقط
      // (في الأنظمة المتقدمة يمكن التحقق من وجود الرقم في قاعدة البيانات)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setNotification({
        type: 'success',
        message: `تم تسجيل رقمك ${toArabicNumbers(parseInt(ticketNumber))}. سيتم تنبيهك عند حلول دورك.`,
      })

      toast.success('تم تفعيل التنبيهات لرقمك')

      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } catch (err) {
      toast.error('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (complaintText.length < 10) {
        toast.error('الرجاء كتابة تفاصيل أكثر')
        setLoading(false)
        return
      }

      // Get Center ID
      const { data: centers } = await supabase.from('centers').select('id').limit(1)
      const centerId = (centers as any)?.[0]?.id

      const { error } = await (supabase.from('complaints') as any).insert({
        center_id: centerId, // قد يكون null إذا لم يوجد مركز، يجب معالجة ذلك في قاعدة البيانات أو هنا
        message: complaintText,
        type: complaintType,
        email: email || null,
        phone: phone || null,
        status: 'new'
      })

      if (error) throw error

      toast.success('تم إرسال ' + (complaintType === 'complaint' ? 'الشكوى' : 'الاقتراح') + ' بنجاح')

      setComplaintText('')
      setEmail('')
      setPhone('')
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء الإرسال')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'clinic-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-medical-900">صفحة العميل</h1>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                العودة
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinics.map((clinic) => (
              <Card
                key={clinic.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => handleClinicSelect(clinic.id)}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-medical-900 mb-4">{clinic.name}</p>
                    <Button className="w-full">اختر</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">{selectedClinic?.name}</h1>
          <Button
            variant="outline"
            onClick={() => setStep('clinic-select')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            تغيير العيادة
          </Button>
        </div>

        <Card className="mb-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <CardContent className="pt-8">
            <div className="text-center">
              <p className="text-lg text-primary-100 mb-2">الرقم الحالي</p>
              <p className="text-6xl font-bold">{toArabicNumbers(currentNumber)}</p>
            </div>
          </CardContent>
        </Card>

        {notification && (
          <Card className={`mb-8 border-2 ${
            notification.type === 'success'
              ? 'border-success-500 bg-success-50'
              : 'border-danger-500 bg-danger-50'
          }`}>
            <CardContent className="pt-6 flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-danger-600 flex-shrink-0" />
              )}
              <p className={notification.type === 'success' ? 'text-success-700' : 'text-danger-700'}>
                {notification.message}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 mb-6">
          <Button
            variant={step === 'ticket' ? 'default' : 'outline'}
            onClick={() => setStep('ticket')}
            className="flex-1"
          >
            <Phone className="w-4 h-4 mr-2" />
            متابعة دوري
          </Button>
          <Button
            variant={step === 'complaint' ? 'default' : 'outline'}
            onClick={() => setStep('complaint')}
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            شكوى / اقتراح
          </Button>
        </div>

        {step === 'ticket' && (
          <Card>
            <CardHeader>
              <CardTitle>متابعة رقم الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم التذكرة</label>
                  <Input
                    type="number"
                    placeholder="أدخل رقمك الحالي"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تفعيل التنبيه'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'complaint' && (
          <Card>
            <CardHeader>
              <CardTitle>شكوى أو اقتراح</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">النوع</label>
                  <Select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="complaint">شكوى</option>
                    <option value="suggestion">اقتراح</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">النص</label>
                  <Textarea
                    placeholder="اكتب تفاصيل الشكوى أو الاقتراح..."
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    disabled={loading}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني (اختياري)</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف (اختياري)</label>
                  <Input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || complaintText.length < 10}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
